require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { validateAndNormalizeObservations, DEFAULT_CONFIDENCE_THRESHOLD } = require('./aiValidator');
const { getMockAnalysis } = require('./mockAi');

const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

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
    const mime = imageInput.mimeType.toLowerCase();
    if (!SUPPORTED_MIME_TYPES.includes(mime)) return null;
    const cleanData = imageInput.data.replace(/^data:image\/\w+;base64,/, '').trim();
    if (!/^[A-Za-z0-9+/=]+$/.test(cleanData)) return null;
    return {
      inlineData: {
        data: cleanData,
        mimeType: mime
      }
    };
  }

  // Case 2: Buffer
  if (Buffer.isBuffer(imageInput)) {
    if (imageInput.length === 0) return null;
    return {
      inlineData: {
        data: imageInput.toString('base64'),
        mimeType: 'image/jpeg'
      }
    };
  }

  // Case 3: Base64 data URI string
  if (typeof imageInput === 'string' && imageInput.startsWith('data:image/')) {
    const match = imageInput.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (match) {
      const mime = match[1].toLowerCase();
      const cleanData = match[2].trim();
      if (SUPPORTED_MIME_TYPES.includes(mime) && /^[A-Za-z0-9+/=]+$/.test(cleanData)) {
        return {
          inlineData: {
            mimeType: mime,
            data: cleanData
          }
        };
      }
    }
  }

  // Case 4: Raw base64 string
  if (typeof imageInput === 'string' && imageInput.length > 50) {
    const clean = imageInput.replace(/\s/g, '');
    if (/^[A-Za-z0-9+/=]+$/.test(clean)) {
      return {
        inlineData: {
          data: clean,
          mimeType: 'image/jpeg'
        }
      };
    }
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
 * @param {number|string} [options.confidenceThreshold] - Confidence threshold for manual verification
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
  const threshold = options.confidenceThreshold !== undefined
    ? options.confidenceThreshold
    : (process.env.CONFIDENCE_THRESHOLD || DEFAULT_CONFIDENCE_THRESHOLD);

  // 1. Explicit mock mode: Return deterministic mock analysis immediately
  if (mode === 'mock') {
    const mockRaw = getMockAnalysis(image);
    const normalized = validateAndNormalizeObservations(mockRaw, threshold);
    return normalized.data;
  }

  // 2. Explicit strict gemini mode without API key: Throw visible error rather than silently masking failure
  if (mode === 'gemini' && !apiKey) {
    throw new Error('Gemini API key is required when AI_MODE is explicitly set to "gemini"');
  }

  // 3. Auto mode without API key: Fall back safely to mock
  if (!apiKey) {
    const mockRaw = getMockAnalysis(image);
    const normalized = validateAndNormalizeObservations(mockRaw, threshold);
    return normalized.data;
  }

  // 4. Gemini Vision Integration
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
      if (mode === 'gemini') {
        throw new Error('Unsupported or invalid image format provided for Gemini analysis');
      }
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

    if (mode === 'gemini') {
      throw new Error(`Gemini response validation failed: ${validated.error || 'Unknown schema error'}`);
    }

    const fallback = getMockAnalysis(image);
    const normalized = validateAndNormalizeObservations(fallback, threshold);
    return normalized.data;
  } catch (error) {
    // In strict gemini mode, propagate the error for production observability
    if (mode === 'gemini') {
      throw error;
    }

    // In auto mode, gracefully fall back to mock observations
    const fallback = getMockAnalysis(image);
    const normalized = validateAndNormalizeObservations(fallback, threshold);
    return normalized.data;
  }
}

module.exports = {
  analyzeWasteImage,
  formatImageForGemini,
  SUPPORTED_MIME_TYPES,
  SYSTEM_PROMPT
};