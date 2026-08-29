/**
 * priorityEngineService.js
 * Deterministic 6-factor priority and resource allocation engine conforming to docs/PRIORITY_ENGINE.md.
 * 
 * Factors & Weights:
 * 1. Health / Environmental Risk (30%)
 * 2. Population Impact (25%)
 * 3. Waste Severity (20%)
 * 4. Public Obstruction (10%)
 * 5. Urgency / Time Sensitivity (10%)
 * 6. Evidence Confidence (5%)
 */

export function calculateDeterministicPriority(report, zonePopulation = 14500) {
  const ai = report.ai_analysis || report.aiAssessment || {};
  const severity = String(report.severity || ai.visible_severity || 'Medium').toLowerCase();
  const healthRisk = String(ai.health_risk || severity).toLowerCase();
  const envRisk = String(ai.environmental_risk || 'medium').toLowerCase();
  const obstruction = Boolean(ai.public_obstruction || (report.indicators && report.indicators.some(i => i.toLowerCase().includes('road') || i.toLowerCase().includes('path'))));
  const confidence = Number(ai.evidence_confidence || report.aiConfidence || 90) > 1 
    ? Number(ai.evidence_confidence || report.aiConfidence || 90) / 100 
    : Number(ai.evidence_confidence || 0.90);

  // 1. Health / Environmental Risk (Weight 30%, scale 0-10)
  let healthScore = 5;
  if (healthRisk === 'critical') healthScore = 10;
  else if (healthRisk === 'high') healthScore = 8;
  else if (healthRisk === 'medium') healthScore = 5;
  else if (healthRisk === 'low') healthScore = 2;
  else if (healthRisk === 'none') healthScore = 0;

  let envScore = 5;
  if (envRisk === 'critical') envScore = 10;
  else if (envRisk === 'high') envScore = 8;
  else if (envRisk === 'medium') envScore = 5;
  else if (envRisk === 'low') envScore = 2;

  const healthEnvRiskScore = Math.max(healthScore, envScore);

  // 2. Population Impact (Weight 25%, scale 0-10)
  let popScore = 5;
  if (zonePopulation > 12000) popScore = 10;
  else if (zonePopulation >= 8000) popScore = 7;
  else if (zonePopulation >= 5000) popScore = 5;
  else if (zonePopulation >= 2000) popScore = 3;
  else popScore = 1;

  // 3. Waste Severity (Weight 20%, scale 0-10)
  let baseSev = 5;
  if (severity === 'critical') baseSev = 10;
  else if (severity === 'high') baseSev = 8;
  else if (severity === 'medium') baseSev = 5;
  else baseSev = 2;

  const scale = String(ai.estimated_scale || 'medium').toLowerCase();
  let scaleMultiplier = 0.85;
  if (scale === 'massive') scaleMultiplier = 1.15;
  else if (scale === 'large') scaleMultiplier = 1.0;
  else if (scale === 'medium') scaleMultiplier = 0.85;
  else if (scale === 'small') scaleMultiplier = 0.7;

  const wasteSeverityScore = Math.min(10, baseSev * scaleMultiplier);

  // 4. Public Obstruction (Weight 10%, scale 0-10)
  const obstructionScore = obstruction ? 10 : 0;

  // 5. Urgency / Time Sensitivity (Weight 10%, scale 0-10)
  const submittedDate = new Date(report.submitted_at || report.submittedAt || Date.now());
  const hoursPending = Math.max(1, Math.round((Date.now() - submittedDate.getTime()) / 3600000));
  let urgencyScore = 5;
  if (hoursPending > 48) urgencyScore = 10;
  else if (hoursPending >= 24) urgencyScore = 7;
  else if (hoursPending >= 12) urgencyScore = 5;
  else if (hoursPending >= 6) urgencyScore = 3;
  else urgencyScore = 1;

  // 6. Evidence Confidence (Weight 5%, scale 0-10)
  const confidenceScore = confidence * 10;

  // Total 10-scale score
  const totalTenScale = (
    healthEnvRiskScore * 0.30 +
    popScore * 0.25 +
    wasteSeverityScore * 0.20 +
    obstructionScore * 0.10 +
    urgencyScore * 0.10 +
    confidenceScore * 0.05
  );

  // Normalize to 100-scale
  const totalHundredScale = Math.min(100, Math.max(10, Math.round(totalTenScale * 10)));

  let level = 'LOW';
  if (totalHundredScale >= 80) level = 'CRITICAL';
  else if (totalHundredScale >= 60) level = 'HIGH';
  else if (totalHundredScale >= 40) level = 'MEDIUM';

  const similarCount = report.similarReports || report.supportingReports || 1;

  return {
    score: totalHundredScale,
    tenScaleScore: Number(totalTenScale.toFixed(2)),
    level,
    breakdown: {
      health_risk_score: Number(healthEnvRiskScore.toFixed(1)),
      population_score: Number(popScore.toFixed(1)),
      waste_severity_score: Number(wasteSeverityScore.toFixed(1)),
      obstruction_score: Number(obstructionScore.toFixed(1)),
      urgency_score: Number(urgencyScore.toFixed(1)),
      confidence_score: Number(confidenceScore.toFixed(1))
    },
    factors: {
      severity: Math.round(wasteSeverityScore * 3.5),
      publicImpact: Math.round(popScore * 2.5),
      supportingReports: Math.min(20, similarCount * 3),
      safetyRisk: Math.round(healthEnvRiskScore * 1.5),
      reportAge: Math.round(urgencyScore * 0.5),
      total: totalHundredScale,
      severityPercent: Math.round(wasteSeverityScore * 10),
      citizenReportsPercent: similarCount >= 7 ? 92 : similarCount >= 4 ? 80 : 50,
      evidenceConfidencePercent: Math.round(confidence * 100),
      timePendingPercent: Math.min(100, Math.round(urgencyScore * 10))
    },
    explainableFactors: [
      { name: 'Health & Environmental Risk', score: Math.round(healthEnvRiskScore * 10), weight: 30, contribution: Number((healthEnvRiskScore * 3.0).toFixed(1)) },
      { name: 'Zone Population Impact', score: Math.round(popScore * 10), weight: 25, contribution: Number((popScore * 2.5).toFixed(1)) },
      { name: 'Visible Waste Severity', score: Math.round(wasteSeverityScore * 10), weight: 20, contribution: Number((wasteSeverityScore * 2.0).toFixed(1)) },
      { name: 'Public Pathway Obstruction', score: obstruction ? 100 : 0, weight: 10, contribution: Number((obstructionScore * 1.0).toFixed(1)) },
      { name: 'Urgency / Pending Age', score: Math.round(urgencyScore * 10), weight: 10, contribution: Number((urgencyScore * 1.0).toFixed(1)) },
      { name: 'AI Evidence Confidence', score: Math.round(confidence * 100), weight: 5, contribution: Number((confidenceScore * 0.5).toFixed(1)) }
    ],
    whySummary: totalHundredScale >= 80
      ? 'High priority because the report indicates significant health & environmental risk, multiple nearby citizen alerts, and road/pathway obstruction.'
      : totalHundredScale >= 60
      ? 'Elevated priority due to public visibility and commercial area proximity requiring scheduled 24-48h clearance.'
      : 'Standard priority for routine municipal sanitation round maintenance.',
    recommendedResponse: totalHundredScale >= 80
      ? 'Immediate municipal inspection recommended. Dispatch high-capacity loader crew within 12 hours.'
      : totalHundredScale >= 60
      ? 'Municipal priority collection & clearance scheduled within 24-48 hours.'
      : 'Scheduled routine municipal route sweep and container maintenance.'
  };
}

