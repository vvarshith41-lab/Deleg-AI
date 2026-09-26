"""Recommendation Module for AI Task Delegator.
Rule-based explainable employee matching engine.
"""

from recommendation.scoring import calculate_score
from recommendation.matcher import recommend_employee

__all__ = ["calculate_score", "recommend_employee"]
