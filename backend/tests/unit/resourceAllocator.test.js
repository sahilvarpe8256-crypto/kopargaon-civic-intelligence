const ResourceAllocator = require('../../src/services/resourceAllocator');
const { DEFERRAL_REASONS } = require('../../src/config/constants');

describe('Resource Allocator Engine Unit Tests', () => {
  const mockResourceState = {
    crews: { total: 6, available: 4 },
    vehicles: [
      { type: 'compactor_truck', available: 1 },
      { type: 'mini_tipper', available: 2 },
      { type: 'tractor_trailer', available: 1 }
    ],
    workingHoursRemainingToday: 6.0,
    dailyBudgetINR: { remaining: 10000 }
  };

  it('correctly allocates feasible high priority complaints and defers low priority/constrained ones', () => {
    const complaints = [
      {
        id: 'C01',
        report_id: 'RPT-001',
        priorityScore: 92,
        severity: 90,
        aiAnalysis: { wasteType: 'hazardous_waste' } // req: 4 crew, 1 compactor_truck, 3.5h, 2200 INR
      },
      {
        id: 'C02',
        report_id: 'RPT-002',
        priorityScore: 84,
        severity: 70,
        aiAnalysis: { wasteType: 'construction_debris' } // req: 3 crew, 1 tractor_trailer, 2.5h, 1400 INR
      },
      {
        id: 'C03',
        report_id: 'RPT-003',
        priorityScore: 50,
        severity: 40,
        aiAnalysis: { wasteType: 'mixed_solid_waste' }
      }
    ];

    const result = ResourceAllocator.allocateResources(complaints, mockResourceState);

    expect(result.summary.totalEvaluated).toBe(3);
    expect(result.summary.totalSelected).toBe(1); // C01 consumes all 4 available crews
    expect(result.summary.totalDeferred).toBe(2);

    expect(result.selectedComplaints[0].id).toBe('C01');
    expect(result.selectedComplaints[0].allocatedResources.crewCount).toBe(4);

    // C02 should be deferred due to insufficient crews
    const deferredC02 = result.deferredComplaints.find(d => d.id === 'C02');
    expect(deferredC02).toBeDefined();
    expect(deferredC02.deferralReason).toBe(DEFERRAL_REASONS.INSUFFICIENT_CREW);
  });

  it('defers complaints when required vehicle type is unavailable', () => {
    const constrainedState = {
      crews: { available: 10 },
      vehicles: [
        { type: 'compactor_truck', available: 0 },
        { type: 'mini_tipper', available: 2 }
      ],
      workingHoursRemainingToday: 8.0,
      dailyBudgetINR: { remaining: 50000 }
    };

    const complaints = [
      {
        id: 'C-HAZARD',
        priorityScore: 95,
        severity: 90,
        aiAnalysis: { wasteType: 'hazardous_waste' } // requires compactor_truck
      }
    ];

    const result = ResourceAllocator.allocateResources(complaints, constrainedState);
    expect(result.summary.totalSelected).toBe(0);
    expect(result.summary.totalDeferred).toBe(1);
    expect(result.deferredComplaints[0].deferralReason).toBe(DEFERRAL_REASONS.NO_VEHICLE);
  });

  it('defers complaints when budget is exceeded', () => {
    const lowBudgetState = {
      crews: { available: 10 },
      vehicles: [{ type: 'mini_tipper', available: 5 }],
      workingHoursRemainingToday: 8.0,
      dailyBudgetINR: { remaining: 200 } // only 200 INR remaining
    };

    const complaints = [
      {
        id: 'C-NORMAL',
        priorityScore: 70,
        severity: 50,
        aiAnalysis: { wasteType: 'mixed_solid_waste' } // cost 800 INR
      }
    ];

    const result = ResourceAllocator.allocateResources(complaints, lowBudgetState);
    expect(result.summary.totalDeferred).toBe(1);
    expect(result.deferredComplaints[0].deferralReason).toBe(DEFERRAL_REASONS.BUDGET_EXCEEDED);
  });
});