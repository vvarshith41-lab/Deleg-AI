"""Image processing, validation, and spatial grid utilities for Person 3.

Provides validation for satellite imagery formats (JPEG, PNG, TIFF),
size and dimension constraints, PIL conversion, and coordinate-to-grid mapping.
"""

from typing import Tuple, Optional, Dict, Any
import io
from PIL import Image

# Supported file extensions and MIME types for satellite imagery
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".tif", ".tiff"}
SUPPORTED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/tiff",
    "image/x-tiff"
}

# Image constraints
MAX_IMAGE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB
MIN_IMAGE_DIMENSION = 16                 # Minimum width and height
MAX_IMAGE_DIMENSION = 12000              # Maximum width and height


class ImageValidationError(ValueError):
    """Exception raised when satellite image fails validation."""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def validate_image_bytes(image_bytes: bytes, filename: Optional[str] = None) -> Image.Image:
    """Validate satellite image payload and return a loaded PIL Image in RGB format.
    
    Checks:
    - Image is not empty
    - Payload size is within maximum allowed limit
    - File extension (if filename provided) matches supported satellite formats
    - Image can be opened and decoded by PIL
    - Image dimensions are within acceptable bounds
    
    Raises:
        ImageValidationError: If any validation rule fails.
    """
    if not image_bytes or len(image_bytes) == 0:
        raise ImageValidationError("Satellite image file is empty or missing.", status_code=400)

    if len(image_bytes) > MAX_IMAGE_SIZE_BYTES:
        max_mb = MAX_IMAGE_SIZE_BYTES // (1024 * 1024)
        raise ImageValidationError(
            f"Image file size ({len(image_bytes) / (1024 * 1024):.1f} MB) exceeds maximum limit of {max_mb} MB.",
            status_code=413
        )

    if filename:
        ext = ("." + filename.rsplit(".", 1)[-1]).lower() if "." in filename else ""
        if ext and ext not in SUPPORTED_EXTENSIONS:
            allowed = ", ".join(sorted(SUPPORTED_EXTENSIONS))
            raise ImageValidationError(
                f"Unsupported image format '{ext}'. Supported formats: {allowed}",
                status_code=400
            )

    try:
        pil_image = Image.open(io.BytesIO(image_bytes))
        pil_image.load()  # Force load pixel data to detect corrupted streams
    except Exception as e:
        raise ImageValidationError(
            f"Corrupted or unreadable image file: {str(e)}",
            status_code=400
        )

    width, height = pil_image.size
    if width < MIN_IMAGE_DIMENSION or height < MIN_IMAGE_DIMENSION:
        raise ImageValidationError(
            f"Image dimensions ({width}x{height}) are too small. Minimum required: {MIN_IMAGE_DIMENSION}x{MIN_IMAGE_DIMENSION}.",
            status_code=400
        )

    if width > MAX_IMAGE_DIMENSION or height > MAX_IMAGE_DIMENSION:
        raise ImageValidationError(
            f"Image dimensions ({width}x{height}) exceed maximum allowed dimension of {MAX_IMAGE_DIMENSION}px.",
            status_code=400
        )

    # Convert to RGB (handles RGBA, grayscale, CMYK, multi-band TIFFs)
    if pil_image.mode != "RGB":
        pil_image = pil_image.convert("RGB")

    return pil_image


def get_grid_location(
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    image_width: Optional[float] = None,
    image_height: Optional[float] = None
) -> str:
    """Map bounding box coordinates to a 3x3 approximate grid location.
    
    Locations:
    - top-left, top-center, top-right
    - center-left, center, center-right
    - bottom-left, bottom-center, bottom-right
    
    If image_width and image_height are provided, coordinates are assumed to be pixels;
    otherwise they are assumed to be normalized in [0.0, 1.0] or [0, 1000].
    """
    # Normalize coordinates to [0.0, 1.0]
    if image_width and image_width > 0:
        norm_x1 = x1 / image_width
        norm_x2 = x2 / image_width
    elif max(x1, x2) > 1.0:
        norm_x1 = x1 / 1000.0 if max(x1, x2) <= 1000.0 else x1 / 1000.0
        norm_x2 = x2 / 1000.0 if max(x1, x2) <= 1000.0 else x2 / 1000.0
    else:
        norm_x1 = x1
        norm_x2 = x2

    if image_height and image_height > 0:
        norm_y1 = y1 / image_height
        norm_y2 = y2 / image_height
    elif max(y1, y2) > 1.0:
        norm_y1 = y1 / 1000.0 if max(y1, y2) <= 1000.0 else y1 / 1000.0
        norm_y2 = y2 / 1000.0 if max(y1, y2) <= 1000.0 else y2 / 1000.0
    else:
        norm_y1 = y1
        norm_y2 = y2

    # Compute center of the bounding box
    cx = (norm_x1 + norm_x2) / 2.0
    cy = (norm_y1 + norm_y2) / 2.0

    # Determine horizontal partition (3 columns)
    if cx < 0.333:
        h_loc = "left"
    elif cx > 0.666:
        h_loc = "right"
    else:
        h_loc = "center"

    # Determine vertical partition (3 rows)
    if cy < 0.333:
        v_loc = "top"
    elif cy > 0.666:
        v_loc = "bottom"
    else:
        v_loc = "center"

    # Combine grid cells
    if v_loc == "center" and h_loc == "center":
        return "center"
    elif v_loc == "center":
        return f"center-{h_loc}"
    elif h_loc == "center":
        return f"{v_loc}-center"
    else:
        return f"{v_loc}-{h_loc}"


def extract_image_metadata(pil_image: Image.Image) -> Dict[str, Any]:
    """Extract non-geographic visual metadata from a PIL Image."""
    return {
        "width": pil_image.width,
        "height": pil_image.height,
        "mode": pil_image.mode,
        "format": getattr(pil_image, "format", "RGB") or "RGB"
    }
