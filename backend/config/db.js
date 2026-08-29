import mongoose from 'mongoose';
import User from '../models/User.js';
import WasteReport from '../models/WasteReport.js';
import Zone from '../models/Zone.js';
import ResourceState from '../models/ResourceState.js';

export const INITIAL_ZONES = [
  { zone_id: 'Z01', zone_name: 'Zone Z01 - Godavari Riverside & Station Road', population: 14500 },
  { zone_id: 'Z02', zone_name: 'Zone Z02 - Market Yard & College Road', population: 18200 },
  { zone_id: 'Z03', zone_name: 'Zone Z03 - Bus Stand & Shirdi Road Corridor', population: 12400 },
  { zone_id: 'Z04', zone_name: 'Zone Z04 - Residential South & Tilak Nagar', population: 16800 },
  { zone_id: 'Z05', zone_name: 'Zone Z05 - Ahmednagar & Rahata Bypass', population: 9200 }
];

export const SEED_REPORTS = [
  {
    report_id: 'KOP-1024',
    id: 'KOP-1024',
    alias_id: 'KOP-WST-1042',
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
      longitude: 74.4682,
      isGps: true
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
    status: 'PENDING',
    assignedTeam: null,
    aiConfidence: 91,
    indicators: ['Waste blocking road/path', 'Attracting animals', 'Near municipal waterway'],
    photos: [
      { name: 'evidence_station_dump_01.jpg', size: 102400 },
      { name: 'canal_obstruction_02.jpg', size: 145000 }
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
    },
    submitted_at: new Date(Date.now() - 3600000 * 48),
    submittedAt: new Date(Date.now() - 3600000 * 48)
  },
  {
    report_id: 'KOP-1038',
    id: 'KOP-1038',
    alias_id: 'KOP-WST-1038',
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
      longitude: 74.4655,
      isGps: true
    },
    description: 'Community dustbins overflowing with mixed organic and commercial market waste near weekly vegetable bazaar. Strong odor causing discomfort to vendors and shoppers.',
    similarReports: 4,
    supportingReports: 4,
    supportingReportIds: ['KOP-1038', 'KOP-1040', 'KOP-1044', 'KOP-1049'],
    age: '1 day',
    status: 'UNDER_REVIEW',
    assignedTeam: null,
    aiConfidence: 88,
    indicators: ['Waste blocking road/path', 'Strong smell'],
    photos: [
      { name: 'market_bin_overflow.jpg', size: 98000 }
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
    },
    submitted_at: new Date(Date.now() - 3600000 * 24),
    submittedAt: new Date(Date.now() - 3600000 * 24)
  },
  {
    report_id: 'KOP-1031',
    id: 'KOP-1031',
    alias_id: 'KOP-WST-1031',
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
      longitude: 74.4715,
      isGps: true
    },
    description: 'Door-to-door municipal collection missed for two consecutive rounds, resulting in bin piles outside residential societies.',
    similarReports: 2,
    supportingReports: 2,
    supportingReportIds: ['KOP-1031', 'KOP-1033'],
    age: '18 hours',
    status: 'IN_PROGRESS',
    assignedTeam: 'Waste Management Team',
    aiConfidence: 85,
    indicators: ['Near residential area'],
    photos: [
      { name: 'shirdi_road_pile.jpg', size: 112000 }
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
    },
    submitted_at: new Date(Date.now() - 3600000 * 18),
    submittedAt: new Date(Date.now() - 3600000 * 18)
  },
  {
    report_id: 'KOP-1045',
    id: 'KOP-1045',
    alias_id: 'KOP-WST-1045',
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
      longitude: 74.472,
      isGps: true
    },
    description: 'Unauthorized commercial packaging dumping and beverage containers accumulating behind depot parking shed.',
    similarReports: 3,
    supportingReports: 3,
    supportingReportIds: ['KOP-1045', 'KOP-1046', 'KOP-1048'],
    age: '14 hours',
    status: 'PENDING',
    assignedTeam: null,
    aiConfidence: 89,
    indicators: ['Waste blocking road/path', 'Near school/public place'],
    photos: [
      { name: 'bus_stand_dump.jpg', size: 120000 }
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
    },
    submitted_at: new Date(Date.now() - 3600000 * 14),
    submittedAt: new Date(Date.now() - 3600000 * 14)
  },
  {
    report_id: 'KOP-1052',
    id: 'KOP-1052',
    alias_id: 'KOP-WST-1052',
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
      longitude: 74.464,
      isGps: true
    },
    description: 'Concrete debris, plaster sacks, and brick rubble left on the road shoulder following shop renovation.',
    similarReports: 1,
    supportingReports: 1,
    supportingReportIds: ['KOP-1052'],
    age: '1 day',
    status: 'APPROVED',
    assignedTeam: 'Municipal Inspection Team',
    aiConfidence: 84,
    indicators: ['Waste blocking road/path'],
    photos: [
      { name: 'main_road_rubble.jpg', size: 108000 }
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
    },
    submitted_at: new Date(Date.now() - 3600000 * 28),
    submittedAt: new Date(Date.now() - 3600000 * 28)
  },
  {
    report_id: 'KOP-1060',
    id: 'KOP-1060',
    alias_id: 'KOP-WST-1060',
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
      longitude: 74.4705,
      isGps: true
    },
    description: 'Flower offerings, dry leaves, and small plastic packets discarded along the temple approach pathway.',
    similarReports: 1,
    supportingReports: 1,
    supportingReportIds: ['KOP-1060'],
    age: '2 days',
    status: 'RESOLVED',
    assignedTeam: 'Sanitation Team',
    aiConfidence: 90,
    indicators: [],
    photos: [
      { name: 'temple_litter.jpg', size: 92000 }
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
    },
    submitted_at: new Date(Date.now() - 3600000 * 52),
    submittedAt: new Date(Date.now() - 3600000 * 52)
  },
  {
    report_id: 'KOP-1070',
    id: 'KOP-1070',
    alias_id: 'KOP-WTR-1070',
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
      longitude: 74.4625,
      isGps: true
    },
    description: 'Underground drinking water distribution pipeline burst, causing potable water loss and muddy overflow mixing with open drain.',
    similarReports: 3,
    supportingReports: 3,
    supportingReportIds: ['KOP-1070', 'KOP-1071', 'KOP-1072'],
    age: '10 hours',
    status: 'IN_PROGRESS',
    assignedTeam: 'Emergency Response Team',
    aiConfidence: 92,
    indicators: ['Near municipal waterway', 'Near residential area'],
    photos: [
      { name: 'water_leakage_01.jpg', size: 135000 }
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
    },
    submitted_at: new Date(Date.now() - 3600000 * 10),
    submittedAt: new Date(Date.now() - 3600000 * 10)
  },
  {
    report_id: 'KOP-1075',
    id: 'KOP-1075',
    alias_id: 'KOP-LGT-1075',
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
      longitude: 74.455,
      isGps: true
    },
    description: 'Series of 6 sodium vapour street light poles dark for 3 days, creating safety concerns for nighttime commuters and women pedestrians.',
    similarReports: 2,
    supportingReports: 2,
    supportingReportIds: ['KOP-1075', 'KOP-1076'],
    age: '2 days',
    status: 'PENDING',
    assignedTeam: null,
    aiConfidence: 87,
    indicators: ['Near school/public place'],
    photos: [
      { name: 'dark_street_light.jpg', size: 104000 }
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
    },
    submitted_at: new Date(Date.now() - 3600000 * 45),
    submittedAt: new Date(Date.now() - 3600000 * 45)
  },
  {
    report_id: 'KOP-1082',
    id: 'KOP-1082',
    alias_id: 'KOP-RDS-1082',
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
      longitude: 74.4635,
      isGps: true
    },
    description: 'Deep asphalt crater measuring 1.5m across on high-speed junction causing two-wheeler skidding risk.',
    similarReports: 4,
    supportingReports: 4,
    supportingReportIds: ['KOP-1082', 'KOP-1083', 'KOP-1084', 'KOP-1085'],
    age: '1 day',
    status: 'UNDER_REVIEW',
    assignedTeam: 'Municipal Inspection Team',
    aiConfidence: 93,
    indicators: ['Waste blocking road/path', 'Near school/public place'],
    photos: [
      { name: 'pothole_naka.jpg', size: 140000 }
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
    },
    submitted_at: new Date(Date.now() - 3600000 * 20),
    submittedAt: new Date(Date.now() - 3600000 * 20)
  },
  {
    report_id: 'KOP-1088',
    id: 'KOP-1088',
    alias_id: 'KOP-ANM-1088',
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
      longitude: 74.469,
      isGps: true
    },
    description: 'Deceased stray animal on river bank approach generating severe biological odor and attracting predatory packs.',
    similarReports: 5,
    supportingReports: 5,
    supportingReportIds: ['KOP-1088', 'KOP-1089', 'KOP-1090', 'KOP-1091', 'KOP-1093'],
    age: '8 hours',
    status: 'PENDING',
    assignedTeam: null,
    aiConfidence: 94,
    indicators: ['Attracting animals', 'Strong smell', 'Near municipal waterway'],
    photos: [
      { name: 'ghat_hazard.jpg', size: 125000 }
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
    },
    submitted_at: new Date(Date.now() - 3600000 * 8),
    submittedAt: new Date(Date.now() - 3600000 * 8)
  },
  {
    report_id: 'KOP-1092',
    id: 'KOP-1092',
    alias_id: 'KOP-HZD-1092',
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
      longitude: 74.467,
      isGps: true
    },
    description: 'Ground-mounted step-down transformer fence broken with open fuse box accessible to passing students and stray animals.',
    similarReports: 6,
    supportingReports: 6,
    supportingReportIds: ['KOP-1092', 'KOP-1094', 'KOP-1095', 'KOP-1096', 'KOP-1097', 'KOP-1098'],
    age: '4 hours',
    status: 'ASSIGNED',
    assignedTeam: 'Emergency Response Team',
    aiConfidence: 96,
    indicators: ['Near school/public place', 'Near residential area'],
    photos: [
      { name: 'transformer_open.jpg', size: 156000 }
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
    },
    submitted_at: new Date(Date.now() - 3600000 * 4),
    submittedAt: new Date(Date.now() - 3600000 * 4)
  },
  {
    report_id: 'KOP-1099',
    id: 'KOP-1099',
    alias_id: 'KOP-PUB-1099',
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
      longitude: 74.461,
      isGps: true
    },
    description: 'Concrete seating bench broken and bushes overgrown along jogging track.',
    similarReports: 1,
    supportingReports: 1,
    supportingReportIds: ['KOP-1099'],
    age: '3 days',
    status: 'RESOLVED',
    assignedTeam: 'Sanitation Team',
    aiConfidence: 86,
    indicators: [],
    photos: [
      { name: 'park_bench.jpg', size: 88000 }
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
    },
    submitted_at: new Date(Date.now() - 3600000 * 75),
    submittedAt: new Date(Date.now() - 3600000 * 75)
  }
];

