const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const ResourceState = require('../models/ResourceState');
const User = require('../models/User');

describe('ResourceState Model Tests', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await ResourceState.deleteMany({});
    await User.deleteMany({});
  });

  it('should successfully create a valid ResourceState document', async () => {
    const officer = await User.create({
      role: 'officer',
      name: 'Supervisor Shinde',
      email: 'shinde@kopargaon.gov.in',
      phone: '9822114455',
      password_hash: 'hashedpassword'
    });

    const validState = new ResourceState({
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
      last_updated_by: officer._id
    });

    const savedState = await validState.save();
    expect(savedState._id).toBeDefined();
    expect(savedState.is_current).toBe(true);
    expect(savedState.vehicles.length).toBe(3);
    expect(savedState.workers_available).toBe(12);
    expect(savedState.budget_remaining_inr).toBe(25000);
    expect(savedState.last_updated_by.toString()).toBe(officer._id.toString());
  });

  it('should reject when workers_available exceeds workers_total', async () => {
    const invalidState = new ResourceState({
      vehicles: [{ type: 'small_truck', total: 2, available: 2 }],
      workers_total: 10,
      workers_available: 15, // Invalid: 15 > 10
      budget_total_inr: 50000,
      budget_remaining_inr: 25000,
      time_window_hours: 8
    });

    let err;
    try {
      await invalidState.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.workers_available).toBeDefined();
  });

  it('should reject when budget_remaining_inr exceeds budget_total_inr', async () => {
    const invalidState = new ResourceState({
      vehicles: [{ type: 'small_truck', total: 2, available: 2 }],
      workers_total: 10,
      workers_available: 8,
      budget_total_inr: 20000,
      budget_remaining_inr: 25000, // Invalid: 25000 > 20000
      time_window_hours: 8
    });

    let err;
    try {
      await invalidState.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.budget_remaining_inr).toBeDefined();
  });

  it('should reject when vehicle available count exceeds total count', async () => {
    const invalidState = new ResourceState({
      vehicles: [{ type: 'large_truck', total: 1, available: 3 }], // Invalid: 3 > 1
      workers_total: 10,
      workers_available: 8,
      budget_total_inr: 50000,
      budget_remaining_inr: 25000,
      time_window_hours: 8
    });

    let err;
    try {
      await invalidState.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
  });

  it('should reject negative values for workers and budget', async () => {
    const negativeState = new ResourceState({
      vehicles: [{ type: 'large_truck', total: -1, available: -1 }],
      workers_total: -5,
      workers_available: -5,
      budget_total_inr: -1000,
      budget_remaining_inr: -500,
      time_window_hours: -2
    });

    let err;
    try {
      await negativeState.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
  });

  it('should reject invalid vehicle type enum', async () => {
    const badVehicleState = new ResourceState({
      vehicles: [{ type: 'airplane', total: 1, available: 1 }],
      workers_total: 10,
      workers_available: 8,
      budget_total_inr: 50000,
      budget_remaining_inr: 25000,
      time_window_hours: 8
    });

    let err;
    try {
      await badVehicleState.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
  });
});
