from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage
from rag import load_index, build_chain, MAX_HISTORY

app = FastAPI(title="RAG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chain = None
retriever = None
conversation_history = []

@app.on_event("startup")
async def startup():
    global chain, retriever
    print("Cargando documentos e indexando...")
    index = load_index()
    chain, retriever = build_chain(index)
    print("Listo.")

@app.get("/health")
def health():
    return {
        "status": "ok",
        "index_loaded": chain is not None,
        "history_length": len(conversation_history)
    }

@app.delete("/history")
def clear_history():
    global conversation_history
    conversation_history = []
    return {"message": "Historial limpiado"}

class Question(BaseModel):
    question: str

@app.post("/ask")
def ask(body: Question):
    global conversation_history
    if not chain:
        raise HTTPException(status_code=503, detail="Índice no cargado")

    limited_history = conversation_history[-MAX_HISTORY:]
    answer = chain.invoke({
        "question": body.question,
        "history": limited_history
    })

    conversation_history.append(HumanMessage(content=body.question))
    conversation_history.append(AIMessage(content=answer))

    docs = retriever.invoke(body.question)
    sources = list(set(
        doc.metadata.get("source", "unknown")
        for doc in docs
    ))

    return {
        "answer": answer,
        "sources": sources,
        "history_length": len(conversation_history)
    }