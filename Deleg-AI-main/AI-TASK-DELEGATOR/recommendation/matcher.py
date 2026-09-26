"""Matcher Module for Employee Recommendation.
Person 3: Recommendation Engine.

Ranks candidates and returns the best-fit employee matching required skills.
"""

from typing import Any, Dict, List
from recommendation.scoring import calculate_score


def recommend_employee(employees: List[Dict[str, Any]], required_skills: List[str]) -> Dict[str, Any]:
    """Recommend the most suitable employee based on weighted skills, performance, and availability.

    Args:
        employees: List of employee records
        required_skills: List of required skills identified for the task

    Returns:
        Structured recommendation dictionary containing the top candidate:
        {
            "employee": "Rahul",
            "employee_id": 1,
            "score": 92,
            "reasons": [
                "Strong marketing skill",
                "Strong graphic design skill",
                "Currently available"
            ],
            "alternatives": [...]
        }
    """
    if not employees:
        return {
            "employee": "None available",
            "employee_id": None,
            "score": 0,
            "reasons": ["No employees registered in the system"],
            "alternatives": []
        }

    scored_candidates = []
    for emp in employees:
        score, reasons = calculate_score(emp, required_skills)
        scored_candidates.append({
            "employee": emp.get("name", "Unknown"),
            "employee_id": emp.get("id"),
            "score": int(round(score)),
            "reasons": reasons,
            "available": emp.get("available", False),
            "performance": emp.get("performance", 0)
        })

    # Sort descending by score. In case of a tie, prioritize currently available employees
    scored_candidates.sort(key=lambda x: (x["score"], 1 if x["available"] else 0), reverse=True)

    top_candidate = scored_candidates[0]
    alternatives = scored_candidates[1:4]  # Up to 3 runner-ups

    return {
        "employee": top_candidate["employee"],
        "employee_id": top_candidate["employee_id"],
        "score": top_candidate["score"],
        "reasons": top_candidate["reasons"],
        "alternatives": alternatives
    }
