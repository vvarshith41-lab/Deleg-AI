from pydantic import BaseModel, Field
from typing import List, Optional


class TaskAnalysisRequest(BaseModel):
    task_description: str = Field(..., description="The raw natural language task description to analyze")


class TaskAnalysisResult(BaseModel):
    category: str = Field(..., description="High-level category of the task (e.g. Marketing, Engineering, Design)")
    required_skills: List[str] = Field(..., description="List of specific skills needed to accomplish the task")
    priority: str = Field(default="Medium", description="Estimated priority level: Low, Medium, High, or Critical")
    difficulty: int = Field(default=3, ge=1, le=5, description="Estimated difficulty rating from 1 (easiest) to 5 (hardest)")
    summary: Optional[str] = Field(default="", description="Brief distilled summary of what needs to be done")
