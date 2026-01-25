from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from utils.llm import llm
from datetime import datetime, timedelta
import json
import re

router = APIRouter(prefix="/study", tags=["study-planner"])

class StudyPlanRequest(BaseModel):
    user_id: str
    input_text: str

class StudyPlanResponse(BaseModel):
    exam: Optional[dict]
    days_left: Optional[int]
    urgency: Optional[str]
    plan: Optional[dict]
    strategy: Optional[str]
    message: str

@router.post("/create-plan", response_model=StudyPlanResponse)
async def create_study_plan(request: StudyPlanRequest):
    """
    Create a personalized study plan using LLM (optimized - single call)
    """
    try:
        # Single LLM call to do everything
        prompt = f"""
You are an expert study planner. Analyze the following exam information and create a comprehensive study plan.

User Input: "{request.input_text}"

Extract and provide a study plan in the following JSON format:
{{
  "exam": {{
    "subject": "extracted subject name",
    "exam_date": "YYYY-MM-DD format",
    "topics": ["topic1", "topic2", "topic3"]
  }},
  "days_left": number of days until exam,
  "urgency": "critical" (≤3 days) | "high" (≤7 days) | "medium" (≤14 days) | "low" (>14 days),
  "plan": {{
    "daily_plan": [
      {{
        "day": 1,
        "tasks": ["specific task 1", "specific task 2", "specific task 3"]
      }}
    ],
    "total_hours": estimated total study hours,
    "priority_topics": ["most important topic 1", "topic 2", "topic 3"]
  }},
  "strategy": "cram_mode" (≤3 days) | "intensify" (≤7 days) | "normal" (>7 days)
}}

Guidelines:
1. If no date is mentioned, assume exam is in 7 days
2. Create realistic daily tasks based on the urgency level
3. For critical urgency (≤3 days): 6 hours/day, focus on key concepts
4. For high urgency (≤7 days): 4 hours/day, balanced coverage
5. For medium/low urgency: 2-3 hours/day, comprehensive study
6. Include specific, actionable tasks for each day
7. Prioritize the most important topics first

Return ONLY the JSON object, no additional text.
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
        
        # Validate and return
        return StudyPlanResponse(
            exam=result.get("exam"),
            days_left=result.get("days_left"),
            urgency=result.get("urgency"),
            plan=result.get("plan"),
            strategy=result.get("strategy"),
            message="Study plan created successfully using AI"
        )
    
    except Exception as e:
        # Fallback to simple plan if LLM fails
        print(f"LLM Error: {str(e)}")
        
        # Simple fallback
        fallback_plan = {
            "exam": {
                "subject": "Subject",
                "exam_date": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
                "topics": ["Topic 1", "Topic 2", "Topic 3"]
            },
            "days_left": 7,
            "urgency": "high",
            "plan": {
                "daily_plan": [
                    {"day": i+1, "tasks": [f"Study session {i+1}", "Practice problems", "Review notes"]}
                    for i in range(7)
                ],
                "total_hours": 28,
                "priority_topics": ["Topic 1", "Topic 2", "Topic 3"]
            },
            "strategy": "intensify"
        }
        
        return StudyPlanResponse(
            exam=fallback_plan["exam"],
            days_left=fallback_plan["days_left"],
            urgency=fallback_plan["urgency"],
            plan=fallback_plan["plan"],
            strategy=fallback_plan["strategy"],
            message=f"Study plan created (fallback mode due to: {str(e)[:100]})"
        )

@router.get("/health")
async def health_check():
    """Check if the study planner service is running"""
    return {
        "status": "healthy",
        "service": "Study Planner (LLM-Powered)",
        "model": "gemini-1.5-flash",
        "features": [
            "AI-powered exam parsing",
            "Intelligent study planning",
            "Personalized recommendations"
        ]
    }
