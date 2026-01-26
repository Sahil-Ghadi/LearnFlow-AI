from fastapi import APIRouter, HTTPException
from firebase_admin import firestore
from datetime import datetime, timedelta
from typing import List, Dict
import statistics

router = APIRouter(prefix="/analytics", tags=["analytics"])
db = firestore.client()

@router.get("/academic/{uid}")
async def get_academic_analytics(uid: str):
    """Get comprehensive academic analytics data"""
    try:
        user_ref = db.collection("user_profiles").document(uid)
        profile_doc = user_ref.get()
        
        if not profile_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        profile_data = profile_doc.to_dict()
        
        # Get all exams for readiness data
        exams_ref = user_ref.collection("exams")
        all_exams = [doc.to_dict() for doc in exams_ref.stream()]
        
        exam_readiness_data = []
        syllabus_progress_data = []
        
        for exam in all_exams:
            subject = exam.get('subject', 'Unknown')
            readiness = exam.get('readiness_score', 0)
            completed = exam.get('completed_topics', 0)
            total = exam.get('total_topics', 1)
            
            exam_readiness_data.append({
                "subject": subject,
                "readiness": int(readiness)
            })
            
            completion_pct = int((completed / total) * 100) if total > 0 else 0
            syllabus_progress_data.append({
                "name": subject[:10],  # Shortened name
                "completed": completion_pct,
                "remaining": 100 - completion_pct
            })
        
        # Get performance history
        history_ref = user_ref.collection("stats_history").order_by("date", direction=firestore.Query.ASCENDING).limit(10)
        history_docs = list(history_ref.stream())
        
        weekly_performance = []
        scores = []
        
        for i, doc in enumerate(history_docs):
            data = doc.to_dict()
            score = data.get('score', 0)
            scores.append(score)
            
            # Create week labels
            week_label = f"Week {i+1}"
            target = 70 + (i * 2)  # Progressive target
            
            weekly_performance.append({
                "week": week_label,
                "score": int(score),
                "target": target
            })
        
        # Calculate stats
        avg_readiness = int(statistics.mean([e["readiness"] for e in exam_readiness_data])) if exam_readiness_data else 0
        avg_syllabus = int(statistics.mean([s["completed"] for s in syllabus_progress_data])) if syllabus_progress_data else 0
        avg_score = int(statistics.mean(scores)) if scores else 0
        
        # Calculate trend
        trend = 0
        if len(scores) >= 2:
            trend = int(scores[-1] - scores[-2])
        
        # Study streak (from profile or calculate)
        study_streak = profile_data.get('study_streak', 0)
        
        return {
            "stats": {
                "overall_readiness": avg_readiness,
                "syllabus_coverage": avg_syllabus,
                "average_score": avg_score,
                "study_streak": study_streak,
                "readiness_trend": trend,
                "score_trend": trend
            },
            "exam_readiness_data": exam_readiness_data if exam_readiness_data else [
                {"subject": "No data yet", "readiness": 0}
            ],
            "syllabus_progress_data": syllabus_progress_data if syllabus_progress_data else [
                {"name": "No data", "completed": 0, "remaining": 100}
            ],
            "weekly_performance": weekly_performance if weekly_performance else [
                {"week": "Week 1", "score": 0, "target": 70}
            ]
        }
    
    except Exception as e:
        print(f"Analytics Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sidehustle/{uid}")
async def get_sidehustle_analytics(uid: str):
    """
    Get side hustle / skill-building analytics data
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
        
        skill_mastery_data = []
        colors = [
            'hsl(var(--chart-1))',
            'hsl(var(--chart-2))',
            'hsl(var(--chart-3))',
            'hsl(var(--chart-4))',
            'hsl(var(--chart-5))'
        ]
        
        for i, skill in enumerate(all_skills[:5]):  # Top 5 skills
            skill_mastery_data.append({
                "name": skill.get('name', 'Skill'),
                "value": int(skill.get('mastery', 0)),
                "color": colors[i % len(colors)]
            })
        
        # Get projects data
        projects_ref = user_ref.collection("projects")
        all_projects = [doc.to_dict() for doc in projects_ref.stream()]
        
        # Group projects by month
        project_completion_data = []
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        
        for month in months:
            # Count projects completed in this month
            count = sum(1 for p in all_projects if p.get('completion_month', '') == month)
            project_completion_data.append({
                "month": month,
                "projects": count
            })
        
        # Portfolio items
        portfolio_items = [
            {
                "category": "Web Projects",
                "count": sum(1 for p in all_projects if p.get('category') == 'web'),
                "target": 6
            },
            {
                "category": "API Projects",
                "count": sum(1 for p in all_projects if p.get('category') == 'api'),
                "target": 4
            },
            {
                "category": "Full Stack",
                "count": sum(1 for p in all_projects if p.get('category') == 'fullstack'),
                "target": 3
            },
            {
                "category": "Open Source",
                "count": sum(1 for p in all_projects if p.get('category') == 'opensource'),
                "target": 2
            }
        ]
        
        # Calculate stats
        skills_in_progress = len([s for s in all_skills if s.get('status') == 'in_progress'])
        projects_completed = len([p for p in all_projects if p.get('status') == 'completed'])
        
        total_portfolio_items = sum(item['count'] for item in portfolio_items)
        total_portfolio_target = sum(item['target'] for item in portfolio_items)
        portfolio_ready = int((total_portfolio_items / total_portfolio_target) * 100) if total_portfolio_target > 0 else 0
        
        return {
            "stats": {
                "skills_in_progress": skills_in_progress,
                "projects_completed": projects_completed,
                "portfolio_ready": portfolio_ready,
                "freelance_ready": "Soon" if portfolio_ready > 50 else "Not Yet"
            },
            "skill_mastery_data": skill_mastery_data if skill_mastery_data else [
                {"name": "No skills yet", "value": 0, "color": colors[0]}
            ],
            "project_completion_data": project_completion_data,
            "portfolio_items": portfolio_items
        }
    
    except Exception as e:
        print(f"Analytics Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
