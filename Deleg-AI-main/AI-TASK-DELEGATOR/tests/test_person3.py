"""Isolated test suite for Person 3 — Remote-Sensing Vision AI.

Tests all required scenarios without downloading heavy model weights:
1. Person 3 health
2. Missing image
3. Invalid image
4. Unsupported image
5. Missing question
6. Empty question
7. Valid image + question
8. Mock mode
9. Response schema
10. Confidence range
"""

import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient

from backend.app.main import app
from person3.service import VisionService, get_vision_service, validate_question
from person3.image_utils import (
    validate_image_bytes,
    ImageValidationError,
    get_grid_location
)
from person3.confidence import clamp_confidence, compute_overall_confidence
from person3.qwen_service import QwenVLService
from person3.schemas import VisionAnalysisResponse, DetectedObject, BoundingBox


@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    return TestClient(app)


def create_test_image_bytes(
    format: str = "PNG",
    width: int = 128,
    height: int = 128,
    color: str = "forestgreen"
) -> bytes:
    """Generate in-memory valid satellite image bytes."""
    buf = io.BytesIO()
    img = Image.new("RGB", (width, height), color=color)
    img.save(buf, format=format)
    return buf.getvalue()


# -------------------------------------------------------------
# 1. Health Check Test
# -------------------------------------------------------------
def test_person3_health(client):
    """Test GET /vision/health returns expected status and module name."""
    response = client.get("/vision/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["module"] == "remote-sensing-vision-ai"


# -------------------------------------------------------------
# 2. Missing Image Test
# -------------------------------------------------------------
def test_missing_image(client):
    """Test POST /vision/analyze without an image file fails cleanly."""
    response = client.post(
        "/vision/analyze",
        data={"question": "What objects are visible?"}
    )
    # FastAPI returns 422 for missing required multipart file
    assert response.status_code in (400, 422)


# -------------------------------------------------------------
# 3. Invalid Image Test
# -------------------------------------------------------------
def test_invalid_image(client):
    """Test POST /vision/analyze with corrupted or non-image bytes fails with 400."""
    corrupt_bytes = b"NOT_A_VALID_IMAGE_DATA_12345"
    response = client.post(
        "/vision/analyze",
        files={"image": ("test.png", corrupt_bytes, "image/png")},
        data={"question": "What objects are visible?"}
    )
    assert response.status_code == 400
    detail = response.json().get("detail", "")
    assert "Corrupted or unreadable image" in detail or "image" in detail.lower()


# -------------------------------------------------------------
# 4. Unsupported Image Format Test
# -------------------------------------------------------------
def test_unsupported_image(client):
    """Test POST /vision/analyze with unsupported file extension fails with 400."""
    fake_txt_bytes = b"Just plain text file."
    response = client.post(
        "/vision/analyze",
        files={"image": ("document.txt", fake_txt_bytes, "text/plain")},
        data={"question": "What objects are visible?"}
    )
    assert response.status_code == 400
    detail = response.json().get("detail", "")
    assert "Unsupported image format" in detail or "supported formats" in detail.lower()


# -------------------------------------------------------------
# 5. Missing Question Test
# -------------------------------------------------------------
def test_missing_question(client):
    """Test POST /vision/analyze without question field fails cleanly."""
    img_bytes = create_test_image_bytes("PNG")
    response = client.post(
        "/vision/analyze",
        files={"image": ("satellite.png", img_bytes, "image/png")}
    )
    assert response.status_code in (400, 422)


# -------------------------------------------------------------
# 6. Empty / Meaningless Question Test
# -------------------------------------------------------------
def test_empty_question(client):
    """Test POST /vision/analyze with empty or whitespace-only question fails with 400."""
    img_bytes = create_test_image_bytes("PNG")
    
    # Whitespace question
    response = client.post(
        "/vision/analyze",
        files={"image": ("satellite.png", img_bytes, "image/png")},
        data={"question": "    "}
    )
    assert response.status_code == 400
    assert "cannot be empty" in response.json().get("detail", "").lower()

    # Meaningless punctuation question
    response_punct = client.post(
        "/vision/analyze",
        files={"image": ("satellite.png", img_bytes, "image/png")},
        data={"question": "???"}
    )
    assert response_punct.status_code == 400
    assert "meaningful text" in response_punct.json().get("detail", "").lower()


# -------------------------------------------------------------
# 7. Valid Image + Question Test
# -------------------------------------------------------------
def test_valid_image_and_question(client):
    """Test POST /vision/analyze with valid image and natural-language question."""
    img_bytes = create_test_image_bytes("PNG", 256, 256)
    response = client.post(
        "/vision/analyze",
        files={"image": ("satellite.png", img_bytes, "image/png")},
        data={"question": "What objects are visible in this satellite image?"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert len(data["answer"]) > 0
    assert isinstance(data["detected_objects"], list)
    assert isinstance(data["observations"], list)
    assert isinstance(data["evidence"], list)


# -------------------------------------------------------------
# 8. Mock Mode Test
# -------------------------------------------------------------
def test_mock_mode_behavior(client):
    """Test that mock mode returns clearly marked model='mock' output."""
    img_bytes = create_test_image_bytes("JPEG", 128, 128)
    response = client.post(
        "/vision/analyze",
        files={"image": ("overhead.jpg", img_bytes, "image/jpeg")},
        data={"question": "Are there any buildings or roads?"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["model"] == "mock"
    assert any("mock mode is active" in obs.lower() for obs in data["observations"])
    assert any("development mode" in ev.lower() for ev in data["evidence"])


# -------------------------------------------------------------
# 9. Response Schema Test
# -------------------------------------------------------------
def test_response_schema(client):
    """Validate that API response strictly conforms to VisionAnalysisResponse schema."""
    img_bytes = create_test_image_bytes("PNG")
    response = client.post(
        "/vision/analyze",
        files={"image": ("area.png", img_bytes, "image/png")},
        data={"question": "Is there water in this image?"}
    )
    assert response.status_code == 200
    data = response.json()
    # Pydantic parsing must succeed without raising validation errors
    parsed = VisionAnalysisResponse(**data)
    assert isinstance(parsed.answer, str)
    assert isinstance(parsed.detected_objects, list)
    assert isinstance(parsed.observations, list)
    assert isinstance(parsed.evidence, list)
    assert isinstance(parsed.confidence, float)
    assert isinstance(parsed.model, str)


# -------------------------------------------------------------
# 10. Confidence Range Test
# -------------------------------------------------------------
def test_confidence_range(client):
    """Test that confidence score and detected object confidences are strictly between 0.0 and 1.0."""
    img_bytes = create_test_image_bytes("PNG")
    response = client.post(
        "/vision/analyze",
        files={"image": ("survey.png", img_bytes, "image/png")},
        data={"question": "Describe the land cover and vegetation."}
    )
    assert response.status_code == 200
    data = response.json()
    assert 0.0 <= data["confidence"] <= 1.0
    for obj in data["detected_objects"]:
        assert 0.0 <= obj["confidence"] <= 1.0
        assert obj["location"] in [
            "top-left", "top-center", "top-right",
            "center-left", "center", "center-right",
            "bottom-left", "bottom-center", "bottom-right",
            "widespread", "unknown"
        ]


# -------------------------------------------------------------
# 11. Additional Formats: TIFF and JPEG
# -------------------------------------------------------------
def test_tiff_support(client):
    """Verify that TIFF format satellite images are supported."""
    tiff_bytes = create_test_image_bytes("TIFF", 64, 64)
    response = client.post(
        "/vision/analyze",
        files={"image": ("sentinel2.tif", tiff_bytes, "image/tiff")},
        data={"question": "Is there vegetation in this scene?"}
    )
    assert response.status_code == 200
    assert response.json()["model"] == "mock"


# -------------------------------------------------------------
# 12. Spatial Grid Location Calculations
# -------------------------------------------------------------
def test_grid_location_calculations():
    """Verify spatial grid mapping logic for remote sensing features."""
    assert get_grid_location(10, 10, 50, 50, image_width=300, image_height=300) == "top-left"
    assert get_grid_location(120, 120, 180, 180, image_width=300, image_height=300) == "center"
    assert get_grid_location(220, 220, 290, 290, image_width=300, image_height=300) == "bottom-right"
    assert get_grid_location(10, 120, 50, 180, image_width=300, image_height=300) == "center-left"
    assert get_grid_location(220, 120, 280, 180, image_width=300, image_height=300) == "center-right"


# -------------------------------------------------------------
# 13. Confidence Clamping and Computation
# -------------------------------------------------------------
def test_confidence_utilities():
    """Verify confidence clamping edge cases."""
    assert clamp_confidence(-0.5) == 0.0
    assert clamp_confidence(1.5) == 1.0
    assert clamp_confidence(0.85234) == 0.8523
    assert clamp_confidence(float("nan"), default=0.5) == 0.5
    
    score = compute_overall_confidence(
        object_confidences=[0.9, 0.85],
        text_context="Buildings are clearly visible in the image."
    )
    assert 0.0 <= score <= 1.0
    assert score > 0.80  # Reinforced by high certainty


# -------------------------------------------------------------
# 14. Qwen Service Output Parsing
# -------------------------------------------------------------
def test_qwen_service_parsing():
    """Verify JSON parsing and bbox handling from mock VLM output."""
    qwen = QwenVLService()
    
    sample_json = """```json
    {
      "answer": "Identified industrial warehouse with distinct metal roof.",
      "detected_objects": [
        {
          "object": "industrial structure",
          "confidence": 0.94,
          "location": "center-right",
          "bbox": {"x1": 150, "y1": 100, "x2": 280, "y2": 220}
        }
      ],
      "observations": ["Rectangular high-reflectance roof clearly visible."],
      "evidence": ["Sharp perpendicular corners."],
      "confidence": 0.93
    }
    ```"""
    
    parsed = qwen._parse_model_output(sample_json, image_width=400, image_height=400)
    assert parsed.answer == "Identified industrial warehouse with distinct metal roof."
    assert len(parsed.detected_objects) == 1
    assert parsed.detected_objects[0].object == "industrial structure"
    assert parsed.detected_objects[0].confidence == 0.94
    assert parsed.detected_objects[0].bbox.x1 == 150.0
    assert parsed.detected_objects[0].bbox.x2 == 280.0
    assert 0.0 <= parsed.confidence <= 1.0
