"""Task Routes for AI Task Delegator.
Person 4: Backend.
"""

from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from backend.app.database.database import db
from backend.app.models.task import Task, TaskCreate, TaskAssign
from ai.task_analyzer import analyze_task

router = APIRouter(prefix="", tags=["Tasks"])


@router.get("/tasks", response_model=List[Task])
def get_tasks():
    """Retrieve all tasks in the system."""
    tasks = db.get_all("tasks")
    return tasks


@router.post("/tasks", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(task_in: TaskCreate):
    """Create a new task. If category or required skills are missing,
    automatically enrich via the task analyzer.
    """
    task_dict = task_in.model_dump()

    # If title is missing, generate title from description
    if not task_dict.get("title"):
        task_dict["title"] = task_dict["description"][:40] + ("..." if len(task_dict["description"]) > 40 else "")

    # Auto-analyze if required_skills are not explicitly provided
    if not task_dict.get("required_skills"):
        analysis = analyze_task(task_dict["description"])
        task_dict["category"] = task_dict.get("category") or analysis.get("category", "General")
        task_dict["required_skills"] = analysis.get("required_skills", [])
        task_dict["priority"] = task_dict.get("priority") or analysis.get("priority", "Medium")
        task_dict["difficulty"] = task_dict.get("difficulty") or analysis.get("difficulty", 3)

    task_dict["status"] = "Pending"
    task_dict["assigned_to"] = None

    created = db.insert("tasks", task_dict)
    return created


@router.post("/assign")
def assign_task(assignment: TaskAssign):
    """Assign an employee to a task and update availability."""
    task = db.get_by_id("tasks", assignment.task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {assignment.task_id} not found"
        )

    employee = db.get_by_id("employees", assignment.employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID {assignment.employee_id} not found"
        )

    # Update task status and assigned employee
    updated_task = db.update("tasks", assignment.task_id, {
        "status": "Assigned",
        "assigned_to": assignment.employee_id
    })

    # Update employee availability status
    db.update("employees", assignment.employee_id, {
        "available": False
    })

    return {
        "message": f"Task '{task.get('title')}' successfully assigned to {employee.get('name')}",
        "task": updated_task,
        "employee": employee
    }


@router.get("/tasks/{task_id}", response_model=Task)
def get_task_by_id(task_id: int):
    """Retrieve a single task by ID."""
    task = db.get_by_id("tasks", task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )
    return task
