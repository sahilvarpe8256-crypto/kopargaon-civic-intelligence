require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { validateAndNormalizeObservations, extractAndParseJson, DEFAULT_CONFIDENCE_THRESHOLD } = require('./aiValidator');
const { getMockAnalysis } = require('./mockAi');
const logger = require('../utils/logger');

const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

const SYSTEM_PROMPT = `You are a civic waste evidence observer for Kopargaon Municipal Council.
Analyze the provided image and return ONLY a valid JSON object describing visual observations.
Do NOT include markdown formatting or explanations outside JSON. Do NOT calculate any priority scores. Do NOT make resource decisions.

Required JSON Structure:
{
  "wasteType": "mixed_solid_waste | plastic_waste | organic_waste | construction_debris | hazardous_waste | dead_animal | none | unknown",
  "severity": <integer 0-100: observational severity estimate>,
  "healthRisk": <integer 0-100: estimated public health hazard>,
  "environmentalRisk": <integer 0-100: estimated soil/drainage/environmental contamination>,
  "obstruction": <integer 0-100: degree of blockage of roads, footpaths, or gutters>,
  "confidence": <integer 0-100: observational confidence>,
  "detectedElements": ["<array of specific observed objects>"],
  "hazardIndicators": ["<array of tags: open_burning | drain_blockage | water_contamination | animal_scavenging | sharp_materials | biohazard | traffic_obstruction | toxic_fumes>"],
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

  // Case 4: Plain base64 string
  if (typeof imageInput === 'string' && imageInput.length > 100 && /^[A-Za-z0-9+/=]+$/.test(imageInput.trim())) {
    return {
      inlineData: {
        data: imageInput.trim(),
        mimeType: 'image/jpeg'
      }
    };
  }

  // Case 5: Local filepath or URL string
  if (typeof imageInput === 'string' && imageInput.trim().length > 0) {
    const fs = require('fs');
    try {
      if (fs.existsSync(imageInput)) {
        const buffer = fs.readFileSync(imageInput);
        const lowerPath = imageInput.toLowerCase();
        let mime = 'image/jpeg';
        if (lowerPath.endsWith('.png')) mime = 'image/png';
        else if (lowerPath.endsWith('.webp')) mime = 'image/webp';
        else if (lowerPath.endsWith('.heic')) mime = 'image/heic';
        return {
          inlineData: {
            data: buffer.toString('base64'),
            mimeType: mime
          }
        };
      }
    } catch (e) {
      // Ignore filesystem errors and fallback to mock
    }
  }

  return null;
}

/**
 * Main AI observation function.
 * Supports both signatures:
 * 1. analyzeWasteImage(image, options)
 * 2. analyzeWasteImage({ image, mimetype, description, ... }, options)
 * 
 * @param {Buffer|string|Object} input
 * @param {Object} [options]
 * @returns {Promise<Object>} Observation results with strictly 0-100 clamped values
 */
async function analyzeWasteImage(input, options = {}) {
  let image = input;
  let opts = { ...options };

  // Support single-object argument pattern { image, mimetype, description, mode, confidenceThreshold }
  if (input && typeof input === 'object' && !Buffer.isBuffer(input) && !input.data) {
    if (input.image !== undefined || input.mimetype !== undefined || input.description !== undefined) {
      image = input.image;
      opts = {
        ...opts,
        mimetype: input.mimetype,
        description: input.description,
        mode: input.mode || opts.mode,
        confidenceThreshold: input.confidenceThreshold || opts.confidenceThreshold
      };
    }
  }

  const mode = (opts.mode || process.env.AI_MODE || 'auto').toLowerCase();
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const threshold = opts.confidenceThreshold || process.env.CONFIDENCE_THRESHOLD || DEFAULT_CONFIDENCE_THRESHOLD;

  // 1. Explicit mock mode: Return deterministic mock observations directly
  if (mode === 'mock') {
    const mockRaw = getMockAnalysis(image, opts.description || '');
    const normalized = validateAndNormalizeObservations(mockRaw, threshold);
    return normalized.data;
  }

  // 2. Explicit strict gemini mode without API key: Throw visible error
  if (mode === 'gemini' && !apiKey) {
    throw new Error('Gemini API key is required when AI_MODE is explicitly set to "gemini"');
  }

  // 3. Auto mode without API key: Fall back safely to mock
  if (!apiKey) {
    const mockRaw = getMockAnalysis(image, opts.description || '');
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
      const fallback = getMockAnalysis('unclear', opts.description || '');
      const normalized = validateAndNormalizeObservations(fallback, threshold);
      return normalized.data;
    }

    const result = await model.generateContent([SYSTEM_PROMPT, formattedImage]);
    const response = await result.response;
    const rawText = response.text();

    const parseResult = extractAndParseJson(rawText);
    if (!parseResult.success) {
      if (mode === 'gemini') {
        throw new Error(`Gemini JSON parsing error: ${parseResult.error}`);
      }
      const fallback = getMockAnalysis(image, opts.description || '');
      const normalized = validateAndNormalizeObservations(fallback, threshold);
      return normalized.data;
    }

    const validated = validateAndNormalizeObservations(parseResult.data, threshold);

    if (validated.isValid) {
      return validated.data;
    }

    if (mode === 'gemini') {
      throw new Error(`Gemini response validation failed: ${validated.error || 'Unknown schema error'}`);
    }

    const fallback = getMockAnalysis(image, opts.description || '');
    const normalized = validateAndNormalizeObservations(fallback, threshold);
    return normalized.data;
  } catch (error) {
    if (mode === 'gemini') {
      throw error;
    }

    const fallback = getMockAnalysis(image, opts.description || '');
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