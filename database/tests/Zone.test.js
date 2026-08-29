const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Zone = require('../models/Zone');

describe('Zone Model Tests', () => {
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
    await Zone.deleteMany({});
  });

  it('should successfully create a valid Kopargaon zone', async () => {
    const validZone = new Zone({
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
    });

    const savedZone = await validZone.save();
    expect(savedZone._id).toBeDefined();
    expect(savedZone.zone_id).toBe('Z01');
    expect(savedZone.population).toBe(12000);
    expect(savedZone.boundary.type).toBe('Polygon');
    expect(savedZone.boundary.coordinates[0].length).toBe(5);
  });

  it('should reject zone without required fields', async () => {
    const emptyZone = new Zone({});
    let err;
    try {
      await emptyZone.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.zone_id).toBeDefined();
    expect(err.errors.zone_name).toBeDefined();
    expect(err.errors.population).toBeDefined();
  });

  it('should enforce unique zone_id', async () => {
    const zoneData = {
      zone_id: 'Z01',
      zone_name: 'Zone 1',
      population: 5000,
      boundary: {
        type: 'Polygon',
        coordinates: [
          [
            [74.46, 19.88],
            [74.47, 19.88],
            [74.47, 19.89],
            [74.46, 19.89],
            [74.46, 19.88]
          ]
        ]
      }
    };

    await Zone.create(zoneData);

    let err;
    try {
      await Zone.create(zoneData);
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
  });

  it('should reject unclosed polygon coordinates', async () => {
    const unclosedZone = new Zone({
      zone_id: 'Z02',
      zone_name: 'Unclosed Zone',
      population: 4000,
      boundary: {
        type: 'Polygon',
        coordinates: [
          [
            [74.46, 19.88],
            [74.47, 19.88],
            [74.47, 19.89],
            [74.46, 19.89] // Missing closing point [74.46, 19.88]
          ]
        ]
      }
    });

    let err;
    try {
      await unclosedZone.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors['boundary.coordinates']).toBeDefined();
  });

  it('should reject negative population', async () => {
    const invalidPopZone = new Zone({
      zone_id: 'Z03',
      zone_name: 'Negative Pop Zone',
      population: -500,
      boundary: {
        type: 'Polygon',
        coordinates: [
          [
            [74.46, 19.88],
            [74.47, 19.88],
            [74.47, 19.89],
            [74.46, 19.89],
            [74.46, 19.88]
          ]
        ]
      }
    });

    let err;
    try {
      await invalidPopZone.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.population).toBeDefined();
  });

  it('should support geospatial point-in-polygon queries ($geoIntersects)', async () => {
    await Zone.create({
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

    // Ensure 2dsphere indexes are built
    await Zone.ensureIndexes();

    // Query point inside the polygon
    const match = await Zone.findOne({
      boundary: {
        $geoIntersects: {
          $geometry: {
            type: 'Point',
            coordinates: [74.4650, 19.8850]
          }
        }
      }
    });

    expect(match).not.toBeNull();
    expect(match.zone_id).toBe('Z01');

    // Query point outside the polygon
    const noMatch = await Zone.findOne({
      boundary: {
        $geoIntersects: {
          $geometry: {
            type: 'Point',
            coordinates: [74.5000, 19.9500]
          }
        }
      }
    });

    expect(noMatch).toBeNull();
  });
});
