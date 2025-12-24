# Research Paper Assistant

Research Paper Assistant is an AI-powered tool that allows users to upload a research paper in PDF format and ask questions related to the content of the paper. The system retrieves relevant information from the uploaded document and provides clear and concise answers based strictly on the content of the paper.

## Features

- Upload PDF research papers.
- Ask questions related to the uploaded research paper.
- Retrieve answers strictly based on the content of the document.
- Supports both web and mobile interfaces.

## Technology Stack

### Backend
- **FastAPI**: Serves as the backend API for handling PDF uploads, querying the document, and returning AI-generated answers.
- **LangChain**: Used for building a RAG (Retrieval-Augmented Generation) pipeline.
- **HuggingFace Embeddings**: Used for document embedding to enable semantic search.
- **FAISS**: Vector store to index document chunks for fast retrieval.
- **Google Gemini API**: Language model used to generate responses.

### Web Frontend
- **Next.js**
- ![Click here to watch the demo](https://github.com/Nikhil4002-50-82/Research-Paper-Assistant/tree/main/assets/web1.mp4)

### Mobile App
- **React Native with Expo**
- 

## Architecture

1. **PDF Upload**
   - Users can upload a PDF research paper via the web or mobile interface.
   - The PDF is sent to the FastAPI backend for processing.

2. **Document Processing**
   - PDF is split into manageable chunks using a recursive character splitter.
   - Chunks are embedded using HuggingFace embeddings.
   - FAISS vector store indexes the chunks for semantic retrieval.

3. **Question Answering**
   - Users submit questions via the web or mobile interface.
   - The backend retrieves relevant chunks from the FAISS index.
   - The Google Gemini language model generates an answer strictly based on the retrieved context.
   - If the answer is not present in the document, the model responds with a clear message indicating insufficient information.

4. **Response**
   - The backend returns the answer to the frontend (web or mobile), which displays it to the user.

## Notes

* The assistant does not generate answers based on external knowledge; it relies only on the content of the uploaded PDF.
* Ensure that the API keys for Google Gemini and HuggingFace are properly configured in the `.env` file.
