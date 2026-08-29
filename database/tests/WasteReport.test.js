const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const WasteReport = require('../models/WasteReport');
const User = require('../models/User');
const Zone = require('../models/Zone');

describe('WasteReport Model Tests', () => {
  let mongoServer;
  let citizen;
  let zone;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    citizen = await User.create({
      role: 'citizen',
      name: 'Pooja Kulkarni',
      email: 'pooja@example.com',
      phone: '9890112233',
      password_hash: 'hashedpassword'
    });

    zone = await Zone.create({
      zone_id: 'Z01',
      zone_name: 'Kopargaon Market Area',
      population: 12000,
      boundary: {
        type: 'Polygon',
        coordinates: [
          [
            [74.4600, 19.8800],
            [74.4700, 19.8800],
            [74.4700, 19.8900],
            [74.4600, 19.8900],
            [74.4600, 19.8800]
          ]
        ]
      }
    });

    await WasteReport.ensureIndexes();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await WasteReport.deleteMany({});
  });

  it('should successfully create a valid WasteReport with AI evidence and priority score', async () => {
    const report = new WasteReport({
      report_id: 'RPT-20260829-0001',
      citizen_id: citizen._id,
      category: 'waste_management',
      status: 'UNDER_REVIEW',
      description: 'Garbage pile near market gate.',
      images: [
        {
          filename: 'rpt_0001_1.jpg',
          original_name: 'photo.jpg',
          mimetype: 'image/jpeg',
          size_bytes: 1024000
        }
      ],
      location: {
        type: 'Point',
        coordinates: [74.4650, 19.8850] // [longitude, latitude]
      },
      zone_id: zone._id,
      ai_analysis: {
        status: 'COMPLETED',
        waste_detected: true,
        waste_type: 'mixed_solid_waste',
        waste_type_detail: 'Plastic and vegetable waste',
        visible_severity: 'high',
        evidence_confidence: 0.92,
        health_risk: 'high',
        environmental_risk: 'medium',
        public_obstruction: true,
        estimated_scale: 'large',
        requires_manual_verification: false,
        image_quality: 'good',
        ai_notes: 'Evidence shows high obstruction.'
      },
      priority_score: {
        total: 7.85,
        breakdown: {
          health_risk_score: 8.0,
          population_score: 7.0,
          waste_severity_score: 8.5,
          obstruction_score: 10.0,
          urgency_score: 5.0,
          confidence_score: 9.2
        }
      }
    });

    const saved = await report.save();
    expect(saved._id).toBeDefined();
    expect(saved.report_id).toBe('RPT-20260829-0001');
    expect(saved.status).toBe('UNDER_REVIEW');
    expect(saved.location.coordinates[0]).toBe(74.4650);
    expect(saved.location.coordinates[1]).toBe(19.8850);
    expect(saved.ai_analysis.visible_severity).toBe('high');
    expect(saved.priority_score.total).toBe(7.85);
  });

  it('should reject when required fields are missing', async () => {
    const emptyReport = new WasteReport({});
    let err;
    try {
      await emptyReport.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.report_id).toBeDefined();
    expect(err.errors.citizen_id).toBeDefined();
  });

  it('should reject invalid coordinates (latitude out of range)', async () => {
    const invalidCoordReport = new WasteReport({
      report_id: 'RPT-20260829-0002',
      citizen_id: citizen._id,
      location: {
        type: 'Point',
        coordinates: [74.4650, 195.0] // Lat > 90 invalid!
      }
    });

    let err;
    try {
      await invalidCoordReport.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors['location.coordinates']).toBeDefined();
  });

  it('should reject descriptions exceeding 500 characters', async () => {
    const longText = 'A'.repeat(501);
    const longDescReport = new WasteReport({
      report_id: 'RPT-20260829-0003',
      citizen_id: citizen._id,
      description: longText,
      location: {
        type: 'Point',
        coordinates: [74.4650, 19.8850]
      }
    });

    let err;
    try {
      await longDescReport.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.description).toBeDefined();
  });

  it('should reject invalid status enum values', async () => {
    const invalidStatusReport = new WasteReport({
      report_id: 'RPT-20260829-0004',
      citizen_id: citizen._id,
      status: 'INVALID_STATUS',
      location: {
        type: 'Point',
        coordinates: [74.4650, 19.8850]
      }
    });

    let err;
    try {
      await invalidStatusReport.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.status).toBeDefined();
  });

  it('should support geospatial proximity queries ($nearSphere for Civic Heatmap / Clustering)', async () => {
    await WasteReport.create({
      report_id: 'RPT-GEO-001',
      citizen_id: citizen._id,
      location: {
        type: 'Point',
        coordinates: [74.4650, 19.8850] // Near center
      }
    });

    await WasteReport.create({
      report_id: 'RPT-GEO-002',
      citizen_id: citizen._id,
      location: {
        type: 'Point',
        coordinates: [74.5000, 19.9200] // Farther away
      }
    });

    await WasteReport.ensureIndexes();

    const nearby = await WasteReport.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [74.4651, 19.8851]
          },
          $maxDistance: 1000 // within 1000 meters
        }
      }
    });

    expect(nearby.length).toBe(1);
    expect(nearby[0].report_id).toBe('RPT-GEO-001');
  });

  it('should populate referenced citizen and zone correctly', async () => {
    const report = await WasteReport.create({
      report_id: 'RPT-POP-001',
      citizen_id: citizen._id,
      zone_id: zone._id,
      location: {
        type: 'Point',
        coordinates: [74.4650, 19.8850]
      }
    });

    const populated = await WasteReport.findById(report._id)
      .populate('citizen_id')
      .populate('zone_id');

    expect(populated.citizen_id.name).toBe('Pooja Kulkarni');
    expect(populated.zone_id.zone_id).toBe('Z01');
    expect(populated.zone_id.zone_name).toBe('Kopargaon Market Area');
  });

  it('should verify presence of compound index on { status: 1, "priority_score.total": -1 }', async () => {
    const indexes = WasteReport.schema.indexes();
    const hasCompoundIndex = indexes.some(
      ([fields]) => fields.status === 1 && fields['priority_score.total'] === -1
    );
    expect(hasCompoundIndex).toBe(true);

    // Verify sort query works as expected
    await WasteReport.create([
      {
        report_id: 'RPT-SORT-001',
        citizen_id: citizen._id,
        status: 'UNDER_REVIEW',
        priority_score: { total: 5.5 },
        location: { type: 'Point', coordinates: [74.465, 19.885] }
      },
      {
        report_id: 'RPT-SORT-002',
        citizen_id: citizen._id,
        status: 'UNDER_REVIEW',
        priority_score: { total: 9.1 },
        location: { type: 'Point', coordinates: [74.466, 19.886] }
      }
    ]);

    const sortedQueue = await WasteReport.find({ status: 'UNDER_REVIEW' }).sort({ 'priority_score.total': -1 });
    expect(sortedQueue[0].priority_score.total).toBe(9.1);
    expect(sortedQueue[1].priority_score.total).toBe(5.5);
  });
});
