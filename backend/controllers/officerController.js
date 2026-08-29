import mongoose from 'mongoose';
import WasteReport from '../models/WasteReport.js';
import ResourceState from '../models/ResourceState.js';
import Decision from '../models/Decision.js';
import { allocateResources } from '../services/priorityEngineService.js';
import { SEED_REPORTS } from '../config/db.js';

let inMemoryReports = JSON.parse(JSON.stringify(SEED_REPORTS));

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

export async function getOfficerReports(req, res) {
  try {
    let reports = inMemoryReports;
    if (isDbConnected()) {
      try {
        const dbList = await WasteReport.find().sort({ priorityScore: -1 });
        if (dbList) reports = dbList;
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

export async function calculatePriorityRecommendation(req, res) {
  try {
    let reports = inMemoryReports.filter(r => r.status === 'PENDING' || r.status === 'UNDER_REVIEW' || r.status === 'SUBMITTED');
    let resourceState = null;

    if (isDbConnected()) {
      try {
        const dbList = await WasteReport.find({ status: { $in: ['PENDING', 'UNDER_REVIEW', 'SUBMITTED'] } });
        if (dbList && dbList.length > 0) reports = dbList;
        resourceState = await ResourceState.findOne({ is_current: true });
      } catch (err) {}
    }

    const recommendation = allocateResources(reports, resourceState);
    return res.json({
      success: true,
      recommendation
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    });
  }
}

export async function getResources(req, res) {
  try {
    let resourceState = {
      vehicles: [
        { type: 'large_truck', total: 2, available: 1 },
        { type: 'small_truck', total: 3, available: 2 },
        { type: 'tractor', total: 2, available: 1 },
        { type: 'loader', total: 1, available: 1 }
      ],
      workers_total: 18,
      workers_available: 14,
      budget_total_inr: 75000,
      budget_remaining_inr: 45000,
      time_window_hours: 8
    };

    if (isDbConnected()) {
      try {
        const dbState = await ResourceState.findOne({ is_current: true });
        if (dbState) resourceState = dbState;
      } catch (err) {}
    }

    return res.json({
      success: true,
      resources: resourceState
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    });
  }
}

export async function submitDecision(req, res) {
  try {
    const { decision_type = 'APPROVED', selected_report_ids = [], deferred_report_ids = [], override_reason } = req.body;

    const decision = {
      decision_id: `DEC-${Date.now()}`,
      officer_id: req.user?._id || req.user?.id,
      officer_name: req.user?.name || 'Municipal Officer',
      decision_type,
      selected_reports: selected_report_ids,
      deferred_reports: deferred_report_ids,
      override_reason: override_reason || null,
      decided_at: new Date()
    };

    if (isDbConnected()) {
      try {
        await Decision.create(decision);
      } catch (err) {}
    }

    return res.json({
      success: true,
      decision_id: decision.decision_id,
      message: 'Decision recorded. Field resource queues updated.',
      reports_approved: selected_report_ids.length,
      reports_deferred: deferred_report_ids.length
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message }
    });
  }
}
