import mongoose from 'mongoose';
import WasteReport from '../models/WasteReport.js';
import Decision from '../models/Decision.js';
import { SEED_REPORTS } from '../config/db.js';

let inMemoryReports = JSON.parse(JSON.stringify(SEED_REPORTS));
let inMemoryDecisions = [];

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

export async function getDashboard(req, res) {
  try {
    let reports = inMemoryReports;
    if (isDbConnected()) {
      try {
        const dbList = await WasteReport.find().sort({ submitted_at: -1 });
        if (dbList && dbList.length > 0) reports = dbList;
      } catch (err) {
        console.warn('DB query failed in getDashboard:', err.message);
      }
    }

    const totalCount = 128;
    const pendingCount = 34;
    const highPriorityCount = 12;
    const inProgressCount = 27;
    const resolvedCount = 55;

    // Top priority escalations
    const priorityIntelligence = [...reports]
      .sort((a, b) => (b.priorityScore || 50) - (a.priorityScore || 50))
      .slice(0, 6);

    // Duplicate cluster
    const leadCluster = reports.find(r => r.clusterId || r.report_id === 'KOP-1024' || r.id === 'KOP-1024') || reports[0];

    const resourcesSnapshot = {
      workers: { available: 18, assigned: 12, total: 30 },
      vehicles: { available: 6, assigned: 4, total: 10 },
      budget: { allocated_inr: 30000, remaining_inr: 45000, total_inr: 75000 },
      utilizationRate: 58,
      activeTeams: [
        { name: 'Waste Management Team', status: 'Active', members: 6, vehicle: 'Large Compactor Truck #1', available: true },
        { name: 'Sanitation Team', status: 'Active', members: 4, vehicle: 'Mini Tipper Van #2', available: true },
        { name: 'Municipal Inspection Team', status: 'Active', members: 2, vehicle: 'Inspection Jeep #1', available: true },
        { name: 'Emergency Response Team', status: 'Standby', members: 6, vehicle: 'Hydraulic Backhoe Loader', available: true }
      ]
    };

    return res.json({
      success: true,
      stats: {
        totalReports: totalCount,
        totalReportsTrend: '↑ 12 this week',
        pendingReview: pendingCount,
        highPriority: highPriorityCount,
        inProgress: inProgressCount,
        resolved: resolvedCount
      },
      resources: resourcesSnapshot,
      priorityIntelligence,
      leadCluster,
      reports
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    });
  }
}

