from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from db.firebase import db
from datetime import datetime
import uuid

router = APIRouter(prefix="/exams", tags=["exams"])

class SyllabusItem(BaseModel):
    name: str
    completed: bool = False

class Exam(BaseModel):
    uid: str
    subject: str
    title: str
    date: str
    syllabus: List[SyllabusItem]
    total_topics: Optional[int] = 0
    completed_topics: Optional[int] = 0

class ExamResponse(Exam):
    id: str
    created_at: str

@router.post("/create", response_model=ExamResponse)
async def create_exam(exam: Exam):
    try:
        exam_data = exam.model_dump()
        exam_data['created_at'] = datetime.utcnow().isoformat()
        exam_data['total_topics'] = len(exam.syllabus)
        exam_data['completed_topics'] = sum(1 for item in exam.syllabus if item.completed)
        
        # Save to subcollection
        doc_ref = db.collection("user_profiles").document(exam.uid).collection("exams").add(exam_data)
        doc_id = doc_ref[1].id
        
        return {**exam_data, "id": doc_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ToggleTopicRequest(BaseModel):
    topic_index: int
    completed: bool

@router.patch("/{uid}/{exam_id}/toggle", response_model=ExamResponse)
async def toggle_topic(uid: str, exam_id: str, request: ToggleTopicRequest):
    try:
        doc_ref = db.collection("user_profiles").document(uid).collection("exams").document(exam_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Exam not found")
            
        data = doc.to_dict()
        syllabus = data.get('syllabus', [])
        
        # Check if syllabus needs migration (contains strings)
        migrated = False
        if syllabus and isinstance(syllabus[0], str):
            syllabus = [{"name": item, "completed": False} for item in syllabus]
            migrated = True

        if 0 <= request.topic_index < len(syllabus):
             syllabus[request.topic_index]['completed'] = request.completed
             
             # Recalculate totals
             total = len(syllabus)
             completed = sum(1 for item in syllabus if item['completed'])
             
             update_data = {
                 'syllabus': syllabus, # Save the migrated/updated structure
                 'total_topics': total,
                 'completed_topics': completed
             }
             
             doc_ref.update(update_data)
             
             # Return updated exam
             return {**data, **update_data, "id": doc.id}
        else:
             raise HTTPException(status_code=400, detail="Invalid topic index")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list/{uid}", response_model=List[ExamResponse])
async def list_exams(uid: str):
    try:
        exams_ref = db.collection("user_profiles").document(uid).collection("exams")
        docs = exams_ref.stream()
        
        exams = []
        for doc in docs:
            data = doc.to_dict()
            # Handle legacy syllabus format (list of strings)
            if 'syllabus' in data and isinstance(data['syllabus'], list):
                new_syllabus = []
                for item in data['syllabus']:
                    if isinstance(item, str):
                        new_syllabus.append({"name": item, "completed": False})
                    else:
                        new_syllabus.append(item)
                data['syllabus'] = new_syllabus

            exams.append({**data, "id": doc.id})
            
        # Sort by date
        exams.sort(key=lambda x: x.get('date', ''))
        
        return exams
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{uid}/{exam_id}")
async def delete_exam(uid: str, exam_id: str):
    try:
        db.collection("user_profiles").document(uid).collection("exams").document(exam_id).delete()
        return {"message": "Exam deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
