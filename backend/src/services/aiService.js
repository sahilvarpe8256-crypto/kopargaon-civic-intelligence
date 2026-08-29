require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { validateAndNormalizeObservations, DEFAULT_CONFIDENCE_THRESHOLD } = require('./aiValidator');
const { getMockAnalysis } = require('./mockAi');
const logger = require('../utils/logger');

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
 * Supports both function signatures:
 * 1. analyzeWasteImage(image, options)
 * 2. analyzeWasteImage({ image, mimetype, description, mode, ... })
 *
 * @param {Buffer|string|Object} imageInput
 * @param {Object} [options={}]
 * @returns {Promise<Object>} Normalized observational evidence
 */
async function analyzeWasteImage(imageInput, options = {}) {
  // Support single-object param: { image, mimetype, description, mode, ... }
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
    const mockRaw = getMockAnalysis(image || (opts.description ? opts.description : 'default'));
    const normalized = validateAndNormalizeObservations(mockRaw, threshold);
    return normalized.data;
  }

  // 2. Explicit strict gemini mode without API key: Throw visible error
  if (mode === 'gemini' && !apiKey) {
    throw new Error('Gemini API key is required when AI_MODE is explicitly set to "gemini"');
  }

  // 3. Auto mode without API key: Fall back safely to mock
  if (!apiKey) {
    const mockRaw = getMockAnalysis(image || (opts.description ? opts.description : 'default'));
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
    if (mode === 'gemini') {
      throw error;
    }

    const fallback = getMockAnalysis(image || (opts.description ? opts.description : 'default'));
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