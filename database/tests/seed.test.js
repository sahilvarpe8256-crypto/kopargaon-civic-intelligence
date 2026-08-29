const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { seedData } = require('../seed/seed');
const { User, WasteReport, Zone, ResourceState, Decision } = require('../models');

describe('Seed Script Verification Tests', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
      instance: { launchTimeout: 30000 }
    });
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it('should run seedData successfully and populate all collections', async () => {
    const result = await seedData(true);

    expect(result.usersCount).toBeGreaterThanOrEqual(6);
    expect(result.zonesCount).toBe(5);
    expect(result.reportsCount).toBe(30);

    const userCount = await User.countDocuments();
    const zoneCount = await Zone.countDocuments();
    const reportCount = await WasteReport.countDocuments();
    const resourceStateCount = await ResourceState.countDocuments();
    const decisionCount = await Decision.countDocuments();

    expect(userCount).toBe(6);
    expect(zoneCount).toBe(5);
    expect(reportCount).toBe(30);
    expect(resourceStateCount).toBe(1);
    expect(decisionCount).toBe(2);

    // Verify password hashes are encrypted and never plaintext
    const usersWithPassword = await User.find().select('+password_hash');
    for (const u of usersWithPassword) {
      expect(u.password_hash.startsWith('$2a$') || u.password_hash.startsWith('$2b$')).toBe(true);
      expect(u.password_hash).not.toBe('SecurePassword@123');
    }

    // Verify 2dsphere index compatibility on waste reports
    const nearReports = await WasteReport.find({
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [74.465, 19.883] },
          $maxDistance: 5000
        }
      }
    });
    expect(nearReports.length).toBeGreaterThan(0);
  });
});
