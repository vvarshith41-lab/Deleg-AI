"""Continual Learning Module for AI Task Delegator.
Person 4: Backend & Continual Learning.

Implements an online, incremental learning update mechanism:
Demonstrates that the system continuously adapts employee skill and performance
scores from real-world feedback without retraining any underlying AI/ML model.
"""

from typing import Any, Dict, List, Optional
from datetime import datetime
from backend.app.database.database import db


def update_skill(old_score: float, feedback_score: float) -> float:
    """Incrementally update a skill score based on new task feedback.
    
    Formula:
        new_score = old_score * 0.8 + feedback_score * 0.2
    
    Example:
        old_score = 80, feedback_score = 100 -> new_score = 84.0
    """
    new_score = (float(old_score) * 0.8) + (float(feedback_score) * 0.2)
    return round(new_score, 1)


def update_employee_performance(employee_id: int, task_id: int, feedback_data: Dict[str, Any]) -> Dict[str, Any]:
    """Incrementally adapt employee skills and overall performance from completed task feedback.
    
    Args:
        employee_id: The ID of the employee who completed the task
        task_id: The ID of the completed task
        feedback_data: Dict containing rating (0-100), comments, and optional skills_evaluated
        
    Returns:
        Summary dictionary showing pre-update and post-update values for verification
    """
    employee = db.get_by_id("employees", employee_id)
    if not employee:
        raise ValueError(f"Employee with ID {employee_id} not found")

    task = db.get_by_id("tasks", task_id)
    feedback_rating = float(feedback_data.get("rating", 80.0))

    # Determine which skills are impacted
    skills_to_update: List[str] = feedback_data.get("skills_evaluated", [])
    if not skills_to_update and task:
        skills_to_update = task.get("required_skills", [])

    old_skills = dict(employee.get("skills", {}))
    new_skills = dict(old_skills)
    skill_diffs = {}

    for skill in skills_to_update:
        old_val = old_skills.get(skill, 70.0)  # Default starting baseline if new skill
        updated_val = update_skill(old_val, feedback_rating)
        new_skills[skill] = updated_val
        skill_diffs[skill] = {
            "old": old_val,
            "new": updated_val,
            "change": round(updated_val - old_val, 1)
        }

    # Update overall performance score incrementally
    old_performance = float(employee.get("performance", 80.0))
    new_performance = round((old_performance * 0.8) + (feedback_rating * 0.2), 1)

    # Persist updated employee profile to database
    db.update("employees", employee_id, {
        "skills": new_skills,
        "performance": new_performance,
        "available": True  # Mark employee available again upon task completion
    })

    # Mark task as completed
    if task:
        db.update("tasks", task_id, {
            "status": "Completed"
        })

    # Store feedback record
    feedback_record = {
        "task_id": task_id,
        "employee_id": employee_id,
        "rating": feedback_rating,
        "comments": feedback_data.get("comments", ""),
        "skills_evaluated": skills_to_update,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    db.insert("feedback", feedback_record)

    return {
        "employee_id": employee_id,
        "employee_name": employee.get("name"),
        "task_id": task_id,
        "old_performance": old_performance,
        "new_performance": new_performance,
        "skill_updates": skill_diffs,
        "feedback": feedback_record
    }
