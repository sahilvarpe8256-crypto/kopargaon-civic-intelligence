/**
 * AI Observation Schema Validator & Sanitizer.
 * Ensures all AI outputs strictly conform to the 0-100 scale contract
 * and never produce unvalidated or crashing structures.
 */

const DEFAULT_CONFIDENCE_THRESHOLD = 50;

const KNOWN_HAZARD_INDICATORS = [
  'open_burning',
  'drain_blockage',
  'water_contamination',
  'animal_scavenging',
  'sharp_materials',
  'biohazard',
  'traffic_obstruction',
  'toxic_fumes'
];

/**
 * Robustly extracts and parses JSON from raw LLM text responses,
 * safely handling markdown fences, leading/trailing prose, and whitespace.
 * @param {string} rawText
 * @returns {{ success: boolean, data?: Object, error?: string }}
 */
function extractAndParseJson(rawText) {
  if (typeof rawText !== 'string' || !rawText.trim()) {
    return { success: false, error: 'Empty or non-string response received from AI model' };
  }

  // 1. Clean markdown code blocks ```json ... ``` or ``` ... ```
  let cleaned = rawText.trim();
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
  }

  // 2. Direct parse attempt
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object') {
      return { success: true, data: parsed };
    }
  } catch (err) {
    // Continue to substring extraction
  }

  // 3. Substring search for outermost JSON object { ... }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      const jsonSubstr = cleaned.slice(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(jsonSubstr);
      if (parsed && typeof parsed === 'object') {
        return { success: true, data: parsed };
      }
    } catch (subErr) {
      return { success: false, error: `Malformed JSON structure: ${subErr.message}` };
    }
  }

  return { success: false, error: 'No valid JSON object found in model output' };
}

/**
 * Validates, clamps numeric ranges (0-100), and normalizes observation data.
 * @param {Object} rawData - Raw parsed JSON response from Gemini or fallback source
 * @param {number|string} [confidenceThreshold=50] - Threshold below which manual verification is flagged
 * @returns {{ isValid: boolean, data: Object, error?: string }}
 */
function validateAndNormalizeObservations(rawData, confidenceThreshold = DEFAULT_CONFIDENCE_THRESHOLD) {
  if (!rawData || typeof rawData !== 'object') {
    return {
      isValid: false,
      error: 'Observation payload must be a non-null object',
      data: null
    };
  }

  // Safe clamping helper: forces value to integer between 0 and 100
  const clampScore = (value, fallback = 50) => {
    const num = Number(value);
    if (isNaN(num)) return fallback;
    return Math.max(0, Math.min(100, Math.round(num)));
  };

  const wasteType = typeof rawData.wasteType === 'string' && rawData.wasteType.trim().length > 0
    ? rawData.wasteType.trim().toLowerCase()
    : 'unknown';

  const severity = clampScore(rawData.severity, 50);
  const healthRisk = clampScore(rawData.healthRisk, 50);
  const environmentalRisk = clampScore(rawData.environmentalRisk, 50);
  const obstruction = clampScore(rawData.obstruction, 50);
  const confidence = clampScore(rawData.confidence, 50);

  const detectedElements = Array.isArray(rawData.detectedElements)
    ? rawData.detectedElements
        .filter(item => typeof item === 'string' && item.trim().length > 0)
        .map(item => item.trim())
    : [];

  const hazardIndicators = Array.isArray(rawData.hazardIndicators)
    ? rawData.hazardIndicators
        .filter(item => typeof item === 'string' && item.trim().length > 0)
        .map(item => item.trim().toLowerCase())
    : [];

  const notes = typeof rawData.notes === 'string' && rawData.notes.trim().length > 0
    ? rawData.notes.trim()
    : 'Visual evidence analyzed.';

  // Determine if manual verification is necessary and provide explainable reasons
  const parsedThreshold = Number(confidenceThreshold);
  const threshold = isNaN(parsedThreshold) ? DEFAULT_CONFIDENCE_THRESHOLD : parsedThreshold;
  
  const verificationReasons = [];
  if (confidence < threshold) {
    verificationReasons.push(`Confidence score (${confidence}%) is below operational threshold (${threshold}%)`);
  }
  if (wasteType === 'hazardous_waste' || hazardIndicators.includes('biohazard')) {
    verificationReasons.push('Potential bio-medical or hazardous material detected requiring safety verification');
  }
  if (wasteType === 'unknown' && confidence < 70) {
    verificationReasons.push('Unidentified waste category requiring officer inspection');
  }
  if (rawData.requiresManualVerification === true && verificationReasons.length === 0) {
    verificationReasons.push('Explicit manual verification flagged by visual observation');
  }

  const requiresManualVerification = Boolean(
    rawData.requiresManualVerification === true || verificationReasons.length > 0
  );

  return {
    isValid: true,
    data: {
      wasteType,
      severity,
      healthRisk,
      environmentalRisk,
      obstruction,
      confidence,
      detectedElements,
      hazardIndicators,
      requiresManualVerification,
      verificationReasons,
      notes
    }
  };
}

module.exports = {
  DEFAULT_CONFIDENCE_THRESHOLD,
  KNOWN_HAZARD_INDICATORS,
  extractAndParseJson,
  validateAndNormalizeObservations
};