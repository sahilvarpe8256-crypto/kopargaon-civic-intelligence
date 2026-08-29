require('dotenv').config();
const mongoose = require('mongoose');
const { User, Zone, Complaint, WasteReport, Resource, ResourceState } = require('../models');
const { connectDB } = require('../config/db');
const ZoneService = require('../services/zoneService');
const PriorityEngine = require('../services/priorityEngine');
const logger = require('../utils/logger');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kopargaon-civic-dev';
    logger.info(`Connecting to MongoDB for seeding: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB.');

    // Clear existing collections
    await User.deleteMany({});
    await Zone.deleteMany({});
    await Complaint.deleteMany({});
    await WasteReport.deleteMany({});
    await Resource.deleteMany({});
    await ResourceState.deleteMany({});
    logger.info('Cleared existing collections.');

    // 1. Seed Municipal Officer and Citizen Users
    const officer = await User.create({
      name: 'Pravin Shinde (Chief Sanitation Inspector)',
      email: 'officer@kopargaon.gov.in',
      phone: '9822012345',
      role: 'officer',
      isActive: true
    });

    const citizen = await User.create({
      name: 'Ramesh Kulkarni',
      email: 'citizen@kopargaon.in',
      phone: '9822054321',
      role: 'citizen',
      isActive: true
    });
    logger.info('Seeded Users (Officer & Citizen).');

    // 2. Seed Kopargaon Zones (Z01 - Z05)
    const zonesData = ZoneService.getZones();
    const createdZones = [];
    for (const z of zonesData) {
      const zoneDoc = await Zone.create({
        name: z.name,
        code: z.zoneId,
        description: `Simulated Ward for Kopargaon: ${z.landmarks.join(', ')}`,
        populationEstimate: z.population,
        status: 'active'
      });
      createdZones.push(zoneDoc);
    }
    logger.info(`Seeded ${createdZones.length} Kopargaon Municipal Zones.`);

    // 3. Seed Municipal Resource Inventory & Constraints
    const resourceDoc = await Resource.create({
      date: new Date().toISOString().split('T')[0],
      crews: { total: 6, available: 4, dispatched: 2 },
      vehicles: [
        { type: 'compactor_truck', total: 2, available: 1, dispatched: 1 },
        { type: 'mini_tipper', total: 4, available: 3, dispatched: 1 },
        { type: 'tractor_trailer', total: 2, available: 2, dispatched: 0 }
      ],
      workingHoursRemainingToday: 6.5,
      dailyBudgetINR: { allocated: 25000, spent: 8500, remaining: 16500 },
      isCurrent: true
    });

    // Also populate ResourceState for backward compatibility
    await ResourceState.create({
      zone: createdZones[0]._id,
      availableStaff: 4,
      availableVehicles: 3,
      availableBudget: 16500,
      dailyCapacity: 8,
      status: 'available'
    });
    logger.info('Seeded Municipal Resource State & Constraints.');

    // 4. Seed 5 Competing Waste Complaints Demonstrating Resource Trade-offs
    const mockReports = [
      {
        reportId: 'RPT-20260829-1001',
        title: 'Massive Hospital & Medical Waste Dump near Market Gutter',
        description: 'Biohazard syringe waste and toxic medical debris blocking the main bazaar drain near Fish Market.',
        category: 'waste_management',
        latitude: 19.8845,
        longitude: 74.4671,
        zoneId: 'Z01',
        zoneName: 'Kopargaon Market & Commercial Hub',
        zonePopulation: 12000,
        estimatedPopulationExposure: 95,
        aiAnalysis: {
          wasteType: 'hazardous_waste',
          detectedElements: ['biohazard bags', 'chemical residue', 'syringes'],
          requiresManualVerification: false,
          confidence: 0.96,
          notes: 'High severity toxic hazard detected adjacent to active food stalls.'
        },
        severity: 92,
        healthRisk: 95,
        environmentalRisk: 88,
        obstruction: 85,
        confidence: 0.96,
        status: 'UNDER_REVIEW',
        reportedBy: citizen._id
      },
      {
        reportId: 'RPT-20260829-1002',
        title: 'Severe Sewage Overflow & Plastic Clog at Station Road',
        description: 'Heavy plastic accumulation blocking rainwater culvert directly outside Kopargaon Railway Station.',
        category: 'waste_management',
        latitude: 19.8920,
        longitude: 74.4750,
        zoneId: 'Z02',
        zoneName: 'Kopargaon Railway Station Area',
        zonePopulation: 9500,
        estimatedPopulationExposure: 85,
        aiAnalysis: {
          wasteType: 'liquid_and_organic',
          detectedElements: ['sludge', 'single-use plastics', 'culvert overflow'],
          requiresManualVerification: false,
          confidence: 0.91,
          notes: 'Active waterlogging hazard on main transit corridor.'
        },
        severity: 82,
        healthRisk: 80,
        environmentalRisk: 85,
        obstruction: 90,
        confidence: 0.91,
        status: 'UNDER_REVIEW',
        reportedBy: citizen._id
      },
      {
        reportId: 'RPT-20260829-1003',
        title: 'Rotting Vegetable & Animal Refuse at Old Peth Ghat',
        description: 'Decomposing organic matter from weekly cattle bazaar accumulating near Godavari riverbank approach.',
        category: 'waste_management',
        latitude: 19.8790,
        longitude: 74.4610,
        zoneId: 'Z03',
        zoneName: 'Old Town / Peth Area',
        zonePopulation: 8200,
        estimatedPopulationExposure: 72,
        aiAnalysis: {
          wasteType: 'organic_and_market_waste',
          detectedElements: ['organic compost heap', 'animal carcass remnants'],
          requiresManualVerification: false,
          confidence: 0.89,
          notes: 'Severe stench, vector-borne disease vector risk.'
        },
        severity: 75,
        healthRisk: 78,
        environmentalRisk: 82,
        obstruction: 60,
        confidence: 0.89,
        status: 'UNDER_REVIEW',
        reportedBy: citizen._id
      },
      {
        reportId: 'RPT-20260829-1004',
        title: 'Construction Debris & Broken Paver Blocks on School Road',
        description: 'Piles of demolition concrete and broken bricks encroaching on pedestrian footpath in Shivaji Nagar.',
        category: 'waste_management',
        latitude: 19.8710,
        longitude: 74.4800,
        zoneId: 'Z04',
        zoneName: 'New Residential Colony / Shivaji Nagar',
        zonePopulation: 6800,
        estimatedPopulationExposure: 55,
        aiAnalysis: {
          wasteType: 'construction_debris',
          detectedElements: ['concrete chunks', 'paver blocks', 'wire mesh'],
          requiresManualVerification: false,
          confidence: 0.87,
          notes: 'Pedestrian hazard, minimal immediate biohazard.'
        },
        severity: 58,
        healthRisk: 35,
        environmentalRisk: 30,
        obstruction: 75,
        confidence: 0.87,
        status: 'UNDER_REVIEW',
        reportedBy: citizen._id
      },
      {
        reportId: 'RPT-20260829-1005',
        title: 'Scattered Dry Packaging Litter on Industrial Bypass',
        description: 'Dry plastic wrappers and cardboard cartons scattered along the sugar factory perimeter fence.',
        category: 'waste_management',
        latitude: 19.8600,
        longitude: 74.4500,
        zoneId: 'Z05',
        zoneName: 'Industrial & Outskirts Zone',
        zonePopulation: 4100,
        estimatedPopulationExposure: 30,
        aiAnalysis: {
          wasteType: 'dry_recyclable_waste',
          detectedElements: ['cardboard boxes', 'plastic film'],
          requiresManualVerification: false,
          confidence: 0.93,
          notes: 'Low urgency dry litter in low pedestrian density corridor.'
        },
        severity: 35,
        healthRisk: 20,
        environmentalRisk: 25,
        obstruction: 20,
        confidence: 0.93,
        status: 'UNDER_REVIEW',
        reportedBy: citizen._id
      }
    ];

    for (const report of mockReports) {
      const { priorityScore, priorityReasons } = PriorityEngine.calculatePriority({
        severity: report.severity,
        estimatedPopulationExposure: report.estimatedPopulationExposure,
        healthRisk: report.healthRisk,
        environmentalRisk: report.environmentalRisk,
        obstruction: report.obstruction
      });

      report.priorityScore = priorityScore;
      report.priorityReasons = priorityReasons;
      report.location = {
        address: `${report.zoneName}, Kopargaon`,
        type: 'Point',
        coordinates: [report.longitude, report.latitude]
      };

      await Complaint.create(report);
      logger.info(`Seeded Complaint [${report.reportId}]: Score ${priorityScore} (${report.title})`);
    }

    logger.info('Database seeding completed successfully.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    logger.error('Error during seeding:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;