export async function seedDatabase() {
  try {
    // 1. Seed Users if not present
    const officerExists = await User.findOne({ email: 'officer.kopargaon@gov.in' });
    if (!officerExists) {
      const officerHash = await User.hashPassword('demo-municipal-2026');
      await User.create({
        name: 'Municipal Operations Officer',
        email: 'officer.kopargaon@gov.in',
        phone: '9822012345',
        role: 'officer',
        password_hash: officerHash,
        department: 'Sanitation & Operations'
      });
      console.log('âœ… Seeded default Municipal Officer: officer.kopargaon@gov.in');
    }

    const citizenExists = await User.findOne({ email: 'citizen@kopargaon.gov.in' });
    if (!citizenExists) {
      const citizenHash = await User.hashPassword('citizen123');
      await User.create({
        name: 'Kopargaon Citizen',
        email: 'citizen@kopargaon.gov.in',
        phone: '9822098765',
        role: 'citizen',
        password_hash: citizenHash
      });
      console.log('âœ… Seeded default Citizen: citizen@kopargaon.gov.in');
    }

    // 2. Seed Zones
    const zoneCount = await Zone.countDocuments();
    if (zoneCount === 0) {
      await Zone.insertMany(INITIAL_ZONES);
      console.log('âœ… Seeded 5 Kopargaon municipal zones (Z01-Z05)');
    }

    // 3. Seed Reports
    const reportCount = await WasteReport.countDocuments();
    if (reportCount === 0) {
      await WasteReport.insertMany(SEED_REPORTS);
      console.log(`âœ… Seeded ${SEED_REPORTS.length} initial civic reports`);
    }

    // 4. Seed ResourceState
    const resourceExists = await ResourceState.findOne({ is_current: true });
    if (!resourceExists) {
      await ResourceState.create({
        vehicles: [
          { type: 'large_truck', name: 'High Capacity Compactor Truck #1', total: 2, available: 1 },
          { type: 'small_truck', name: 'Mini Tipper Van #2', total: 3, available: 2 },
          { type: 'tractor', name: 'Municipal Tractor Loader #1', total: 2, available: 1 },
          { type: 'loader', name: 'Backhoe Excavator #1', total: 1, available: 1 }
        ],
        workers_total: 18,
        workers_available: 14,
        budget_total_inr: 75000,
        budget_remaining_inr: 45000,
        time_window_hours: 8
      });
      console.log('âœ… Seeded initial municipal resource state');
    }
  } catch (err) {
    console.error('Error during database seeding:', err.message);
  }
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kopargaon_civic';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500 // Quick timeout to fall back cleanly if local daemon not started
    });
    console.log(`âœ… MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    await seedDatabase();
    return true;
  } catch (error) {
    console.warn(`âš ï¸ MongoDB connection unavailable (${error.message}). Running with robust in-memory database simulation for development.`);
    return false;
  }
}
