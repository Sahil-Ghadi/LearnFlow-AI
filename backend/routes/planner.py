from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from utils.llm import llm
import json
import re
from datetime import datetime
from firebase_admin import firestore

router = APIRouter(prefix="/planner", tags=["planner"])
db = firestore.client()

class PlannerSettings(BaseModel):
    uid: str
    available_hours: int
    start_time: str
    end_time: str
    constraints: str
    view_mode: str = "daily"  # 'daily' or 'weekly'

class Task(BaseModel):
    time: str
    task: str
    type: str # 'study', 'break', 'other'
    subject: Optional[str] = None
    duration: int # minutes

class DaySchedule(BaseModel):
    day: str
    date: str
    slots: List[Task]

class ScheduleResponse(BaseModel):
    schedule: List[DaySchedule]

@router.post("/generate", response_model=ScheduleResponse)
async def generate_plan(settings: PlannerSettings):
    try:
        # Fetch user profile to get subjects
        user_ref = db.collection("user_profiles").document(settings.uid).get()
        if not user_ref.exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = user_ref.to_dict()
        subjects = user_data.get("academic_subjects", [])
        
        if not subjects:
             # Fallback if no subjects found
             subjects = ["General Study"]

        # Construct Prompt
        # Construct Prompt based on view mode
        if settings.view_mode == 'daily':
             prompt = f"""
            You are an expert academic study planner. Create a detailed daily study schedule for Today ({datetime.now().strftime('%A, %Y-%m-%d')}).
            
            **User Profile:**
            - Subjects: {", ".join(subjects)}
            - Daily Study Goal: {settings.available_hours} hours
            - Preferred Time Window: {settings.start_time} to {settings.end_time}
            
            **Specific Constraints:**
            "{settings.constraints}"
            
            **Instructions:**
            1. Create a detailed slot-by-slot schedule for Today.
            2. Respect the start and end times strictly.
            3. MANDATORY BREAKS:
                - **Lunch Break**: 1:00 PM - 2:00 PM (13:00 - 14:00)
                - **Dinner Break**: 9:00 PM - 10:00 PM (21:00 - 22:00)
            4. Block out time for user constraints.
            5. Return strictly valid JSON.
            
            **JSON Format:**
            {{
                "schedule": [
                    {{
                        "day": "Monday",
                        "date": "YYYY-MM-DD",
                        "slots": [
                            {{ "time": "09:00-10:00", "task": "Math - Algebra", "type": "study", "subject": "Math", "duration": 60 }}
                        ]
                    }}
                ]
            }}
            """
        else:
            # Weekly View Prompt - optimized for stability
            prompt = f"""
            You are an expert academic study planner. Create a 7-day study schedule starting Today ({datetime.now().strftime('%Y-%m-%d')}).
            
            **User Profile:**
            - Subjects: {", ".join(subjects)}
            - Daily Study Goal: {settings.available_hours} hours/day
            - Preferred Window: {settings.start_time} to {settings.end_time}
            - Constraints: "{settings.constraints}"
            
            **Instructions:**
            1. Generate a schedule for 7 days.
            2. For each day, provide high-level study blocks (Morning, Afternoon, Evening) rather than minute-by-minute granular slots, to keep the output concise and parsable.
            3. MANDATORY BREAKS must be accounted for but you don't need to list every single break if it clutters the JSON.
            4. Ensure strictly valid JSON. Do not cut off the output.
            
            **JSON Format:**
            {{
                "schedule": [
                    {{
                        "day": "Monday",
                        "date": "YYYY-MM-DD",
                        "slots": [
                            {{ "time": "09:00-12:00", "task": "Math Review", "type": "study", "subject": "Math", "duration": 180 }},
                            {{ "time": "14:00-16:00", "task": "Physics Practice", "type": "study", "subject": "Physics", "duration": 120 }}
                        ]
                    }},
                    ... (repeat for 7 days)
                ]
            }}
            """

        # Call LLM
        print(f"Sending prompt to LLM: {prompt[:100]}...") # Log start of prompt
        response = llm.invoke(prompt)
        content = response.content if hasattr(response, 'content') else str(response)
        print(f"LLM Response: {content[:200]}...") # Log start of response

        # Extract JSON
        # Clean up the content to handle markdown code blocks
        clean_content = content.replace("```json", "").replace("```", "").strip()
        
        # Try to find the first { and last }
        start_idx = clean_content.find('{')
        end_idx = clean_content.rfind('}')
        
        if start_idx == -1 or end_idx == -1:
             print(f"Failed to find JSON braces. Raw content: {content}")
             raise ValueError("Could not find JSON object in response")
        
        json_str = clean_content[start_idx:end_idx+1]
        
        try:
            plan_data = json.loads(json_str)
            print("Successfully parsed JSON")
        except json.JSONDecodeError as je:
            print(f"JSON Parse Error: {je}")
            print(f"Attempted to parse: {json_str}")
            raise ValueError("Invalid JSON format from LLM")
        
        # Save to Firestore
        try:
            # Add timestamp for sorting
            plan_data['created_at'] = datetime.utcnow().isoformat()
            
            # We'll save it to a subcollection 'generated_plans' under the user profile
            plan_ref = db.collection("user_profiles").document(settings.uid).collection("generated_plans").add(plan_data)
            print(f"Plan saved to Firestore with ID: {plan_ref[1].id}")
        except Exception as e:
            print(f"Failed to save plan to Firestore: {str(e)}")
            # We don't raise here to ensure the user still gets the plan response

        return plan_data

    except Exception as e:
        import traceback
        traceback.print_exc() # Print full stack trace
        print(f"Planner Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/latest/{uid}", response_model=ScheduleResponse)
async def get_latest_plan(uid: str):
    try:
        # Query the latest plan from subcollection
        plans_ref = db.collection("user_profiles").document(uid).collection("generated_plans")
        
        # Order by created_at descending and get the first one
        docs = plans_ref.order_by("created_at", direction=firestore.Query.DESCENDING).limit(1).get()
        
        if not docs:
             # Return empty schedule if no plan found
             return {"schedule": []}
             
        return docs[0].to_dict()

    except Exception as e:
        print(f"Error fetching latest plan: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