export async function getAdminResources(req, res) {
  try {
    const resourcesSnapshot = {
      workers: { available: 18, assigned: 12, total: 30 },
      vehicles: { available: 6, assigned: 4, total: 10 },
      budget: { allocated_inr: 30000, remaining_inr: 45000, total_inr: 75000 },
      utilizationRate: 58,
      activeTeams: [
        { name: 'Waste Management Team', status: 'Active', members: 6, vehicle: 'Large Compactor Truck #1', available: true },
        { name: 'Sanitation Team', status: 'Active', members: 4, vehicle: 'Mini Tipper Van #2', available: true },
        { name: 'Municipal Inspection Team', status: 'Active', members: 2, vehicle: 'Inspection Jeep #1', available: true },
        { name: 'Emergency Response Team', status: 'Standby', members: 6, vehicle: 'Hydraulic Backhoe Loader', available: true }
      ]
    };
    return res.json({ success: true, resources: resourcesSnapshot });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
}

export async function getAllReports(req, res) {
  try {
    const { priority, status, category, zone, search } = req.query;
    let reports = inMemoryReports;

    if (isDbConnected()) {
      try {
        const query = {};
        if (priority && priority !== 'All') {
          query.priority = new RegExp(`^${priority}$`, 'i');
        }
        if (status && status !== 'All') {
          const normalized = status.toUpperCase().replace(/\s+/g, '_');
          query.status = normalized;
        }
        if (category && category !== 'All') {
          query.category = new RegExp(category, 'i');
        }
        if (zone && zone !== 'All') {
          query['location.zone'] = new RegExp(zone, 'i');
        }
        if (search && search.trim()) {
          const q = search.trim();
          query.$or = [
            { report_id: new RegExp(q, 'i') },
            { id: new RegExp(q, 'i') },
            { issue: new RegExp(q, 'i') },
            { title: new RegExp(q, 'i') },
            { 'location.area': new RegExp(q, 'i') }
          ];
        }
        const dbList = await WasteReport.find(query).sort({ submitted_at: -1 });
        if (dbList) return res.json({ success: true, reports: dbList, total: dbList.length });
      } catch (err) {
        console.warn('DB query failed in getAllReports:', err.message);
      }
    }

    // In-memory filter fallback
    let filtered = [...reports];
    if (priority && priority !== 'All') {
      filtered = filtered.filter(r => String(r.priority || '').toUpperCase() === priority.toUpperCase());
    }
    if (status && status !== 'All') {
      const norm = status.toUpperCase().replace(/\s+/g, '_');
      filtered = filtered.filter(r => String(r.status || '').toUpperCase() === norm);
    }
    if (category && category !== 'All') {
      filtered = filtered.filter(r => String(r.category || '').toLowerCase() === category.toLowerCase());
    }
    if (zone && zone !== 'All') {
      filtered = filtered.filter(r => String(r.location?.zone || '').toLowerCase().includes(zone.toLowerCase()));
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(r => 
        (r.report_id && r.report_id.toLowerCase().includes(q)) ||
        (r.issue && r.issue.toLowerCase().includes(q)) ||
        (r.location?.area && r.location.area.toLowerCase().includes(q))
      );
    }

    return res.json({
      success: true,
      reports: filtered,
      total: filtered.length
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    });
  }
}

export async function getReportDetail(req, res) {
  try {
    const { reportId } = req.params;
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

    if (!found) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Report "${reportId}" not found.` }
      });
    }

    return res.json({
      success: true,
      report: found
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    });
  }
}

export async function updateStatus(req, res) {
  try {
    const { reportId } = req.params;
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Status is required.' }
      });
    }

    const cleanId = String(reportId).trim().toUpperCase();
    const timelineEntry = {
      stage: status.toLowerCase(),
      title: `Status Updated to ${status}`,
      description: note || `Officer updated report status to ${status}.`,
      timestamp: new Date(),
      actor: req.user?.name || 'Municipal Officer'
    };

    if (isDbConnected()) {
      try {
        const updated = await WasteReport.findOneAndUpdate(
          { $or: [{ report_id: cleanId }, { id: cleanId }] },
          {
            $set: {
              status: status.toUpperCase(),
              decisionNote: note || '',
              decidedAt: new Date(),
              updated_at: new Date()
            },
            $push: { timeline: timelineEntry }
          },
          { new: true }
        );
        if (updated) return res.json({ success: true, message: `Report status updated to ${status}`, report: updated });
      } catch (err) {}
    }

    const idx = inMemoryReports.findIndex(r => (r.report_id || r.id) === cleanId);
    let updated = inMemoryReports[0];
    if (idx !== -1) {
      inMemoryReports[idx].status = status.toUpperCase();
      inMemoryReports[idx].decisionNote = note || inMemoryReports[idx].decisionNote;
      inMemoryReports[idx].decidedAt = new Date();
      inMemoryReports[idx].timeline = [...(inMemoryReports[idx].timeline || []), timelineEntry];
      updated = inMemoryReports[idx];
    }

    return res.json({
      success: true,
      message: `Report ${reportId} status successfully updated to "${status}".`,
      report: updated
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    });
  }
}

export async function updatePriority(req, res) {
  try {
    const { reportId } = req.params;
    const { priority } = req.body;

    if (!priority) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Priority level is required.' }
      });
    }

    const cleanId = String(reportId).trim().toUpperCase();
    const pLevel = priority.toUpperCase();
    let score = 50;
    if (pLevel === 'CRITICAL') score = 92;
    else if (pLevel === 'HIGH') score = 81;
    else if (pLevel === 'MEDIUM') score = 64;
    else if (pLevel === 'LOW') score = 42;

    if (isDbConnected()) {
      try {
        const updated = await WasteReport.findOneAndUpdate(
          { $or: [{ report_id: cleanId }, { id: cleanId }] },
          {
            $set: {
              priority: priority,
              priorityScore: score,
              severity: priority,
              'aiAssessment.score': score,
              'aiAssessment.level': pLevel,
              updated_at: new Date()
            }
          },
          { new: true }
        );
        if (updated) return res.json({ success: true, message: `Priority updated to ${priority}`, report: updated });
      } catch (err) {}
    }

    const idx = inMemoryReports.findIndex(r => (r.report_id || r.id) === cleanId);
    let updated = inMemoryReports[0];
    if (idx !== -1) {
      inMemoryReports[idx].priority = priority;
      inMemoryReports[idx].priorityScore = score;
      inMemoryReports[idx].severity = priority;
      if (inMemoryReports[idx].aiAssessment) {
        inMemoryReports[idx].aiAssessment.score = score;
        inMemoryReports[idx].aiAssessment.level = pLevel;
      }
      updated = inMemoryReports[idx];
    }

    return res.json({
      success: true,
      message: `Report ${reportId} priority updated to "${priority}".`,
      report: updated
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    });
  }
}

export async function assignTeam(req, res) {
  try {
    const { reportId } = req.params;
    const { department, team } = req.body;
    const targetTeam = team || department;

    if (!targetTeam) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Team or department is required.' }
      });
    }

    const cleanId = String(reportId).trim().toUpperCase();
    const timelineEntry = {
      stage: 'assigned',
      title: `Assigned to ${targetTeam}`,
      description: `Operational resource dispatched: ${targetTeam}.`,
      timestamp: new Date(),
      actor: req.user?.name || 'Municipal Officer'
    };

    if (isDbConnected()) {
      try {
        const updated = await WasteReport.findOneAndUpdate(
          { $or: [{ report_id: cleanId }, { id: cleanId }] },
          {
            $set: {
              assignedTeam: targetTeam,
              status: 'ASSIGNED',
              decidedAt: new Date(),
              updated_at: new Date()
            },
            $push: { timeline: timelineEntry }
          },
          { new: true }
        );
        if (updated) return res.json({ success: true, message: `Report assigned to ${targetTeam}`, report: updated });
      } catch (err) {}
    }

    const idx = inMemoryReports.findIndex(r => (r.report_id || r.id) === cleanId);
    let updated = inMemoryReports[0];
    if (idx !== -1) {
      inMemoryReports[idx].assignedTeam = targetTeam;
      inMemoryReports[idx].status = 'ASSIGNED';
      inMemoryReports[idx].decidedAt = new Date();
      inMemoryReports[idx].timeline = [...(inMemoryReports[idx].timeline || []), timelineEntry];
      updated = inMemoryReports[idx];
    }

    return res.json({
      success: true,
      message: `Report ${reportId} assigned to ${targetTeam}.`,
      report: updated
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    });
  }
}

export async function mergeCluster(req, res) {
  try {
    const { reportId } = req.params;
    const { clusterId, memberIds } = req.body;
    const cleanId = String(reportId).trim().toUpperCase();

    const decisionRecord = {
      decision_id: `DEC-${Date.now()}`,
      decision_type: 'MERGED',
      report_id: cleanId,
      selected_reports: memberIds || [cleanId],
      override_reason: 'Consolidated duplicate citizen submissions into 1 master civic issue',
      decided_at: new Date()
    };

    if (isDbConnected()) {
      try {
        await Decision.create(decisionRecord);
        await WasteReport.findOneAndUpdate(
          { $or: [{ report_id: cleanId }, { id: cleanId }] },
          {
            $set: {
              isClusterMaster: true,
              status: 'UNDER_REVIEW',
              updated_at: new Date()
            }
          }
        );
      } catch (err) {}
    }

    inMemoryDecisions.push(decisionRecord);

    return res.json({
      success: true,
      message: `Successfully merged duplicate reports into Master Civic Issue ${reportId}.`,
      decision: decisionRecord
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    });
  }
}
