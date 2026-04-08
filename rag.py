import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

load_dotenv()

DOCS_FOLDER = "documents"

def load_index():
    all_docs = []
    for filename in os.listdir(DOCS_FOLDER):
        if filename.endswith(".pdf"):
            loader = PyPDFLoader(os.path.join(DOCS_FOLDER, filename))
            all_docs.extend(loader.load())

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150
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

    prompt = ChatPromptTemplate.from_template("""
Usá únicamente el siguiente contexto para responder la pregunta.
Si la respuesta no está en el contexto, decí exactamente: "No encontré esa información en los documentos."
No inventes información.

Contexto:
{context}

Pregunta: {question}

Respuesta:""")

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    retriever = index.as_retriever(search_kwargs={"k": 4})

    chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain, retriever