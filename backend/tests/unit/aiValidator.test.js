const {
  validateAndNormalizeObservations,
  extractAndParseJson,
  KNOWN_HAZARD_INDICATORS,
  DEFAULT_CONFIDENCE_THRESHOLD
} = require('../../src/services/aiValidator');

describe('AI Validator Unit Tests', () => {
  it('1. Successfully validates and normalizes a standard observation payload with hazard indicators', () => {
    const raw = {
      wasteType: 'plastic_waste',
      severity: 85,
      healthRisk: 70,
      environmentalRisk: 90,
      obstruction: 60,
      confidence: 92,
      detectedElements: ['plastic bottles', 'polythene bags'],
      hazardIndicators: ['drain_blockage', 'water_contamination'],
      requiresManualVerification: false,
      notes: 'Significant plastic accumulation near drainage.'
    };

    const result = validateAndNormalizeObservations(raw);
    expect(result.isValid).toBe(true);
    expect(result.data).toEqual({
      wasteType: 'plastic_waste',
      severity: 85,
      healthRisk: 70,
      environmentalRisk: 90,
      obstruction: 60,
      confidence: 92,
      detectedElements: ['plastic bottles', 'polythene bags'],
      hazardIndicators: ['drain_blockage', 'water_contamination'],
      requiresManualVerification: false,
      verificationReasons: [],
      notes: 'Significant plastic accumulation near drainage.'
    });
  });

  it('2. Clamps all numeric scores strictly within 0 - 100 range', () => {
    const raw = {
      wasteType: 'mixed_solid_waste',
      severity: 150, // exceeds 100
      healthRisk: -25, // below 0
      environmentalRisk: 1000,
      obstruction: -5,
      confidence: 100,
      detectedElements: ['debris']
    };

    const result = validateAndNormalizeObservations(raw);
    expect(result.isValid).toBe(true);
    expect(result.data.severity).toBe(100);
    expect(result.data.healthRisk).toBe(0);
    expect(result.data.environmentalRisk).toBe(100);
    expect(result.data.obstruction).toBe(0);
    expect(result.data.confidence).toBe(100);
  });

  it('3. Sets requiresManualVerification and populates explainable verificationReasons when confidence is low', () => {
    const raw = {
      wasteType: 'unknown',
      severity: 50,
      healthRisk: 50,
      environmentalRisk: 50,
      obstruction: 50,
      confidence: 42, // Below 50
      requiresManualVerification: false
    };

    const result = validateAndNormalizeObservations(raw, 50);
    expect(result.isValid).toBe(true);
    expect(result.data.requiresManualVerification).toBe(true);
    expect(result.data.verificationReasons.length).toBeGreaterThan(0);
    expect(result.data.verificationReasons[0]).toContain('42%');
  });

  it('4. Automatically flags manual verification when biohazard / hazardous waste is detected', () => {
    const raw = {
      wasteType: 'hazardous_waste',
      severity: 90,
      confidence: 85,
      hazardIndicators: ['biohazard', 'sharp_materials']
    };

    const result = validateAndNormalizeObservations(raw, 50);
    expect(result.isValid).toBe(true);
    expect(result.data.requiresManualVerification).toBe(true);
    expect(result.data.verificationReasons).toEqual(
      expect.arrayContaining([expect.stringContaining('bio-medical or hazardous material')])
    );
  });

  it('5. Handles string-based threshold conversion gracefully', () => {
    const raw = {
      wasteType: 'unknown',
      severity: 50,
      confidence: 65,
      requiresManualVerification: false
    };

    const result = validateAndNormalizeObservations(raw, '70'); // threshold 70 > 65
    expect(result.isValid).toBe(true);
    expect(result.data.requiresManualVerification).toBe(true);
  });

  it('6. Rejects non-object raw payload safely', () => {
    expect(validateAndNormalizeObservations(null).isValid).toBe(false);
    expect(validateAndNormalizeObservations('string').isValid).toBe(false);
    expect(validateAndNormalizeObservations(undefined).isValid).toBe(false);
  });

  it('7. Provides safe defaults for missing or empty fields', () => {
    const raw = {};
    const result = validateAndNormalizeObservations(raw);

    expect(result.isValid).toBe(true);
    expect(result.data.wasteType).toBe('unknown');
    expect(result.data.severity).toBe(50);
    expect(result.data.healthRisk).toBe(50);
    expect(result.data.environmentalRisk).toBe(50);
    expect(result.data.obstruction).toBe(50);
    expect(result.data.confidence).toBe(50);
    expect(Array.isArray(result.data.detectedElements)).toBe(true);
    expect(Array.isArray(result.data.hazardIndicators)).toBe(true);
    expect(result.data.notes).toBeDefined();
  });

  describe('extractAndParseJson', () => {
    it('8. Successfully extracts clean JSON string', () => {
      const input = '{"wasteType":"organic_waste","severity":60}';
      const parsed = extractAndParseJson(input);
      expect(parsed.success).toBe(true);
      expect(parsed.data.wasteType).toBe('organic_waste');
    });

    it('9. Strips markdown fences ```json ... ``` correctly', () => {
      const input = '```json\n{\n  "wasteType": "plastic_waste",\n  "severity": 80\n}\n```';
      const parsed = extractAndParseJson(input);
      expect(parsed.success).toBe(true);
      expect(parsed.data.wasteType).toBe('plastic_waste');
      expect(parsed.data.severity).toBe(80);
    });

    it('10. Safely extracts JSON from surrounding conversational text', () => {
      const input = 'Here is the analysis:\n\n{"wasteType":"dead_animal","severity":95}\n\nHope this helps.';
      const parsed = extractAndParseJson(input);
      expect(parsed.success).toBe(true);
      expect(parsed.data.wasteType).toBe('dead_animal');
    });

    it('11. Returns error for empty or invalid non-JSON output', () => {
      expect(extractAndParseJson('').success).toBe(false);
      expect(extractAndParseJson('Not a JSON string').success).toBe(false);
      expect(extractAndParseJson(null).success).toBe(false);
    });
  });
});