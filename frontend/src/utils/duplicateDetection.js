/**
 * duplicateDetection.js
 * Deterministic duplicate report detection and clustering utility for Kopargaon Civic Intelligence.
 */

export const DUPLICATE_THRESHOLD = 75;

/**
 * Calculates Haversine distance in meters between two lat/lng coordinates
 */
export function calculateGeoDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Distance in meters
}

const SIMILARITY_KEYWORDS = [
  'garbage', 'dumping', 'dump', 'waste', 'overflowing', 'overflow',
  'trash', 'litter', 'pile', 'rubble', 'debris', 'smell', 'stench',
  'plastic', 'canal', 'river', 'road', 'street', 'drain', 'bin', 'station'
];

/**
 * Calculates keyword similarity score between two descriptions
 */
export function calculateTextOverlap(text1 = '', text2 = '') {
  const t1 = String(text1).toLowerCase();
  const t2 = String(text2).toLowerCase();
  if (!t1 || !t2) return 0;

  let matches = 0;
  SIMILARITY_KEYWORDS.forEach((kw) => {
    if (t1.includes(kw) && t2.includes(kw)) {
      matches++;
    }
  });

  return Math.min(15, matches * 4);
}

/**
 * Evaluates duplicate confidence between two reports
 * Returns { score: number, reasons: string[], distanceMeters: number|null }
 */
export function evaluatePairSimilarity(reportA, reportB) {
  if (reportA.reportId === reportB.reportId) {
    return { score: 100, reasons: ['Identical report'], distanceMeters: 0 };
  }

  let score = 0;
  const reasons = [];

  // 1. Category / Waste Type Similarity (up to 35 pts)
  const catA = (reportA.wasteType || '').toLowerCase().trim();
  const catB = (reportB.wasteType || '').toLowerCase().trim();
  if (catA && catB && catA === catB) {
    score += 35;
    reasons.push(`Same civic category (${reportA.wasteType})`);
  } else if (catA.includes('waste') && catB.includes('waste')) {
    score += 20;
    reasons.push('Related waste management category');
  }

  // 2. Location Proximity (up to 35 pts)
  const dist = calculateGeoDistance(
    reportA.location?.latitude,
    reportA.location?.longitude,
    reportB.location?.latitude,
    reportB.location?.longitude
  );

  const zoneA = reportA.location?.zone || reportA.location?.area || '';
  const zoneB = reportB.location?.zone || reportB.location?.area || '';

  if (dist !== null) {
    if (dist <= 150) {
      score += 35;
      reasons.push(`Close geographic proximity (~${dist}m apart)`);
    } else if (dist <= 450) {
      score += 25;
      reasons.push(`Nearby vicinity (~${dist}m apart)`);
    } else if (dist <= 1000) {
      score += 10;
      reasons.push(`Same local sector (~${dist}m apart)`);
    }
  } else if (zoneA && zoneB && zoneA === zoneB) {
    score += 25;
    reasons.push(`Same municipal ward/zone (${zoneA})`);
  } else if (zoneA && zoneB && (zoneA.includes('Z01') && zoneB.includes('Z01') || zoneA.includes('Z02') && zoneB.includes('Z02'))) {
    score += 20;
    reasons.push('Overlapping municipal zone');
  }

  // 3. Time Proximity (up to 20 pts)
  const timeA = new Date(reportA.submittedAt || reportA.createdAt || 0).getTime();
  const timeB = new Date(reportB.submittedAt || reportB.createdAt || 0).getTime();
  const diffMinutes = Math.abs(timeA - timeB) / (1000 * 60);

  if (diffMinutes <= 60) {
    score += 20;
    reasons.push(`Submitted within ${Math.max(1, Math.round(diffMinutes))} minutes of each other`);
  } else if (diffMinutes <= 360) {
    score += 15;
    reasons.push(`Submitted on the same day (${Math.round(diffMinutes / 60)} hours apart)`);
  } else if (diffMinutes <= 1440) {
    score += 10;
    reasons.push('Submitted within 24 hours');
  }

  // 4. Description Keyword Overlap (up to 15 pts)
  const textScore = calculateTextOverlap(reportA.description, reportB.description);
  if (textScore > 0) {
    score += textScore;
    reasons.push('Matching civic problem keywords in description');
  }

  const finalScore = Math.min(98, Math.max(0, score));

  return {
    score: finalScore,
    reasons,
    distanceMeters: dist
  };
}

/**
 * Analyzes a list of reports and groups possible duplicates into clusters.
 * Takes clusterOverrides (persisted officer decisions from storage).
 */
export function detectDuplicateClusters(reports = [], clusterDecisions = {}) {
  const clusters = [];
  const assignedReportIds = new Set();
  const reportMap = new Map(reports.map((r) => [r.reportId, r]));

  for (let i = 0; i < reports.length; i++) {
    const primary = reports[i];
    if (assignedReportIds.has(primary.reportId)) continue;

    const linked = [];
    let bestScore = 0;
    let aggregateReasons = new Set();

    for (let j = 0; j < reports.length; j++) {
      if (i === j) continue;
      const candidate = reports[j];

      // Check similarity
      const { score, reasons } = evaluatePairSimilarity(primary, candidate);

      // Check explicit linked duplicates property or calculated score threshold
      const explicitlyLinked =
        (primary.linkedDuplicates && primary.linkedDuplicates.includes(candidate.reportId)) ||
        (candidate.linkedDuplicates && candidate.linkedDuplicates.includes(primary.reportId));

      if (score >= DUPLICATE_THRESHOLD || explicitlyLinked) {
        linked.push({
          report: candidate,
          similarityScore: score,
          reasons
        });
        if (score > bestScore) bestScore = score;
        reasons.forEach((r) => aggregateReasons.add(r));
      }
    }

    if (linked.length > 0) {
      const allClusterReports = [primary, ...linked.map((l) => l.report)];
      // Deterministic cluster ID from sorted report IDs
      const sortedIds = allClusterReports.map((r) => r.reportId).sort();
      const clusterId = `CLUSTER-${sortedIds.join('-')}`;

      // Check if officer made a decision on this cluster
      const decision = clusterDecisions[clusterId] || null;
      const status = decision ? decision.status : 'POSSIBLE'; // 'POSSIBLE' | 'CONFIRMED' | 'SEPARATE'

      const clusterObj = {
        clusterId,
        primaryReportId: primary.reportId,
        reportIds: sortedIds,
        reports: allClusterReports,
        confidence: Math.max(bestScore, 88),
        status, // 'POSSIBLE', 'CONFIRMED', 'SEPARATE'
        reasons: Array.from(aggregateReasons),
        commonCategory: primary.wasteType,
        commonZone: primary.location?.zone || primary.location?.area || 'Kopargaon Ward',
        earliestTime: allClusterReports.reduce((min, r) => {
          const t = new Date(r.submittedAt || 0).getTime();
          return t < min ? t : min;
        }, Infinity),
        decisionNote: decision?.note || null,
        decidedAt: decision?.decidedAt || null
      };

      clusters.push(clusterObj);
      allClusterReports.forEach((r) => assignedReportIds.add(r.reportId));
    }
  }

  // Create lookup map of reportId -> cluster
  const reportClusterMap = new Map();
  clusters.forEach((cluster) => {
    cluster.reportIds.forEach((id) => {
      reportClusterMap.set(id, cluster);
    });
  });

  return {
    clusters,
    reportClusterMap
  };
}