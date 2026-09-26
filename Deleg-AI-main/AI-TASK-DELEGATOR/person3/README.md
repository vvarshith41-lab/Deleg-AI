# Person 3 — Remote-Sensing Vision AI

An isolated, modular Vision-Language AI service designed to perform overhead satellite and aerial imagery interpretation, feature detection, approximate grid localization, and visual question answering using **Qwen3-VL**.

---

## 🛰️ Architecture & Responsibilities

Person 3 receives:
1. **Satellite Image**: Optical overhead imagery (`.jpg`, `.jpeg`, `.png`, `.tif`, `.tiff`).
2. **Natural-Language Question**: Queries such as *"What objects are visible?"*, *"Are there buildings?"*, *"Is there water?"*, *"Has construction occurred?"*.

And produces a structured Pydantic response:
1. **AI Answer**: Direct, analytical natural-language response.
2. **Detected Objects**: Recognized remote-sensing features (buildings, roads, vegetation, water bodies, etc.).
3. **Approximate Locations**: 3x3 grid sector (`top-left`, `center`, `bottom-right`, etc.) and preserved bounding boxes when provided by the VLM.
4. **Calibrated Confidence**: Confidence score strictly between `0.0` and `1.0`.
5. **Evidence & Observations**: Specific visual indicators, textures, and geometric patterns observed.

### Component Pipeline

```text
HTTP Request (POST /vision/analyze)
          ↓
  Person 3 Router (person3/router.py)
          ↓
  Vision Service (person3/service.py)
   ├── Image Validation (image_utils.py)
   ├── Question Validation (service.py)
   └── Mode Dispatcher
          ↓
 ┌───────────────────────┴───────────────────────┐
 │                                               │
 │ (VISION_MOCK_MODE=false)                      │ (VISION_MOCK_MODE=true)
 ▼                                               ▼
Qwen3-VL Service (qwen_service.py)           Mock Engine
 ├── Lazy-loaded model singleton              ├── Zero-download fast testing
 ├── Remote-Sensing Prompts (prompts.py)      ├── Fully validates image/question
 └── JSON output parser & bbox preservation   └── Explicit model="mock" marker
 └───────────────────────┬───────────────────────┘
          ↓
  Confidence Engine (person3/confidence.py)
  [Clamped strictly to 0.0 - 1.0]
          ↓
  Structured VisionAnalysisResponse (schemas.py)
```

---

## 📁 File Structure

```text
person3/
├── __init__.py          # Public package interface and exports
├── schemas.py           # Pydantic schemas (VisionAnalysisResponse, DetectedObject, BoundingBox)
├── service.py           # Core VisionService, question validation, and mock engine
├── qwen_service.py      # Qwen3-VL model loader, inference handler, and JSON parser
├── prompts.py           # Dedicated remote-sensing system prompts and question formatting
├── image_utils.py       # Satellite image validation (JPEG, PNG, TIFF), dimensions, grid mapping
├── confidence.py        # Uncertainty calibration and confidence clamping [0.0, 1.0]
├── router.py            # FastAPI APIRouter exposing /vision/analyze and /vision/health
└── README.md            # Comprehensive module documentation
```

---

## ⚙️ Configuration & Environment Variables

Configure Person 3 behavior via environment variables in `.env`:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `VISION_MOCK_MODE` | `true` | When `true`, executes mock analysis without loading weights. Set to `false` for real Qwen3-VL inference. |
| `VISION_MODEL_NAME` | `Qwen/Qwen2.5-VL-7B-Instruct` | Hugging Face model identifier for the vision-language model. |
| `VISION_DEVICE` | `auto` | Device mapping (`auto`, `cuda`, `cpu`). Defaults to `cuda` if GPU available, otherwise `cpu`. |

---

## 📡 REST API Endpoints

### 1. Health Check
```http
GET /vision/health
```

**Response:**
```json
{
  "status": "ok",
  "module": "remote-sensing-vision-ai"
}
```

### 2. Analyze Satellite Image
```http
POST /vision/analyze
Content-Type: multipart/form-data
```

**Form Fields:**
- `image`: Binary satellite image file (`.jpg`, `.jpeg`, `.png`, `.tif`, `.tiff`).
- `question`: Natural language question string (e.g., *"What objects are visible?"*).

**Example Response:**
```json
{
  "answer": "Several building-like structures are visible in the central portion of the image.",
  "detected_objects": [
    {
      "object": "building",
      "confidence": 0.91,
      "location": "center-right",
      "bbox": {
        "x1": 100.0,
        "y1": 80.0,
        "x2": 300.0,
        "y2": 220.0
      }
    }
  ],
  "observations": [
    "Multiple rectangular structures are visible."
  ],
  "evidence": [
    "Rectangular structures are visible in the center-right region."
  ],
  "confidence": 0.88,
  "model": "Qwen3-VL"
}
```

---

## 🛡️ Validation & Guardrails

1. **Image Validation**:
   - Supported extensions: `.jpg`, `.jpeg`, `.png`, `.tif`, `.tiff`.
   - File size ceiling: 50MB.
   - Dimension constraints: Min 16x16px, Max 12000x12000px.
   - Corrupted image bytes are caught and returned as clean `400 Bad Request`.

2. **Question Validation**:
   - Rejects empty, whitespace-only, or pure punctuation strings (`400 Bad Request`).
   - Requires meaningful natural language text.

3. **No Coordinate / BBox Hallucination**:
   - Person 3 **never** invents geographic latitude/longitude coordinates.
   - Bounding boxes are only populated when explicitly detected by the model; otherwise `bbox` is `null`.

---

## 🤝 Team Integration Contracts

### Person 1 — AI Orchestrator Integration
Person 1 delegates visual inquiries to Person 3 via either:
1. REST API: `POST /vision/analyze`
2. Python API:
   ```python
   from person3 import get_vision_service
   service = get_vision_service()
   result = service.analyze(image_bytes=raw_bytes, question="Are there buildings?")
   ```

### Person 2 — Satellite Imagery Integration
Person 2 provides preprocessed, aligned, or cropped satellite imagery tiles. Person 3 receives these image bytes and executes visual inference without interfering with satellite sourcing logic.

---

## 🧪 Testing

Run Person 3 isolated tests using pytest:

```bash
pytest tests/test_person3.py -v
```
