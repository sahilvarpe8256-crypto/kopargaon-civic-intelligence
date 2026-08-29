# PRIORITY_ENGINE.md — Deterministic Scoring & Resource Allocation Engine

**Version:** 1.0  
**Type:** Deterministic (Rule-Based, Zero AI/ML in Decision)  
**Transparency Requirement:** All factor contributions MUST be displayed to municipal supervisors.

---

## 1. Core Principle

The Priority Engine evaluates verified civic reports against a transparent, objective 0–100 weighted index. It does **not** rely on opaque neural networks or AI judgements to rank complaints.

$$\text{Priority Score} = (S \times 0.30) + (E \times 0.25) + (H \times 0.20) + (R \times 0.15) + (O \times 0.10)$$

Where:
- **$S$ = Waste Severity (30%):** Assessed scale, density, and physical magnitude of the waste pile.
- **$E$ = Estimated Population Exposure (25%):** Exposure factor calculated from ward population density and proximity to high-density zones (schools, bazaars, hospitals).
- **$H$ = Health Risk (20%):** Biohazard, decomposition, disease vector, and leachate potential.
- **$R$ = Environmental Risk (15%):** Proximity to open waterways, storm drains, or agricultural soil.
- **$O$ = Public Obstruction (10%):** Physical impedance of pedestrian footpaths, vehicular roadways, or drainage.

---

## 2. Factor Normalization (0–100 Scale)

All inputs are normalized to an integer scale of 0 to 100:

| Factor | Metric Source | Range | Description |
|---|---|---|---|
| **Severity ($S$)** | Gemini Vision observation | 0–100 | Visual volume and compactness of waste |
| **Population Exposure ($E$)** | Zone Geo-mapping | 0–100 | Zone demographic multiplier + landmark density |
| **Health Risk ($H$)** | Gemini Vision observation | 0–100 | Toxic, medical, or biological decomposition risk |
| **Environmental Risk ($R$)** | Gemini Vision observation | 0–100 | Waterway contamination and soil leaching risk |
| **Obstruction ($O$)** | Gemini Vision observation | 0–100 | Footpath, road, or stormwater drainage blockage |

---

## 3. Explainability Waterfall (Officer View)

For every complaint, the officer dashboard displays the exact contribution of each factor:

```
Complaint #RPT-20260829-0012 ── Priority Score: 80.20 / 100
──────────────────────────────────────────────────────────
  [+] Severity (82/100 × 30%)           =  24.60 pts
  [+] Population Exposure (85/100 × 25%)=  21.25 pts
  [+] Health Risk (76/100 × 20%)        =  15.20 pts
  [+] Environmental Risk (68/100 × 15%) =  10.20 pts
  [+] Public Obstruction (90/100 × 10%) =   9.00 pts
──────────────────────────────────────────────────────────
  Total Computed Priority Score         =  80.25 pts
```

---

## 4. Municipal Resource Constraint Matching

### Resource Inventory:
- **Sanitation Crews:** Total and active field teams.
- **Vehicles:** Compactor trucks, mini tippers, tractor-trailers.
- **Operational Hours:** Remaining shift time today.
- **Daily Budget:** Remaining fuel/operational fund (in INR).

### Allocation Logic:
1. Sort all pending reports by `priorityScore` descending.
2. For each report:
   - Check if `requiredCrews <= availableCrews` AND `requiredVehicle in availableVehicles` AND `estimatedCost <= remainingBudget` AND `estimatedHours <= remainingShiftHours`.
   - If **feasible:** Mark as `SELECTED_FOR_DISPATCH`, decrement available resources.
   - If **constrained:** Mark as `DEFERRED`, assign specific reason code (`NO_VEHICLE`, `INSUFFICIENT_CREW`, `BUDGET_EXCEEDED`, `SHIFT_TIME_EXCEEDED`, `LOWER_PRIORITY`).