import os
import uuid
from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.output_parsers import StrOutputParser
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS

load_dotenv()

GOOGLE_API_KEY=os.environ.get("GOOGLE_API_KEY")

Llm=ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0,
    max_tokens=1024,
    google_api_key=GOOGLE_API_KEY
)

Embeddings=HuggingFaceEmbeddings(
    model_name="intfloat/e5-large-v2",
    model_kwargs={"device":"cpu"},
    encode_kwargs={"normalize_embeddings":True}
)

Splitter=RecursiveCharacterTextSplitter(
    chunk_size=1200,
    chunk_overlap=350
)

Prompt=PromptTemplate(
    template="""
Answer the question strictly using the context below.
If the answer is not present, say:
"The provided document does not contain sufficient information to answer this question."

Context:
{context}

Question:
{question}

Answer:
""",
    input_variables=["context","question"]
)

Parser=StrOutputParser()

VectorStores={}

def FormatDocs(Docs):
    return "\n\n".join(
        f"(Page {d.metadata.get('page','N/A')}): {d.page_content}"
        for d in Docs
    )

def IndexPdf(FilePath:str)->str:
    Loader=PyPDFLoader(FilePath)
    Docs=Loader.load()
    Chunks=Splitter.split_documents(Docs)
    VectorStore=FAISS.from_documents(Chunks,Embeddings)
    DocId=str(uuid.uuid4())
    VectorStores[DocId]=VectorStore
    return DocId

def RAG(DocId:str,Question:str)->str:
    if DocId not in VectorStores:
        return "Invalid document ID."
    Retriever=VectorStores[DocId].as_retriever(
        search_type="mmr",
        search_kwargs={"k":8,"fetch_k":20}
    )
    Docs=Retriever.invoke(Question)
    if not Docs:
        return "The provided document does not contain sufficient information to answer this question."
    Context=FormatDocs(Docs)
    Chain=Prompt|Llm|Parser
    return Chain.invoke({"context":Context,"question":Question})
