/**
 * mockReports.js
 * Civic intelligence prioritization formulas, duplicate detection, and realistic mock reports for Kopargaon Municipal Council.
 */

export function calculatePriorityScore(report) {
  if (!report) return { score: 50, level: 'MEDIUM', factors: {} };

  // If report already has explicit priorityScore, use it or calculate from factors
  if (typeof report.priorityScore === 'number' && report.aiAssessment?.factors) {
    let level = 'LOW';
    if (report.priorityScore >= 80) level = 'CRITICAL';
    else if (report.priorityScore >= 60) level = 'HIGH';
    else if (report.priorityScore >= 40) level = 'MEDIUM';

    return {
      score: report.priorityScore,
      level: report.priority || level,
      factors: report.aiAssessment.factors
    };
  }

  // 1. Severity Factor (up to 35 points)
  let severityScore = 20;
  const sev = String(report.severity || '').toLowerCase();
  if (sev === 'critical') severityScore = 35;
  else if (sev === 'high') severityScore = 28;
  else if (sev === 'medium') severityScore = 18;
  else if (sev === 'low') severityScore = 10;

  // 2. Public Impact (up to 25 points)
  let publicImpact = 15;
  const area = String(report.location?.area || report.location || '').toLowerCase();
  const desc = String(report.description || '').toLowerCase();
  const indicators = (report.indicators || []).map((i) => String(i).toLowerCase());

  if (
    area.includes('station') ||
    area.includes('market') ||
    area.includes('junction') ||
    area.includes('hospital') ||
    area.includes('depot') ||
    area.includes('naka')
  ) {
    publicImpact += 7;
  }
  if (indicators.some((i) => i.includes('road') || i.includes('public') || i.includes('access') || i.includes('hazard'))) {
    publicImpact += 3;
  }
  publicImpact = Math.min(25, publicImpact);

  // 3. Supporting Reports / Duplicates (up to 20 points)
  const count = report.similarReports || report.supportingReports || (report.supportingReportIds ? report.supportingReportIds.length : 1);
  let supportingScore = Math.min(20, Math.max(5, count * 3));
  if (count >= 7) supportingScore = 20;
  else if (count >= 4) supportingScore = 15;

  // 4. Environmental / Safety Risk (up to 15 points)
  let safetyScore = 8;
  if (
    indicators.some((i) => i.includes('water') || i.includes('canal') || i.includes('river') || i.includes('animal') || i.includes('medical') || i.includes('toxic') || i.includes('electric'))
  ) {
    safetyScore = 14;
  } else if (desc.includes('canal') || desc.includes('hazard') || desc.includes('medical') || desc.includes('smoke') || desc.includes('drain')) {
    safetyScore = 13;
  }
  safetyScore = Math.min(15, safetyScore);

  // 5. Report Age (up to 5 points)
  let ageScore = 5;

  const totalScore = Math.min(100, severityScore + publicImpact + supportingScore + safetyScore + ageScore);

  let level = 'LOW';
  if (totalScore >= 80) level = 'CRITICAL';
  else if (totalScore >= 60) level = 'HIGH';
  else if (totalScore >= 40) level = 'MEDIUM';

  return {
    score: totalScore,
    level,
    factors: {
      severity: Math.min(35, severityScore),
      publicImpact: Math.min(25, publicImpact),
      supportingReports: Math.min(20, supportingScore),
      safetyRisk: Math.min(15, safetyScore),
      reportAge: Math.min(5, ageScore),
      total: totalScore,
      severityPercent: sev === 'critical' ? 95 : sev === 'high' ? 82 : sev === 'medium' ? 60 : 35,
      citizenReportsPercent: count >= 7 ? 82 : count >= 4 ? 68 : 40,
      evidenceConfidencePercent: report.aiConfidence || report.aiAssessment?.confidence || 91,
      timePendingPercent: report.age?.includes('2d') || report.age?.includes('2 days') ? 80 : 70
    }
  };
}