export function allocateResources(reports, resourceState) {
  const sorted = [...reports].sort((a, b) => (b.priorityScore || 50) - (a.priorityScore || 50));
  const selected = [];
  const deferred = [];

  let workersLeft = resourceState?.workers_available || 14;
  let budgetLeft = resourceState?.budget_remaining_inr || 45000;

  for (const r of sorted) {
    const isCritical = (r.priorityScore || 50) >= 80;
    const workersNeeded = isCritical ? 6 : 3;
    const costNeeded = isCritical ? 3000 : 1200;

    if (workersLeft >= workersNeeded && budgetLeft >= costNeeded) {
      workersLeft -= workersNeeded;
      budgetLeft -= costNeeded;
      selected.push({
        report_id: r.report_id || r.id,
        priority_score: r.priorityScore || 50,
        allocated_resources: {
          vehicle: isCritical ? 'large_truck' : 'small_truck',
          workers: workersNeeded,
          estimated_hours: isCritical ? 4 : 2,
          estimated_cost_inr: costNeeded
        }
      });
    } else {
      deferred.push({
        report_id: r.report_id || r.id,
        priority_score: r.priorityScore || 50,
        deferral_reason: workersLeft < workersNeeded ? 'INSUFFICIENT_WORKERS' : 'BUDGET_EXCEEDED',
        deferral_reason_detail: 'Allocated to higher-priority civic issues in current shift.'
      });
    }
  }

  return {
    engine_version: '1.0',
    generated_at: new Date(),
    selected_reports: selected,
    deferred_reports: deferred,
    total_cost_estimate_inr: (resourceState?.budget_remaining_inr || 45000) - budgetLeft,
    total_time_estimate_hours: 8
  };
}
