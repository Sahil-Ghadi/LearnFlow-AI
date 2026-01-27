from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from utils.llm import llm
from datetime import datetime, timedelta
from firebase_admin import firestore

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

        # Construct concise prompt based on view mode
        if settings.view_mode == 'daily':
            today = datetime.now()
            prompt = f"""Create a detailed daily study schedule for {today.strftime('%A, %Y-%m-%d')}.

User Profile:
- Subjects: {', '.join(subjects)}
- Study Goal: {settings.available_hours} hours
- Time Window: {settings.start_time} to {settings.end_time}
- Constraints: {settings.constraints} (STRICTLY FOLLOW)

Requirements:
1. Create time slots within the specified window
2. Include mandatory breaks:
   - Lunch: 1:00 PM - 2:00 PM (type: "break")
   - Dinner: 9:00 PM - 10:00 PM (type: "break")
3. Distribute subjects evenly
4. Include short breaks between study sessions
5. Respect user constraints
6. If the user constraints conflict with standard times, prioritization CONSTRAINTS.

IMPORTANT OUTPUT FORMAT:
For every slot, you MUST include:
- "time": "HH:MM-HH:MM"
- "task": "Description"
- "type": "study" OR "break" OR "other"
- "duration": duration in minutes (integer)
- "subject": "Subject Name" (if study) or null

Generate a realistic, achievable schedule."""

        else:  # Weekly view
            start_date = datetime.now()
            prompt = f"""Create a 7-day study schedule starting {start_date.strftime('%Y-%m-%d')}.

User Profile:
- Subjects: {', '.join(subjects)}
- Daily Goal: {settings.available_hours} hours/day
- Time Window: {settings.start_time} to {settings.end_time}
- Constraints: {settings.constraints} (STRICTLY FOLLOW)

Requirements:
1. Generate schedule for 7 consecutive days
2. Use 2-3 hour study blocks per session
3. Rotate subjects across the week
4. Include breaks and rest periods
5. Account for mandatory meal times:
   - Lunch: 1:00 PM - 2:00 PM (type: "break")
   - Dinner: 9:00 PM - 10:00 PM (type: "break")
6. Keep it balanced and sustainable
7. STRICTLY Respect user constraints

IMPORTANT OUTPUT FORMAT:
For every slot, you MUST include:
- "time": "HH:MM-HH:MM"
- "task": "Description"
- "type": "study" OR "break" OR "other"
- "duration": duration in minutes (integer)
- "subject": "Subject Name" (if study) or null

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
