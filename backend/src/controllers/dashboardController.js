const mongoose = require('mongoose');
const { Complaint, Resource } = require('../models');
const ResourceAllocator = require('../services/resourceAllocator');
const logger = require('../utils/logger');

class DashboardController {
  static isDbConnected() {
    return mongoose.connection && mongoose.connection.readyState === 1;
  }

  /**
   * Get current municipal resource inventory & availability
   * GET /api/dashboard/resources
   */
  static async getResources(req, res, next) {
    try {
      let resource = null;
      if (DashboardController.isDbConnected()) {
        resource = await Resource.findOne({ isCurrent: true }).lean();
      }

      if (!resource) {
        resource = {
          date: new Date().toISOString().split('T')[0],
          crews: { total: 6, available: 4, dispatched: 2 },
          vehicles: [
            { type: 'compactor_truck', total: 2, available: 1, dispatched: 1 },
            { type: 'mini_tipper', total: 4, available: 3, dispatched: 1 },
            { type: 'tractor_trailer', total: 2, available: 2, dispatched: 0 }
          ],
          workingHoursRemainingToday: 6.5,
          dailyBudgetINR: { allocated: 25000, spent: 8500, remaining: 16500 },
          isCurrent: true
        };
      }

      return res.status(200).json({
        success: true,
        data: resource
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate resource-constrained prioritization across all active reports
   * POST /api/dashboard/prioritize
   */
  static async runPrioritization(req, res, next) {
    try {
      let complaints = [];
      let resourceState = null;

      if (DashboardController.isDbConnected()) {
        complaints = await Complaint.find({
          status: { $in: ['UNDER_REVIEW', 'PENDING', 'DEFERRED'] }
        }).lean();
        resourceState = await Resource.findOne({ isCurrent: true }).lean();
      }

      if (!resourceState) {
        resourceState = {
          crews: { total: 6, available: 4, dispatched: 2 },
          vehicles: [
            { type: 'compactor_truck', total: 2, available: 1 },
            { type: 'mini_tipper', total: 4, available: 3 },
            { type: 'tractor_trailer', total: 2, available: 2 }
          ],
          workingHoursRemainingToday: 6.5,
          dailyBudgetINR: { remaining: 16500 }
        };
      }

      if (complaints.length === 0) {
        // Fallback sample for demonstration if DB has no complaints
        complaints = [
          {
            id: 'RPT-DEMO-01',
            priorityScore: 88.5,
            severity: 85,
            aiAnalysis: { wasteType: 'hazardous_waste' }
          },
          {
            id: 'RPT-DEMO-02',
            priorityScore: 78.0,
            severity: 70,
            aiAnalysis: { wasteType: 'liquid_and_organic' }
          },
          {
            id: 'RPT-DEMO-03',
            priorityScore: 62.0,
            severity: 55,
            aiAnalysis: { wasteType: 'mixed_solid_waste' }
          }
        ];
      }

      const recommendation = ResourceAllocator.allocateResources(complaints, resourceState);

      return res.status(200).json({
        success: true,
        data: recommendation
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;