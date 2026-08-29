const mongoose = require('mongoose');
const User = require('../../src/models/User');
const Zone = require('../../src/models/Zone');
const WasteReport = require('../../src/models/WasteReport');
const ResourceState = require('../../src/models/ResourceState');
const Decision = require('../../src/models/Decision');

const validateDoc = async (doc) => {
  try {
    await doc.validate();
    return null;
  } catch (error) {
    return error;
  }
};

describe('Mongoose Models Schema Validation Unit Tests', () => {
  describe('1. User Model', () => {
    it('validates a correct user document with defaults', async () => {
      const user = new User({
        name: 'Suresh Patil',
        email: 'suresh.patil@example.com',
        phone: '9876543210'
      });

      const err = await validateDoc(user);
      expect(err).toBeNull();
      expect(user.role).toBe('citizen');
      expect(user.isActive).toBe(true);
    });

    it('rejects missing required fields (name, email)', async () => {
      const user = new User({});
      const err = await validateDoc(user);

      expect(err).not.toBeNull();
      expect(err.errors.name).toBeDefined();
      expect(err.errors.email).toBeDefined();
    });

    it('rejects invalid email format', async () => {
      const user = new User({
        name: 'Invalid Email User',
        email: 'invalid-email-address'
      });
      const err = await validateDoc(user);

      expect(err).not.toBeNull();
      expect(err.errors.email).toBeDefined();
    });

    it('rejects invalid role value', async () => {
      const user = new User({
        name: 'Invalid Role User',
        email: 'user@example.com',
        role: 'superadmin'
      });
      const err = await validateDoc(user);

      expect(err).not.toBeNull();
      expect(err.errors.role).toBeDefined();
    });
  });

  describe('2. Zone Model', () => {
    it('validates a correct zone document', async () => {
      const zone = new Zone({
        name: 'Kopargaon Market Area',
        code: 'Z01',
        description: 'Main commercial hub',
        populationEstimate: 12000
      });

      const err = await validateDoc(zone);
      expect(err).toBeNull();
      expect(zone.status).toBe('active');
      expect(zone.code).toBe('Z01');
    });

    it('rejects missing required fields (name, code)', async () => {
      const zone = new Zone({});
      const err = await validateDoc(zone);

      expect(err).not.toBeNull();
      expect(err.errors.name).toBeDefined();
      expect(err.errors.code).toBeDefined();
    });

    it('rejects negative population estimate', async () => {
      const zone = new Zone({
        name: 'Zone Negative',
        code: 'Z99',
        populationEstimate: -500
      });
      const err = await validateDoc(zone);

      expect(err).not.toBeNull();
      expect(err.errors.populationEstimate).toBeDefined();
    });

    it('rejects invalid status value', async () => {
      const zone = new Zone({
        name: 'Zone Invalid Status',
        code: 'Z98',
        status: 'archived'
      });
      const err = await validateDoc(zone);

      expect(err).not.toBeNull();
      expect(err.errors.status).toBeDefined();
    });
  });

  describe('3. WasteReport Model', () => {
    it('validates a correct waste report document', async () => {
      const report = new WasteReport({
        title: 'Overflowing dumpster near bus stand',
        description: 'Trash is spilling over onto the main walkway.',
        category: 'overflowing_bin',
        severity: 'high',
        location: {
          address: 'Station Road, Kopargaon',
          latitude: 19.8845,
          longitude: 74.4671
        },
        zone: new mongoose.Types.ObjectId(),
        reportedBy: new mongoose.Types.ObjectId()
      });

      const err = await validateDoc(report);
      expect(err).toBeNull();
      expect(report.status).toBe('reported');
      expect(report.reportedAt).toBeDefined();
    });

    it('rejects missing required fields (title, description, category, location, reportedBy)', async () => {
      const report = new WasteReport({});
      const err = await validateDoc(report);

      expect(err).not.toBeNull();
      expect(err.errors.title).toBeDefined();
      expect(err.errors.description).toBeDefined();
      expect(err.errors.category).toBeDefined();
      expect(err.errors.location).toBeDefined();
      expect(err.errors.reportedBy).toBeDefined();
    });

    it('rejects missing address inside location object', async () => {
      const report = new WasteReport({
        title: 'Valid Title Here',
        description: 'Valid Description text here',
        category: 'overflowing_bin',
        location: {},
        reportedBy: new mongoose.Types.ObjectId()
      });
      const err = await validateDoc(report);

      expect(err).not.toBeNull();
      expect(err.errors['location.address']).toBeDefined();
    });

    it('rejects invalid category', async () => {
      const report = new WasteReport({
        title: 'Valid Title',
        description: 'Valid Description with enough length',
        category: 'noise_complaint',
        location: { address: 'Main Street' },
        reportedBy: new mongoose.Types.ObjectId()
      });
      const err = await validateDoc(report);

      expect(err).not.toBeNull();
      expect(err.errors.category).toBeDefined();
    });

    it('rejects invalid severity level', async () => {
      const report = new WasteReport({
        title: 'Valid Title',
        description: 'Valid Description with enough length',
        category: 'illegal_dumping',
        severity: 'catastrophic',
        location: { address: 'Main Street' },
        reportedBy: new mongoose.Types.ObjectId()
      });
      const err = await validateDoc(report);

      expect(err).not.toBeNull();
      expect(err.errors.severity).toBeDefined();
    });

    it('rejects invalid report status', async () => {
      const report = new WasteReport({
        title: 'Valid Title',
        description: 'Valid Description with enough length',
        category: 'illegal_dumping',
        status: 'pending_approval',
        location: { address: 'Main Street' },
        reportedBy: new mongoose.Types.ObjectId()
      });
      const err = await validateDoc(report);

      expect(err).not.toBeNull();
      expect(err.errors.status).toBeDefined();
    });
  });

  describe('4. ResourceState Model', () => {
    it('validates a correct resource state document', async () => {
      const resourceState = new ResourceState({
        zone: new mongoose.Types.ObjectId(),
        availableStaff: 12,
        availableVehicles: 4,
        availableBudget: 25000,
        dailyCapacity: 40,
        status: 'available'
      });

      const err = await validateDoc(resourceState);
      expect(err).toBeNull();
      expect(resourceState.lastUpdated).toBeDefined();
    });

    it('rejects missing required zone reference', async () => {
      const resourceState = new ResourceState({
        availableStaff: 5,
        availableVehicles: 2,
        availableBudget: 10000,
        dailyCapacity: 20
      });
      const err = await validateDoc(resourceState);

      expect(err).not.toBeNull();
      expect(err.errors.zone).toBeDefined();
    });

    it('rejects negative staff, vehicles, budget, or daily capacity', async () => {
      const resourceState = new ResourceState({
        zone: new mongoose.Types.ObjectId(),
        availableStaff: -1,
        availableVehicles: -2,
        availableBudget: -500,
        dailyCapacity: -10
      });
      const err = await validateDoc(resourceState);

      expect(err).not.toBeNull();
      expect(err.errors.availableStaff).toBeDefined();
      expect(err.errors.availableVehicles).toBeDefined();
      expect(err.errors.availableBudget).toBeDefined();
      expect(err.errors.dailyCapacity).toBeDefined();
    });

    it('rejects invalid status', async () => {
      const resourceState = new ResourceState({
        zone: new mongoose.Types.ObjectId(),
        availableStaff: 5,
        availableVehicles: 2,
        availableBudget: 10000,
        dailyCapacity: 20,
        status: 'overloaded'
      });
      const err = await validateDoc(resourceState);

      expect(err).not.toBeNull();
      expect(err.errors.status).toBeDefined();
    });
  });

  describe('5. Decision Model', () => {
    it('validates a correct decision document', async () => {
      const decision = new Decision({
        report: new mongoose.Types.ObjectId(),
        decisionType: 'prioritize',
        status: 'approved',
        priorityRank: 1,
        score: 8.75,
        factors: {
          severity: 8,
          publicImpact: 9,
          healthRisk: 8.5,
          environmentalRisk: 7,
          dataConfidence: 0.92
        },
        explanation: 'High severity accumulation adjacent to public school requires immediate dispatch.',
        resourcesAllocated: {
          staff: 4,
          vehicles: 1,
          budget: 1500,
          estimatedHours: 2.5
        }
      });

      const err = await validateDoc(decision);
      expect(err).toBeNull();
      expect(decision.decidedAt).toBeDefined();
    });

    it('rejects missing required fields (report, decisionType, explanation)', async () => {
      const decision = new Decision({});
      const err = await validateDoc(decision);

      expect(err).not.toBeNull();
      expect(err.errors.report).toBeDefined();
      expect(err.errors.decisionType).toBeDefined();
      expect(err.errors.explanation).toBeDefined();
    });

    it('rejects invalid decisionType', async () => {
      const decision = new Decision({
        report: new mongoose.Types.ObjectId(),
        decisionType: 'ignore',
        explanation: 'Valid explanation string'
      });
      const err = await validateDoc(decision);

      expect(err).not.toBeNull();
      expect(err.errors.decisionType).toBeDefined();
    });

    it('rejects invalid status', async () => {
      const decision = new Decision({
        report: new mongoose.Types.ObjectId(),
        decisionType: 'defer',
        status: 'closed',
        explanation: 'Valid explanation string'
      });
      const err = await validateDoc(decision);

      expect(err).not.toBeNull();
      expect(err.errors.status).toBeDefined();
    });

    it('rejects negative score or rank', async () => {
      const decision = new Decision({
        report: new mongoose.Types.ObjectId(),
        decisionType: 'allocate',
        priorityRank: 0,
        score: -5,
        explanation: 'Valid explanation string'
      });
      const err = await validateDoc(decision);

      expect(err).not.toBeNull();
      expect(err.errors.priorityRank).toBeDefined();
      expect(err.errors.score).toBeDefined();
    });

    it('rejects negative resource allocation quantities', async () => {
      const decision = new Decision({
        report: new mongoose.Types.ObjectId(),
        decisionType: 'allocate',
        explanation: 'Valid explanation string',
        resourcesAllocated: {
          staff: -2,
          vehicles: -1,
          budget: -100,
          estimatedHours: -3
        }
      });
      const err = await validateDoc(decision);

      expect(err).not.toBeNull();
      expect(err.errors['resourcesAllocated.staff']).toBeDefined();
      expect(err.errors['resourcesAllocated.vehicles']).toBeDefined();
      expect(err.errors['resourcesAllocated.budget']).toBeDefined();
      expect(err.errors['resourcesAllocated.estimatedHours']).toBeDefined();
    });
  });
});