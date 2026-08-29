const logger = require('../utils/logger');

/**
 * AI Analysis Service Abstraction
 * 
 * CRITICAL RULE:
 * AI provides observational evidence only. It NEVER computes the final priority score
 * or makes municipal resource allocation decisions.
 * 
 * Supports AI_MODE=mock for local dev and unit tests, and serves as a clean interface
 * for the AI teammate working on feature/ai-analysis.
 */
class AIService {
  /**
   * Analyze uploaded waste image and return structured visual observations
   * @param {Object} params
   * @param {string|Buffer} params.image - Image path or buffer
   * @param {string} [params.mimetype] - Image mime type
   * @param {string} [params.description] - Optional citizen description
   * @returns {Promise<Object>} Structured observations
   */
  static async analyzeWasteImage({ image, mimetype, description = '' }) {
    const mode = process.env.AI_MODE || (process.env.GEMINI_API_KEY ? 'live' : 'mock');

    if (mode === 'live' && process.env.GEMINI_API_KEY) {
      return await this._callGeminiLive({ image, mimetype, description });
    }

    return this._mockAnalysis({ description });
  }

  /**
   * Deterministic mock observation generator for reliable testing & offline dev
   */
  static _mockAnalysis({ description = '' }) {
    const text = description.toLowerCase();

    let wasteType = 'mixed_solid_waste';
    let severity = 65;
    let healthRisk = 60;
    let environmentalRisk = 55;
    let obstruction = 40;
    let confidence = 0.88;
    const detectedElements = ['discarded packaging', 'solid refuse'];

    if (text.includes('hospital') || text.includes('medical') || text.includes('chemical') || text.includes('toxic')) {
      wasteType = 'hazardous_waste';
      severity = 90;
      healthRisk = 95;
      environmentalRisk = 85;
      obstruction = 50;
      confidence = 0.94;
      detectedElements.push('biohazard bags', 'chemical residue');
    } else if (text.includes('drain') || text.includes('gutter') || text.includes('sewage') || text.includes('water')) {
      wasteType = 'liquid_and_organic';
      severity = 80;
      healthRisk = 85;
      environmentalRisk = 90;
      obstruction = 85;
      confidence = 0.91;
      detectedElements.push('sludge', 'drainage blockage');
    } else if (text.includes('market') || text.includes('bazaar') || text.includes('food') || text.includes('vegetable')) {
      wasteType = 'organic_and_market_waste';
      severity = 75;
      healthRisk = 70;
      environmentalRisk = 65;
      obstruction = 75;
      confidence = 0.89;
      detectedElements.push('rotting organic matter', 'plastic crates');
    } else if (text.includes('road') || text.includes('footpath') || text.includes('block')) {
      obstruction = 90;
      severity = 70;
      detectedElements.push('roadway encroachment');
    }

    return {
      wasteType,
      severity,
      healthRisk,
      environmentalRisk,
      obstruction,
      confidence,
      detectedElements,
      requiresManualVerification: confidence < 0.5,
      notes: `Visual evidence assessed via mock vision provider: ${detectedElements.join(', ')}.`
    };
  }

  /**
   * Live Gemini API integration point (to be extended by AI teammate on feature/ai-analysis)
   */
  static async _callGeminiLive({ image, mimetype, description }) {
    try {
      // In live mode with @google/genai installed, AI teammate connects Gemini Vision prompt here.
      // Fallback to structured mock if external network fails or key is invalid
      logger.info('Calling Gemini Vision API for waste evidence assessment...');
      return this._mockAnalysis({ description });
    } catch (err) {
      logger.error('Gemini API call failed, falling back to safe observation:', err.message);
      return {
        wasteType: 'unclassified_waste',
        severity: 50,
        healthRisk: 50,
        environmentalRisk: 50,
        obstruction: 50,
        confidence: 0.40,
        detectedElements: ['unverified visual content'],
        requiresManualVerification: true,
        notes: 'AI inspection incomplete. Routed to manual officer verification.'
      };
    }
  }
}

module.exports = AIService;