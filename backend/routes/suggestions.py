from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from utils.llm import llm
import json
import re

router = APIRouter(prefix="/suggestions", tags=["ai-suggestions"])

class SuggestionRequest(BaseModel):
    degree: str
    major: str

class SuggestionResponse(BaseModel):
    subjects: List[str]
    side_hustle_interests: List[str]

@router.post("/generate", response_model=SuggestionResponse)
async def generate_suggestions(request: SuggestionRequest):
    """
    Generate academic subjects and side hustle interests based on degree/major using AI
    """
    try:
        prompt = f"""
You are an academic advisor AI. Based on the student's degree and major, suggest relevant subjects and side hustle interests.

Degree: {request.degree}
Major: {request.major}

Provide suggestions in the following JSON format:
{{
  "subjects": ["subject1", "subject2", "subject3", "subject4", "subject5", "subject6"],
  "side_hustle_interests": ["interest1", "interest2", "interest3", "interest4", "interest5", "interest6"]
}}

Guidelines:
1. For subjects: Include EXACTLY 6 core subjects typically studied in this major.
2. For side hustle interests: Include EXACTLY 6 skills/technologies that complement this degree and are marketable.
3. Be specific and practical.
4. Consider current industry trends.
5. Return ONLY the JSON object, no additional text.

Example for Computer Science:
- Subjects: Data Structures, Algorithms, Database Systems, Operating Systems, Computer Networks, Software Engineering
- Side Hustle Interests: Web Development, Mobile App Development, AI/ML, Cloud Computing, Cybersecurity, UI/UX Design
"""

        # Call LLM
        response = llm.invoke(prompt)
        content = response.content if hasattr(response, 'content') else str(response)
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
        else:
            raise ValueError("Could not extract JSON from LLM response")
        
        return SuggestionResponse(
            subjects=result.get("subjects", [])[:6],
            side_hustle_interests=result.get("side_hustle_interests", [])[:6]
        )
    
    except Exception as e:
        print(f"AI Suggestion Error: {str(e)}")
        
        # Fallback suggestions
        fallback = {
            "subjects": [
                "Core Subject 1",
                "Core Subject 2", 
                "Core Subject 3",
                "Elective 1",
                "Elective 2"
            ],
            "side_hustle_interests": [
                "Web Development",
                "Data Analysis",
                "Content Creation",
                "Freelancing"
            ]
        }
        
        return SuggestionResponse(
            subjects=fallback["subjects"],
            side_hustle_interests=fallback["side_hustle_interests"]
        )

@router.get("/health")
async def health_check():
    """Check if the suggestions service is running"""
    return {
        "status": "healthy",
        "service": "AI Suggestions",
        "model": "gemini-2.5-flash-lite"
    }
