import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.messages import HumanMessage, AIMessage

load_dotenv()

DOCS_FOLDER = "documents"
MAX_HISTORY = 6  # máximo de mensajes en el historial (3 de ida, 3 de vuelta)

def load_index():
    all_docs = []
    for filename in os.listdir(DOCS_FOLDER):
        if filename.endswith(".pdf"):
            loader = PyPDFLoader(os.path.join(DOCS_FOLDER, filename))
            all_docs.extend(loader.load())

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200,  
        chunk_overlap=200  
    )
    chunks = splitter.split_documents(all_docs)

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    index = FAISS.from_documents(chunks, embeddings)
    return index


def build_chain(index):
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0,
        api_key=os.getenv("GROQ_API_KEY")
    )

    prompt = ChatPromptTemplate.from_messages([
    ("system", """Sos un asistente que responde preguntas basándose únicamente en el siguiente contexto.
Si la respuesta no está en el contexto, decí exactamente: "No encontré esa información en los documentos."
No inventes información. Si te piden una lista o conteo, sé exhaustivo con lo que aparece en el contexto.

Contexto:
{context}"""),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{question}"),
])

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    retriever = index.as_retriever(search_kwargs={"k": 6}) 

    chain = (
        {
            "context": lambda x: format_docs(retriever.invoke(x["question"])),
            "history": lambda x: x["history"],
            "question": lambda x: x["question"],
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain, retriever