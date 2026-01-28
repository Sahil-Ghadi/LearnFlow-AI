from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from utils.llm import llm
from datetime import datetime, timedelta
from firebase_admin import firestore
from utils.timeline_logger import log_timeline_event

router = APIRouter(prefix="/planner", tags=["planner"])
db = firestore.client()

# Pydantic Models for Structured Output
from agents.schemas import Task, DaySchedule, ScheduleResponse

# Request Models
class PlannerSettings(BaseModel):
    uid: str
    available_hours: int
    start_time: str
    end_time: str
    constraints: str
    view_mode: str = "daily"  # 'daily' or 'weekly'

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
            subjects = ["General Study"]

        # Create structured output LLM
        structured_llm = llm.with_structured_output(ScheduleResponse)

        # Construct optimized prompt
        common_instructions = f"""
User Profile:
- Subjects: {', '.join(subjects)}
- Study Goal: {settings.available_hours} hours/day
- Time Window: {settings.start_time} to {settings.end_time}
- Constraints: {settings.constraints} (STRICTLY FOLLOW)

Requirements:
1. Create time slots strictly within {settings.start_time} - {settings.end_time}
2. Distribute subjects evenly
3. Include short breaks between study sessions
4. Respect user constraints (Priority #1)

Meal Logic:
- IF time window covers 13:00, schedule "Lunch Break" (13:00-14:00)
- IF time window covers 21:00, schedule "Dinner Break" (21:00-22:00)
- ELSE exclude them.

IMPORTANT OUTPUT FORMAT:
For every slot, you MUST include:
- "time": "HH:MM-HH:MM"
- "task": "Description"
- "type": "study" OR "break" OR "other"
- "duration": duration in minutes (integer)
- "subject": "Subject Name" (if study) or null"""

        if settings.view_mode == 'daily':
            today = datetime.now()
            prompt = f"""Create a detailed daily study schedule for {today.strftime('%A, %Y-%m-%d')}.
{common_instructions}

Generate a realistic, achievable daily schedule."""
        else:
            start_date = datetime.now()
            prompt = f"""Create a 7-day study schedule starting {start_date.strftime('%Y-%m-%d')}.
{common_instructions}

Additional Weekly Requirements:
- Generate schedule for 7 consecutive days
- Use 2-3 hour study blocks per session
- Rotate subjects across the week
- Keep it balanced and sustainable

Generate a realistic weekly schedule."""

        try:
            # Get structured output directly
            schedule_data: ScheduleResponse = structured_llm.invoke(prompt)
            
            # Convert to dict for storage
            plan_data = schedule_data.model_dump()
            
        except Exception as e:
            print(f"Structured output error: {e}")
            # Fallback schedule
            plan_data = create_fallback_schedule(settings, subjects)
        
        # Save to Firestore
        try:
            plan_data['created_at'] = datetime.utcnow().isoformat()
            plan_data['view_mode'] = settings.view_mode
            plan_data['settings'] = {
                'available_hours': settings.available_hours,
                'start_time': settings.start_time,
                'end_time': settings.end_time,
                'constraints': settings.constraints
            }
            
            plan_ref = db.collection("user_profiles").document(settings.uid).collection("generated_plans").add(plan_data)
            print(f"Plan saved to Firestore with ID: {plan_ref[1].id}")
            
            # Log to Timeline
            await log_timeline_event(
                uid=settings.uid,
                type="schedule",
                title="Study Plan Generated",
                description=f"Created daily optimized schedule",
                icon="Calendar",
                details=[
                    f"Total: {settings.available_hours}h",
                    f"Mode: {settings.view_mode}",
                    f"Constraints: {settings.constraints[:20]}..." if settings.constraints else "No constraints"
                ]
            )
        except Exception as e:
            print(f"Failed to save plan to Firestore: {str(e)}")

        return plan_data

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Planner Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/latest/{uid}", response_model=ScheduleResponse)
async def get_latest_plan(uid: str):
    try:
        plans_ref = db.collection("user_profiles").document(uid).collection("generated_plans")
        docs = plans_ref.order_by("created_at", direction=firestore.Query.DESCENDING).limit(1).get()
        
        if not docs:
            return {"schedule": []}
              
        return docs[0].to_dict()

    except Exception as e:
        print(f"Error fetching latest plan: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


def create_fallback_schedule(settings: PlannerSettings, subjects: List[str]) -> dict:
    """Create a simple fallback schedule if LLM fails"""
    today = datetime.now()
    
    if settings.view_mode == 'daily':
        days = 1
    else:
        days = 7
    
    schedule = []
    
    for i in range(days):
        current_date = today + timedelta(days=i)
        day_name = current_date.strftime('%A')
        date_str = current_date.strftime('%Y-%m-%d')
        
        slots = []
        
        # Morning session
        slots.append({
            "time": "09:00-11:00",
            "task": f"{subjects[i % len(subjects)]} - Study Session",
            "type": "study",
            "subject": subjects[i % len(subjects)],
            "duration": 120
        })
        
        # Lunch break
        slots.append({
            "time": "13:00-14:00",
            "task": "Lunch Break",
            "type": "break",
            "subject": None,
            "duration": 60
        })
        
        # Afternoon session
        slots.append({
            "time": "14:00-16:00",
            "task": f"{subjects[(i+1) % len(subjects)]} - Practice",
            "type": "study",
            "subject": subjects[(i+1) % len(subjects)],
            "duration": 120
        })
        
        # Evening session
        slots.append({
            "time": "17:00-19:00",
            "task": f"{subjects[(i+2) % len(subjects)]} - Review",
            "type": "study",
            "subject": subjects[(i+2) % len(subjects)],
            "duration": 120
        })

        # Dinner break (Added)
        slots.append({
            "time": "21:00-22:00",
            "task": "Dinner Break",
            "type": "break",
            "subject": None,
            "duration": 60
        })
        
        schedule.append({
            "day": day_name,
            "date": date_str,
            "slots": slots
        })
    
    return {"schedule": schedule}
