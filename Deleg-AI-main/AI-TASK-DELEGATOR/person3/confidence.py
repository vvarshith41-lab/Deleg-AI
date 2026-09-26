"""Confidence score calculation and validation for Person 3 Remote-Sensing Vision AI.

Ensures all confidence scores are strictly within [0.0, 1.0] and provides
heuristics to calculate or adjust confidence based on visual certainty markers.
"""

from typing import List, Optional
import math


def clamp_confidence(score: float, default: float = 0.5) -> float:
    """Clamp any numeric score strictly between 0.0 and 1.0.
    
    Handles NaN, inf, negatives, and excessive values gracefully.
    """
    if score is None or math.isnan(score) or math.isinf(score):
        return default
    return max(0.0, min(1.0, round(float(score), 4)))


# Linguistic certainty markers in remote-sensing analysis
HIGH_CERTAINTY_KEYWORDS = [
    "clearly visible",
    "clearly identifiable",
    "distinct",
    "evident",
    "high confidence",
    "unmistakable",
    "sharp",
    "well-defined"
]

MODERATE_CERTAINTY_KEYWORDS = [
    "likely",
    "probable",
    "consistent with",
    "appears to be",
    "suggests",
    "moderate confidence"
]

UNCERTAINTY_KEYWORDS = [
    "uncertain",
    "unclear",
    "ambiguous",
    "low resolution",
    "obscured",
    "cloud cover",
    "shadow",
    "possible",
    "cannot determine",
    "insufficient evidence",
    "hard to distinguish"
]


def evaluate_text_certainty(text: str) -> float:
    """Analyze natural-language text for remote-sensing certainty keywords.
    
    Returns an adjustment factor or base confidence estimate between 0.2 and 0.95.
    """
    if not text:
        return 0.5

    lower = text.lower()
    
    # Check uncertainty indicators first
    uncertainty_count = sum(1 for kw in UNCERTAINTY_KEYWORDS if kw in lower)
    high_count = sum(1 for kw in HIGH_CERTAINTY_KEYWORDS if kw in lower)
    mod_count = sum(1 for kw in MODERATE_CERTAINTY_KEYWORDS if kw in lower)

    if uncertainty_count > 0 and high_count == 0:
        # Significant uncertainty expressed
        return max(0.20, 0.55 - (uncertainty_count * 0.10))
    elif high_count > 0 and uncertainty_count == 0:
        # High confidence expressed
        return min(0.95, 0.85 + (high_count * 0.03))
    elif mod_count > 0:
        return 0.75
    else:
        return 0.80


def compute_overall_confidence(
    object_confidences: List[float],
    text_context: Optional[str] = None,
    raw_confidence: Optional[float] = None
) -> float:
    """Compute an aggregated, validated overall confidence score.
    
    Args:
        object_confidences: List of individual detection confidences
        text_context: Combined observations or answer text
        raw_confidence: Model-reported confidence if available
        
    Returns:
        float: Normalized confidence strictly between 0.0 and 1.0
    """
    if raw_confidence is not None:
        base = clamp_confidence(raw_confidence)
    elif object_confidences:
        # Average of detected objects, weighted toward reliable detections
        valid_confs = [clamp_confidence(c) for c in object_confidences]
        base = sum(valid_confs) / len(valid_confs)
    else:
        base = 0.70

    if text_context:
        text_certainty = evaluate_text_certainty(text_context)
        # Blend model confidence (70%) with text certainty calibration (30%)
        blended = (base * 0.7) + (text_certainty * 0.3)
        return clamp_confidence(blended)

    return clamp_confidence(base)
