from fastapi import APIRouter, HTTPException
from firebase_admin import firestore
from datetime import datetime, timedelta
from typing import List, Dict

router = APIRouter(prefix="/dashboard", tags=["dashboard"])
db = firestore.client()

@router.get("/sidehustle/{uid}")
async def get_sidehustle_dashboard(uid: str):
    """
    Get comprehensive side hustle dashboard data
    """
    try:
        user_ref = db.collection("user_profiles").document(uid)
        profile_doc = user_ref.get()
        
        if not profile_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        profile_data = profile_doc.to_dict()
        
        # Get skills data
        skills_ref = user_ref.collection("skills")
        all_skills = [doc.to_dict() for doc in skills_ref.stream()]
        
        # Get projects data
        projects_ref = user_ref.collection("projects")
        all_projects = [doc.to_dict() for doc in projects_ref.stream()]
        
        # Get learning sources
        sources_ref = user_ref.collection("learning_sources")
        all_sources = [doc.to_dict() for doc in sources_ref.stream()]
        
        # Get activity alerts
        alerts_ref = user_ref.collection("activity_alerts").order_by("created_at", direction=firestore.Query.DESCENDING).limit(5)
        all_alerts = [doc.to_dict() for doc in alerts_ref.stream()]
        
        # Calculate stats
        skills_in_progress = len([s for s in all_skills if s.get('status') == 'in_progress'])
        projects_completed = len([p for p in all_projects if p.get('status') == 'completed'])
        
        # Calculate weekly practice hours
        week_ago = datetime.now() - timedelta(days=7)
        practice_sessions = user_ref.collection("practice_sessions").where("date", ">=", week_ago).stream()
        weekly_hours = sum(session.to_dict().get('duration', 0) for session in practice_sessions) / 60  # Convert to hours
        
        # Calculate portfolio readiness
        total_portfolio_items = sum(1 for p in all_projects if p.get('in_portfolio', False))
        portfolio_target = 10  # Target number of portfolio items
        portfolio_ready = min(int((total_portfolio_items / portfolio_target) * 100), 100)
        
        # Format skill progress
        skill_progress = []
        icon_map = {
            'web': 'Code',
            'dsa': 'FolderKanban',
            'ai': 'Zap',
            'design': 'Rocket'
        }
        
        for skill in all_skills[:4]:  # Top 4 skills
            skill_progress.append({
                'name': skill.get('name', 'Skill'),
                'progress': int(skill.get('mastery', 0)),
                'icon': icon_map.get(skill.get('category', 'web'), 'Code')
            })
        
        # Format learning sources
        learning_sources = []
        for source in all_sources[:5]:  # Top 5 sources
            learning_sources.append({
                'id': source.get('id', ''),
                'source': source.get('name', ''),
                'skill': source.get('skill', ''),
                'type': source.get('type', 'course'),
                'status': source.get('status', 'Queued')
            })
        
        # Format assigned projects
        assigned_projects = []
        for project in all_projects[:5]:  # Top 5 projects
            assigned_projects.append({
                'id': project.get('id', ''),
                'title': project.get('title', ''),
                'difficulty': project.get('difficulty', 'Beginner'),
                'estimatedTime': project.get('estimated_time', '8 hours'),
                'skills': project.get('skills', [])
            })
        
        # Format activity alerts
        activity_alerts = []
        for alert in all_alerts:
            alert_type = alert.get('type', 'info')
            activity_alerts.append({
                'id': alert.get('id', ''),
                'type': alert_type,
                'message': alert.get('message', ''),
                'time': format_time_ago(alert.get('created_at'))
            })
        
        return {
            "stats": {
                "skills_in_progress": skills_in_progress,
                "projects_completed": projects_completed,
                "weekly_practice": f"{int(weekly_hours)}h",
                "portfolio_ready": f"{portfolio_ready}%",
                "portfolio_ready_value": portfolio_ready
            },
            "skill_progress": skill_progress if skill_progress else [
                {"name": "Web Development", "progress": 60, "icon": "Code"}
            ],
            "learning_sources": learning_sources if learning_sources else [
                {"id": 1, "source": "YouTube: React Full Course", "skill": "Web Development", "type": "video", "status": "In Progress"}
            ],
            "assigned_projects": assigned_projects if assigned_projects else [
                {"id": 1, "title": "Build a Portfolio Website", "difficulty": "Beginner", "estimatedTime": "8 hours", "skills": ["HTML", "CSS", "React"]}
            ],
            "activity_alerts": activity_alerts if activity_alerts else [
                {"id": 1, "type": "info", "message": "Start practicing to see activity alerts here!", "time": "Just now"}
            ]
        }
    
    except Exception as e:
        print(f"Dashboard Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/deadlines/{uid}")
async def get_deadlines(uid: str):
    """
    Get upcoming deadlines for the user
    """
    try:
        user_ref = db.collection("user_profiles").document(uid)
        deadlines_ref = user_ref.collection("deadlines").where("dueDate", ">=", datetime.now()).order_by("dueDate").limit(10)
        
        deadlines = []
        for doc in deadlines_ref.stream():
            data = doc.to_dict()
            deadlines.append({
                "id": doc.id,
                "title": data.get('title', ''),
                "dueDate": data.get('dueDate').isoformat() if data.get('dueDate') else None,
                "category": data.get('category', 'assignment'),
                "subject": data.get('subject')
            })
        
        return {"deadlines": deadlines}
    
    except Exception as e:
        print(f"Deadlines Error: {str(e)}")
        return {"deadlines": []}


@router.get("/reminders/{uid}")
async def get_reminders(uid: str):
    """
    Get study reminders for the user
    """
    try:
        user_ref = db.collection("user_profiles").document(uid)
        reminders_ref = user_ref.collection("reminders").where("completed", "==", False).order_by("dueTime").limit(10)
        
        reminders = []
        for doc in reminders_ref.stream():
            data = doc.to_dict()
            reminders.append({
                "id": doc.id,
                "subject": data.get('subject', ''),
                "topic": data.get('topic', ''),
                "dueTime": data.get('dueTime').isoformat() if data.get('dueTime') else None,
                "priority": data.get('priority', 'medium'),
                "completed": data.get('completed', False)
            })
        
        return {"reminders": reminders}
    
    except Exception as e:
        print(f"Reminders Error: {str(e)}")
        return {"reminders": []}


def format_time_ago(timestamp) -> str:
    """Format timestamp to human-readable time ago"""
    if not timestamp:
        return "Just now"
    
    # Handle Firestore timestamp
    if hasattr(timestamp, 'timestamp'):
        dt = datetime.fromtimestamp(timestamp.timestamp())
    elif isinstance(timestamp, str):
        try:
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        except:
            return "Just now"
    elif isinstance(timestamp, datetime):
        dt = timestamp
    else:
        return "Just now"
    
    now = datetime.now()
    diff = now - dt
    
    if diff.total_seconds() < 60:
        return "Just now"
    elif diff.total_seconds() < 3600:
        minutes = int(diff.total_seconds() / 60)
        return f"{minutes} {'minute' if minutes == 1 else 'minutes'} ago"
    elif diff.total_seconds() < 86400:
        hours = int(diff.total_seconds() / 3600)
        return f"{hours} {'hour' if hours == 1 else 'hours'} ago"
    else:
        days = int(diff.total_seconds() / 86400)
        return f"{days} {'day' if days == 1 else 'days'} ago"
