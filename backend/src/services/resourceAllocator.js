const { DEFERRAL_REASONS } = require('../config/constants');

/**
 * Resource-Constrained Municipal Allocation Engine
 * 
 * Solves the core problem: Given N competing complaints with priority scores and 
 * required resources vs limited municipal capacity (crews, vehicles, hours, budget),
 * produces a defensible, explainable dispatch recommendation.
 */
class ResourceAllocator {
  /**
   * Estimate resource requirements for a single complaint
   * @param {Object} complaint
   * @returns {{ crewRequired: number, vehicleType: string, hoursRequired: number, costINR: number }}
   */
  static estimateRequirements(complaint) {
    const severity = complaint.severity || 50;
    const wasteType = (complaint.aiAnalysis && complaint.aiAnalysis.wasteType) || 'mixed_solid_waste';

    let crewRequired = 2;
    let vehicleType = 'mini_tipper';
    let hoursRequired = 2;
    let costINR = 800;

    if (severity >= 80 || wasteType === 'hazardous_waste') {
      crewRequired = 4;
      vehicleType = 'compactor_truck';
      hoursRequired = 3.5;
      costINR = 2200;
    } else if (severity >= 60 || wasteType === 'construction_debris') {
      crewRequired = 3;
      vehicleType = 'tractor_trailer';
      hoursRequired = 2.5;
      costINR = 1400;
    }

    return { crewRequired, vehicleType, hoursRequired, costINR };
  }

  /**
   * Allocate municipal resources across a list of complaints
   * @param {Array<Object>} complaints - List of complaints
   * @param {Object} resourceState - Available municipal resources
   * @returns {Object} Allocation recommendation with selected and deferred lists
   */
  static allocateResources(complaints = [], resourceState = {}) {
    // Clone available resources to simulate consumption
    const availableCrews = resourceState.crews ? (resourceState.crews.available || 0) : 4;
    let remainingCrews = availableCrews;
    let remainingHours = typeof resourceState.workingHoursRemainingToday === 'number' 
      ? resourceState.workingHoursRemainingToday 
      : 7;
    let remainingBudget = (resourceState.dailyBudgetINR && typeof resourceState.dailyBudgetINR.remaining === 'number')
      ? resourceState.dailyBudgetINR.remaining
      : 25000;

    // Track vehicle inventory map: type -> count available
    const vehicleMap = {};
    if (Array.isArray(resourceState.vehicles)) {
      resourceState.vehicles.forEach(v => {
        vehicleMap[v.type] = v.available || 0;
      });
    } else {
      // Default baseline inventory
      vehicleMap['compactor_truck'] = 1;
      vehicleMap['mini_tipper'] = 3;
      vehicleMap['tractor_trailer'] = 2;
    }

    // 1. Sort complaints by priorityScore descending
    const sortedComplaints = [...complaints].sort((a, b) => {
      const scoreA = typeof a.priorityScore === 'number' ? a.priorityScore : 0;
      const scoreB = typeof b.priorityScore === 'number' ? b.priorityScore : 0;
      return scoreB - scoreA;
    });

    const selectedComplaints = [];
    const deferredComplaints = [];

    for (const complaint of sortedComplaints) {
      const req = this.estimateRequirements(complaint);
      const vehicleAvailable = (vehicleMap[req.vehicleType] || 0) > 0;

      // Check feasibility against all constraints
      if (remainingCrews < req.crewRequired) {
        deferredComplaints.push({
          id: complaint.id || complaint._id,
          reportId: complaint.id || complaint.report_id,
          priorityScore: complaint.priorityScore,
          deferralReason: DEFERRAL_REASONS.INSUFFICIENT_CREW,
          explanation: `Requires ${req.crewRequired} sanitation workers, but only ${remainingCrews} workers remain available in current shift.`,
          requiredResources: req
        });
      } else if (!vehicleAvailable) {
        deferredComplaints.push({
          id: complaint.id || complaint._id,
          reportId: complaint.id || complaint.report_id,
          priorityScore: complaint.priorityScore,
          deferralReason: DEFERRAL_REASONS.NO_VEHICLE,
          explanation: `Required ${req.vehicleType} is currently fully dispatched to higher-ranked priority incidents.`,
          requiredResources: req
        });
      } else if (remainingHours < req.hoursRequired) {
        deferredComplaints.push({
          id: complaint.id || complaint._id,
          reportId: complaint.id || complaint.report_id,
          priorityScore: complaint.priorityScore,
          deferralReason: DEFERRAL_REASONS.SHIFT_TIME_EXCEEDED,
          explanation: `Operation requires ${req.hoursRequired}h, which exceeds remaining shift window (${remainingHours.toFixed(1)}h).`,
          requiredResources: req
        });
      } else if (remainingBudget < req.costINR) {
        deferredComplaints.push({
          id: complaint.id || complaint._id,
          reportId: complaint.id || complaint.report_id,
          priorityScore: complaint.priorityScore,
          deferralReason: DEFERRAL_REASONS.BUDGET_EXCEEDED,
          explanation: `Estimated dispatch cost ₹${req.costINR} exceeds remaining daily operational fund ₹${remainingBudget}.`,
          requiredResources: req
        });
      } else {
        // Feasible: allocate resources and deduct
        remainingCrews -= req.crewRequired;
        remainingHours -= req.hoursRequired;
        remainingBudget -= req.costINR;
        vehicleMap[req.vehicleType] = (vehicleMap[req.vehicleType] || 1) - 1;

        selectedComplaints.push({
          id: complaint.id || complaint._id,
          reportId: complaint.id || complaint.report_id,
          priorityScore: complaint.priorityScore,
          allocatedResources: {
            crewCount: req.crewRequired,
            vehicleType: req.vehicleType,
            estimatedHours: req.hoursRequired,
            estimatedCostINR: req.costINR
          },
          selectionReason: `Selected: Priority score of ${complaint.priorityScore} is within available capacity (${req.crewRequired} crew, 1 ${req.vehicleType}).`
        });
      }
    }

    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalEvaluated: complaints.length,
        totalSelected: selectedComplaints.length,
        totalDeferred: deferredComplaints.length,
        initialCrews: availableCrews,
        remainingCrews,
        remainingBudgetINR: remainingBudget
      },
      selectedComplaints,
      deferredComplaints
    };
  }
}

module.exports = ResourceAllocator;