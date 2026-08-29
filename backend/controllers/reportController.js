import mongoose from 'mongoose';
import WasteReport from '../models/WasteReport.js';
import { analyzeImageEvidence } from '../services/aiEvidenceService.js';
import { calculateDeterministicPriority } from '../services/priorityEngineService.js';
import { findDuplicatesForReport } from '../services/duplicateClusterService.js';
import { SEED_REPORTS } from '../config/db.js';

let inMemoryReports = JSON.parse(JSON.stringify(SEED_REPORTS));

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

export async function createReport(req, res) {
  try {
    const {
      wasteType = 'Illegal Dumping',
      category = 'Waste',
      severity = 'Medium',
      description = '',
      indicators = [],
      latitude = 19.8845,
      longitude = 74.4682,
      area = 'Station Road, Kopargaon',
      address = '',
      zone = 'Zone Z01'
    } = req.body;

    const parsedIndicators = Array.isArray(indicators) 
      ? indicators 
      : typeof indicators === 'string' 
      ? JSON.parse(indicators || '[]') 
      : [];

    const photos = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((f) => {
        photos.push({
          name: f.filename,
          original_name: f.originalname,
          url: `/api/uploads/${f.filename}`,
          mimetype: f.mimetype,
          size: f.size,
          uploaded_at: new Date()
        });
      });
    } else if (req.body.photos && Array.isArray(req.body.photos)) {
      req.body.photos.forEach((p) => {
        photos.push({
          name: p.name || 'citizen_evidence.jpg',
          url: p.preview || '',
          size: p.size || 102400
        });
      });
    }

    const aiEvidence = await analyzeImageEvidence({
      citizenDescription: description,
      wasteType,
      severity,
      indicators: parsedIndicators
    });

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const reportId = `KOP-${randomSuffix}`;

    const priorityResult = calculateDeterministicPriority({
      severity,
      ai_analysis: aiEvidence,
      indicators: parsedIndicators,
      submitted_at: new Date()
    });

    const newReportData = {
      report_id: reportId,
      id: reportId,
      citizen_id: req.user?._id || req.user?.id || null,
      citizen_name: req.user?.name || 'Citizen (Kopargaon Resident)',
      category: category || 'Waste',
      issue: `${wasteType} — ${area.split(',')[0]}`,
      title: wasteType,
      wasteType,
      severity,
      priority: priorityResult.level,
      priorityScore: priorityResult.score,
      status: 'SUBMITTED',
      description,
      location: {
        area,
        address: address || area,
        zone: zone || 'Zone Z01',
        latitude: parseFloat(latitude) || 19.8845,
        longitude: parseFloat(longitude) || 74.4682,
        isGps: Boolean(req.body.isGps)
      },
      indicators: parsedIndicators,
      photos,
      evidence: photos.map((p) => ({
        name: p.name,
        description: 'Citizen verified photo evidence',
        time: 'Just now'
      })),
      ai_analysis: aiEvidence,
      aiAssessment: {
        score: priorityResult.score,
        level: priorityResult.level,
        confidence: Math.round(aiEvidence.evidence_confidence * 100),
        severityLabel: aiEvidence.visible_severity || severity,
        wasteType: aiEvidence.waste_type || wasteType,
        estimatedUrgency: priorityResult.level === 'CRITICAL' ? 'Immediate attention' : 'Scheduled clearance',
        recommendedResponse: priorityResult.recommendedResponse,
        reasoning: [
          `AI analyzed ${aiEvidence.waste_type} evidence with ${Math.round(aiEvidence.evidence_confidence * 100)}% confidence`,
          `${parsedIndicators.length} risk indicators reported by citizen`,
          `Assessed in municipal sector ${zone || 'Zone Z01'}`
        ],
        factors: priorityResult.factors
      },
      aiConfidence: Math.round(aiEvidence.evidence_confidence * 100),
      similarReports: 1,
      supportingReports: 1,
      supportingReportIds: [reportId],
      timeline: [
        {
          stage: 'submitted',
          title: 'Citizen Report Submitted',
          description: 'Report logged with GPS coordinates and verified photo evidence.',
          timestamp: new Date(),
          actor: req.user?.name || 'Citizen'
        },
        {
          stage: 'ai',
          title: 'AI Vision Assessment Completed',
          description: `Evidence verified with ${Math.round(aiEvidence.evidence_confidence * 100)}% confidence. Priority score: ${priorityResult.score}/100.`,
          timestamp: new Date(),
          actor: 'AI Civic Engine'
        }
      ],
      age: 'Just now',
      submitted_at: new Date(),
      submittedAt: new Date()
    };

    // Duplicate check
    const duplicates = findDuplicatesForReport(newReportData, inMemoryReports);
    if (duplicates.length > 0) {
      newReportData.similarReports = duplicates.length + 1;
      newReportData.supportingReports = duplicates.length + 1;
      newReportData.supportingReportIds = [reportId, ...duplicates.map(d => d.report_id)];
    }

    if (isDbConnected()) {
      try {
        const savedDoc = await WasteReport.create(newReportData);
        inMemoryReports.unshift(savedDoc);
        return res.status(201).json({
          success: true,
          message: 'Report submitted successfully.',
          report_id: savedDoc.report_id,
          report: savedDoc
        });
      } catch (err) {}
    }

    inMemoryReports.unshift(newReportData);
    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully.',
      report_id: newReportData.report_id,
      report: newReportData
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    });
  }
}

