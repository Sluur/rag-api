# RAG API

API REST que permite hacer preguntas en lenguaje natural sobre documentos PDF propios, usando un sistema RAG (Retrieval-Augmented Generation).

## Stack

- **FastAPI** — API REST
- **LangChain** — orquestación del pipeline RAG
- **Groq (Llama 3.3)** — LLM para generación de respuestas
- **FAISS** — vector store para búsqueda por similaridad
- **HuggingFace Embeddings** — modelo all-MiniLM-L6-v2 (local, gratuito)

## Arquitectura

1. Los PDFs se cargan y se dividen en chunks de 800 caracteres
2. Cada chunk se convierte en un embedding vectorial
3. Los embeddings se indexan en FAISS
4. Cuando el usuario pregunta, se recuperan los 4 chunks más relevantes
5. El LLM genera una respuesta basada únicamente en ese contexto
6. El historial de conversación se mantiene (últimos 6 mensajes) para preguntas de seguimiento

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /health | Estado de la API e índice |
| POST | /ask | Hacer una pregunta sobre los documentos |
| DELETE | /history | Limpiar el historial de conversación |

## Ejemplo

Request:
```json
POST /ask
{
  "question": "¿Cuáles son los requisitos para aprobar la materia?"
}
```

Response:
```json
{
  "answer": "Deberá asistir a por lo menos un 80% de las clases prácticas programadas, y aprobar 2 exámenes parciales o sus respectivas recuperaciones, cada uno con un mínimo del 60% del puntaje total.",
  "sources": ["documents/materia.pdf"],
  "history_length": 2
}
```

## Setup

```bash
git clone https://github.com/Sluur/rag-api
cd rag-api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Crear `.env`:
GROQ_API_KEY=tu_key_de_groq.com

Agregar PDFs propios en la carpeta `documents/` y correr:

```bash
uvicorn main:app --reload
```

La documentación interactiva está disponible en `http://localhost:8000/docs`