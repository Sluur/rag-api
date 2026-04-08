from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from rag import load_index, build_chain

app = FastAPI(title="RAG API")

chain = None
retriever = None

@app.on_event("startup")
async def startup():
    global chain, retriever
    print("Cargando documentos e indexando...")
    index = load_index()
    chain, retriever = build_chain(index)
    print("Listo.")

@app.get("/health")
def health():
    return {"status": "ok", "index_loaded": chain is not None}

class Question(BaseModel):
    question: str

@app.post("/ask")
def ask(body: Question):
    if not chain:
        raise HTTPException(status_code=503, detail="Índice no cargado")

    answer = chain.invoke(body.question)

    docs = retriever.invoke(body.question)
    sources = list(set(
        doc.metadata.get("source", "unknown")
        for doc in docs
    ))

    return {
        "answer": answer,
        "sources": sources
    }