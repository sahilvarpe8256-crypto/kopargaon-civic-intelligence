const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { User, WasteReport, Zone, ResourceState, Decision } = require('../models');
const { connectDB, disconnectDB } = require('../config/db');

// Realistic Kopargaon Municipal Center: Lat 19.8833, Lng 74.4667
// Simulated Kopargaon Zones GeoJSON Polygons (closed loops with [lng, lat])
const zonesData = [
  {
    zone_id: 'Z01',
    zone_name: 'Kopargaon Market Area',
    population: 12000,
    boundary: {
      type: 'Polygon',
      coordinates: [
        [
          [74.4620, 19.8810],
          [74.4710, 19.8810],
          [74.4710, 19.8880],
          [74.4620, 19.8880],
          [74.4620, 19.8810]
        ]
      ]
    }
  },
  {
    zone_id: 'Z02',
    zone_name: 'Kopargaon Station Area',
    population: 9500,
    boundary: {
      type: 'Polygon',
      coordinates: [
        [
          [74.4710, 19.8880],
          [74.4820, 19.8880],
          [74.4820, 19.8970],
          [74.4710, 19.8970],
          [74.4710, 19.8880]
        ]
      ]
    }
  },
  {
    zone_id: 'Z03',
    zone_name: 'Old Town / Peth',
    population: 8200,
    boundary: {
      type: 'Polygon',
      coordinates: [
        [
          [74.4520, 19.8750],
          [74.4620, 19.8750],
          [74.4620, 19.8840],
          [74.4520, 19.8840],
          [74.4520, 19.8750]
        ]
      ]
    }
  },
  {
    zone_id: 'Z04',
    zone_name: 'New Residential Colony',
    population: 6800,
    boundary: {
      type: 'Polygon',
      coordinates: [
        [
          [74.4620, 19.8880],
          [74.4730, 19.8880],
          [74.4730, 19.8980],
          [74.4620, 19.8980],
          [74.4620, 19.8880]
        ]
      ]
    }
  },
  {
    zone_id: 'Z05',
    zone_name: 'Industrial / Outskirts',
    population: 4100,
    boundary: {
      type: 'Polygon',
      coordinates: [
        [
          [74.4400, 19.8650],
          [74.4550, 19.8650],
          [74.4550, 19.8750],
          [74.4400, 19.8750],
          [74.4400, 19.8650]
        ]
      ]
    }
  }
];

/**
 * Seed all database collections
 * @param {boolean} reset If true, clears collections before seeding
 */
