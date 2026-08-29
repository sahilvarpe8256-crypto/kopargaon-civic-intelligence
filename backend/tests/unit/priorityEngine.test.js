const PriorityEngine = require('../../src/services/priorityEngine');
const { PRIORITY_WEIGHTS } = require('../../src/config/constants');

describe('Deterministic Priority Engine Unit Tests', () => {
  it('calculates deterministic priority score with accurate weightings', () => {
    // Formula: (Severity * 0.30) + (Pop. Exp * 0.25) + (Health * 0.20) + (Env * 0.15) + (Obstruction * 0.10)
    const factors = {
      severity: 80,                       // 80 * 0.30 = 24.0
      estimatedPopulationExposure: 90,    // 90 * 0.25 = 22.5
      healthRisk: 70,                     // 70 * 0.20 = 14.0
      environmentalRisk: 60,              // 60 * 0.15 = 9.0
      obstruction: 50                     // 50 * 0.10 = 5.0
    };                                    // Total = 74.5

    const { priorityScore, priorityReasons } = PriorityEngine.calculatePriority(factors);

    expect(priorityScore).toBe(74.5);
    expect(priorityReasons.severityContribution).toBe(24);
    expect(priorityReasons.exposureContribution).toBe(22.5);
    expect(priorityReasons.healthRiskContribution).toBe(14);
    expect(priorityReasons.environmentalContribution).toBe(9);
    expect(priorityReasons.obstructionContribution).toBe(5);
  });

  it('clamps all input factors strictly between 0 and 100', () => {
    const overflowFactors = {
      severity: 150,
      estimatedPopulationExposure: 200,
      healthRisk: 120,
      environmentalRisk: 500,
      obstruction: 999
    };

    const { priorityScore } = PriorityEngine.calculatePriority(overflowFactors);
    expect(priorityScore).toBe(100);

    const negativeFactors = {
      severity: -50,
      estimatedPopulationExposure: -20,
      healthRisk: -10,
      environmentalRisk: -100,
      obstruction: -5
    };

    const { priorityScore: minScore } = PriorityEngine.calculatePriority(negativeFactors);
    expect(minScore).toBe(0);
  });

  it('handles missing or non-numeric inputs gracefully with default 0s', () => {
    const { priorityScore, priorityReasons } = PriorityEngine.calculatePriority({});
    expect(priorityScore).toBe(0);
    expect(priorityReasons).toBeDefined();
    expect(typeof priorityReasons.summary).toBe('string');
  });

  it('generates an explainable summary highlighting dominant risk factors', () => {
    const criticalReport = {
      severity: 95,
      estimatedPopulationExposure: 90,
      healthRisk: 85,
      environmentalRisk: 40,
      obstruction: 30
    };

    const { priorityReasons } = PriorityEngine.calculatePriority(criticalReport);
    expect(priorityReasons.summary).toContain('High Severity');
    expect(priorityReasons.summary).toContain('Heavy Population Exposure');
    expect(priorityReasons.summary).toContain('Critical Health Hazard');
  });
});