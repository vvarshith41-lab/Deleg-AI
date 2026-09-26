/**
 * API Service Client for Person 3 — Remote-Sensing Vision AI.
 * 
 * Provides isolated frontend helper functions for satellite image analysis
 * and health checking against the FastAPI backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Check Remote-Sensing Vision AI health status.
 * @returns {Promise<{status: string, module: string}>}
 */
export async function getVisionHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/vision/health`);
    if (!res.ok) {
      throw new Error(`Vision health check failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[VisionAPI] Health check failed: ${err.message}`);
    return { status: 'offline', module: 'remote-sensing-vision-ai' };
  }
}

/**
 * Analyze a satellite image file with a natural-language question.
 * 
 * @param {File|Blob} imageFile - Binary satellite image (.jpg, .jpeg, .png, .tif, .tiff)
 * @param {string} question - Natural language question
 * @returns {Promise<Object>} Structured vision analysis response
 */
export async function analyzeSatelliteImage(imageFile, question) {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('question', question);

  const res = await fetch(`${API_BASE_URL}/vision/analyze`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Analysis failed with status ${res.status}`);
  }

  return await res.json();
}
