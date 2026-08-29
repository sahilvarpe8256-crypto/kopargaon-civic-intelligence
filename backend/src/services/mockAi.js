/**
 * Deterministic Mock AI Observations.
 * Provides realistic, reliable observations when Gemini API is unconfigured or in test mode.
 */

const DEFAULT_MOCK_OBSERVATIONS = {
  wasteType: 'mixed_solid_waste',
  severity: 82,
  healthRisk: 76,
  environmentalRisk: 68,
  obstruction: 90,
  confidence: 95,
  detectedElements: [
    'plastic bags',
    'organic waste',
    'overflowing garbage',
    'blocked roadside drainage'
  ],
  requiresManualVerification: false,
  notes: 'Visible mixed waste accumulation with significant public obstruction and drainage blockage.'
};

const MOCK_SCENARIOS = {
  default: DEFAULT_MOCK_OBSERVATIONS,
  clean: {
    wasteType: 'none',
    severity: 5,
    healthRisk: 0,
    environmentalRisk: 0,
    obstruction: 0,
    confidence: 95,
    detectedElements: ['clean paved road', 'empty sidewalk'],
    requiresManualVerification: false,
    notes: 'No civic waste or obstruction detected in the image.'
  },
  hazardous: {
    wasteType: 'hazardous_waste',
    severity: 95,
    healthRisk: 90,
    environmentalRisk: 85,
    obstruction: 70,
    confidence: 88,
    detectedElements: ['medical waste', 'chemical containers', 'broken glass'],
    requiresManualVerification: false,
    notes: 'Potentially hazardous bio-medical or chemical waste requiring urgent specialized handling.'
  },
  unclear: {
    wasteType: 'unknown',
    severity: 45,
    healthRisk: 40,
    environmentalRisk: 35,
    obstruction: 30,
    confidence: 35, // Below 50 threshold -> triggers requiresManualVerification = true
    detectedElements: ['unidentified debris', 'low resolution blur'],
    requiresManualVerification: true,
    notes: 'Image lighting and resolution make definitive assessment uncertain. Manual verification recommended.'
  }
};

/**
 * Returns deterministic mock observations based on input characteristics or hints.
 * @param {any} [imageInput]
 * @returns {Object}
 */
function getMockAnalysis(imageInput) {
  if (typeof imageInput === 'string') {
    const lower = imageInput.toLowerCase();
    if (lower.includes('clean') || lower.includes('no_waste')) {
      return { ...MOCK_SCENARIOS.clean };
    }
    if (lower.includes('hazard') || lower.includes('medical') || lower.includes('chemical')) {
      return { ...MOCK_SCENARIOS.hazardous };
    }
    if (lower.includes('unclear') || lower.includes('blurry') || lower.includes('low_conf')) {
      return { ...MOCK_SCENARIOS.unclear };
    }
  }

  return { ...MOCK_SCENARIOS.default };
}

module.exports = {
  DEFAULT_MOCK_OBSERVATIONS,
  MOCK_SCENARIOS,
  getMockAnalysis
};