export const INITIAL_MOCK_REPORTS = [
  {
    id: 'KOP-1024',
    reportId: 'KOP-1024',
    aliasId: 'KOP-WST-1042',
    title: 'Waste accumulation',
    issue: 'Waste accumulation — Station Road',
    category: 'Waste',
    wasteType: 'Illegal Dumping',
    severity: 'Critical',
    priority: 'Critical',
    priorityScore: 92,
    location: {
      area: 'Station Road, Kopargaon',
      address: 'Station Road near Godavari Canal Bridge, Kopargaon',
      zone: 'Zone Z01',
      latitude: 19.8845,
      longitude: 74.4682
    },
    description: 'Hazardous municipal solid waste accumulating near Godavari canal access point on Station Road. Refuse is directly blocking water passage and overflowing onto pedestrian sidewalk.',
    similarReports: 7,
    supportingReports: 7,
    supportingReportIds: [
      'KOP-1024',
      'KOP-1031',
      'KOP-1038',
      'KOP-1042',
      'KOP-1051',
      'KOP-1060',
      'KOP-1064'
    ],
    clusterId: 'CLUSTER-STATION-RD',
    clusterName: 'Waste hotspot — Station Road',
    clusterDescription: '7 citizen reports appear to refer to the same civic issue.',
    isClusterMaster: true,
    age: '2 days',
    submittedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    status: 'PENDING',
    assignedTeam: null,
    aiConfidence: 91,
    indicators: ['Waste blocking road/path', 'Attracting animals', 'Near municipal waterway'],
    photos: [
      { name: 'evidence_station_dump_01.jpg', preview: '' },
      { name: 'canal_obstruction_02.jpg', preview: '' }
    ],
    evidence: [
      { name: 'evidence_station_dump_01.jpg', description: 'Canal bridge pile obstruction', time: '2 days ago' },
      { name: 'canal_obstruction_02.jpg', description: 'Pedestrian pavement spillover', time: '1 day ago' }
    ],
    aiAssessment: {
      score: 92,
      level: 'CRITICAL',
      confidence: 91,
      severityLabel: 'High',
      wasteType: 'Mixed municipal waste',
      estimatedUrgency: 'Immediate attention',
      recommendedResponse: 'Immediate municipal inspection recommended. Dispatch high-capacity loader crew within 12 hours.',
      reasoning: [
        'Critical severity score from hazardous organic & plastic accumulation',
        'Direct obstruction of municipal canal waterway drainage',
        'Cluster of 7 independent citizen complaints confirms active dumping hotspot',
        'Public health risk due to animal scavenging near railway transit corridor'
      ],
      factors: {
        severity: 35,
        publicImpact: 24,
        supportingReports: 20,
        safetyRisk: 13,
        reportAge: 5,
        total: 92,
        severityPercent: 95,
        citizenReportsPercent: 82,
        evidenceConfidencePercent: 91,
        timePendingPercent: 80
      }
    }
  },
  {
    id: 'KOP-1038',
    reportId: 'KOP-1038',
    aliasId: 'KOP-WST-1038',
    title: 'Overflowing waste bins',
    issue: 'Overflowing waste bins — Market Area',
    category: 'Waste',
    wasteType: 'Overflowing Bins',
    severity: 'High',
    priority: 'High',
    priorityScore: 81,
    location: {
      area: 'Market Area, Kopargaon',
      address: 'Main Market Yard Road, Kopargaon',
      zone: 'Zone Z02',
      latitude: 19.8821,
      longitude: 74.4655
    },
    description: 'Community dustbins overflowing with mixed organic and commercial market waste near weekly vegetable bazaar. Strong odor causing discomfort to vendors and shoppers.',
    similarReports: 4,
    supportingReports: 4,
    supportingReportIds: ['KOP-1038', 'KOP-1040', 'KOP-1044', 'KOP-1049'],
    age: '1 day',
    submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'UNDER_REVIEW',
    assignedTeam: null,
    aiConfidence: 88,
    indicators: ['Waste blocking road/path', 'Strong smell'],
    photos: [
      { name: 'market_bin_overflow.jpg', preview: '' }
    ],
    evidence: [
      { name: 'market_bin_overflow.jpg', description: 'Commercial dustbin overflow', time: '1 day ago' }
    ],
    aiAssessment: {
      score: 81,
      level: 'HIGH',
      confidence: 88,
      severityLabel: 'High',
      wasteType: 'Commercial market & organic waste',
      estimatedUrgency: 'High priority clearance',
      recommendedResponse: 'Municipal collection truck route priority clearance scheduled within 24 hours.',
      reasoning: [
        'Commercial market waste overflow blocking pedestrian sidewalk',
        'Strong odor and health hazard for daily vegetable vendors',
        '4 citizen complaints registered within 4 hours'
      ],
      factors: {
        severity: 28,
        publicImpact: 23,
        supportingReports: 15,
        safetyRisk: 10,
        reportAge: 5,
        total: 81,
        severityPercent: 80,
        citizenReportsPercent: 78,
        evidenceConfidencePercent: 88,
        timePendingPercent: 75
      }
    }
  },
  {
    id: 'KOP-1031',
    reportId: 'KOP-1031',
    aliasId: 'KOP-WST-1031',
    title: 'Garbage collection delay',
    issue: 'Garbage collection delay — Shirdi Road',
    category: 'Waste',
    wasteType: 'Collection Delay',
    severity: 'Medium',
    priority: 'Medium',
    priorityScore: 64,
    location: {
      area: 'Shirdi Road, Kopargaon',
      address: 'Shirdi Road near Bus Stand Junction, Kopargaon',
      zone: 'Zone Z03',
      latitude: 19.881,
      longitude: 74.4715
    },
    description: 'Door-to-door municipal collection missed for two consecutive rounds, resulting in bin piles outside residential societies.',
    similarReports: 2,
    supportingReports: 2,
    supportingReportIds: ['KOP-1031', 'KOP-1033'],
    age: '18 hours',
    submittedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    status: 'IN_PROGRESS',
    assignedTeam: 'Waste Management Team',
    aiConfidence: 85,
    indicators: ['Near residential area'],
    photos: [
      { name: 'shirdi_road_pile.jpg', preview: '' }
    ],
    evidence: [
      { name: 'shirdi_road_pile.jpg', description: 'Residential door collection missed piles', time: '18h ago' }
    ],
    aiAssessment: {
      score: 64,
      level: 'MEDIUM',
      confidence: 85,
      severityLabel: 'Medium',
      wasteType: 'Household dry & wet waste',
      estimatedUrgency: 'Routine route adjustment',
      recommendedResponse: 'Notify Ward Z03 sanitation supervisor for makeup round routing.',
      reasoning: [
        'Collection vehicle route lapse in residential block',
        'Moderate waste volume contained in bins'
      ],
      factors: {
        severity: 20,
        publicImpact: 18,
        supportingReports: 11,
        safetyRisk: 10,
        reportAge: 5,
        total: 64,
        severityPercent: 62,
        citizenReportsPercent: 55,
        evidenceConfidencePercent: 85,
        timePendingPercent: 60
      }
    }
  },
  {
    id: 'KOP-1045',
    reportId: 'KOP-1045',
    aliasId: 'KOP-WST-1045',
    title: 'Illegal dumping',
    issue: 'Illegal dumping — Bus Stand Area',
    category: 'Waste',
    wasteType: 'Illegal Dumping',
    severity: 'High',
    priority: 'High',
    priorityScore: 86,
    location: {
      area: 'Bus Stand Area, Kopargaon',
      address: 'Near Old MSRTC Bus Terminal, Kopargaon',
      zone: 'Zone Z03',
      latitude: 19.8805,
      longitude: 74.472
    },
    description: 'Unauthorized commercial packaging dumping and beverage containers accumulating behind depot parking shed.',
    similarReports: 3,
    supportingReports: 3,
    supportingReportIds: ['KOP-1045', 'KOP-1046', 'KOP-1048'],
    age: '14 hours',
    submittedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    status: 'PENDING',
    assignedTeam: null,
    aiConfidence: 89,
    indicators: ['Waste blocking road/path', 'Near school/public place'],
    photos: [
      { name: 'bus_stand_dump.jpg', preview: '' }
    ],
    evidence: [
      { name: 'bus_stand_dump.jpg', description: 'Bus stand perimeter commercial dumping', time: '14h ago' }
    ],
    aiAssessment: {
      score: 86,
      level: 'HIGH',
      confidence: 89,
      severityLabel: 'High',
      wasteType: 'Commercial packaging and plastics',
      estimatedUrgency: 'High priority inspection',
      recommendedResponse: 'Dispatch sanitation enforcement team and clear commercial debris.',
      reasoning: [
        'Commercial transit hub footfall exposure',
        'Potential fire hazard from dry packaging cartons'
      ],
      factors: {
        severity: 30,
        publicImpact: 24,
        supportingReports: 14,
        safetyRisk: 13,
        reportAge: 5,
        total: 86,
        severityPercent: 85,
        citizenReportsPercent: 75,
        evidenceConfidencePercent: 89,
        timePendingPercent: 65
      }
    }
  },
  {
    id: 'KOP-1052',
    reportId: 'KOP-1052',
    aliasId: 'KOP-WST-1052',
    title: 'Construction waste',
    issue: 'Construction waste — Main Road',
    category: 'Waste',
    wasteType: 'Construction Waste',
    severity: 'Medium',
    priority: 'Medium',
    priorityScore: 67,
    location: {
      area: 'Main Road, Kopargaon',
      address: 'Main Road opp. Shivaji Statue, Kopargaon',
      zone: 'Zone Z02',
      latitude: 19.8835,
      longitude: 74.464
    },
    description: 'Concrete debris, plaster sacks, and brick rubble left on the road shoulder following shop renovation.',
    similarReports: 1,
    supportingReports: 1,
    supportingReportIds: ['KOP-1052'],
    age: '1 day',
    submittedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    status: 'APPROVED',
    assignedTeam: 'Municipal Inspection Team',
    aiConfidence: 84,
    indicators: ['Waste blocking road/path'],
    photos: [
      { name: 'main_road_rubble.jpg', preview: '' }
    ],
    evidence: [
      { name: 'main_road_rubble.jpg', description: 'Road shoulder renovation rubble', time: '1d ago' }
    ],
    aiAssessment: {
      score: 67,
      level: 'MEDIUM',
      confidence: 84,
      severityLabel: 'Medium',
      wasteType: 'Inert construction & demolition rubble',
      estimatedUrgency: 'Scheduled clearance',
      recommendedResponse: 'Issue municipal notice to property owner and schedule loader truck.',
      reasoning: [
        'Road shoulder obstruction causing traffic constriction',
        'Inert non-hazardous masonry material'
      ],
      factors: {
        severity: 22,
        publicImpact: 20,
        supportingReports: 8,
        safetyRisk: 12,
        reportAge: 5,
        total: 67,
        severityPercent: 65,
        citizenReportsPercent: 45,
        evidenceConfidencePercent: 84,
        timePendingPercent: 72
      }
    }
  },
  {
    id: 'KOP-1060',
    reportId: 'KOP-1060',
    aliasId: 'KOP-WST-1060',
    title: 'Public litter',
    issue: 'Public litter — Temple Area',
    category: 'Public Spaces',
    wasteType: 'Public Litter',
    severity: 'Low',
    priority: 'Low',
    priorityScore: 42,
    location: {
      area: 'Temple Area, Kopargaon',
      address: 'Datta Mandir Ghat Road, Kopargaon',
      zone: 'Zone Z01',
      latitude: 19.8885,
      longitude: 74.4705
    },
    description: 'Flower offerings, dry leaves, and small plastic packets discarded along the temple approach pathway.',
    similarReports: 1,
    supportingReports: 1,
    supportingReportIds: ['KOP-1060'],
    age: '2 days',
    submittedAt: new Date(Date.now() - 3600000 * 52).toISOString(),
    status: 'RESOLVED',
    assignedTeam: 'Sanitation Team',
    aiConfidence: 90,
    indicators: [],
    photos: [
      { name: 'temple_litter.jpg', preview: '' }
    ],
    evidence: [
      { name: 'temple_litter.jpg', description: 'Temple pathway organic dry litter', time: '2d ago' }
    ],
    aiAssessment: {
      score: 42,
      level: 'LOW',
      confidence: 90,
      severityLabel: 'Low',
      wasteType: 'Biodegradable floral & light paper litter',
      estimatedUrgency: 'Daily morning sweep',
      recommendedResponse: 'Swept during routine ghat sanitation round.',
      reasoning: [
        'Low physical obstruction',
        'Mainly biodegradable floral materials'
      ],
      factors: {
        severity: 12,
        publicImpact: 14,
        supportingReports: 5,
        safetyRisk: 6,
        reportAge: 5,
        total: 42,
        severityPercent: 35,
        citizenReportsPercent: 25,
        evidenceConfidencePercent: 90,
        timePendingPercent: 80
      }
    }
  },
  {
    id: 'KOP-1070',
    reportId: 'KOP-1070',
    aliasId: 'KOP-WTR-1070',
    title: 'Pipeline leakage & contaminated puddle',
    issue: 'Water pipeline leakage — Tilak Nagar',
    category: 'Water',
    wasteType: 'Water Supply & Contamination',
    severity: 'High',
    priority: 'High',
    priorityScore: 79,
    location: {
      area: 'Tilak Nagar, Kopargaon',
      address: 'Lane 4 near Municipal Water Tank, Kopargaon',
      zone: 'Zone Z04',
      latitude: 19.878,
      longitude: 74.4625
    },
    description: 'Underground drinking water distribution pipeline burst, causing potable water loss and muddy overflow mixing with open drain.',
    similarReports: 3,
    supportingReports: 3,
    supportingReportIds: ['KOP-1070', 'KOP-1071', 'KOP-1072'],
    age: '10 hours',
    submittedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    status: 'IN_PROGRESS',
    assignedTeam: 'Emergency Response Team',
    aiConfidence: 92,
    indicators: ['Near municipal waterway', 'Near residential area'],
    photos: [
      { name: 'water_leakage_01.jpg', preview: '' }
    ],
    evidence: [
      { name: 'water_leakage_01.jpg', description: 'Pipeline rupture pressure leak', time: '10h ago' }
    ],
    aiAssessment: {
      score: 79,
      level: 'HIGH',
      confidence: 92,
      severityLabel: 'High',
      wasteType: 'Water infrastructure failure',
      estimatedUrgency: 'Urgent hydraulic valve isolation',
      recommendedResponse: 'Dispatch hydraulic pipeline repair crew to isolate valve.',
      reasoning: [
        'Pressurized potable water wastage',
        'Contamination risk with adjacent stormwater drain'
      ],
      factors: {
        severity: 28,
        publicImpact: 22,
        supportingReports: 12,
        safetyRisk: 12,
        reportAge: 5,
        total: 79,
        severityPercent: 82,
        citizenReportsPercent: 70,
        evidenceConfidencePercent: 92,
        timePendingPercent: 55
      }
    }
  },
  {
    id: 'KOP-1075',
    reportId: 'KOP-1075',
    aliasId: 'KOP-LGT-1075',
    title: 'Street lights non-functional along dark lane',
    issue: 'Street lights failure — Rahata Bypass Road',
    category: 'Lighting',
    wasteType: 'Public Lighting Fault',
    severity: 'Medium',
    priority: 'Medium',
    priorityScore: 61,
    location: {
      area: 'Rahata Bypass Road, Kopargaon',
      address: 'Bypass Stretch near Zilla Parishad School, Kopargaon',
      zone: 'Zone Z05',
      latitude: 19.872,
      longitude: 74.455
    },
    description: 'Series of 6 sodium vapour street light poles dark for 3 days, creating safety concerns for nighttime commuters and women pedestrians.',
    similarReports: 2,
    supportingReports: 2,
    supportingReportIds: ['KOP-1075', 'KOP-1076'],
    age: '2 days',
    submittedAt: new Date(Date.now() - 3600000 * 45).toISOString(),
    status: 'PENDING',
    assignedTeam: null,
    aiConfidence: 87,
    indicators: ['Near school/public place'],
    photos: [
      { name: 'dark_street_light.jpg', preview: '' }
    ],
    evidence: [
      { name: 'dark_street_light.jpg', description: 'Failed lighting pole cluster', time: '2d ago' }
    ],
    aiAssessment: {
      score: 61,
      level: 'MEDIUM',
      confidence: 87,
      severityLabel: 'Medium',
      wasteType: 'Electrical civic asset breakdown',
      estimatedUrgency: 'Electrical maintenance',
      recommendedResponse: 'Dispatch municipal electrical linesman for transformer fuse replacement.',
      reasoning: [
        'Darkness along highway feeder road',
        'Pedestrian security concern'
      ],
      factors: {
        severity: 20,
        publicImpact: 18,
        supportingReports: 10,
        safetyRisk: 8,
        reportAge: 5,
        total: 61,
        severityPercent: 60,
        citizenReportsPercent: 50,
        evidenceConfidencePercent: 87,
        timePendingPercent: 78
      }
    }
  },
  {
    id: 'KOP-1082',
    reportId: 'KOP-1082',
    aliasId: 'KOP-RDS-1082',
    title: 'Broken road divider & dangerous pothole cluster',
    issue: 'Road hazard & pothole cluster — Sangamner Naka',
    category: 'Roads',
    wasteType: 'Road Damage & Hazard',
    severity: 'High',
    priority: 'High',
    priorityScore: 83,
    location: {
      area: 'Sangamner Naka, Kopargaon',
      address: 'Sangamner Naka Junction Circle, Kopargaon',
      zone: 'Zone Z01',
      latitude: 19.885,
      longitude: 74.4635
    },
    description: 'Deep asphalt crater measuring 1.5m across on high-speed junction causing two-wheeler skidding risk.',
    similarReports: 4,
    supportingReports: 4,
    supportingReportIds: ['KOP-1082', 'KOP-1083', 'KOP-1084', 'KOP-1085'],
    age: '1 day',
    submittedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    status: 'UNDER_REVIEW',
    assignedTeam: 'Municipal Inspection Team',
    aiConfidence: 93,
    indicators: ['Waste blocking road/path', 'Near school/public place'],
    photos: [
      { name: 'pothole_naka.jpg', preview: '' }
    ],
    evidence: [
      { name: 'pothole_naka.jpg', description: 'Junction asphalt crater', time: '1d ago' }
    ],
    aiAssessment: {
      score: 83,
      level: 'HIGH',
      confidence: 93,
      severityLabel: 'High',
      wasteType: 'Road surface structural damage',
      estimatedUrgency: 'Road safety repair',
      recommendedResponse: 'Deploy cold-mix asphalt patch team and place hazard barricades.',
      reasoning: [
        'Major accident risk at heavy traffic roundabout',
        'Multiple citizen hazard alerts'
      ],
      factors: {
        severity: 28,
        publicImpact: 25,
        supportingReports: 15,
        safetyRisk: 10,
        reportAge: 5,
        total: 83,
        severityPercent: 82,
        citizenReportsPercent: 78,
        evidenceConfidencePercent: 93,
        timePendingPercent: 68
      }
    }
  },
  {
    id: 'KOP-1088',
    reportId: 'KOP-1088',
    aliasId: 'KOP-ANM-1088',
    title: 'Stray cattle & animal carcass near open canal',
    issue: 'Animal carcass near waterway — Godavari Ghat Road',
    category: 'Animals',
    wasteType: 'Animal & Health Hazard',
    severity: 'Critical',
    priority: 'Critical',
    priorityScore: 90,
    location: {
      area: 'Godavari Ghat Road, Kopargaon',
      address: 'Near Old Crematorium Ghat, Kopargaon',
      zone: 'Zone Z01',
      latitude: 19.889,
      longitude: 74.469
    },
    description: 'Deceased stray animal on river bank approach generating severe biological odor and attracting predatory packs.',
    similarReports: 5,
    supportingReports: 5,
    supportingReportIds: ['KOP-1088', 'KOP-1089', 'KOP-1090', 'KOP-1091', 'KOP-1093'],
    age: '8 hours',
    submittedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    status: 'PENDING',
    assignedTeam: null,
    aiConfidence: 94,
    indicators: ['Attracting animals', 'Strong smell', 'Near municipal waterway'],
    photos: [
      { name: 'ghat_hazard.jpg', preview: '' }
    ],
    evidence: [
      { name: 'ghat_hazard.jpg', description: 'Canal perimeter biological risk', time: '8h ago' }
    ],
    aiAssessment: {
      score: 90,
      level: 'CRITICAL',
      confidence: 94,
      severityLabel: 'Critical',
      wasteType: 'Biological contamination risk',
      estimatedUrgency: 'Immediate sanitary burial / disposal',
      recommendedResponse: 'Dispatch sanitation health team with disinfectant and removal unit.',
      reasoning: [
        'Biological pathogen risk near public river steps',
        'High health hazard and intense odor'
      ],
      factors: {
        severity: 35,
        publicImpact: 22,
        supportingReports: 16,
        safetyRisk: 14,
        reportAge: 3,
        total: 90,
        severityPercent: 92,
        citizenReportsPercent: 80,
        evidenceConfidencePercent: 94,
        timePendingPercent: 50
      }
    }
  },
  {
    id: 'KOP-1092',
    reportId: 'KOP-1092',
    aliasId: 'KOP-HZD-1092',
    title: 'Open electrical transformer hazard',
    issue: 'Open transformer door with hanging wire — College Road',
    category: 'Hazards',
    wasteType: 'Electrical Public Hazard',
    severity: 'Critical',
    priority: 'Critical',
    priorityScore: 94,
    location: {
      area: 'College Road, Kopargaon',
      address: 'Near K.J. Somaiya College Gate, Kopargaon',
      zone: 'Zone Z02',
      latitude: 19.883,
      longitude: 74.467
    },
    description: 'Ground-mounted step-down transformer fence broken with open fuse box accessible to passing students and stray animals.',
    similarReports: 6,
    supportingReports: 6,
    supportingReportIds: ['KOP-1092', 'KOP-1094', 'KOP-1095', 'KOP-1096', 'KOP-1097', 'KOP-1098'],
    age: '4 hours',
    submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'ASSIGNED',
    assignedTeam: 'Emergency Response Team',
    aiConfidence: 96,
    indicators: ['Near school/public place', 'Near residential area'],
    photos: [
      { name: 'transformer_open.jpg', preview: '' }
    ],
    evidence: [
      { name: 'transformer_open.jpg', description: 'Unsecured live electrical enclosure', time: '4h ago' }
    ],
    aiAssessment: {
      score: 94,
      level: 'CRITICAL',
      confidence: 96,
      severityLabel: 'Critical',
      wasteType: 'High voltage electrical hazard',
      estimatedUrgency: 'Emergency life safety hazard',
      recommendedResponse: 'Coordinate immediately with MSEDCL electricity board and cordon off area.',
      reasoning: [
        'Direct electrocution risk in student transit zone',
        'Urgent priority 94/100 requiring immediate containment'
      ],
      factors: {
        severity: 35,
        publicImpact: 25,
        supportingReports: 16,
        safetyRisk: 15,
        reportAge: 3,
        total: 94,
        severityPercent: 96,
        citizenReportsPercent: 88,
        evidenceConfidencePercent: 96,
        timePendingPercent: 45
      }
    }
  },
  {
    id: 'KOP-1099',
    reportId: 'KOP-1099',
    aliasId: 'KOP-PUB-1099',
    title: 'Unmaintained public park & damaged bench',
    issue: 'Damaged benches & overgrown weeds — Shivaji Garden',
    category: 'Public Spaces',
    wasteType: 'Public Space Maintenance',
    severity: 'Low',
    priority: 'Low',
    priorityScore: 38,
    location: {
      area: 'Shivaji Garden, Kopargaon',
      address: 'Shivaji Nagar Community Park, Kopargaon',
      zone: 'Zone Z04',
      latitude: 19.876,
      longitude: 74.461
    },
    description: 'Concrete seating bench broken and bushes overgrown along jogging track.',
    similarReports: 1,
    supportingReports: 1,
    supportingReportIds: ['KOP-1099'],
    age: '3 days',
    submittedAt: new Date(Date.now() - 3600000 * 75).toISOString(),
    status: 'RESOLVED',
    assignedTeam: 'Sanitation Team',
    aiConfidence: 86,
    indicators: [],
    photos: [
      { name: 'park_bench.jpg', preview: '' }
    ],
    evidence: [
      { name: 'park_bench.jpg', description: 'Public garden bench fracture', time: '3d ago' }
    ],
    aiAssessment: {
      score: 38,
      level: 'LOW',
      confidence: 86,
      severityLabel: 'Low',
      wasteType: 'Civil park furniture upkeep',
      estimatedUrgency: 'Routine public works maintenance',
      recommendedResponse: 'Scheduled park bench repair during upcoming ward maintenance cycle.',
      reasoning: [
        'Non-hazardous aesthetic wear',
        'No direct pathway obstruction'
      ],
      factors: {
        severity: 10,
        publicImpact: 14,
        supportingReports: 5,
        safetyRisk: 4,
        reportAge: 5,
        total: 38,
        severityPercent: 32,
        citizenReportsPercent: 20,
        evidenceConfidencePercent: 86,
        timePendingPercent: 88
      }
    }
  }
];

