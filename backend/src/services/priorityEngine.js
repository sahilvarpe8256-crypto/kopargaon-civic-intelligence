const { PRIORITY_WEIGHTS } = require('../config/constants');

/**
 * Deterministic Priority Engine for Kopargaon Civic Intelligence Platform
 * 
 * Formula:
 * Priority Score = (Severity * 0.30) + (Population Exposure * 0.25) +
 *                  (Health Risk * 0.20) + (Environmental Risk * 0.15) +
 *                  (Obstruction * 0.10)
 * 
 * All inputs must be normalized to 0 - 100.
 * Gemini AI does NOT dictate or modify these weights or scores.
 */
class PriorityEngine {
  /**
   * Clamp a value strictly between min and max (default 0 to 100)
   * @param {number} val 
   * @param {number} min 
   * @param {number} max 
   * @returns {number}
   */
  static clamp(val, min = 0, max = 100) {
    if (typeof val !== 'number' || isNaN(val)) return min;
    return Math.max(min, Math.min(max, val));
  }

  /**
   * Calculate deterministic priority score and explainable reasons
   * @param {Object} factors
   * @param {number} factors.severity - 0 to 100
   * @param {number} factors.estimatedPopulationExposure - 0 to 100
   * @param {number} factors.healthRisk - 0 to 100
   * @param {number} factors.environmentalRisk - 0 to 100
   * @param {number} factors.obstruction - 0 to 100
   * @returns {{ priorityScore: number, priorityReasons: Object }}
   */
  static calculatePriority(factors = {}) {
    const severity = this.clamp(factors.severity, 0, 100);
    const exposure = this.clamp(factors.estimatedPopulationExposure, 0, 100);
    const healthRisk = this.clamp(factors.healthRisk, 0, 100);
    const envRisk = this.clamp(factors.environmentalRisk, 0, 100);
    const obstruction = this.clamp(factors.obstruction, 0, 100);

    const severityContribution = parseFloat((severity * PRIORITY_WEIGHTS.SEVERITY).toFixed(2));
    const exposureContribution = parseFloat((exposure * PRIORITY_WEIGHTS.POPULATION_EXPOSURE).toFixed(2));
    const healthRiskContribution = parseFloat((healthRisk * PRIORITY_WEIGHTS.HEALTH_RISK).toFixed(2));
    const environmentalContribution = parseFloat((envRisk * PRIORITY_WEIGHTS.ENVIRONMENTAL_RISK).toFixed(2));
    const obstructionContribution = parseFloat((obstruction * PRIORITY_WEIGHTS.OBSTRUCTION).toFixed(2));

    const rawTotal = severityContribution + exposureContribution + healthRiskContribution + environmentalContribution + obstructionContribution;
    const priorityScore = parseFloat(rawTotal.toFixed(2));

    // Construct an explainable human-readable summary for municipal officers
    const topFactors = [];
    if (severity >= 70) topFactors.push(`High Severity (${severity}/100)`);
    if (exposure >= 70) topFactors.push(`Heavy Population Exposure (${exposure}/100)`);
    if (healthRisk >= 70) topFactors.push(`Critical Health Hazard (${healthRisk}/100)`);
    if (envRisk >= 70) topFactors.push(`Severe Environmental Risk (${envRisk}/100)`);
    if (obstruction >= 70) topFactors.push(`Major Road/Drainage Obstruction (${obstruction}/100)`);

    const summary = topFactors.length > 0
      ? `Priority driven by ${topFactors.join(', ')}.`
      : `Moderate priority report across standard civic parameters.`;

    return {
      priorityScore,
      priorityReasons: {
        severityContribution,
        exposureContribution,
        healthRiskContribution,
        environmentalContribution,
        obstructionContribution,
        summary
      }
    };
  }
}

module.exports = PriorityEngine;