from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from utils.llm import llm
from youtube_search import YoutubeSearch
import json

router = APIRouter(prefix="/learning", tags=["learning"])

class RecommendationRequest(BaseModel):
    topic: str
    subject: str

class VideoResource(BaseModel):
    id: str
    title: str
    thumbnail: str
    duration: str
    channel: str
    link: str
    viewCount: Optional[str] = "N/A"

@router.post("/recommend", response_model=List[VideoResource])
async def recommend_resources(request: RecommendationRequest):
    try:
        # Step 1: Use LLM to optimize the search query
        prompt = f"""
        You are an expert tutor. A student needs to learn about "{request.topic}" in the subject "{request.subject}".
        
        Generate ONE single, highly optimized YouTube search query that would yield the best educational videos for this specific concept.
        Focus on "conceptual understanding" or "visual explanation".
        
        Return ONLY the query string, nothing else. No dictionary, no JSON. just the text.
        """
        
        response = llm.invoke(prompt)
        query = response.content if hasattr(response, 'content') else str(response)
        query = query.strip().replace('"', '')
        
        # Step 2: Search YouTube using youtube_search library
        results = YoutubeSearch(query, max_results=4).to_dict()

        videos = []
        for item in results:
            # item keys: id, thumbnails, title, long_desc, channel, duration, views, publish_time, url_suffix
            
            # Construct link
            link = f"https://www.youtube.com{item['url_suffix']}"
            
            # Get thumbnail (usually standard resolution is first)
            thumbnail = item['thumbnails'][0] if item.get('thumbnails') else ""
            
            videos.append({
                "id": item['id'],
                "title": item['title'],
                "thumbnail": thumbnail,
                "duration": item.get('duration', 'N/A'),
                "channel": item.get('channel', 'Unknown'),
                "link": link,
                "viewCount": item.get('views', 'N/A')
            })
        
        return videos

    except Exception as e:
        print(f"Learning Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
