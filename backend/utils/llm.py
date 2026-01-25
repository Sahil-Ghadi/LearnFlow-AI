from langchain_google_genai import ChatGoogleGenerativeAI
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize LLM with API key from environment
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",  # Using stable model instead of experimental
    google_api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.7,
    max_tokens=2048
)