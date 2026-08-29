const { validateAndNormalizeObservations, DEFAULT_CONFIDENCE_THRESHOLD } = require('../../src/services/aiValidator');

describe('AI Validator Unit Tests', () => {
  it('1. Successfully validates and normalizes a standard observation payload', () => {
    const raw = {
      wasteType: 'plastic_waste',
      severity: 85,
      healthRisk: 70,
      environmentalRisk: 90,
      obstruction: 60,
      confidence: 92,
      detectedElements: ['plastic bottles', 'polythene bags'],
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
      requiresManualVerification: false,
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

  it('3. Sets requiresManualVerification to true when confidence is below threshold', () => {
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
  });

  it('4. Handles string-based threshold conversion gracefully', () => {
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

  it('5. Rejects non-object raw payload safely', () => {
    expect(validateAndNormalizeObservations(null).isValid).toBe(false);
    expect(validateAndNormalizeObservations('string').isValid).toBe(false);
    expect(validateAndNormalizeObservations(undefined).isValid).toBe(false);
  });

  it('6. Provides safe defaults for missing or empty fields', () => {
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
    expect(result.data.notes).toBeDefined();
  });
});