export async function getReportById(req, res) {
  try {
    const { reportId } = req.params;
    if (!reportId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Report ID is required.' }
      });
    }

    const cleanId = String(reportId).trim().toUpperCase();
    const numericPart = cleanId.replace(/\D/g, '');

    if (isDbConnected()) {
      try {
        const found = await WasteReport.findOne({
          $or: [
            { report_id: cleanId },
            { id: cleanId },
            { alias_id: cleanId },
            { report_id: new RegExp(numericPart, 'i') },
            { supportingReportIds: cleanId }
          ]
        });
        if (found) return res.json({ success: true, report: found });
      } catch (err) {}
    }

    const found = inMemoryReports.find(r => {
      const rId = String(r.report_id || r.id || '').toUpperCase();
      const alias = String(r.alias_id || '').toUpperCase();
      const rNumeric = rId.replace(/\D/g, '');
      return (
        rId === cleanId ||
        alias === cleanId ||
        (numericPart && rNumeric && numericPart === rNumeric) ||
        (r.supportingReportIds && r.supportingReportIds.some(sid => sid.toUpperCase() === cleanId))
      );
    });

    if (found) {
      return res.json({ success: true, report: found });
    }

    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Report with ID "${reportId}" was not found.` }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    });
  }
}

export async function getReportStatus(req, res) {
  try {
    const { reportId } = req.params;
    const cleanId = String(reportId).trim().toUpperCase();

    let report = inMemoryReports.find(r => (r.report_id || r.id) === cleanId);
    if (isDbConnected()) {
      try {
        const found = await WasteReport.findOne({ $or: [{ report_id: cleanId }, { id: cleanId }] });
        if (found) report = found;
      } catch (err) {}
    }

    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Report ID not found' }
      });
    }

    return res.json({
      success: true,
      report_id: report.report_id || report.id,
      status: report.status || 'PENDING',
      zone_name: report.location?.zone || 'Zone Z01',
      category: report.category || 'Waste',
      submitted_at: report.submitted_at || report.submittedAt,
      priority: report.priority,
      assigned_team: report.assignedTeam,
      timeline: report.timeline
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    });
  }
}

export async function getMyReports(req, res) {
  try {
    let reports = inMemoryReports;
    if (isDbConnected()) {
      try {
        const userId = req.user?._id || req.user?.id;
        let dbList = [];
        if (userId) {
          dbList = await WasteReport.find({ citizen_id: userId }).sort({ submitted_at: -1 });
        }
        if (!dbList || dbList.length === 0) {
          dbList = await WasteReport.find().sort({ submitted_at: -1 }).limit(10);
        }
        if (dbList && dbList.length > 0) reports = dbList;
      } catch (err) {}
    }

    return res.json({
      success: true,
      reports,
      total: reports.length
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    });
  }
}

export async function submitFeedback(req, res) {
  try {
    const { reportId } = req.params;
    const { rating, comment, citizenName } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Rating must be between 1 and 5 stars.' }
      });
    }

    const cleanId = String(reportId).trim().toUpperCase();
    const feedbackObj = {
      rating: Number(rating),
      comment: (comment || '').trim().slice(0, 500),
      submittedAt: new Date(),
      citizenName: citizenName || req.user?.name || 'Kopargaon Resident'
    };

    const timelineEntry = {
      stage: 'feedback',
      title: `Citizen Feedback Submitted (Rating: ${rating}★)`,
      description: comment ? `"${comment}"` : 'Citizen confirmed issue resolution.',
      timestamp: new Date(),
      actor: feedbackObj.citizenName
    };

    let updated = null;
    if (isDbConnected()) {
      try {
        updated = await WasteReport.findOneAndUpdate(
          { $or: [{ report_id: cleanId }, { id: cleanId }] },
          {
            $set: { feedback: feedbackObj, updated_at: new Date() },
            $push: { timeline: timelineEntry }
          },
          { new: true }
        );
      } catch (err) {}
    }

    const idx = inMemoryReports.findIndex(r => (r.report_id || r.id) === cleanId);
    if (idx !== -1) {
      inMemoryReports[idx].feedback = feedbackObj;
      inMemoryReports[idx].timeline = [...(inMemoryReports[idx].timeline || []), timelineEntry];
      updated = inMemoryReports[idx];
    }

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Report "${reportId}" not found.` }
      });
    }

    return res.json({
      success: true,
      message: 'Thank you for your feedback! Your rating has been recorded.',
      feedback: feedbackObj,
      report: updated
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    });
  }
}

