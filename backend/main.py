from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn
import os
from routes.auth import router as auth_router
from routes.profile import router as profile_router
from routes.college import router as study_router
from routes.suggestions import router as suggestions_router

# Load environment variables
load_dotenv()

app = FastAPI(
    title="LearnFlow AI Backend",
    description="Backend API for LearnFlow AI - College Learning Assistant",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(study_router)
app.include_router(suggestions_router)

@app.get("/")
def read_root():
    return {
        "message": "LearnFlow AI Backend API",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/auth",
            "profile": "/profile",
            "study": "/study",
            "suggestions": "/suggestions",
            "docs": "/docs"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "LearnFlow-AI Backend"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
