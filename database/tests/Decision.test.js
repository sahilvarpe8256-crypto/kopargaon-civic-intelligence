const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Decision = require('../models/Decision');
const User = require('../models/User');
const WasteReport = require('../models/WasteReport');
const ResourceState = require('../models/ResourceState');

describe('Decision Model Tests', () => {
  let mongoServer;
  let officer;
  let report1;
  let report2;
  let resourceState;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        launchTimeout: 30000
      }
    });
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    await Decision.deleteMany({});
    await WasteReport.deleteMany({});
    await User.deleteMany({});
    await ResourceState.deleteMany({});

    officer = await User.create({
      role: 'officer',
      name: 'Officer Deshmukh',
      email: 'deshmukh@kopargaon.gov.in',
      phone: '9822334455',
      password_hash: 'hashedpassword'
    });

    const citizen = await User.create({
      role: 'citizen',
      name: 'Citizen Rahul',
      email: 'rahul@example.com',
      phone: '9890113355',
      password_hash: 'hashedpassword'
    });

    report1 = await WasteReport.create({
      report_id: 'RPT-DEC-001',
      citizen_id: citizen._id,
      location: { type: 'Point', coordinates: [74.465, 19.885] }
    });

    report2 = await WasteReport.create({
      report_id: 'RPT-DEC-002',
      citizen_id: citizen._id,
      location: { type: 'Point', coordinates: [74.475, 19.895] }
    });

    resourceState = await ResourceState.create({
      is_current: true,
      vehicles: [{ type: 'small_truck', total: 2, available: 2 }],
      workers_total: 10,
      workers_available: 8,
      budget_total_inr: 50000,
      budget_remaining_inr: 25000,
      time_window_hours: 8
    });
  });

  it('should successfully save an APPROVED decision', async () => {
    const approvedDecision = new Decision({
      officer_id: officer._id,
      decision_type: 'APPROVED',
      engine_recommendation: {
        engine_version: '1.0',
        selected_reports: [
          {
            report_id: 'RPT-DEC-001',
            priority_score: 8.2,
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
            report_id: 'RPT-DEC-002',
            priority_score: 5.1,
            deferral_reason: 'LOWER_PRIORITY',
            deferral_reason_detail: 'Vehicle allocated to higher priority report.'
          }
        ],
        total_cost_estimate_inr: 1200,
        total_time_estimate_hours: 2
      },
      officer_decision: {
        selected_reports: [
          {
            report_id: 'RPT-DEC-001',
            priority_score: 8.2,
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
            report_id: 'RPT-DEC-002',
            priority_score: 5.1,
            deferral_reason: 'LOWER_PRIORITY'
          }
        ]
      },
      resource_state_before: resourceState._id,
      reports_affected: [report1._id]
    });

    const saved = await approvedDecision.save();
    expect(saved._id).toBeDefined();
    expect(saved.decision_type).toBe('APPROVED');
    expect(saved.engine_recommendation.selected_reports.length).toBe(1);
    expect(saved.officer_decision.selected_reports.length).toBe(1);
  });

  it('should successfully save an OVERRIDDEN decision when override_reason is provided', async () => {
    const overriddenDecision = new Decision({
      officer_id: officer._id,
      decision_type: 'OVERRIDDEN',
      engine_recommendation: {
        selected_reports: [
          { report_id: 'RPT-DEC-001', priority_score: 8.2 }
        ],
        deferred_reports: [
          { report_id: 'RPT-DEC-002', priority_score: 5.1, deferral_reason: 'LOWER_PRIORITY' }
        ]
      },
      officer_decision: {
        selected_reports: [
          { report_id: 'RPT-DEC-002', priority_score: 5.1 }
        ],
        deferred_reports: [
          { report_id: 'RPT-DEC-001', priority_score: 8.2, deferral_reason: 'OTHER' }
        ],
        override_reason: 'School area report RPT-DEC-002 requires urgent priority before school opening hours.'
      },
      resource_state_before: resourceState._id,
      reports_affected: [report2._id]
    });

    const saved = await overriddenDecision.save();
    expect(saved._id).toBeDefined();
    expect(saved.decision_type).toBe('OVERRIDDEN');
    expect(saved.officer_decision.override_reason).toContain('School area report');
  });

  it('should reject OVERRIDDEN decision if override_reason is missing or empty', async () => {
    const missingReasonDecision = new Decision({
      officer_id: officer._id,
      decision_type: 'OVERRIDDEN',
      engine_recommendation: {
        selected_reports: [{ report_id: 'RPT-DEC-001' }]
      },
      officer_decision: {
        selected_reports: [{ report_id: 'RPT-DEC-002' }],
        override_reason: '' // Empty string is invalid
      }
    });

    let err;
    try {
      await missingReasonDecision.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors['officer_decision.override_reason']).toBeDefined();
  });

  it('should reject invalid decision_type enum', async () => {
    const badDecisionType = new Decision({
      officer_id: officer._id,
      decision_type: 'PENDING_APPROVAL', // invalid enum
      engine_recommendation: {},
      officer_decision: {}
    });

    let err;
    try {
      await badDecisionType.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.decision_type).toBeDefined();
  });

  it('should populate officer and affected reports successfully', async () => {
    const decision = await Decision.create({
      officer_id: officer._id,
      decision_type: 'APPROVED',
      engine_recommendation: { selected_reports: [] },
      officer_decision: { selected_reports: [] },
      reports_affected: [report1._id, report2._id]
    });

    const populated = await Decision.findById(decision._id)
      .populate('officer_id')
      .populate('reports_affected');

    expect(populated.officer_id.name).toBe('Officer Deshmukh');
    expect(populated.reports_affected.length).toBe(2);
    expect(populated.reports_affected[0].report_id).toBe('RPT-DEC-001');
    expect(populated.reports_affected[1].report_id).toBe('RPT-DEC-002');
  });
});
