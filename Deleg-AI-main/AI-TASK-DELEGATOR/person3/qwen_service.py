"""Qwen-VL Vision-Language Model Service for Person 3 Remote-Sensing Vision AI.

Handles lazy model loading, device placement, vision-language inference,
and robust JSON output extraction into structured Pydantic schemas.
"""

import os
import json
import re
import logging
from typing import Optional, Dict, Any, List
from PIL import Image

from person3.schemas import (
    VisionAnalysisResponse,
    DetectedObject,
    BoundingBox
)
from person3.prompts import (
    REMOTE_SENSING_SYSTEM_PROMPT,
    build_user_prompt
)
from person3.confidence import clamp_confidence, compute_overall_confidence
from person3.image_utils import get_grid_location

logger = logging.getLogger("person3.qwen_service")


class QwenVLService:
    """Dedicated service for Qwen-VL remote-sensing vision analysis."""

    def __init__(
        self,
        model_name: Optional[str] = None,
        device: Optional[str] = None
    ):
        self.model_name = model_name or os.getenv("VISION_MODEL_NAME", "Qwen/Qwen2.5-VL-7B-Instruct")
        self.device_setting = device or os.getenv("VISION_DEVICE", "auto")
        self._model = None
        self._processor = None
        self._is_loaded = False
        self._actual_device = None

    @property
    def is_loaded(self) -> bool:
        return self._is_loaded

    def get_device(self) -> str:
        """Resolve target device for PyTorch inference."""
        if self._actual_device:
            return self._actual_device

        if self.device_setting == "auto":
            try:
                import torch
                self._actual_device = "cuda" if torch.cuda.is_available() else "cpu"
            except ImportError:
                self._actual_device = "cpu"
        else:
            self._actual_device = self.device_setting
        return self._actual_device

    def load_model(self):
        """Lazy-load the Qwen vision-language model and processor once.
        
        Reuses the loaded instance across all subsequent inference requests.
        """
        if self._is_loaded:
            return

        target_device = self.get_device()
        logger.info(f"Loading vision model '{self.model_name}' onto {target_device}...")

        try:
            import torch
            from transformers import AutoProcessor

            # Try modern Qwen2.5-VL / Qwen2-VL or generic AutoModel
            try:
                from transformers import Qwen2_5_VLForConditionalGeneration
                model_cls = Qwen2_5_VLForConditionalGeneration
            except ImportError:
                try:
                    from transformers import Qwen2VLForConditionalGeneration
                    model_cls = Qwen2VLForConditionalGeneration
                except ImportError:
                    from transformers import AutoModelForVision2Seq
                    model_cls = AutoModelForVision2Seq

            torch_dtype = torch.float16 if target_device == "cuda" else torch.float32

            self._processor = AutoProcessor.from_pretrained(
                self.model_name,
                trust_remote_code=True
            )

            if target_device == "cuda":
                self._model = model_cls.from_pretrained(
                    self.model_name,
                    torch_dtype=torch_dtype,
                    device_map="auto",
                    trust_remote_code=True
                )
            else:
                self._model = model_cls.from_pretrained(
                    self.model_name,
                    torch_dtype=torch_dtype,
                    trust_remote_code=True
                ).to(target_device)

            self._model.eval()
            self._is_loaded = True
            logger.info(f"Model '{self.model_name}' successfully loaded.")

        except Exception as e:
            logger.error(f"Failed to load vision model '{self.model_name}': {str(e)}")
            raise RuntimeError(
                f"Could not load vision model '{self.model_name}'. "
                f"Ensure weights are accessible or enable VISION_MOCK_MODE=true. Error: {str(e)}"
            )

    def analyze(self, pil_image: Image.Image, question: str) -> VisionAnalysisResponse:
        """Run vision-language model inference on a satellite image and natural-language question."""
        if not self._is_loaded:
            self.load_model()

        user_content = build_user_prompt(question)
        target_device = self.get_device()

        # Build standard chat conversation format with image
        messages = [
            {"role": "system", "content": REMOTE_SENSING_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "image", "image": pil_image},
                    {"type": "text", "text": user_content}
                ]
            }
        ]

        try:
            text_prompt = self._processor.apply_chat_template(
                messages,
                tokenize=False,
                add_generation_prompt=True
            )

            image_inputs, video_inputs = None, None
            # Extract vision inputs if processor supports process_vision_info
            try:
                from qwen_vl_utils import process_vision_info
                image_inputs, video_inputs = process_vision_info(messages)
                inputs = self._processor(
                    text=[text_prompt],
                    images=image_inputs,
                    videos=video_inputs,
                    padding=True,
                    return_tensors="pt"
                )
            except Exception:
                # Standard fallback direct processor invocation
                inputs = self._processor(
                    text=[text_prompt],
                    images=[pil_image],
                    padding=True,
                    return_tensors="pt"
                )

            # Move inputs to device
            import torch
            inputs = {k: v.to(target_device) if isinstance(v, torch.Tensor) else v for k, v in inputs.items()}

            with torch.no_grad():
                generated_ids = self._model.generate(
                    **inputs,
                    max_new_tokens=1024,
                    temperature=0.2,
                    top_p=0.9
                )

            # Slice output to remove prompt tokens
            generated_ids_trimmed = [
                out_ids[len(in_ids):] for in_ids, out_ids in zip(inputs["input_ids"], generated_ids)
            ]
            output_text = self._processor.batch_decode(
                generated_ids_trimmed,
                skip_special_tokens=True,
                clean_up_tokenization_spaces=False
            )[0]

            return self._parse_model_output(
                output_text=output_text,
                image_width=pil_image.width,
                image_height=pil_image.height,
                model_name="Qwen3-VL"
            )

        except Exception as e:
            logger.error(f"Inference error during vision analysis: {str(e)}")
            raise RuntimeError(f"Vision inference failed: {str(e)}")

    def _parse_model_output(
        self,
        output_text: str,
        image_width: int,
        image_height: int,
        model_name: str = "Qwen3-VL"
    ) -> VisionAnalysisResponse:
        """Parse, sanitize, and validate raw model text output into structured VisionAnalysisResponse."""
        cleaned_text = output_text.strip()
        data = None

        # 1. Attempt extracting from markdown ```json ``` codeblock
        json_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned_text, re.DOTALL)
        if json_match:
            try:
                data = json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass

        # 2. Attempt extracting first balanced JSON object from string
        if data is None:
            first_brace = cleaned_text.find("{")
            last_brace = cleaned_text.rfind("}")
            if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
                try:
                    data = json.loads(cleaned_text[first_brace:last_brace + 1])
                except json.JSONDecodeError:
                    pass

        # 3. If parsing fails, construct structured response from text
        if not isinstance(data, dict):
            logger.warning("VLM output was not valid JSON. Formatting text response gracefully.")
            return VisionAnalysisResponse(
                answer=cleaned_text or "Analysis completed, but structured format could not be decoded.",
                detected_objects=[],
                observations=["Model produced non-JSON natural language response."],
                evidence=["Visual assessment based on prompt instructions."],
                confidence=0.70,
                model=model_name
            )

        # Extract and validate fields
        answer = str(data.get("answer") or "Visual analysis completed.").strip()

        # Parse detected objects
        raw_objects = data.get("detected_objects", [])
        parsed_objects: List[DetectedObject] = []

        if isinstance(raw_objects, list):
            for obj in raw_objects:
                if not isinstance(obj, dict):
                    continue
                name = str(obj.get("object") or "").strip()
                if not name:
                    continue

                conf = clamp_confidence(obj.get("confidence", 0.80))
                loc = str(obj.get("location") or "center").strip()

                # Process bounding box if present
                bbox_data = obj.get("bbox")
                bbox = None
                if isinstance(bbox_data, dict):
                    try:
                        x1 = float(bbox_data.get("x1", 0))
                        y1 = float(bbox_data.get("y1", 0))
                        x2 = float(bbox_data.get("x2", 0))
                        y2 = float(bbox_data.get("y2", 0))
                        if x2 >= x1 and y2 >= y1:
                            bbox = BoundingBox(x1=x1, y1=y1, x2=x2, y2=y2)
                            # Calibrate grid location from bbox if location was generic
                            if loc in ("unknown", "center", ""):
                                loc = get_grid_location(x1, y1, x2, y2, image_width, image_height)
                    except (ValueError, TypeError):
                        bbox = None

                parsed_objects.append(
                    DetectedObject(
                        object=name,
                        confidence=conf,
                        location=loc,
                        bbox=bbox
                    )
                )

        observations = [str(o).strip() for o in data.get("observations", []) if str(o).strip()]
        evidence = [str(e).strip() for e in data.get("evidence", []) if str(e).strip()]

        raw_conf = data.get("confidence")
        overall_conf = compute_overall_confidence(
            object_confidences=[o.confidence for o in parsed_objects],
            text_context=" ".join(observations + evidence + [answer]),
            raw_confidence=float(raw_conf) if raw_conf is not None else None
        )

        return VisionAnalysisResponse(
            answer=answer,
            detected_objects=parsed_objects,
            observations=observations,
            evidence=evidence,
            confidence=overall_conf,
            model=model_name
        )
