"""Vision Service layer for Person 3 Remote-Sensing Vision AI.

Orchestrates input validation, mock mode execution, and interaction with
the dedicated Qwen3-VL service.
"""

import os
import re
import logging
from typing import Optional, List
from PIL import Image

from person3.schemas import (
    VisionAnalysisResponse,
    DetectedObject,
    BoundingBox
)
from person3.image_utils import (
    validate_image_bytes,
    ImageValidationError,
    extract_image_metadata
)
from person3.qwen_service import QwenVLService
from person3.confidence import clamp_confidence

logger = logging.getLogger("person3.service")


class QuestionValidationError(ValueError):
    """Exception raised when natural-language question fails validation."""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def validate_question(question: Optional[str]) -> str:
    """Validate user natural-language question.
    
    Checks:
    - Question is not None
    - Question is not empty or whitespace-only
    - Question contains meaningful alphanumeric text (not just punctuation)
    
    Raises:
        QuestionValidationError: If question is invalid.
    """
    if question is None:
        raise QuestionValidationError("Question field is missing.", status_code=400)

    cleaned = str(question).strip()
    if not cleaned:
        raise QuestionValidationError("Question cannot be empty or blank.", status_code=400)

    # Check for meaningful text (at least 2 alphanumeric characters)
    alnum_count = sum(1 for ch in cleaned if ch.isalnum())
    if alnum_count < 2:
        raise QuestionValidationError(
            "Question must contain meaningful text, not solely punctuation or symbols.",
            status_code=400
        )

    if len(cleaned) > 2000:
        raise QuestionValidationError(
            "Question is too long (maximum 2000 characters).",
            status_code=400
        )

    return cleaned


