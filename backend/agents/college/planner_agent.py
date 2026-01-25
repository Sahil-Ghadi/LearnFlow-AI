from agents.state import CollegeAgentState
from utils.llm import llm
import json
import re

def planner_agent(state: CollegeAgentState) -> CollegeAgentState:
    """Create a study plan based on exam details and urgency"""
    
    urgency = state.get("urgency", "medium")
    topics = state.get("exam", {}).get("topics", [])
    days_left = state.get("days_left", 7)
    
    prompt = f"""
    Create a structured study plan in JSON format.
    
    Context:
    - Urgency level: {urgency}
    - Topics to cover: {', '.join(topics) if topics else 'General review'}
    - Days remaining: {days_left}
    
    Return ONLY a valid JSON object in this format:
    {{
      "daily_plan": [
        {{
          "day": 1,
          "tasks": ["task description 1", "task description 2"]
        }}
      ],
      "total_hours": 20,
      "priority_topics": ["topic1", "topic2"]
    }}
    
    Make the plan realistic and achievable. Return only the JSON, no other text.
    """
    
    try:
        response = llm.invoke(prompt)
        content = response.content if hasattr(response, 'content') else str(response)
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            plan = json.loads(json_match.group())
        else:
            # Fallback plan
            plan = {
                "daily_plan": [
                    {"day": i+1, "tasks": [f"Study session {i+1}"]}
                    for i in range(min(days_left, 7))
                ],
                "total_hours": days_left * 3,
                "priority_topics": topics[:3] if topics else []
            }
    except Exception as e:
        print(f"Error creating plan: {e}")
        plan = {
            "daily_plan": [
                {"day": i+1, "tasks": [f"Study session {i+1}"]}
                for i in range(min(days_left, 7))
            ],
            "total_hours": days_left * 3,
            "priority_topics": topics[:3] if topics else []
        }
    
    return {**state, "plan": plan}