export const MOCK_HOTSPOTS = [
  {
    id: 'HOT-1',
    zone: 'Z01 - Godavari Riverside',
    location: 'Station Road Canal Point',
    issue: 'Waste accumulation',
    priority: 'CRITICAL',
    score: 92,
    reportsCount: 7,
    lat: 19.8845,
    lng: 74.4682,
    x: 32,
    y: 28
  },
  {
    id: 'HOT-2',
    zone: 'Z03 - Shirdi Road Corridor',
    location: 'Bus Depot & Shirdi Junction',
    issue: 'Illegal dumping',
    priority: 'HIGH',
    score: 86,
    reportsCount: 5,
    lat: 19.8805,
    lng: 74.472,
    x: 68,
    y: 65
  },
  {
    id: 'HOT-3',
    zone: 'Z02 - Market Yard',
    location: 'Vegetable Market Area',
    issue: 'Overflowing waste bins',
    priority: 'HIGH',
    score: 81,
    reportsCount: 4,
    lat: 19.8821,
    lng: 74.4655,
    x: 45,
    y: 52
  },
  {
    id: 'HOT-4',
    zone: 'Z02 - College Sector',
    location: 'College Road Enclosure',
    issue: 'Electrical transformer hazard',
    priority: 'CRITICAL',
    score: 94,
    reportsCount: 6,
    lat: 19.883,
    lng: 74.467,
    x: 52,
    y: 18
  },
  {
    id: 'HOT-5',
    zone: 'Z04 - Residential South',
    location: 'Shivaji Nagar Garden',
    issue: 'Public park upkeep',
    priority: 'LOW',
    score: 38,
    reportsCount: 1,
    lat: 19.876,
    lng: 74.461,
    x: 25,
    y: 78
  }
];