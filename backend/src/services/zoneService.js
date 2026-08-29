/**
 * Zone & Population Exposure Intelligence Service
 * 
 * Provides geospatial zone lookup and estimated population exposure calculation.
 * Note: Zone demographics for Kopargaon are simulated for the hackathon prototype.
 */
class ZoneService {
  /**
   * Predefined Kopargaon Municipal Zones (Simulated Prototype Wards)
   */
  static getZones() {
    return [
      {
        zoneId: 'Z01',
        name: 'Kopargaon Market & Commercial Hub',
        population: 12000,
        densityScore: 90,
        landmarks: ['Main Bazaar', 'Fish & Veg Market', 'Town Bus Stand'],
        center: { lat: 19.8845, lng: 74.4671 }
      },
      {
        zoneId: 'Z02',
        name: 'Kopargaon Railway Station Area',
        population: 9500,
        densityScore: 80,
        landmarks: ['Station Road', 'Auto Stand', 'Transit Goods Shed'],
        center: { lat: 19.8920, lng: 74.4750 }
      },
      {
        zoneId: 'Z03',
        name: 'Old Town / Peth Area',
        population: 8200,
        densityScore: 70,
        landmarks: ['Godavari Ghat Approach', 'Old Municipal Building', 'Temples'],
        center: { lat: 19.8790, lng: 74.4610 }
      },
      {
        zoneId: 'Z04',
        name: 'New Residential Colony / Shivaji Nagar',
        population: 6800,
        densityScore: 50,
        landmarks: ['School Complex', 'Residential Sector 1-4', 'Community Hall'],
        center: { lat: 19.8710, lng: 74.4800 }
      },
      {
        zoneId: 'Z05',
        name: 'Industrial & Outskirts Zone',
        population: 4100,
        densityScore: 30,
        landmarks: ['Sugar Factory Approach', 'Warehousing Hub', 'Highway Bypass'],
        center: { lat: 19.8600, lng: 74.4500 }
      }
    ];
  }

  /**
   * Determine zone from GPS coordinates by finding nearest zone center
   * @param {number} lat 
   * @param {number} lng 
   * @returns {Object} Zone details
   */
  static getZoneByCoordinates(lat, lng) {
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      return this.getZones()[0]; // Default to Z01 if coordinates missing
    }

    const zones = this.getZones();
    let closestZone = zones[0];
    let minDistance = Infinity;

    for (const zone of zones) {
      const dLat = lat - zone.center.lat;
      const dLng = lng - zone.center.lng;
      const distSq = dLat * dLat + dLng * dLng;

      if (distSq < minDistance) {
        minDistance = distSq;
        closestZone = zone;
      }
    }

    return closestZone;
  }

  /**
   * Calculate Estimated Population Exposure (0 - 100)
   * Distinguishes total ward demographic count from local exposure intensity.
   * @param {Object} zone 
   * @param {number} lat 
   * @param {number} lng 
   * @returns {number} 0 to 100
   */
  static calculatePopulationExposure(zone, lat, lng) {
    const baseDensity = zone.densityScore || 50;
    // Calculate proximity factor (closer to zone center = higher exposure)
    let proximityModifier = 0;
    if (zone.center && typeof lat === 'number' && typeof lng === 'number') {
      const dLat = Math.abs(lat - zone.center.lat);
      const dLng = Math.abs(lng - zone.center.lng);
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      // If within 0.01 deg (~1.1 km), boost exposure
      if (dist < 0.01) {
        proximityModifier = 10;
      }
    }

    const rawExposure = baseDensity + proximityModifier;
    return Math.max(0, Math.min(100, rawExposure));
  }
}

module.exports = ZoneService;