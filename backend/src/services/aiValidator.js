/**
 * AI Observation Schema Validator & Sanitizer.
 * Ensures all AI outputs strictly conform to the 0-100 scale contract
 * and never produce unvalidated or crashing structures.
 */

const DEFAULT_CONFIDENCE_THRESHOLD = 50;

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
    ? rawData.wasteType.trim()
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

  const notes = typeof rawData.notes === 'string' && rawData.notes.trim().length > 0
    ? rawData.notes.trim()
    : 'Visual evidence analyzed.';

  // Determine if manual verification is necessary
  const parsedThreshold = Number(confidenceThreshold);
  const threshold = isNaN(parsedThreshold) ? DEFAULT_CONFIDENCE_THRESHOLD : parsedThreshold;
  const requiresManualVerification = Boolean(
    rawData.requiresManualVerification === true || confidence < threshold
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
      requiresManualVerification,
      notes
    }
  };
}

module.exports = {
  DEFAULT_CONFIDENCE_THRESHOLD,
  validateAndNormalizeObservations
};