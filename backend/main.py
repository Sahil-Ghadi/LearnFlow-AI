from fastapi import FastAPI
from dotenv import load_dotenv
import uvicorn
import os

# Load environment variables
load_dotenv()

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "LearnFlow-AI Backend"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
