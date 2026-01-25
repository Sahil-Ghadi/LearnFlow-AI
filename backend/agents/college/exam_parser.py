from agents.state import CollegeAgentState
from utils.llm import llm
import json
import re

def exam_parser_agent(state: CollegeAgentState) -> CollegeAgentState:
    """Parse exam information from user input"""
    raw = state.get("input", "")
    
    prompt = f"""
    Extract exam information from the following text and return ONLY a valid JSON object.
    
    Required format:
    {{
      "subject": "subject name",
      "exam_date": "YYYY-MM-DD",
      "topics": ["topic1", "topic2", ...]
    }}
    
    Text: {raw}
    
    Return only the JSON, no other text.
    """
    
    try:
        response = llm.invoke(prompt)
        # Extract JSON from response
        content = response.content if hasattr(response, 'content') else str(response)
        
        # Try to find JSON in the response
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group())
        else:
            # Fallback if no JSON found
            parsed = {
                "subject": "Unknown",
                "exam_date": "2024-12-31",
                "topics": []
            }
    except Exception as e:
        print(f"Error parsing exam: {e}")
        parsed = {
            "subject": "Unknown",
            "exam_date": "2024-12-31",
            "topics": []
        }
    
    return {**state, "exam": parsed}
