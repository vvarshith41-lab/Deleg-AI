"""Pydantic data schemas for Person 3 — Remote-Sensing Vision AI."""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field, field_validator


# Standard grid locations for remote sensing features
GridLocation = Literal[
    "top-left",
    "top-center",
    "top-right",
    "center-left",
    "center",
    "center-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
    "widespread",
    "unknown"
]


class BoundingBox(BaseModel):
    """Normalized or pixel bounding box coordinates for a detected feature."""
    x1: float = Field(..., description="Top-left X coordinate")
    y1: float = Field(..., description="Top-left Y coordinate")
    x2: float = Field(..., description="Bottom-right X coordinate")
    y2: float = Field(..., description="Bottom-right Y coordinate")

    @field_validator("x2")
    @classmethod
    def validate_x(cls, v, values):
        x1 = values.data.get("x1")
        if x1 is not None and v < x1:
            raise ValueError("x2 must be greater than or equal to x1")
        return v

    @field_validator("y2")
    @classmethod
    def validate_y(cls, v, values):
        y1 = values.data.get("y1")
        if y1 is not None and v < y1:
            raise ValueError("y2 must be greater than or equal to y1")
        return v


class DetectedObject(BaseModel):
    """An identified remote sensing object or geographical feature."""
    object: str = Field(..., min_length=1, description="Object or feature name (e.g. building, road, vegetation)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Detection confidence score between 0.0 and 1.0")
    location: str = Field(
        ...,
        description="Approximate image location (e.g. center-right, top-left, center)"
    )
    bbox: Optional[BoundingBox] = Field(
        default=None,
        description="Preserved bounding box if provided by the vision model; None if not provided"
    )


class VisionAnalysisResponse(BaseModel):
    """Structured response returned by Person 3 Vision AI."""
    answer: str = Field(
        ...,
        description="Natural language answer addressing the user's question"
    )
    detected_objects: List[DetectedObject] = Field(
        default_factory=list,
        description="List of remote-sensing objects and features detected in the image"
    )
    observations: List[str] = Field(
        default_factory=list,
        description="Key qualitative observations of visual patterns, structures, and land cover"
    )
    evidence: List[str] = Field(
        default_factory=list,
        description="Supporting visual evidence from the satellite imagery"
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Overall confidence score between 0.0 and 1.0"
    )
    model: str = Field(
        ...,
        description="Name of the vision model used (e.g. Qwen3-VL, mock)"
    )


class HealthResponse(BaseModel):
    """Health check response schema for Person 3."""
    status: str = Field(default="ok", description="Module operational status")
    module: str = Field(default="remote-sensing-vision-ai", description="Module identifier")
    mock_mode: Optional[bool] = Field(default=None, description="Whether mock mode is active")
    model_name: Optional[str] = Field(default=None, description="Configured VLM model name")
    device: Optional[str] = Field(default=None, description="Inference compute device")
