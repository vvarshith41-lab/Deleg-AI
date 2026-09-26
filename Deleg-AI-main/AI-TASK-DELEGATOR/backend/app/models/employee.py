from pydantic import BaseModel, Field
from typing import Dict, Optional


class EmployeeBase(BaseModel):
    name: str = Field(..., example="Rahul")
    skills: Dict[str, float] = Field(default_factory=dict, description="Skill name to proficiency score mapping (0-100)")
    performance: float = Field(default=85.0, ge=0.0, le=100.0, description="Overall past performance rating (0-100)")
    available: bool = Field(default=True, description="Current availability status")


class EmployeeCreate(EmployeeBase):
    pass


class Employee(EmployeeBase):
    id: int = Field(..., description="Unique employee identifier")
