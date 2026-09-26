"""AI Task Analyzer
Person 2: Extracts task categories, required skills, priority, and difficulty using LLM
or transparent rule-based demo heuristics when no API key is provided.
"""

import json
import os
import re
from typing import Any, Dict
from dotenv import load_dotenv

from ai.prompts import build_analysis_prompt
from ai.schemas import TaskAnalysisResult

load_dotenv()


def _mock_analyze_task(task_description: str) -> Dict[str, Any]:
    """Fallback heuristic analyzer used when no LLM API key is configured.
    Provides intelligent mock responses based on input keywords for realistic hackathon demos.
    """
    text = task_description.lower()

    if any(k in text for k in ["instagram", "ad", "marketing", "campaign", "social media", "branding", "copy"]):
        category = "Marketing"
        required_skills = ["Marketing", "Graphic Design", "Communication"]
        if "social" in text:
            required_skills.append("Social Media")
        priority = "High" if "urgent" in text or "launch" in text else "Medium"
        difficulty = 3

    elif any(k in text for k in ["code", "api", "database", "backend", "python", "bug", "endpoint", "stripe"]):
        category = "Engineering"
        required_skills = ["Python", "Backend Development", "API Integration"]
        priority = "Critical" if "urgent" in text or "bug" in text or "fix" in text else "High"
        difficulty = 4

    elif any(k in text for k in ["react", "frontend", "ui", "ux", "css", "website", "landing page"]):
        category = "Frontend"
        required_skills = ["Frontend Development", "React", "UI/UX Design"]
        priority = "Medium"
        difficulty = 3

    elif any(k in text for k in ["finance", "reconcil", "accounting", "tax", "balance sheet", "excel", "invoice"]):
        category = "Finance"
        required_skills = ["Finance", "Accounting", "Excel"]
        priority = "High" if "tax" in text or "deadline" in text else "Medium"
        difficulty = 3

    elif any(k in text for k in ["customer", "client", "support", "onboard", "email", "meeting"]):
        category = "Operations"
        required_skills = ["Customer Support", "Communication", "Client Management"]
        priority = "Medium"
        difficulty = 2

    else:
        # Default fallback structure specified in requirements
        category = "Marketing"
        required_skills = ["Marketing", "Graphic Design", "Communication"]
        priority = "Medium"
        difficulty = 3

    return {
        "category": category,
        "required_skills": required_skills,
        "priority": priority,
        "difficulty": difficulty,
        "summary": task_description[:80] + ("..." if len(task_description) > 80 else "")
    }


def analyze_task(task_description: str) -> Dict[str, Any]:
    """Analyze a task description to identify required skills, category, priority, and difficulty.
    
    If LLM_API_KEY is configured in the environment, attempts to call an LLM API.
    Otherwise, gracefully falls back to the deterministic heuristic demo analyzer.
    """
    api_key = os.getenv("LLM_API_KEY", "").strip()

    if not api_key:
        # Demo mode without requiring external keys
        result = _mock_analyze_task(task_description)
        return TaskAnalysisResult(**result).model_dump()

    # Placeholder for live LLM integration (OpenAI/Gemini/Anthropic)
    try:
        # Example pseudo-call / extension point for Person 2:
        # prompt_data = build_analysis_prompt(task_description)
        # response = call_llm(prompt_data, api_key=api_key)
        # return json.loads(response)
        
        # When Person 2 adds their preferred SDK, replace below line:
        result = _mock_analyze_task(task_description)
        return TaskAnalysisResult(**result).model_dump()
    except Exception as e:
        # Resilient fallback if API call errors out during demo
        fallback = _mock_analyze_task(task_description)
        fallback["error"] = f"LLM error: {str(e)}. Using fallback demo analysis."
        return fallback
