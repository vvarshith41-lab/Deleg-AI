from pydantic import BaseModel, Field
from typing import List, Optional


class TaskBase(BaseModel):
    title: str = Field(..., example="Create Instagram Ad Campaign")
    description: str = Field(..., example="Create an Instagram advertisement for product launch")
    category: str = Field(default="General", example="Marketing")
    required_skills: List[str] = Field(default_factory=list, example=["Marketing", "Graphic Design"])
    priority: str = Field(default="Medium", example="High")
    difficulty: int = Field(default=3, ge=1, le=5)
    deadline: Optional[str] = Field(default="", example="2026-10-05")
    status: str = Field(default="Pending", example="Pending")  # Pending, Assigned, Completed
    assigned_to: Optional[int] = Field(default=None, description="Employee ID assigned to this task")


class TaskCreate(BaseModel):
    title: Optional[str] = None
    description: str = Field(..., example="Create an Instagram advertisement for our new product")
    category: Optional[str] = None
    required_skills: Optional[List[str]] = None
    priority: Optional[str] = "Medium"
    difficulty: Optional[int] = 3
    deadline: Optional[str] = ""


class TaskAssign(BaseModel):
    task_id: int
    employee_id: int


class Task(TaskBase):
    id: int
