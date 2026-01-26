from fastapi import APIRouter, HTTPException
from firebase_admin import firestore
from datetime import datetime, timedelta
from typing import List, Dict

router = APIRouter(prefix="/timeline", tags=["timeline"])
db = firestore.client()

@router.get("/events/{uid}")
async def get_timeline_events(uid: str, mode: str = "academic"):
    """
    Get AI agent timeline events based on user activity and agent decisions
    """
    try:
        user_ref = db.collection("user_profiles").document(uid)
        profile_doc = user_ref.get()
        
        if not profile_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        events = []
        event_id = 1
        
        # Get recent study plans
        plans_ref = user_ref.collection("generated_plans").order_by("created_at", direction=firestore.Query.DESCENDING).limit(1)
        plan_docs = list(plans_ref.stream())
        
        if plan_docs:
            plan_data = plan_docs[0].to_dict()
            created_at = plan_data.get('created_at', datetime.now())
            
            # Convert Firestore timestamp to datetime if needed
            if hasattr(created_at, 'timestamp'):
                created_at = datetime.fromtimestamp(created_at.timestamp())
            elif isinstance(created_at, str):
                try:
                    created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                except:
                    created_at = datetime.now()
            
            time_ago = get_time_ago(created_at)
            
            events.append({
                "id": event_id,
                "type": "schedule",
                "icon": "Calendar",
                "title": "Study Plan Generated",
                "description": f"Created optimized study schedule for {plan_data.get('exam', {}).get('subject', 'upcoming exam')}",
                "time": time_ago,
                "date": "Today" if is_today(created_at) else "Yesterday",
                "details": [
                    f"Total hours: {plan_data.get('plan', {}).get('total_hours', 0)}h",
                    f"Days: {len(plan_data.get('plan', {}).get('daily_plan', []))}",
                    f"Urgency: {plan_data.get('urgency', 'medium')}"
                ]
            })
            event_id += 1
        
        # Get weak areas
        profile_data = profile_doc.to_dict()
        weak_areas = profile_data.get('weak_areas', [])
        
        if weak_areas:
            from collections import Counter
            area_counts = Counter(weak_areas)
            most_common = area_counts.most_common(1)
            
            if most_common:
                topic, count = most_common[0]
                events.append({
                    "id": event_id,
                    "type": "detection",
                    "icon": "AlertTriangle",
                    "title": "Weak Topic Identified",
                    "description": f"Detected low confidence in {topic} after practice analysis.",
                    "time": "2h ago",
                    "date": "Today",
                    "details": [
                        f"Mistakes: {count}",
                        "Added extra revision sessions",
                        "Recommended: Practice problems"
                    ]
                })
                event_id += 1
        
        # Get exam readiness
        exams_ref = user_ref.collection("exams")
        all_exams = list(exams_ref.stream())
        
        if all_exams:
            total_readiness = sum(doc.to_dict().get('readiness_score', 0) for doc in all_exams)
            avg_readiness = total_readiness / len(all_exams) if all_exams else 0
            
            if avg_readiness < 50:
                events.append({
                    "id": event_id,
                    "type": "priority",
                    "icon": "Target",
                    "title": "Exam Priority Mode Activated",
                    "description": "Low readiness detected. Adjusting study intensity.",
                    "time": "4h ago",
                    "date": "Today",
                    "details": [
                        f"Current readiness: {int(avg_readiness)}%",
                        "Increased daily study time",
                        "Focus on weak areas"
                    ]
                })
                event_id += 1
        
        # Get performance history
        history_ref = user_ref.collection("stats_history").order_by("date", direction=firestore.Query.DESCENDING).limit(5)
        history_docs = list(history_ref.stream())
        
        if len(history_docs) >= 2:
            recent_scores = [doc.to_dict().get('score', 0) for doc in history_docs[:2]]
            if len(recent_scores) == 2:
                improvement = recent_scores[0] - recent_scores[1]
                
                if improvement > 5:
                    events.append({
                        "id": event_id,
                        "type": "insight",
                        "icon": "TrendingUp",
                        "title": "Performance Trend Analyzed",
                        "description": f"Performance improved by {int(improvement)}% in recent assessments.",
                        "time": "1 day ago",
                        "date": "Yesterday",
                        "details": [
                            f"Latest score: {int(recent_scores[0])}%",
                            f"Previous: {int(recent_scores[1])}%",
                            "Keep up the good work!"
                        ]
                    })
                    event_id += 1
                elif improvement < -5:
                    events.append({
                        "id": event_id,
                        "type": "adjustment",
                        "icon": "Brain",
                        "title": "Learning Pace Adjusted",
                        "description": "Detected performance dip. Reducing workload to prevent burnout.",
                        "time": "1 day ago",
                        "date": "Yesterday",
                        "details": [
                            "Reduced daily targets by 20%",
                            "Added more revision time",
                            "Focus on concept clarity"
                        ]
                    })
                    event_id += 1
        
        # If no events, add a default one
        if not events:
            events.append({
                "id": 1,
                "type": "schedule",
                "icon": "Bot",
                "title": "AI Agent Initialized",
                "description": "Your personalized learning assistant is now active and monitoring your progress.",
                "time": "Just now",
                "date": "Today",
                "details": [
                    "Ready to create study plans",
                    "Tracking your progress",
                    "Optimizing learning path"
                ]
            })
        
        return {"events": events}
    
    except Exception as e:
        print(f"Timeline Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


def get_time_ago(dt: datetime) -> str:
    """Convert datetime to human-readable time ago"""
    now = datetime.now()
    diff = now - dt
    
    if diff.total_seconds() < 60:
        return "Just now"
    elif diff.total_seconds() < 3600:
        minutes = int(diff.total_seconds() / 60)
        return f"{minutes}m ago"
    elif diff.total_seconds() < 86400:
        hours = int(diff.total_seconds() / 3600)
        return f"{hours}h ago"
    else:
        days = int(diff.total_seconds() / 86400)
        return f"{days}d ago"


def is_today(dt: datetime) -> bool:
    """Check if datetime is today"""
    return dt.date() == datetime.now().date()
