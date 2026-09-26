from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class FeedbackCreate(BaseModel):
    task_id: int
    employee_id: int
    rating: float = Field(..., ge=0.0, le=100.0, description="Task performance rating from 0 to 100")
    comments: Optional[str] = Field(default="", description="Feedback review comments")


class Feedback(FeedbackCreate):
    id: int
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    skills_evaluated: Optional[List[str]] = Field(default_factory=list)


class PerformanceMetric(BaseModel):
    total_employees: int
    active_employees: int
    pending_tasks: int
    assigned_tasks: int
    completed_tasks: int
    average_team_performance: float
