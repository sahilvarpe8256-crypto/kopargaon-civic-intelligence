/**
 * mockAiService.js
 * Deterministic evidence scoring and AI assessment simulator for Kopargaon Civic Waste Intelligence.
 */

export async function simulateAiAssessment(reportData) {
  // Simulate asynchronous AI vision processing delay (1.2s for responsive UX)
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const { severity = 'Medium', indicators = [], photos = [] } = reportData;

  // 1. Base Score calculation by severity
  let baseScore = 40;
  switch (severity) {
    case 'Low':
      baseScore = 20;
      break;
    case 'Medium':
      baseScore = 40;
      break;
    case 'High':
      baseScore = 65;
      break;
    case 'Critical':
      baseScore = 85;
      break;
    default:
      baseScore = 40;
  }

  // 2. Indicator weights
  let bonus = 0;
  const reasoning = [];

  if (severity === 'High' || severity === 'Critical') {
    reasoning.push(`High reported severity (${severity})`);
  }

  if (indicators.includes('Waste blocking road/path')) {
    bonus += 5;
    reasoning.push('Waste obstructing public access or transport route');
  }
  if (indicators.includes('Strong smell')) {
    bonus += 5;
    reasoning.push('Decomposition odor indicating organic fermentation');
  }
  if (indicators.includes('Attracting animals')) {
    bonus += 5;
    reasoning.push('Active animal scavenging posing vector-borne disease risk');
  }
  if (indicators.includes('Near residential area')) {
    bonus += 5;
    reasoning.push('Direct proximity to residential settlement');
  }
  if (indicators.includes('Near school/public place')) {
    bonus += 10;
    reasoning.push('High vulnerability zone (school / public assembly area)');
  }
  if (indicators.includes('Burning/smoke visible')) {
    bonus += 10;
    reasoning.push('Active combustion creating immediate air quality and fire hazard');
  }

  // 3. Photo evidence multiplier
  if (photos && photos.length >= 2) {
    bonus += 5;
    reasoning.push(`Multiple verified visual angles submitted (${photos.length} photos)`);
  } else if (photos && photos.length === 1) {
    reasoning.push('Single visual evidence angle provided');
  }

  // Total Score capped at 100
  const score = Math.min(100, Math.max(15, baseScore + bonus));

  // 4. Priority Classification
  let level = 'MEDIUM';
  let recommendedResponse = 'Municipal truck dispatch within 48 hours';

  if (score >= 80) {
    level = 'CRITICAL';
    recommendedResponse = 'Urgent municipal dispatch required within 12-24 hours';
  } else if (score >= 60) {
    level = 'HIGH';
    recommendedResponse = 'Municipal priority inspection & clearance within 24-48 hours';
  } else if (score >= 30) {
    level = 'MEDIUM';
    recommendedResponse = 'Scheduled routine municipal route clearance within 3-5 days';
  } else {
    level = 'LOW';
    recommendedResponse = 'Standard scheduled sanitation route collection';
  }

  // 5. Confidence calculation
  const confidence = Math.min(94, 75 + (photos.length * 6) + (indicators.length * 2));

  // 6. Nearby Duplicate Simulation
  const nearbyDuplicates = [
    {
      reportId: 'WI-2026-1042',
      issueType: reportData.wasteType || 'Illegal Dumping',
      distance: '120m away',
      reportedAgo: '35 minutes ago',
      matchProbability: '88% match'
    },
    {
      reportId: 'WI-2026-1039',
      issueType: 'Mixed Solid Waste',
      distance: '180m away',
      reportedAgo: '1 hour ago',
      matchProbability: '74% match'
    }
  ];

  return {
    score,
    level,
    confidence,
    recommendedResponse,
    reasoning,
    nearbyDuplicates,
    analyzedAt: new Date().toISOString()
  };
}

export function generateReportId() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `KOP-WI-${dateStr}-${randNum}`;
}