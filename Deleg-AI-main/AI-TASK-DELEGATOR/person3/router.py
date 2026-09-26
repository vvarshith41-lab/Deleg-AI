"""FastAPI Router for Person 3 — Remote-Sensing Vision AI.

Exposes:
- POST /vision/analyze: Multipart upload for satellite image and natural-language question
- GET  /vision/health: Module health check and operational status
"""

import logging
from fastapi import APIRouter, File, Form, UploadFile, HTTPException, status
from fastapi.responses import JSONResponse

from person3.schemas import VisionAnalysisResponse, HealthResponse
from person3.service import (
    get_vision_service,
    QuestionValidationError
)
from person3.image_utils import ImageValidationError

logger = logging.getLogger("person3.router")

router = APIRouter(prefix="/vision", tags=["Remote-Sensing Vision AI"])


@router.get(
    "/health",
    summary="Remote-Sensing Vision AI Health Check",
    response_model=dict
)
async def health_check():
    """Health check endpoint for Person 3 Remote-Sensing Vision AI.
    
    Returns standard module confirmation.
    """
    return {
        "status": "ok",
        "module": "remote-sensing-vision-ai"
    }


@router.post(
    "/analyze",
    summary="Analyze Satellite Image with Vision AI",
    response_model=VisionAnalysisResponse,
    responses={
        400: {"description": "Validation error (corrupt image, empty question, unsupported format)"},
        413: {"description": "Payload too large (oversized image)"},
        500: {"description": "Inference or server error"}
    }
)
async def analyze_satellite_image(
    image: UploadFile = File(
        ...,
        description="Satellite image file (supported formats: .jpg, .jpeg, .png, .tif, .tiff)"
    ),
    question: str = Form(
        ...,
        description="Natural-language question regarding features, land-cover, or objects in the image"
    )
):
    """Analyze a remote-sensing satellite image using Qwen3-VL (or mock mode).
    
    Accepts:
    - **image**: Binary image file in multipart/form-data
    - **question**: Plain-text natural language query
    
    Returns:
    - Structured analysis with answer, detected objects, locations, observations, evidence, and confidence.
    """
    # Verify file is provided
    if not image or not image.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Satellite image file must be provided."
        )

    try:
        image_bytes = await image.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded image data: {str(e)}"
        )

    service = get_vision_service()

    try:
        response = service.analyze(
            image_bytes=image_bytes,
            question=question,
            filename=image.filename
        )
        return response

    except ImageValidationError as e:
        logger.warning(f"Image validation failed: {e.message}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.message
        )

    except QuestionValidationError as e:
        logger.warning(f"Question validation failed: {e.message}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.message
        )

    except RuntimeError as e:
        logger.error(f"Inference runtime error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

    except Exception as e:
        logger.exception("Unexpected error during vision analysis")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected internal error occurred: {str(e)}"
        )
