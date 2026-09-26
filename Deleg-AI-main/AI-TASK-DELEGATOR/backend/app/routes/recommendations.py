"""Recommendations and AI Task Analysis Routes.
Person 2 & 3 & 4 integration.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from backend.app.database.database import db
from ai.task_analyzer import analyze_task
from ai.schemas import TaskAnalysisRequest
from recommendation.matcher import recommend_employee

router = APIRouter(prefix="", tags=["AI & Recommendations"])


class RecommendRequest(BaseModel):
    task_description: Optional[str] = Field(default="", example="Build a customer dashboard in React")
    required_skills: Optional[List[str]] = Field(default=None, example=["React", "Frontend Development"])


@router.post("/analyze-task")
def endpoint_analyze_task(payload: TaskAnalysisRequest):
    """Analyze a task description to identify category, required skills, priority, and difficulty."""
    if not payload.task_description or not payload.task_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="task_description cannot be empty"
        )
    analysis = analyze_task(payload.task_description)
    return analysis


@router.post("/recommend")
def endpoint_recommend(payload: RecommendRequest):
    """Recommend the best-fit employee for a task based on skills, past performance, and availability."""
    required_skills = payload.required_skills

    # If required_skills not provided, extract them using the AI task analyzer
    if not required_skills and payload.task_description:
        analysis = analyze_task(payload.task_description)
        required_skills = analysis.get("required_skills", [])

    if required_skills is None:
        required_skills = []

    employees = db.get_all("employees")
    recommendation = recommend_employee(employees, required_skills)
    recommendation["required_skills"] = required_skills
    return recommendation
