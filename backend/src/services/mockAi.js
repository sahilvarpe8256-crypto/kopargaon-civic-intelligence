/**
 * Deterministic Mock AI Observations for Kopargaon Civic Intelligence Platform.
 * Provides realistic, reliable visual evidence observations when Gemini API is offline or in mock mode.
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
  hazardIndicators: ['drain_blockage', 'traffic_obstruction'],
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
    hazardIndicators: [],
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
    hazardIndicators: ['biohazard', 'sharp_materials', 'toxic_fumes'],
    requiresManualVerification: false,
    notes: 'Potentially hazardous bio-medical or chemical waste requiring urgent specialized handling.'
  },
  unclear: {
    wasteType: 'unknown',
    severity: 45,
    healthRisk: 40,
    environmentalRisk: 35,
    obstruction: 30,
    confidence: 35, // Below threshold -> triggers requiresManualVerification
    detectedElements: ['unidentified debris', 'low resolution blur'],
    hazardIndicators: [],
    requiresManualVerification: true,
    notes: 'Image lighting and resolution make definitive assessment uncertain. Manual verification recommended.'
  },
  burning: {
    wasteType: 'mixed_solid_waste',
    severity: 90,
    healthRisk: 92,
    environmentalRisk: 88,
    obstruction: 65,
    confidence: 92,
    detectedElements: ['active open fire', 'smoke plume', 'burning plastic', 'ash pile'],
    hazardIndicators: ['open_burning', 'toxic_fumes', 'air_pollution'],
    requiresManualVerification: false,
    notes: 'Active open garbage burning detected with toxic smoke emissions and immediate respiratory hazard.'
  },
  drain_blockage: {
    wasteType: 'plastic_waste',
    severity: 85,
    healthRisk: 80,
    environmentalRisk: 88,
    obstruction: 95,
    confidence: 94,
    detectedElements: ['clogged stormwater drain', 'floating plastic bottles', 'stagnant sewage'],
    hazardIndicators: ['drain_blockage', 'water_contamination', 'traffic_obstruction'],
    requiresManualVerification: false,
    notes: 'Severe roadside nalah / gutter blockage caused by single-use plastics and silt accumulation.'
  },
  animal: {
    wasteType: 'dead_animal',
    severity: 92,
    healthRisk: 96,
    environmentalRisk: 75,
    obstruction: 60,
    confidence: 90,
    detectedElements: ['animal carcass', 'flies', 'organic decomposition'],
    hazardIndicators: ['biohazard', 'animal_scavenging', 'health_vector'],
    requiresManualVerification: false,
    notes: 'Decomposing animal carcass presenting severe public health hazard and vector risk.'
  },
  construction: {
    wasteType: 'construction_debris',
    severity: 75,
    healthRisk: 40,
    environmentalRisk: 55,
    obstruction: 88,
    confidence: 93,
    detectedElements: ['concrete chunks', 'broken bricks', 'cement sacks', 'roadway encroachment'],
    hazardIndicators: ['traffic_obstruction', 'sharp_materials'],
    requiresManualVerification: false,
    notes: 'Heavy construction and demolition debris obstructing public right-of-way and road transit.'
  },
  market: {
    wasteType: 'organic_waste',
    severity: 78,
    healthRisk: 70,
    environmentalRisk: 65,
    obstruction: 75,
    confidence: 91,
    detectedElements: ['rotten vegetables', 'fruit peels', 'biodegradable waste', 'wet sludge'],
    hazardIndicators: ['animal_scavenging', 'odour_nuisance'],
    requiresManualVerification: false,
    notes: 'High-volume organic vegetable market waste causing foul odor and stray animal gathering.'
  }
};

/**
 * Returns deterministic mock observations based on input characteristics or hints.
 * @param {any} [imageInput]
 * @param {string} [hintText]
 * @returns {Object}
 */
function getMockAnalysis(imageInput, hintText = '') {
  const combined = `${typeof imageInput === 'string' ? imageInput : ''} ${typeof hintText === 'string' ? hintText : ''}`.toLowerCase();

  if (combined.includes('clean') || combined.includes('no_waste') || combined.includes('spotless')) {
    return { ...MOCK_SCENARIOS.clean };
  }
  if (combined.includes('burn') || combined.includes('fire') || combined.includes('smoke') || combined.includes('ash')) {
    return { ...MOCK_SCENARIOS.burning };
  }
  if (combined.includes('drain') || combined.includes('gutter') || combined.includes('nalah') || combined.includes('clog')) {
    return { ...MOCK_SCENARIOS.drain_blockage };
  }
  if (combined.includes('dead') || combined.includes('animal') || combined.includes('carcass') || combined.includes('dog')) {
    return { ...MOCK_SCENARIOS.animal };
  }
  if (combined.includes('construct') || combined.includes('debris') || combined.includes('malba') || combined.includes('cement') || combined.includes('brick')) {
    return { ...MOCK_SCENARIOS.construction };
  }
  if (combined.includes('market') || combined.includes('vegetable') || combined.includes('mandi') || combined.includes('fruit')) {
    return { ...MOCK_SCENARIOS.market };
  }
  if (combined.includes('hazard') || combined.includes('medical') || combined.includes('chemical') || combined.includes('hospital') || combined.includes('syringe')) {
    return { ...MOCK_SCENARIOS.hazardous };
  }
  if (combined.includes('unclear') || combined.includes('blurry') || combined.includes('low_conf') || combined.includes('dark')) {
    return { ...MOCK_SCENARIOS.unclear };
  }

  return { ...MOCK_SCENARIOS.default };
}

module.exports = {
  DEFAULT_MOCK_OBSERVATIONS,
  MOCK_SCENARIOS,
  getMockAnalysis
};