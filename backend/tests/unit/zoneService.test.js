const ZoneService = require('../../src/services/zoneService');

describe('Zone Service Unit Tests', () => {
  it('returns all Kopargaon prototype zones (Z01 - Z05)', () => {
    const zones = ZoneService.getZones();
    expect(zones.length).toBe(5);
    expect(zones.map(z => z.zoneId)).toEqual(['Z01', 'Z02', 'Z03', 'Z04', 'Z05']);
  });

  it('accurately resolves closest zone by GPS coordinates', () => {
    // Near Market Center: 19.8845, 74.4671
    const marketZone = ZoneService.getZoneByCoordinates(19.8844, 74.4670);
    expect(marketZone.zoneId).toBe('Z01');

    // Near Railway Station: 19.8920, 74.4750
    const stationZone = ZoneService.getZoneByCoordinates(19.8922, 74.4755);
    expect(stationZone.zoneId).toBe('Z02');
  });

  it('calculates estimated population exposure distinguishing zone demographic count', () => {
    const zones = ZoneService.getZones();
    const marketZone = zones[0]; // density 90

    const exposureNearCenter = ZoneService.calculatePopulationExposure(marketZone, 19.8845, 74.4671);
    expect(exposureNearCenter).toBe(100); // 90 + 10 = 100 (capped at 100)

    const exposureFar = ZoneService.calculatePopulationExposure(marketZone, 19.9999, 74.9999);
    expect(exposureFar).toBe(90); // base density only
  });
});