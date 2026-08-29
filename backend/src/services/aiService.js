require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { validateAndNormalizeObservations, DEFAULT_CONFIDENCE_THRESHOLD } = require('./aiValidator');
const { getMockAnalysis } = require('./mockAi');

const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

const SYSTEM_PROMPT = `
You are an expert civic environmental and waste assessment vision AI for the Kopargaon Municipal Council.
Your task is to analyze the provided image of reported public waste or garbage accumulation and extract objective observational evidence.

Analyze the image and return a strictly valid JSON object matching this schema:
{
  "wasteType": "mixed_solid_waste" | "organic_waste" | "plastic_debris" | "construction_debris" | "hazardous_waste" | "drainage_silt",
  "severity": <integer between 0 and 100 representing physical visual accumulation density>,
  "healthRisk": <integer between 0 and 100 representing biological hazard, decaying matter, vectors>,
  "environmentalRisk": <integer between 0 and 100 representing water body contamination or fire hazard>,
  "obstruction": <integer between 0 and 100 representing encroachment on footpaths, roads, or gutters>,
  "confidence": <integer between 0 and 100 representing clarity and confidence of detection>,
  "detectedElements": [<array of specific visual elements detected, e.g. "plastic bottles", "blocked drain">],
  "requiresManualVerification": <boolean, true if image is blurry, ambiguous, or confidence < 50>,
  "notes": "<concise factual observation summary>"
}

Do NOT calculate a priority score or assign municipal cleanup crews. Only return the raw observational evidence in the specified JSON format.
`;

/**
 * Validates and converts various image input formats into Gemini Part format.
 *
 * @param {Buffer|string|Object} imageInput
 * @returns {{ inlineData: { data: string, mimeType: string } } | null}
 */
function formatImageForGemini(imageInput) {
  if (!imageInput) return null;

  // Case 1: Object with base64 data and mimeType
  if (typeof imageInput === 'object' && imageInput !== null && imageInput.data && imageInput.mimeType) {
    const mime = imageInput.mimeType.toLowerCase();
    if (SUPPORTED_MIME_TYPES.includes(mime)) {
      const cleanData = imageInput.data.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '').trim();
      if (/^[A-Za-z0-9+/=]+$/.test(cleanData)) {
        return {
          inlineData: {
            data: cleanData,
            mimeType: mime
          }
        };
      }
    }
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
 * Supports both signatures:
 * 1. analyzeWasteImage(image, options)
 * 2. analyzeWasteImage({ image, mimetype, description, mode, ... })
 *
 * @param {Buffer|string|Object} imageInput - Image buffer, base64 string, or { data, mimeType }
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
async function analyzeWasteImage(imageInput, options = {}) {
  let image = imageInput;
  let opts = { ...options };

  if (typeof imageInput === 'object' && imageInput !== null && !Buffer.isBuffer(imageInput) && !imageInput.data && imageInput.image !== undefined) {
    image = imageInput.image;
    opts = { ...imageInput, ...options };
  }

  const mode = opts.mode || process.env.AI_MODE || 'auto';
  const apiKey = opts.apiKey || process.env.GEMINI_API_KEY;
  const modelName = opts.modelName || process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const threshold = opts.confidenceThreshold !== undefined
    ? opts.confidenceThreshold
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

class AIService {
  static analyzeWasteImage(params, options) {
    return analyzeWasteImage(params, options);
  }
}

module.exports = AIService;
module.exports.analyzeWasteImage = analyzeWasteImage;
module.exports.formatImageForGemini = formatImageForGemini;
module.exports.SUPPORTED_MIME_TYPES = SUPPORTED_MIME_TYPES;
module.exports.SYSTEM_PROMPT = SYSTEM_PROMPT;
module.exports.AIService = AIService;