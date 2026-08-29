require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { validateAndNormalizeObservations, DEFAULT_CONFIDENCE_THRESHOLD } = require('./aiValidator');
const { getMockAnalysis } = require('./mockAi');

const SYSTEM_PROMPT = `You are a civic waste evidence observer for Kopargaon Municipal Council.
Analyze the provided image and return ONLY a valid JSON object describing visual observations.
Do NOT include explanations outside JSON. Do NOT calculate any priority scores. Do NOT make resource decisions.

Required JSON Structure:
{
  "wasteType": "mixed_solid_waste | plastic_waste | organic_waste | construction_debris | hazardous_waste | dead_animal | none | unknown",
  "severity": <integer 0-100: observational severity estimate>,
  "healthRisk": <integer 0-100: estimated public health hazard>,
  "environmentalRisk": <integer 0-100: estimated soil/drainage/environmental contamination>,
  "obstruction": <integer 0-100: degree of blockage of roads, footpaths, or gutters>,
  "confidence": <integer 0-100: observational confidence>,
  "detectedElements": ["<array of specific observed objects>"],
  "requiresManualVerification": <boolean: true if image is ambiguous, blurry, or low confidence>,
  "notes": "<concise summary of visual evidence>"
}`;

/**
 * Normalizes various image input types into inline base64 object for Gemini.
 * @param {Buffer|string|Object} imageInput
 * @returns {{ inlineData: { data: string, mimeType: string } } | null}
 */
function formatImageForGemini(imageInput) {
  if (!imageInput) return null;

  // Case 1: Object with base64 data and mimeType
  if (typeof imageInput === 'object' && imageInput.data && imageInput.mimeType) {
    return {
      inlineData: {
        data: imageInput.data.replace(/^data:image\/\w+;base64,/, ''),
        mimeType: imageInput.mimeType
      }
    };
  }

  // Case 2: Buffer
  if (Buffer.isBuffer(imageInput)) {
    return {
      inlineData: {
        data: imageInput.toString('base64'),
        mimeType: 'image/jpeg'
      }
    };
  }

  // Case 3: Base64 data URI string
  if (typeof imageInput === 'string' && imageInput.startsWith('data:image/')) {
    const match = imageInput.match(/^data:(image\/\w+);base64,(.+)$/);
    if (match) {
      return {
        inlineData: {
          mimeType: match[1],
          data: match[2]
        }
      };
    }
  }

  // Case 4: Raw base64 string
  if (typeof imageInput === 'string' && imageInput.length > 100) {
    return {
      inlineData: {
        data: imageInput.replace(/\s/g, ''),
        mimeType: 'image/jpeg'
      }
    };
  }

  return null;
}

/**
 * Primary AI Analysis Service Interface.
 * Analyzes waste image using Google Gemini Vision with deterministic mock fallback.
 * 
 * @param {Buffer|string|Object} image - Image buffer, base64 string, or { data, mimeType }
 * @param {Object} [options={}] - Execution options
 * @param {'auto'|'gemini'|'mock'} [options.mode] - Force mock or gemini mode (defaults to process.env.AI_MODE || 'auto')
 * @param {string} [options.apiKey] - Optional override for GEMINI_API_KEY
 * @param {string} [options.modelName] - Gemini model name (default: 'gemini-2.0-flash' or 'gemini-1.5-flash')
 * @param {number} [options.confidenceThreshold] - Confidence threshold for manual verification
 * @returns {Promise<{
 *   wasteType: string,
 *   severity: number,
 *   healthRisk: number,
 *   environmentalRisk: number,
 *   obstruction: number,
 *   confidence: number,
 *   detectedElements: string[],
 *   requiresManualVerification: boolean,
 *   notes: string
 * }>}
 */
async function analyzeWasteImage(image, options = {}) {
  const mode = options.mode || process.env.AI_MODE || 'auto';
  const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
  const modelName = options.modelName || process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const threshold = options.confidenceThreshold || process.env.CONFIDENCE_THRESHOLD || DEFAULT_CONFIDENCE_THRESHOLD;

  // If explicitly configured for mock mode or no API key is provided, execute deterministic mock
  if (mode === 'mock' || !apiKey) {
    const mockRaw = getMockAnalysis(image);
    const normalized = validateAndNormalizeObservations(mockRaw, threshold);
    return normalized.data;
  }

  // Real Gemini Vision Integration
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const formattedImage = formatImageForGemini(image);

    if (!formattedImage) {
      // If image format is unsupported, fall back safely with manual verification flagged
      const fallback = getMockAnalysis('unclear');
      const normalized = validateAndNormalizeObservations(fallback, threshold);
      return normalized.data;
    }

    const result = await model.generateContent([SYSTEM_PROMPT, formattedImage]);
    const response = await result.response;
    const rawText = response.text();

    const parsedJson = JSON.parse(rawText);
    const validated = validateAndNormalizeObservations(parsedJson, threshold);

    if (validated.isValid) {
      return validated.data;
    }

    // If validation fails on model output, fall back safely
    const fallback = getMockAnalysis(image);
    const normalized = validateAndNormalizeObservations(fallback, threshold);
    return normalized.data;
  } catch (error) {
    // Graceful fallback: Network, timeout, quota, or parsing error triggers deterministic fallback
    const fallback = getMockAnalysis(image);
    const normalized = validateAndNormalizeObservations(fallback, threshold);
    return normalized.data;
  }
}

module.exports = {
  analyzeWasteImage,
  formatImageForGemini,
  SYSTEM_PROMPT
};