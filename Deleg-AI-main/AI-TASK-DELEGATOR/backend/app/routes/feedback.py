"""Feedback and Continual Learning Routes.
Person 4: Backend & Continual Learning.
"""

from fastapi import APIRouter, HTTPException, status
from typing import List
from backend.app.database.database import db
from backend.app.models.performance import FeedbackCreate, PerformanceMetric
from backend.app.learning.continual_learning import update_employee_performance

router = APIRouter(prefix="", tags=["Feedback & Analytics"])


@router.post("/feedback", status_code=status.HTTP_201_CREATED)
def submit_feedback(feedback_in: FeedbackCreate):
    """Submit post-task completion feedback.
    Incrementally updates the employee's performance rating and skills without retraining models.
    """
    try:
        feedback_dict = feedback_in.model_dump()
        result = update_employee_performance(
            employee_id=feedback_in.employee_id,
            task_id=feedback_in.task_id,
            feedback_data=feedback_dict
        )
        return {
            "message": "Feedback applied successfully. Employee skills incrementally updated.",
            "data": result
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process feedback: {str(e)}"
        )


@router.get("/analytics")
def get_analytics():
    """Retrieve operational dashboard metrics and team performance aggregates."""
    employees = db.get_all("employees")
    tasks = db.get_all("tasks")

    total_employees = len(employees)
    active_employees = len([e for e in employees if e.get("available", False)])
    pending_tasks = len([t for t in tasks if t.get("status") == "Pending"])
    assigned_tasks = len([t for t in tasks if t.get("status") == "Assigned"])
    completed_tasks = len([t for t in tasks if t.get("status") == "Completed"])

    avg_performance = 0.0
    if employees:
        avg_performance = round(sum(e.get("performance", 0.0) for e in employees) / total_employees, 1)

    return {
        "total_employees": total_employees,
        "active_employees": active_employees,
        "pending_tasks": pending_tasks,
        "assigned_tasks": assigned_tasks,
        "completed_tasks": completed_tasks,
        "average_team_performance": avg_performance,
        "recent_tasks": sorted(tasks, key=lambda x: x.get("id", 0), reverse=True)[:5]
    }


@router.get("/feedback")
def get_all_feedback():
    """Retrieve all historical feedback evaluations."""
    return db.get_all("feedback")