const seedData = async (reset = false) => {
  console.log('[Seed] Starting database seeding process...');
  const passwordHash = await bcrypt.hash('SecurePassword@123', 10);

  if (reset) {
    console.log('[Seed] Reset flag passed. Clearing existing collections...');
    await Decision.deleteMany({});
    await WasteReport.deleteMany({});
    await ResourceState.deleteMany({});
    await Zone.deleteMany({});
    await User.deleteMany({});
    console.log('[Seed] All collections cleared.');
  }

  // 1. Seed Users (Citizens & Officers)
  console.log('[Seed] Seeding Users...');
  const usersToInsert = [
    {
      role: 'officer',
      name: 'Santosh Shinde',
      email: 'officer.shinde@kopargaon.gov.in',
      phone: '9822012345',
      password_hash: passwordHash,
      is_active: true
    },
    {
      role: 'officer',
      name: 'Anjali Deshmukh',
      email: 'officer.deshmukh@kopargaon.gov.in',
      phone: '9822054321',
      password_hash: passwordHash,
      is_active: true
    },
    {
      role: 'citizen',
      name: 'Rahul Patil',
      email: 'rahul.patil@example.com',
      phone: '9890112233',
      password_hash: passwordHash,
      is_active: true
    },
    {
      role: 'citizen',
      name: 'Pooja Kulkarni',
      email: 'pooja.kulkarni@example.com',
      phone: '9890223344',
      password_hash: passwordHash,
      is_active: true
    },
    {
      role: 'citizen',
      name: 'Sachin Jadhav',
      email: 'sachin.jadhav@example.com',
      phone: '9890334455',
      password_hash: passwordHash,
      is_active: true
    },
    {
      role: 'citizen',
      name: 'Kavita More',
      email: 'kavita.more@example.com',
      phone: '9890445566',
      password_hash: passwordHash,
      is_active: true
    }
  ];

  const createdUsers = [];
  for (const u of usersToInsert) {
    const existing = await User.findOne({ email: u.email });
    if (!existing) {
      const created = await User.create(u);
      createdUsers.push(created);
    } else {
      createdUsers.push(existing);
    }
  }
  console.log(`[Seed] ${createdUsers.length} Users ready.`);

  const officer1 = createdUsers.find(u => u.role === 'officer' && u.email.includes('shinde'));
  const officer2 = createdUsers.find(u => u.role === 'officer' && u.email.includes('deshmukh'));
  const citizens = createdUsers.filter(u => u.role === 'citizen');

  // 2. Seed Zones
  console.log('[Seed] Seeding Kopargaon Zones...');
  const createdZones = [];
  for (const z of zonesData) {
    let zone = await Zone.findOne({ zone_id: z.zone_id });
    if (!zone) {
      zone = await Zone.create(z);
    }
    createdZones.push(zone);
  }
  console.log(`[Seed] ${createdZones.length} Zones ready.`);

  const zoneMap = {};
  createdZones.forEach(z => {
    zoneMap[z.zone_id] = z;
  });

  // 3. Seed Resource State (One active prototype resource state)
  console.log('[Seed] Seeding Resource State...');
  let resourceState = await ResourceState.findOne({ is_current: true });
  if (!resourceState) {
    resourceState = await ResourceState.create({
      snapshot_date: new Date(),
      is_current: true,
      vehicles: [
        { type: 'large_truck', total: 1, available: 1, capacity_cubic_meters: 15 },
        { type: 'small_truck', total: 2, available: 2, capacity_cubic_meters: 5 },
        { type: 'tractor', total: 1, available: 1, capacity_cubic_meters: 3 }
      ],
      workers_total: 15,
      workers_available: 12,
      budget_total_inr: 50000,
      budget_remaining_inr: 25000,
      time_window_hours: 8,
      last_updated_by: officer1 ? officer1._id : null
    });
    console.log('[Seed] Current Resource State created.');
  }

  // 4. Seed Realistic Simulated Waste Reports (30 reports across zones for Civic Heatmap)
  console.log('[Seed] Seeding Waste Reports across Kopargaon zones...');
  const reportsTemplate = [
    // --- Cluster 1: Kopargaon Market Area (Z01 - High Density Hotspot) ---
    {
      report_id: 'RPT-20260829-0001',
      zone_id: zoneMap['Z01']._id,
      description: 'Major garbage accumulation near weekly vegetable market entrance blocking pedestrian walkway.',
      lng: 74.4645,
      lat: 19.8835,
      status: 'UNDER_REVIEW',
      waste_type: 'mixed_solid_waste',
      severity: 'high',
      confidence: 0.92,
      health_risk: 'high',
      env_risk: 'medium',
      obstruction: true,
      scale: 'large',
      score: 8.42,
      breakdown: { health: 8.0, pop: 7.0, sev: 8.5, obs: 10.0, urg: 5.0, conf: 9.2 }
    },
    {
      report_id: 'RPT-20260829-0002',
      zone_id: zoneMap['Z01']._id,
      description: 'Rotting vegetable heaps and packaging boxes spilling into open drainage gutter.',
      lng: 74.4652,
      lat: 19.8841,
      status: 'UNDER_REVIEW',
      waste_type: 'organic_waste',
      severity: 'high',
      confidence: 0.88,
      health_risk: 'critical',
      env_risk: 'high',
      obstruction: true,
      scale: 'large',
      score: 8.75,
      breakdown: { health: 10.0, pop: 7.0, sev: 8.5, obs: 10.0, urg: 7.0, conf: 8.8 }
    },
    {
      report_id: 'RPT-20260829-0003',
      zone_id: zoneMap['Z01']._id,
      description: 'Plastic wrapper waste and discarded beverage cups behind commercial complex.',
      lng: 74.4660,
      lat: 19.8829,
      status: 'UNDER_REVIEW',
      waste_type: 'plastic_waste',
      severity: 'medium',
      confidence: 0.94,
      health_risk: 'medium',
      env_risk: 'medium',
      obstruction: false,
      scale: 'medium',
      score: 5.82,
      breakdown: { health: 5.0, pop: 7.0, sev: 5.0, obs: 0.0, urg: 3.0, conf: 9.4 }
    },
    {
      report_id: 'RPT-20260829-0004',
      zone_id: zoneMap['Z01']._id,
      description: 'Overflowing community municipal dustbin on main market road.',
      lng: 74.4675,
      lat: 19.8850,
      status: 'APPROVED',
      waste_type: 'mixed_solid_waste',
      severity: 'high',
      confidence: 0.91,
      health_risk: 'high',
      env_risk: 'low',
      obstruction: true,
      scale: 'medium',
      score: 7.65,
      breakdown: { health: 8.0, pop: 7.0, sev: 8.0, obs: 10.0, urg: 5.0, conf: 9.1 }
    },
    {
      report_id: 'RPT-20260829-0005',
      zone_id: zoneMap['Z01']._id,
      description: 'Fish and poultry market organic waste bags left uncollected.',
      lng: 74.4635,
      lat: 19.8822,
      status: 'UNDER_REVIEW',
      waste_type: 'organic_waste',
      severity: 'critical',
      confidence: 0.89,
      health_risk: 'critical',
      env_risk: 'high',
      obstruction: false,
      scale: 'large',
      score: 8.10,
      breakdown: { health: 10.0, pop: 7.0, sev: 10.0, obs: 0.0, urg: 5.0, conf: 8.9 }
    },
    {
      report_id: 'RPT-20260829-0006',
      zone_id: zoneMap['Z01']._id,
      description: 'Cardboard cartons and packaging pile near cloth market corner.',
      lng: 74.4682,
      lat: 19.8865,
      status: 'PENDING',
      waste_type: 'mixed_solid_waste',
      severity: 'low',
      confidence: 0.85,
      health_risk: 'low',
      env_risk: 'none',
      obstruction: false,
      scale: 'small',
      score: 3.90,
      breakdown: { health: 2.0, pop: 7.0, sev: 2.0, obs: 0.0, urg: 1.0, conf: 8.5 }
    },

    // --- Cluster 2: Kopargaon Station Area (Z02 - Transit & Commuter Hub) ---
    {
      report_id: 'RPT-20260829-0007',
      zone_id: zoneMap['Z02']._id,
      description: 'Heavy plastic bottle and snack wrapper dumping along railway approach road.',
      lng: 74.4740,
      lat: 19.8910,
      status: 'UNDER_REVIEW',
      waste_type: 'plastic_waste',
      severity: 'high',
      confidence: 0.95,
      health_risk: 'medium',
      env_risk: 'medium',
      obstruction: true,
      scale: 'large',
      score: 7.45,
      breakdown: { health: 5.0, pop: 7.0, sev: 8.5, obs: 10.0, urg: 5.0, conf: 9.5 }
    },
    {
      report_id: 'RPT-20260829-0008',
      zone_id: zoneMap['Z02']._id,
      description: 'Illegal dumping site near auto rickshaw stand with food and solid waste.',
      lng: 74.4765,
      lat: 19.8930,
      status: 'UNDER_REVIEW',
      waste_type: 'mixed_solid_waste',
      severity: 'high',
      confidence: 0.87,
      health_risk: 'high',
      env_risk: 'medium',
      obstruction: true,
      scale: 'large',
      score: 7.93,
      breakdown: { health: 8.0, pop: 7.0, sev: 8.5, obs: 10.0, urg: 5.0, conf: 8.7 }
    },
    {
      report_id: 'RPT-20260829-0009',
      zone_id: zoneMap['Z02']._id,
      description: 'Discarded tea stall cups and coconut shells blocking stormwater drain.',
      lng: 74.4785,
      lat: 19.8950,
      status: 'DEFERRED',
      waste_type: 'organic_waste',
      severity: 'medium',
      confidence: 0.86,
      health_risk: 'medium',
      env_risk: 'high',
      obstruction: true,
      scale: 'medium',
      score: 6.43,
      breakdown: { health: 5.0, pop: 7.0, sev: 5.0, obs: 10.0, urg: 3.0, conf: 8.6 }
    },
    {
      report_id: 'RPT-20260829-0010',
      zone_id: zoneMap['Z02']._id,
      description: 'Construction rubble dumped on platform 2 outer perimeter.',
      lng: 74.4725,
      lat: 19.8895,
      status: 'UNDER_REVIEW',
      waste_type: 'construction_debris',
      severity: 'medium',
      confidence: 0.90,
      health_risk: 'low',
      env_risk: 'none',
      obstruction: true,
      scale: 'medium',
      score: 5.25,
      breakdown: { health: 2.0, pop: 7.0, sev: 5.0, obs: 10.0, urg: 1.0, conf: 9.0 }
    },
    {
      report_id: 'RPT-20260829-0011',
      zone_id: zoneMap['Z02']._id,
      description: 'Photo showing clear train track section without waste.',
      lng: 74.4800,
      lat: 19.8960,
      status: 'REJECTED_NO_WASTE',
      waste_type: 'unknown',
      severity: 'low',
      confidence: 0.96,
      health_risk: 'none',
      env_risk: 'none',
      obstruction: false,
      scale: 'small',
      score: 0.0,
      breakdown: { health: 0, pop: 0, sev: 0, obs: 0, urg: 0, conf: 0 }
    },

    // --- Cluster 3: Old Town / Peth (Z03 - Heritage & Narrow Lanes) ---
    {
      report_id: 'RPT-20260829-0012',
      zone_id: zoneMap['Z03']._id,
      description: 'Household waste dumped near temple lane steps creating foul smell.',
      lng: 74.4560,
      lat: 19.8780,
      status: 'UNDER_REVIEW',
      waste_type: 'mixed_solid_waste',
      severity: 'high',
      confidence: 0.89,
      health_risk: 'high',
      env_risk: 'medium',
      obstruction: true,
      scale: 'medium',
      score: 7.14,
      breakdown: { health: 8.0, pop: 5.0, sev: 8.0, obs: 10.0, urg: 5.0, conf: 8.9 }
    },
    {
      report_id: 'RPT-20260829-0013',
      zone_id: zoneMap['Z03']._id,
      description: 'Old timber and broken roof tiles blocking narrow alleyway.',
      lng: 74.4580,
      lat: 19.8805,
      status: 'UNDER_REVIEW',
      waste_type: 'bulk_waste',
      severity: 'medium',
      confidence: 0.91,
      health_risk: 'low',
      env_risk: 'none',
      obstruction: true,
      scale: 'large',
      score: 5.51,
      breakdown: { health: 2.0, pop: 5.0, sev: 8.5, obs: 10.0, urg: 3.0, conf: 9.1 }
    },
    {
      report_id: 'RPT-20260829-0014',
      zone_id: zoneMap['Z03']._id,
      description: 'Stagnant domestic wastewater and floating plastic near community well.',
      lng: 74.4540,
      lat: 19.8765,
      status: 'UNDER_REVIEW',
      waste_type: 'liquid_waste',
      severity: 'critical',
      confidence: 0.85,
      health_risk: 'critical',
      env_risk: 'critical',
      obstruction: false,
      scale: 'medium',
      score: 7.43,
      breakdown: { health: 10.0, pop: 5.0, sev: 8.5, obs: 0.0, urg: 5.0, conf: 8.5 }
    },
    {
      report_id: 'RPT-20260829-0015',
      zone_id: zoneMap['Z03']._id,
      description: 'Fallen dry tree branches and garden leaves on side lane.',
      lng: 74.4605,
      lat: 19.8825,
      status: 'APPROVED',
      waste_type: 'organic_waste',
      severity: 'low',
      confidence: 0.93,
      health_risk: 'none',
      env_risk: 'none',
      obstruction: false,
      scale: 'small',
      score: 2.97,
      breakdown: { health: 0.0, pop: 5.0, sev: 2.0, obs: 0.0, urg: 1.0, conf: 9.3 }
    },
    {
      report_id: 'RPT-20260829-0016',
      zone_id: zoneMap['Z03']._id,
      description: 'Blurry photo with poor lighting near old town peth gate.',
      lng: 74.4530,
      lat: 19.8755,
      status: 'MANUAL_REVIEW',
      waste_type: 'unknown',
      severity: 'medium',
      confidence: 0.35,
      health_risk: 'low',
      env_risk: 'none',
      obstruction: false,
      scale: 'small',
      score: 3.10,
      breakdown: { health: 2.0, pop: 5.0, sev: 5.0, obs: 0.0, urg: 1.0, conf: 3.5 }
    },

    // --- Cluster 4: New Residential Colony (Z04 - Schools & Housing) ---
    {
      report_id: 'RPT-20260829-0017',
      zone_id: zoneMap['Z04']._id,
      description: 'Overflowing open garbage bin right opposite municipal primary school.',
      lng: 74.4650,
      lat: 19.8920,
      status: 'UNDER_REVIEW',
      waste_type: 'mixed_solid_waste',
      severity: 'high',
      confidence: 0.93,
      health_risk: 'critical',
      env_risk: 'medium',
      obstruction: true,
      scale: 'large',
      score: 8.27,
      breakdown: { health: 10.0, pop: 5.0, sev: 8.5, obs: 10.0, urg: 5.0, conf: 9.3 }
    },
    {
      report_id: 'RPT-20260829-0018',
      zone_id: zoneMap['Z04']._id,
      description: 'Discarded medical packaging and syringes on vacant plot near clinic.',
      lng: 74.4670,
      lat: 19.8945,
      status: 'UNDER_REVIEW',
      waste_type: 'hazardous_waste',
      severity: 'critical',
      confidence: 0.91,
      health_risk: 'critical',
      env_risk: 'high',
      obstruction: false,
      scale: 'medium',
      score: 7.91,
      breakdown: { health: 10.0, pop: 5.0, sev: 10.0, obs: 0.0, urg: 7.0, conf: 9.1 }
    },
    {
      report_id: 'RPT-20260829-0019',
      zone_id: zoneMap['Z04']._id,
      description: 'Lawn clippings and pruned plant debris piled outside society park.',
      lng: 74.4700,
      lat: 19.8965,
      status: 'UNDER_REVIEW',
      waste_type: 'organic_waste',
      severity: 'low',
      confidence: 0.95,
      health_risk: 'none',
      env_risk: 'none',
      obstruction: false,
      scale: 'small',
      score: 2.83,
      breakdown: { health: 0.0, pop: 5.0, sev: 2.0, obs: 0.0, urg: 3.0, conf: 9.5 }
    },
    {
      report_id: 'RPT-20260829-0020',
      zone_id: zoneMap['Z04']._id,
      description: 'Empty plastic paint buckets and plaster bags near newly constructed building.',
      lng: 74.4630,
      lat: 19.8900,
      status: 'PENDING',
      waste_type: 'construction_debris',
      severity: 'medium',
      confidence: 0.88,
      health_risk: 'low',
      env_risk: 'low',
      obstruction: true,
      scale: 'medium',
      score: 5.14,
      breakdown: { health: 2.0, pop: 5.0, sev: 5.0, obs: 10.0, urg: 1.0, conf: 8.8 }
    },
    {
      report_id: 'RPT-20260829-0021',
      zone_id: zoneMap['Z04']._id,
      description: 'Cardboard appliance boxes stacked by supermarket back door.',
      lng: 74.4715,
      lat: 19.8975,
      status: 'APPROVED',
      waste_type: 'mixed_solid_waste',
      severity: 'medium',
      confidence: 0.92,
      health_risk: 'low',
      env_risk: 'none',
      obstruction: false,
      scale: 'medium',
      score: 4.11,
      breakdown: { health: 2.0, pop: 5.0, sev: 5.0, obs: 0.0, urg: 5.0, conf: 9.2 }
    },

    // --- Cluster 5: Industrial / Outskirts (Z05 - High Severity / Hazardous Site) ---
    {
      report_id: 'RPT-20260829-0022',
      zone_id: zoneMap['Z05']._id,
      description: 'Massive open dumping ground fire and chemical packaging near industrial boundary.',
      lng: 74.4450,
      lat: 19.8690,
      status: 'UNDER_REVIEW',
      waste_type: 'hazardous_waste',
      severity: 'critical',
      confidence: 0.94,
      health_risk: 'critical',
      env_risk: 'critical',
      obstruction: true,
      scale: 'massive',
      score: 8.77,
      breakdown: { health: 10.0, pop: 3.0, sev: 10.0, obs: 10.0, urg: 7.0, conf: 9.4 }
    },
    {
      report_id: 'RPT-20260829-0023',
      zone_id: zoneMap['Z05']._id,
      description: 'Industrial sludge drums leaking into roadside ditch.',
      lng: 74.4480,
      lat: 19.8710,
      status: 'UNDER_REVIEW',
      waste_type: 'liquid_waste',
      severity: 'critical',
      confidence: 0.90,
      health_risk: 'critical',
      env_risk: 'critical',
      obstruction: false,
      scale: 'large',
      score: 7.45,
      breakdown: { health: 10.0, pop: 3.0, sev: 10.0, obs: 0.0, urg: 5.0, conf: 9.0 }
    },
    {
      report_id: 'RPT-20260829-0024',
      zone_id: zoneMap['Z05']._id,
      description: 'Discarded tractor tires and vehicle body scrap near highway turn.',
      lng: 74.4510,
      lat: 19.8735,
      status: 'DEFERRED',
      waste_type: 'bulk_waste',
      severity: 'medium',
      confidence: 0.92,
      health_risk: 'low',
      env_risk: 'none',
      obstruction: true,
      scale: 'large',
      score: 5.01,
      breakdown: { health: 2.0, pop: 3.0, sev: 8.5, obs: 10.0, urg: 3.0, conf: 9.2 }
    },
    {
      report_id: 'RPT-20260829-0025',
      zone_id: zoneMap['Z05']._id,
      description: 'Old concrete pipe fragments left in open field.',
      lng: 74.4420,
      lat: 19.8665,
      status: 'UNDER_REVIEW',
      waste_type: 'construction_debris',
      severity: 'low',
      confidence: 0.89,
      health_risk: 'none',
      env_risk: 'none',
      obstruction: false,
      scale: 'small',
      score: 1.80,
      breakdown: { health: 0.0, pop: 3.0, sev: 2.0, obs: 0.0, urg: 1.0, conf: 8.9 }
    },

    // Additional Reports to complete high-fidelity 30-report distribution
    {
      report_id: 'RPT-20260829-0026',
      zone_id: zoneMap['Z01']._id,
      description: 'Overflowing street corner bin near Kopargaon cloth market lane.',
      lng: 74.4690,
      lat: 19.8870,
      status: 'UNDER_REVIEW',
      waste_type: 'mixed_solid_waste',
      severity: 'high',
      confidence: 0.91,
      health_risk: 'medium',
      env_risk: 'low',
      obstruction: true,
      scale: 'medium',
      score: 6.91,
      breakdown: { health: 5.0, pop: 7.0, sev: 8.0, obs: 10.0, urg: 3.0, conf: 9.1 }
    },
    {
      report_id: 'RPT-20260829-0027',
      zone_id: zoneMap['Z02']._id,
      description: 'Scattered plastic pouches and water bottles on railway overbridge footpath.',
      lng: 74.4755,
      lat: 19.8925,
      status: 'UNDER_REVIEW',
      waste_type: 'plastic_waste',
      severity: 'medium',
      confidence: 0.93,
      health_risk: 'low',
      env_risk: 'low',
      obstruction: true,
      scale: 'small',
      score: 5.42,
      breakdown: { health: 2.0, pop: 7.0, sev: 5.0, obs: 10.0, urg: 5.0, conf: 9.3 }
    },
    {
      report_id: 'RPT-20260829-0028',
      zone_id: zoneMap['Z03']._id,
      description: 'Decaying animal waste and market scrap on corner plot.',
      lng: 74.4570,
      lat: 19.8795,
      status: 'UNDER_REVIEW',
      waste_type: 'organic_waste',
      severity: 'critical',
      confidence: 0.88,
      health_risk: 'critical',
      env_risk: 'high',
      obstruction: false,
      scale: 'medium',
      score: 7.39,
      breakdown: { health: 10.0, pop: 5.0, sev: 8.5, obs: 0.0, urg: 5.0, conf: 8.8 }
    },
    {
      report_id: 'RPT-20260829-0029',
      zone_id: zoneMap['Z04']._id,
      description: 'Spilled cement bags and sand pile encroaching road width.',
      lng: 74.4680,
      lat: 19.8950,
      status: 'UNDER_REVIEW',
      waste_type: 'construction_debris',
      severity: 'medium',
      confidence: 0.94,
      health_risk: 'low',
      env_risk: 'low',
      obstruction: true,
      scale: 'medium',
      score: 5.32,
      breakdown: { health: 2.0, pop: 5.0, sev: 5.0, obs: 10.0, urg: 3.0, conf: 9.4 }
    },
    {
      report_id: 'RPT-20260829-0030',
      zone_id: zoneMap['Z05']._id,
      description: 'Charred solid waste residue from unauthorized open burning.',
      lng: 74.4465,
      lat: 19.8700,
      status: 'UNDER_REVIEW',
      waste_type: 'hazardous_waste',
      severity: 'high',
      confidence: 0.90,
      health_risk: 'high',
      env_risk: 'high',
      obstruction: false,
      scale: 'large',
      score: 6.90,
      breakdown: { health: 8.0, pop: 3.0, sev: 8.5, obs: 0.0, urg: 5.0, conf: 9.0 }
    }
  ];

  const createdReports = [];
  for (let i = 0; i < reportsTemplate.length; i++) {
    const tpl = reportsTemplate[i];
    const assignedCitizen = citizens[i % citizens.length];

    let report = await WasteReport.findOne({ report_id: tpl.report_id });
    if (!report) {
      report = await WasteReport.create({
        report_id: tpl.report_id,
        citizen_id: assignedCitizen._id,
        category: 'waste_management',
        status: tpl.status,
        description: tpl.description,
        images: [
          {
            filename: `seed_${tpl.report_id.toLowerCase()}_1.jpg`,
            original_name: `evidence_${tpl.report_id}.jpg`,
            mimetype: 'image/jpeg',
            size_bytes: 1450200,
            uploaded_at: new Date(Date.now() - (30 - i) * 3600 * 1000)
          }
        ],
        location: {
          type: 'Point',
          coordinates: [tpl.lng, tpl.lat]
        },
        zone_id: tpl.zone_id,
        ai_analysis: {
          status: tpl.status === 'PENDING' ? 'PENDING' : 'COMPLETED',
          waste_detected: tpl.status !== 'REJECTED_NO_WASTE',
          waste_type: tpl.waste_type,
          waste_type_detail: `${tpl.waste_type} with observable severity ${tpl.severity}`,
          visible_severity: tpl.severity,
          evidence_confidence: tpl.confidence,
          health_risk: tpl.health_risk,
          environmental_risk: tpl.env_risk,
          public_obstruction: tpl.obstruction,
          estimated_scale: tpl.scale,
          requires_manual_verification: tpl.status === 'MANUAL_REVIEW',
          image_quality: tpl.status === 'MANUAL_REVIEW' ? 'poor' : 'good',
          rejection_reason: tpl.status === 'REJECTED_NO_WASTE' ? 'no_waste_detected' : null,
          ai_notes: `AI Evidence: ${tpl.description}`,
          raw_response: JSON.stringify({ waste_detected: tpl.status !== 'REJECTED_NO_WASTE', confidence: tpl.confidence }),
          analyzed_at: new Date(Date.now() - (29 - i) * 3600 * 1000)
        },
        priority_score: {
          total: tpl.score,
          breakdown: {
            health_risk_score: tpl.breakdown.health,
            population_score: tpl.breakdown.pop,
            waste_severity_score: tpl.breakdown.sev,
            obstruction_score: tpl.breakdown.obs,
            urgency_score: tpl.breakdown.urg,
            confidence_score: tpl.breakdown.conf
          },
          calculated_at: new Date(Date.now() - (28 - i) * 3600 * 1000)
        },
        submitted_at: new Date(Date.now() - (30 - i) * 3600 * 1000)
      });
    }
    createdReports.push(report);
  }
  console.log(`[Seed] ${createdReports.length} Waste Reports seeded successfully.`);

  // 5. Seed Decision Records (One APPROVED, One OVERRIDDEN)
  console.log('[Seed] Seeding Decision audit records...');
  const existingDecisions = await Decision.countDocuments();
  if (existingDecisions === 0 && officer1 && officer2) {
    // Approved decision
    const approvedReport = createdReports.find(r => r.report_id === 'RPT-20260829-0004');
    const deferredReport1 = createdReports.find(r => r.report_id === 'RPT-20260829-0009');

    await Decision.create({
      officer_id: officer1._id,
      decision_type: 'APPROVED',
      engine_recommendation: {
        engine_version: '1.0',
        generated_at: new Date(Date.now() - 6 * 3600 * 1000),
        selected_reports: [
          {
            report_id: 'RPT-20260829-0004',
            priority_score: 7.65,
            allocated_resources: {
              vehicle: 'small_truck',
              workers: 4,
              estimated_hours: 2,
              estimated_cost_inr: 1200
            }
          }
        ],
        deferred_reports: [
          {
            report_id: 'RPT-20260829-0009',
            priority_score: 6.43,
            deferral_reason: 'LOWER_PRIORITY',
            deferral_reason_detail: 'Vehicle prioritized for higher scoring market report.'
          }
        ],
        total_cost_estimate_inr: 1200,
        total_time_estimate_hours: 2
      },
      officer_decision: {
        selected_reports: [
          {
            report_id: 'RPT-20260829-0004',
            priority_score: 7.65,
            allocated_resources: {
              vehicle: 'small_truck',
              workers: 4,
              estimated_hours: 2,
              estimated_cost_inr: 1200
            }
          }
        ],
        deferred_reports: [
          {
            report_id: 'RPT-20260829-0009',
            priority_score: 6.43,
            deferral_reason: 'LOWER_PRIORITY',
            deferral_reason_detail: 'Vehicle prioritized for higher scoring market report.'
          }
        ],
        override_reason: null
      },
      resource_state_before: resourceState._id,
      resource_state_after: {
        workers_available: 8,
        budget_remaining_inr: 23800,
        vehicles: [{ type: 'small_truck', available: 1 }]
      },
      reports_affected: approvedReport ? [approvedReport._id] : [],
      decided_at: new Date(Date.now() - 5 * 3600 * 1000)
    });

    // Overridden decision (with required override reason)
    const overriddenReport = createdReports.find(r => r.report_id === 'RPT-20260829-0015');
    await Decision.create({
      officer_id: officer2._id,
      decision_type: 'OVERRIDDEN',
      engine_recommendation: {
        engine_version: '1.0',
        generated_at: new Date(Date.now() - 3 * 3600 * 1000),
        selected_reports: [
          {
            report_id: 'RPT-20260829-0024',
            priority_score: 5.01,
            allocated_resources: {
              vehicle: 'tractor',
              workers: 2,
              estimated_hours: 1,
              estimated_cost_inr: 500
            }
          }
        ],
        deferred_reports: [
          {
            report_id: 'RPT-20260829-0015',
            priority_score: 2.97,
            deferral_reason: 'LOWER_PRIORITY',
            deferral_reason_detail: 'Lower priority score.'
          }
        ],
        total_cost_estimate_inr: 500,
        total_time_estimate_hours: 1
      },
      officer_decision: {
        selected_reports: [
          {
            report_id: 'RPT-20260829-0015',
            priority_score: 2.97,
            allocated_resources: {
              vehicle: 'tractor',
              workers: 2,
              estimated_hours: 1,
              estimated_cost_inr: 500
            }
          }
        ],
        deferred_reports: [
          {
            report_id: 'RPT-20260829-0024',
            priority_score: 5.01,
            deferral_reason: 'OTHER',
            deferral_reason_detail: 'Deferred by officer for temple event clearance.'
          }
        ],
        override_reason: 'Urgent municipal request: Annual temple festival procession passing through Old Town Peth lane requires immediate clearance of fallen branches.'
      },
      resource_state_before: resourceState._id,
      resource_state_after: {
        workers_available: 10,
        budget_remaining_inr: 24500,
        vehicles: [{ type: 'tractor', available: 0 }]
      },
      reports_affected: overriddenReport ? [overriddenReport._id] : [],
      decided_at: new Date(Date.now() - 2 * 3600 * 1000)
    });
    console.log('[Seed] Decision audit records created.');
  }

  console.log('[Seed] ✅ Database seeding completed successfully.');
  return {
    usersCount: createdUsers.length,
    zonesCount: createdZones.length,
    reportsCount: createdReports.length
  };
};

// If run directly from CLI
if (require.main === module) {
  const shouldReset = process.argv.includes('--reset');
  (async () => {
    try {
      await connectDB();
      await seedData(shouldReset);
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('[Seed] Seeding failed with error:', err);
      process.exit(1);
    }
  })();
}

module.exports = { seedData };
