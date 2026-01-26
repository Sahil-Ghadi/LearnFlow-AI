from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from utils.llm import llm
from firebase_admin import firestore
import json
import uuid

router = APIRouter(prefix="/assessment", tags=["assessment"])
db = firestore.client()

class GenerateRequest(BaseModel):
    subject: str
    topics: List[str]
    set_number: int  # 1, 2, or 3

class Question(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_answer: int  # 0-3
    topic_tag: str

class SubmitRequest(BaseModel):
    uid: str
    exam_id: str
    set_number: int
    answers: List[Dict] # [{question_id: "id", selected: 0}]
    questions: List[Question]

@router.post("/generate", response_model=List[Question])
async def generate_assessment(request: GenerateRequest):
    try:
        # Simplified: Always mixed difficulty for standard assessment
        topics_str = ", ".join(request.topics)
        
        prompt = f"""
        Generate 10 Multiple Choice Questions (MCQs) for the subject "{request.subject}".
        Focus specifically on these topics: {topics_str}.
        Difficulty Level: Mixed (Fundamental to Application-based).
        
        Return STRICT JSON format:
        [
            {{
                "question": "Question text here?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": 0,  // Index of correct option (0-3)
                "topic_tag": "Specific Topic Name"
            }}
        ]
        """
        
        response = llm.invoke(prompt)
        content = response.content if hasattr(response, 'content') else str(response)
        
        # Clean markdown
        clean_content = content.replace("```json", "").replace("```", "").strip()
        start = clean_content.find('[')
        end = clean_content.rfind(']')
        
        if start == -1 or end == -1:
             raise ValueError("Failed to parse JSON")
             
        data = json.loads(clean_content[start:end+1])
        
        questions = []
        for q in data:
            questions.append({
                "id": str(uuid.uuid4()),
                "question": q['question'],
                "options": q['options'],
                "correct_answer": q['correct_answer'],
                "topic_tag": q['topic_tag']
            })
            
        return questions

    except Exception as e:
        print(f"Assessment Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submit")
async def submit_assessment(request: SubmitRequest):
    try:
        correct_count = 0
        total = len(request.questions)
        weak_topics = []
        
        # Grading
        for q in request.questions:
            user_ans = next((a['selected'] for a in request.answers if a['question_id'] == q.id), -1)
            if user_ans == q.correct_answer:
                correct_count += 1
            else:
                weak_topics.append(q.topic_tag)
                
        accuracy = (correct_count / total) * 100
        
        # Update User Stats
        user_ref = db.collection("user_profiles").document(request.uid)
        
        # Update Exam specific stats
        exam_ref = user_ref.collection("exams").document(request.exam_id)
        
        # Simple overwrite/update for readiness based on latest assessment
        # Can be made more complex (average history) later
        exam_ref.update({
            "readiness_score": accuracy, # Direct mapping for now as per request
            "last_assessment_date": firestore.SERVER_TIMESTAMP
        })
        
        # Update Global Weak Areas
        profile_doc = user_ref.get()
        current_weak_areas = profile_doc.to_dict().get('weak_areas', []) if profile_doc.exists else []
        
        # Append new weak topics (Allow duplicates to track frequency)
        # Keep last 50 entries to maintain history but avoid unlimited growth
        updated_weak_areas = (current_weak_areas + weak_topics)[-50:]
        
        user_ref.update({
           "weak_areas": updated_weak_areas
        })
        
        # Log performance point (for graph)
        # In a real app, this goes to a subcollection. Here we might store it in a simplified way or just rely on component fetching.
        # We will create a stats collection entry for history
        stats_history_ref = user_ref.collection("stats_history")
        stats_history_ref.add({
            "date": firestore.SERVER_TIMESTAMP,
            "exam_subject": request.exam_id, # using ID or could fetch name
            "score": accuracy,
            "type": "assessment"
        })

        return {
            "score": correct_count,
            "total": total,
            "accuracy": accuracy,
            "readiness": accuracy,
            "weak_areas": list(set(weak_topics))
        }

    except Exception as e:
        print(f"Submission Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