class VisionService:
    """Core Vision Service for Remote-Sensing Vision AI."""

    def __init__(
        self,
        mock_mode: Optional[bool] = None,
        model_name: Optional[str] = None,
        device: Optional[str] = None
    ):
        # Read mock mode from parameter or environment variable
        if mock_mode is not None:
            self._mock_mode = mock_mode
        else:
            env_val = os.getenv("VISION_MOCK_MODE", "true").lower()
            self._mock_mode = env_val in ("true", "1", "yes", "on")

        self.model_name = model_name or os.getenv("VISION_MODEL_NAME", "Qwen3-VL")
        self.device = device or os.getenv("VISION_DEVICE", "auto")
        self._qwen_service: Optional[QwenVLService] = None

    @property
    def mock_mode(self) -> bool:
        return self._mock_mode

    @mock_mode.setter
    def mock_mode(self, val: bool):
        self._mock_mode = val

    def get_qwen_service(self) -> QwenVLService:
        """Lazily initialize the QwenVLService singleton."""
        if self._qwen_service is None:
            self._qwen_service = QwenVLService(
                model_name=self.model_name,
                device=self.device
            )
        return self._qwen_service

    def analyze(
        self,
        image_bytes: bytes,
        question: str,
        filename: Optional[str] = None
    ) -> VisionAnalysisResponse:
        """Execute vision analysis pipeline on satellite image and natural-language question.
        
        Steps:
        1. Validate satellite image (size, format, decodability, dimensions)
        2. Validate natural-language question
        3. If VISION_MOCK_MODE is enabled, return clearly marked mock response
        4. Otherwise, delegate to Qwen3-VL service
        """
        # Step 1: Validate image
        pil_image = validate_image_bytes(image_bytes, filename=filename)

        # Step 2: Validate question
        valid_question = validate_question(question)

        # Step 3: Mock Mode execution
        if self._mock_mode:
            logger.info("Person 3 mock mode active: generating simulated response.")
            return self._generate_mock_response(pil_image, valid_question)

        # Step 4: Real Qwen3-VL model inference
        qwen = self.get_qwen_service()
        return qwen.analyze(pil_image, valid_question)

    def _generate_mock_response(
        self,
        pil_image: Image.Image,
        question: str
    ) -> VisionAnalysisResponse:
        """Generate a compliant mock response for development, testing, and non-GPU environments.
        
        Strictly marks the response with model="mock" and development notices.
        Adapts detected features contextually to the question.
        """
        meta = extract_image_metadata(pil_image)
        q_lower = question.lower()

        detected_objects: List[DetectedObject] = []
        observations: List[str] = [
            "Person 3 mock mode is active.",
            f"Image dimensions: {meta['width']}x{meta['height']} (format: {meta['format']})."
        ]
        evidence: List[str] = [
            "This response was generated in development mode.",
            "Simulated detection of typical remote sensing features based on mock mode."
        ]

        # Contextual feature detection simulation based on query topics
        if any(w in q_lower for w in ["building", "structure", "roof", "urban", "house", "facility"]):
            detected_objects.append(
                DetectedObject(
                    object="building",
                    confidence=0.89,
                    location="center-right",
                    bbox=BoundingBox(
                        x1=round(meta['width'] * 0.45, 1),
                        y1=round(meta['height'] * 0.35, 1),
                        x2=round(meta['width'] * 0.65, 1),
                        y2=round(meta['height'] * 0.55, 1)
                    )
                )
            )
            observations.append("Rectilinear structures with defined edges observed in central sector.")
            evidence.append("High-contrast rectilinear rooftop boundaries distinguishable.")

        if any(w in q_lower for w in ["vegetation", "forest", "tree", "plant", "green", "agriculture", "crop"]):
            detected_objects.append(
                DetectedObject(
                    object="vegetation",
                    confidence=0.86,
                    location="top-left",
                    bbox=None
                )
            )
            observations.append("Dense canopy coverage identifiable in the northwest quadrant.")
            evidence.append("Irregular organic texture consistent with canopy.")

        if any(w in q_lower for w in ["water", "river", "lake", "canal", "pond", "sea", "ocean"]):
            detected_objects.append(
                DetectedObject(
                    object="water body",
                    confidence=0.91,
                    location="bottom-center",
                    bbox=None
                )
            )
            observations.append("Continuous low-albedo linear feature consistent with water channel.")
            evidence.append("Homogeneous dark spectral response with specular reflection patterns.")

        if any(w in q_lower for w in ["road", "highway", "street", "bridge", "path"]):
            detected_objects.append(
                DetectedObject(
                    object="road",
                    confidence=0.84,
                    location="center",
                    bbox=None
                )
            )
            observations.append("Linear transit corridor crossing through the image center.")
            evidence.append("Uniform width linear pattern with consistent surface material.")

        if any(w in q_lower for w in ["construction", "earthwork", "clearing", "excavation"]):
            detected_objects.append(
                DetectedObject(
                    object="construction area",
                    confidence=0.82,
                    location="bottom-right",
                    bbox=None
                )
            )
            observations.append("Disturbed bare ground and irregular earthworks visible.")
            evidence.append("Exposed soil with distinct boundary compared to adjacent vegetation.")

        # Default fallback objects if user asked general question
        if not detected_objects:
            detected_objects = [
                DetectedObject(
                    object="vegetation",
                    confidence=0.85,
                    location="top-right",
                    bbox=None
                ),
                DetectedObject(
                    object="building",
                    confidence=0.82,
                    location="center",
                    bbox=None
                )
            ]
            observations.append("General overhead remote-sensing pattern analysis conducted.")
            evidence.append("Visual features assessed against standard satellite object ontology.")

        # Build natural language answer
        obj_names = [o.object for o in detected_objects]
        obj_str = ", ".join(obj_names)
        answer = (
            f"Mock vision analysis completed for query: '{question}'. "
            f"Identified remote-sensing features: {obj_str}."
        )

        overall_conf = 0.85 if detected_objects else 0.50

        return VisionAnalysisResponse(
            answer=answer,
            detected_objects=detected_objects,
            observations=observations,
            evidence=evidence,
            confidence=clamp_confidence(overall_conf),
            model="mock"
        )


# Global service instance for the application
_default_vision_service: Optional[VisionService] = None


def get_vision_service() -> VisionService:
    """Obtain or initialize the global VisionService singleton."""
    global _default_vision_service
    if _default_vision_service is None:
        _default_vision_service = VisionService()
    return _default_vision_service
