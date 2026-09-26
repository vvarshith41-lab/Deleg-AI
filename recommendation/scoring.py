"""Scoring Module for Employee Matching.
Person 3: Recommendation Engine.

Scoring Formula:
Final Score = 60% Skill Match + 25% Past Performance + 15% Availability
"""

from typing import Any, Dict, List, Tuple


def calculate_score(employee: Dict[str, Any], required_skills: List[str]) -> Tuple[float, List[str]]:
    """Calculate the recommendation score and generate explainable reasons.

    Args:
        employee: Dictionary containing employee details (name, skills, performance, available)
        required_skills: List of required skill names for the task

    Returns:
        A tuple of (final_score, reasons_list)
    """
    reasons: List[str] = []
    emp_skills = employee.get("skills", {})
    performance = float(employee.get("performance", 75))
    is_available = bool(employee.get("available", False))

    # 1. Skill Match Calculation (60% weight)
    if not required_skills:
        skill_match_score = 75.0
        reasons.append("General task profile match")
    else:
        matched_scores = []
        for skill in required_skills:
            # Case-insensitive skill matching
            score = 0
            for emp_skill, emp_val in emp_skills.items():
                if emp_skill.lower() == skill.lower():
                    score = emp_val
                    break
                elif skill.lower() in emp_skill.lower() or emp_skill.lower() in skill.lower():
                    score = emp_val * 0.9  # Partial domain match
                    break

            matched_scores.append(score)
            if score >= 80:
                reasons.append(f"Strong {skill} skill ({int(score)}%)")
            elif score >= 60:
                reasons.append(f"Competent {skill} skill ({int(score)}%)")
            elif score > 0:
                reasons.append(f"Developing {skill} skill ({int(score)}%)")

        skill_match_score = sum(matched_scores) / len(matched_scores) if matched_scores else 0.0

    # 2. Past Performance Calculation (25% weight)
    performance_score = max(0.0, min(100.0, performance))
    if performance_score >= 85:
        reasons.append(f"High past performance rating ({int(performance_score)}%)")

    # 3. Availability Calculation (15% weight)
    availability_score = 100.0 if is_available else 0.0
    if is_available:
        reasons.append("Currently available")
    else:
        reasons.append("Currently busy with other commitments")

    # Final Combined Weighted Score
    final_score = (
        (0.60 * skill_match_score) +
        (0.25 * performance_score) +
        (0.15 * availability_score)
    )

    # Round to nearest integer (or 1 decimal place)
    final_score = round(final_score, 1)

    return final_score, reasons
