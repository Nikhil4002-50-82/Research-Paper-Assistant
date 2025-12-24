import os
import shutil
from fastapi import FastAPI,UploadFile,File,HTTPException
from pydantic import BaseModel,Field
from assistant import IndexPdf,RAG

app=FastAPI(title="Research Paper Assistant")

UploadDir="uploads"
os.makedirs(UploadDir,exist_ok=True)

class UploadResponse(BaseModel):
    documentId:str

class QueryRequest(BaseModel):
    documentId:str
    question:str=Field(...,examples=["What methodology is used in this paper?"])

class QueryResponse(BaseModel):
    result:str

@app.get("/")
def default():
    return{"message":"Server running successfully"}

@app.post("/upload",response_model=UploadResponse)
def UploadPdf(File:UploadFile=File(...)):
    if not File.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400,detail="Only PDF files are allowed")
    FilePath=os.path.join(UploadDir,File.filename)
    with open(FilePath,"wb") as Buffer:
        shutil.copyfileobj(File.file,Buffer)
    DocumentId=IndexPdf(FilePath)
    return {"documentId":DocumentId}

@app.post("/ask",response_model=QueryResponse)
def Ask(Request:QueryRequest):
    Result=RAG(Request.documentId,Request.question)
    return {"result":Result}
