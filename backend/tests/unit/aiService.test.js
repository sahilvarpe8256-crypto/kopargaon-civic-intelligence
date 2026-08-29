const { analyzeWasteImage, formatImageForGemini } = require('../../services/aiService');
const { DEFAULT_MOCK_OBSERVATIONS } = require('../../services/mockAi');

describe('AI Service Unit & Mock Integration Tests', () => {
  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
    process.env.AI_MODE = 'mock';
  });

  it('1. Mock AI returns valid structured output without GEMINI_API_KEY', async () => {
    const result = await analyzeWasteImage('sample_image.jpg');

    expect(result).toBeDefined();
    expect(result).toHaveProperty('wasteType');
    expect(result).toHaveProperty('severity');
    expect(result).toHaveProperty('healthRisk');
    expect(result).toHaveProperty('environmentalRisk');
    expect(result).toHaveProperty('obstruction');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('detectedElements');
    expect(result).toHaveProperty('requiresManualVerification');
    expect(result).toHaveProperty('notes');
  });

  it('2. All numeric observational fields remain strictly between 0 and 100', async () => {
    const result = await analyzeWasteImage('sample_image.jpg');

    expect(typeof result.severity).toBe('number');
    expect(result.severity).toBeGreaterThanOrEqual(0);
    expect(result.severity).toBeLessThanOrEqual(100);

    expect(typeof result.healthRisk).toBe('number');
    expect(result.healthRisk).toBeGreaterThanOrEqual(0);
    expect(result.healthRisk).toBeLessThanOrEqual(100);

    expect(typeof result.environmentalRisk).toBe('number');
    expect(result.environmentalRisk).toBeGreaterThanOrEqual(0);
    expect(result.environmentalRisk).toBeLessThanOrEqual(100);

    expect(typeof result.obstruction).toBe('number');
    expect(result.obstruction).toBeGreaterThanOrEqual(0);
    expect(result.obstruction).toBeLessThanOrEqual(100);

    expect(typeof result.confidence).toBe('number');
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(100);
  });

  it('3. Missing GEMINI_API_KEY does not crash the service and falls back to mock mode', async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.AI_MODE;

    await expect(analyzeWasteImage('test.jpg')).resolves.toEqual(
      expect.objectContaining({
        wasteType: expect.any(String),
        severity: expect.any(Number),
        confidence: expect.any(Number)
      })
    );
  });

  it('4. Low confidence produces requiresManualVerification = true', async () => {
    const result = await analyzeWasteImage('unclear_blurry_image.jpg');

    expect(result.confidence).toBeLessThan(50);
    expect(result.requiresManualVerification).toBe(true);
  });

  it('5. The service does NOT calculate priorityScore or make resource decisions', async () => {
    const result = await analyzeWasteImage('sample_waste.jpg');

    // Strict boundary enforcement
    expect(result.priorityScore).toBeUndefined();
    expect(result.score).toBeUndefined();
    expect(result.populationExposure).toBeUndefined();
    expect(result.allocatedResources).toBeUndefined();
    expect(result.assignedCrew).toBeUndefined();
    expect(result.assignedVehicle).toBeUndefined();
  });

  it('6. The same mock input produces deterministic output', async () => {
    const run1 = await analyzeWasteImage('test_waste.jpg');
    const run2 = await analyzeWasteImage('test_waste.jpg');

    expect(run1).toEqual(run2);
  });

  it('7. Handles multiple image input formats gracefully (Buffer, data URI, Object)', () => {
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
});