"""Person 3 — Remote-Sensing Vision AI.

Provides isolated remote-sensing satellite image inspection, feature detection,
and visual reasoning using Qwen3-VL and calibrated confidence heuristics.
"""

from person3.schemas import (
    VisionAnalysisResponse,
    DetectedObject,
    BoundingBox,
    HealthResponse
)
from person3.service import (
    VisionService,
    get_vision_service,
    QuestionValidationError,
    validate_question
)
from person3.qwen_service import QwenVLService
from person3.image_utils import (
    validate_image_bytes,
    ImageValidationError,
    get_grid_location
)
from person3.confidence import clamp_confidence, compute_overall_confidence
from person3.router import router as vision_router

__all__ = [
    "VisionService",
    "get_vision_service",
    "QwenVLService",
    "VisionAnalysisResponse",
    "DetectedObject",
    "BoundingBox",
    "HealthResponse",
    "QuestionValidationError",
    "validate_question",
    "ImageValidationError",
    "validate_image_bytes",
    "get_grid_location",
    "clamp_confidence",
    "compute_overall_confidence",
    "vision_router"
]
