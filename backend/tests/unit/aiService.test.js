const {
  analyzeWasteImage,
  formatImageForGemini,
  SUPPORTED_MIME_TYPES,
  SYSTEM_PROMPT
} = require('../../src/services/aiService');

describe('AI Service Unit Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('1. Returns valid mock observation object with expected properties and hazard indicators in mock mode', async () => {
    process.env.AI_MODE = 'mock';
    delete process.env.GEMINI_API_KEY;

    const result = await analyzeWasteImage('dummy_image.jpg');

    expect(result).toHaveProperty('wasteType');
    expect(result).toHaveProperty('severity');
    expect(result).toHaveProperty('healthRisk');
    expect(result).toHaveProperty('environmentalRisk');
    expect(result).toHaveProperty('obstruction');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('detectedElements');
    expect(result).toHaveProperty('hazardIndicators');
    expect(result).toHaveProperty('requiresManualVerification');
    expect(result).toHaveProperty('notes');

    expect(Array.isArray(result.detectedElements)).toBe(true);
    expect(Array.isArray(result.hazardIndicators)).toBe(true);
    expect(typeof result.requiresManualVerification).toBe('boolean');
  });

  it('2. Clamps all numerical outputs within strict 0 - 100 range', async () => {
    process.env.AI_MODE = 'mock';
    const result = await analyzeWasteImage('sample_image.jpg');

    expect(result.severity).toBeGreaterThanOrEqual(0);
    expect(result.severity).toBeLessThanOrEqual(100);

    expect(result.healthRisk).toBeGreaterThanOrEqual(0);
    expect(result.healthRisk).toBeLessThanOrEqual(100);

    expect(result.environmentalRisk).toBeGreaterThanOrEqual(0);
    expect(result.environmentalRisk).toBeLessThanOrEqual(100);

    expect(result.obstruction).toBeGreaterThanOrEqual(0);
    expect(result.obstruction).toBeLessThanOrEqual(100);

    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(100);
  });

  it('3. Auto mode without GEMINI_API_KEY does not crash and falls back safely to mock observations', async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.AI_MODE;

    await expect(analyzeWasteImage('test.jpg', { mode: 'auto' })).resolves.toEqual(
      expect.objectContaining({
        wasteType: expect.any(String),
        severity: expect.any(Number),
        confidence: expect.any(Number),
        hazardIndicators: expect.any(Array)
      })
    );
  });

  it('4. Strict gemini mode without API key throws an explicit error', async () => {
    delete process.env.GEMINI_API_KEY;

    await expect(analyzeWasteImage('test.jpg', { mode: 'gemini' })).rejects.toThrow(
      'Gemini API key is required when AI_MODE is explicitly set to "gemini"'
    );
  });

  it('5. Low confidence produces requiresManualVerification = true and verificationReasons', async () => {
    const result = await analyzeWasteImage('unclear_blurry_image.jpg');

    expect(result.confidence).toBeLessThan(50);
    expect(result.requiresManualVerification).toBe(true);
    expect(Array.isArray(result.verificationReasons)).toBe(true);
    expect(result.verificationReasons.length).toBeGreaterThan(0);
  });

  it('6. Supports confidence threshold configured as string or number', async () => {
    const result = await analyzeWasteImage('sample.jpg', { confidenceThreshold: '99' });

    // Since mock confidence is 95, threshold 99 forces requiresManualVerification
    expect(result.requiresManualVerification).toBe(true);
  });

  it('7. The service does NOT calculate priorityScore or make resource decisions', async () => {
    const result = await analyzeWasteImage('sample_waste.jpg');

    // Strict boundary enforcement
    expect(result.priorityScore).toBeUndefined();
    expect(result.score).toBeUndefined();
    expect(result.populationExposure).toBeUndefined();
    expect(result.allocatedResources).toBeUndefined();
    expect(result.assignedCrew).toBeUndefined();
    expect(result.assignedVehicle).toBeUndefined();
  });

  it('8. Supports contextual mock scenarios based on description keywords (e.g., burning, drain, dead animal)', async () => {
    // Scenario 1: Burning garbage
    const burningResult = await analyzeWasteImage({ image: 'img.jpg', description: 'burning garbage with heavy smoke' });
    expect(burningResult.hazardIndicators).toContain('open_burning');
    expect(burningResult.healthRisk).toBeGreaterThan(80);

    // Scenario 2: Drain blockage
    const drainResult = await analyzeWasteImage({ image: 'img.jpg', description: 'plastic waste clogging roadside nalah gutter' });
    expect(drainResult.hazardIndicators).toContain('drain_blockage');
    expect(drainResult.obstruction).toBeGreaterThan(85);

    // Scenario 3: Dead animal
    const animalResult = await analyzeWasteImage({ image: 'img.jpg', description: 'dead animal carcass near temple' });
    expect(animalResult.wasteType).toBe('dead_animal');
    expect(animalResult.hazardIndicators).toContain('biohazard');
  });

  it('9. The same mock input produces deterministic output', async () => {
    const run1 = await analyzeWasteImage('test_waste.jpg');
    const run2 = await analyzeWasteImage('test_waste.jpg');

    expect(run1).toEqual(run2);
  });

  it('10. Handles multiple valid image formats correctly (Buffer, data URI, Object)', () => {
    // Buffer
    const bufferImage = Buffer.from('fake image content');
    const formattedBuffer = formatImageForGemini(bufferImage);
    expect(formattedBuffer).toHaveProperty('inlineData.data');
    expect(formattedBuffer.inlineData.mimeType).toBe('image/jpeg');

    // Data URI
    const dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const formattedDataUri = formatImageForGemini(dataUri);
    expect(formattedDataUri.inlineData.mimeType).toBe('image/png');

    // Object { data, mimeType }
    const objImage = { data: 'aGVsbG8=', mimeType: 'image/webp' };
    const formattedObj = formatImageForGemini(objImage);
    expect(formattedObj.inlineData.mimeType).toBe('image/webp');
    expect(formattedObj.inlineData.data).toBe('aGVsbG8=');
  });

  it('11. Rejects invalid MIME types or corrupted base64 strings in image formatter', () => {
    expect(formatImageForGemini(null)).toBeNull();
    expect(formatImageForGemini('')).toBeNull();
    expect(formatImageForGemini({ data: 'abc', mimeType: 'text/plain' })).toBeNull();
    expect(formatImageForGemini('data:application/pdf;base64,JVBERi0xLjQK')).toBeNull();
    expect(formatImageForGemini('corrupted non base64 string @@##$$%%')).toBeNull();
  });
});