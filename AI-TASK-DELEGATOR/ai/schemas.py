from typing import List
from pydantic import BaseModel


class TaskAnalysis(BaseModel):
    category: str
    required_skills: List[str]
    priority: str
    difficulty: int