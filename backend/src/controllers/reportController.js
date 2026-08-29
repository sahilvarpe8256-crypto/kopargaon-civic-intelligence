const mongoose = require('mongoose');
const { Complaint } = require('../models');
const AIService = require('../services/aiService');
const ZoneService = require('../services/zoneService');
const PriorityEngine = require('../services/priorityEngine');
const { STATUSES, KOPARGAON_BOUNDS } = require('../config/constants');
const logger = require('../utils/logger');

// In-memory fallback store for offline tests
const inMemoryReports = [];

class ReportController {
  static isDbConnected() {
    return mongoose.connection && mongoose.connection.readyState === 1;
  }

  /**
   * Submit a new waste complaint with photo and GPS location
   * POST /api/reports
   */
  static async createReport(req, res, next) {
    try {
      const { latitude, longitude, description, category, title } = req.body;

      if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Latitude and longitude coordinates are required.' }
        });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid coordinates provided.' }
        });
      }

      if (lat < KOPARGAON_BOUNDS.MIN_LAT || lat > KOPARGAON_BOUNDS.MAX_LAT ||
          lng < KOPARGAON_BOUNDS.MIN_LNG || lng > KOPARGAON_BOUNDS.MAX_LNG) {
        logger.warn(`Coordinates (${lat}, ${lng}) fall outside standard Kopargaon bounds.`);
      }

      // Generate formatted unique Report ID: RPT-YYYYMMDD-XXXX
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const reportId = `RPT-${dateStr}-${randomSuffix}`;

      // File handling
      let imageUrl = '';
      const images = [];
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
        images.push({
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path
        });
      } else if (req.body.imageUrl) {
        imageUrl = req.body.imageUrl;
      }

      // 1. Zone & Population Exposure Determination
      const zone = ZoneService.getZoneByCoordinates(lat, lng);
      const estimatedExposure = ZoneService.calculatePopulationExposure(zone, lat, lng);

      // 2. AI Evidence Assessment (Observational only)
      const aiObservation = await AIService.analyzeWasteImage({
        image: req.file ? req.file.path : imageUrl,
        mimetype: req.file ? req.file.mimetype : 'image/jpeg',
        description: description || ''
      });

      // 3. Deterministic Priority Engine Calculation
      const { priorityScore, priorityReasons } = PriorityEngine.calculatePriority({
        severity: aiObservation.severity,
        estimatedPopulationExposure: estimatedExposure,
        healthRisk: aiObservation.healthRisk,
        environmentalRisk: aiObservation.environmentalRisk,
        obstruction: aiObservation.obstruction
      });

      // 4. Determine initial status
      const initialStatus = aiObservation.requiresManualVerification
        ? STATUSES.MANUAL_REVIEW
        : STATUSES.UNDER_REVIEW;

      // 5. Construct Complaint object
      const complaintData = {
        reportId,
        title: title || `Waste Report near ${zone.name}`,
        description: description || '',
        category: category || 'waste_management',
        imageUrl,
        images,
        latitude: lat,
        longitude: lng,
        location: {
          address: `${zone.name}, Kopargaon`,
          type: 'Point',
          coordinates: [lng, lat]
        },
        zoneId: zone.zoneId,
        zoneName: zone.name,
        zonePopulation: zone.population,
        estimatedPopulationExposure: estimatedExposure,
        aiAnalysis: {
          wasteType: aiObservation.wasteType,
          detectedElements: aiObservation.detectedElements,
          requiresManualVerification: aiObservation.requiresManualVerification,
          confidence: aiObservation.confidence,
          notes: aiObservation.notes,
          analyzedAt: new Date()
        },
        severity: aiObservation.severity,
        healthRisk: aiObservation.healthRisk,
        environmentalRisk: aiObservation.environmentalRisk,
        obstruction: aiObservation.obstruction,
        confidence: aiObservation.confidence,
        priorityScore,
        priorityReasons,
        status: initialStatus
      };

      if (ReportController.isDbConnected()) {
        await Complaint.create(complaintData);
      } else {
        inMemoryReports.push({ ...complaintData, _id: `mem-${Date.now()}` });
      }

      return res.status(201).json({
        success: true,
        message: 'Report registered successfully and prioritized.',
        data: {
          id: reportId,
          reportId,
          status: initialStatus,
          zoneId: zone.zoneId,
          zoneName: zone.name,
          priorityScore,
          priorityReasons,
          aiAnalysis: aiObservation,
          imageUrl,
          createdAt: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get complaints list with optional filtering and sorting
   * GET /api/reports
   */
  static async getReports(req, res, next) {
    try {
      const { status, zoneId, sortBy = 'priorityScore', order = 'desc' } = req.query;

      let reports = [];
      if (ReportController.isDbConnected()) {
        const filter = {};
        if (status) filter.status = status;
        if (zoneId) filter.zoneId = zoneId;

        const sortOptions = {};
        sortOptions[sortBy] = order === 'asc' ? 1 : -1;
        reports = await Complaint.find(filter).sort(sortOptions).lean();
      } else {
        reports = [...inMemoryReports];
        if (status) reports = reports.filter(r => r.status === status);
        if (zoneId) reports = reports.filter(r => r.zoneId === zoneId);
        reports.sort((a, b) => {
          const valA = a[sortBy] || 0;
          const valB = b[sortBy] || 0;
          return order === 'asc' ? valA - valB : valB - valA;
        });
      }

      return res.status(200).json({
        success: true,
        count: reports.length,
        data: reports
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single complaint by reportId or Mongo ID
   * GET /api/reports/:id
   */
  static async getReportById(req, res, next) {
    try {
      const { id } = req.params;
      let report = null;

      if (ReportController.isDbConnected()) {
        if (id.startsWith('RPT-')) {
          report = await Complaint.findOne({ reportId: id }).lean();
        } else {
          report = await Complaint.findById(id).lean();
        }
      } else {
        report = inMemoryReports.find(r => r.reportId === id || r._id === id || r.id === id);
      }

      if (!report) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `Report with ID '${id}' not found.` }
        });
      }

      return res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update complaint status / assign resources (Officer Action)
   * PATCH /api/reports/:id/status
   */
  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, assignedResources, deferralReason, officerNotes } = req.body;

      if (!status || !Object.values(STATUSES).includes(status)) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: `Valid status required. Allowed: ${Object.values(STATUSES).join(', ')}` }
        });
      }

      const updateFields = { status };
      if (assignedResources) updateFields.assignedResources = assignedResources;
      if (deferralReason) updateFields.deferralReason = deferralReason;
      if (officerNotes) updateFields.officerNotes = officerNotes;

      let updated = null;
      if (ReportController.isDbConnected()) {
        const query = id.startsWith('RPT-') ? { reportId: id } : { _id: id };
        updated = await Complaint.findOneAndUpdate(query, updateFields, { new: true }).lean();
      } else {
        const target = inMemoryReports.find(r => r.reportId === id || r._id === id || r.id === id);
        if (target) {
          Object.assign(target, updateFields, { updatedAt: new Date() });
          updated = target;
        }
      }

      return res.status(200).json({
        success: true,
        message: `Report status updated to '${status}'.`,
        data: updated || { id, ...updateFields, updatedAt: new Date().toISOString() }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReportController;