# PRIORITY_ENGINE.md
## Kopargaon Waste Intelligence â€” Priority & Resource Allocation Engine

**Version:** 1.0  
**Type:** Deterministic (no AI/ML in prioritization)  
**Transparency Requirement:** All factor scores MUST be shown to the municipal officer.

---

## 1. Core Principle

The Priority Engine is a fully deterministic, rule-based scoring system. It does NOT use machine learning. Every score is calculable, auditable, and explainable.

The engine:
1. Scores each pending report across 6 weighted factors
2. Ranks reports by total score
3. Checks resource feasibility for the top-ranked reports
4. Produces a recommended action plan with reasons for each decision
5. Presents the plan to the municipal officer for approval or override

> The engine RECOMMENDS. The officer DECIDES.

---

## 2. Scoring Factors and Weights

| Factor | Weight | Description |
|---|---|---|
| Health / Environmental Risk | 30% | Based on AI-assessed health_risk and environmental_risk |
| Population Impact | 25% | Population of the affected zone |
| Waste Severity | 20% | Based on AI-assessed visible_severity and estimated_scale |
| Public Obstruction | 10% | Whether waste is blocking public access |
| Urgency / Time Sensitivity | 10% | How long the report has been pending |
| Evidence Confidence | 5% | AI confidence score (lower confidence = lower weight contribution) |

**Total weights sum to 100%.**

---

## 3. Factor Score Calculation

All raw factor values are normalized to a 0â€“10 scale before applying weights.

### 3.1 Health / Environmental Risk Score (Weight: 30%)

Map AI output to numeric values:

| Risk Level | Score |
|---|---|
| none | 0 |
| low | 2 |
| medium | 5 |
| high | 8 |
| critical | 10 |

Combined score = max(health_risk_score, environmental_risk_score)

### 3.2 Population Impact Score (Weight: 25%)

Based on zone population (simulated):

| Population | Score |
|---|---|
| < 2,000 | 1 |
| 2,000 â€“ 5,000 | 3 |
| 5,000 â€“ 8,000 | 5 |
| 8,000 â€“ 12,000 | 7 |
| > 12,000 | 10 |

Use the population of the zone in which the report is located.

### 3.3 Waste Severity Score (Weight: 20%)

Combine `visible_severity` and `estimated_scale`:

**Severity base:**
| Severity | Base Score |
|---|---|
| low | 2 |
| medium | 5 |
| high | 8 |
| critical | 10 |

**Scale multiplier:**
| Scale | Multiplier |
|---|---|
| small | 0.7 |
| medium | 0.85 |
| large | 1.0 |
| massive | 1.15 (capped at 10) |

`waste_severity_score = min(10, severity_base Ã— scale_multiplier)`

### 3.4 Public Obstruction Score (Weight: 10%)

| Obstruction | Score |
|---|---|
| false | 0 |
| true | 10 |

### 3.5 Urgency / Time Sensitivity Score (Weight: 10%)

Based on how many hours the report has been in `UNDER_REVIEW` status:

| Hours Pending | Score |
|---|---|
| 0 â€“ 6 | 1 |
| 6 â€“ 12 | 3 |
| 12 â€“ 24 | 5 |
| 24 â€“ 48 | 7 |
| > 48 | 10 |

### 3.6 Evidence Confidence Score (Weight: 5%)

`evidence_confidence_score = ai_evidence_confidence Ã— 10`

Example: confidence 0.87 â†’ score 8.7

---

## 4. Total Priority Score Formula

```
total_score = (health_risk_score Ã— 0.30)
            + (population_score Ã— 0.25)
            + (waste_severity_score Ã— 0.20)
            + (obstruction_score Ã— 0.10)
            + (urgency_score Ã— 0.10)
            + (confidence_score Ã— 0.05)
```

**Score range:** 0.0 â€“ 10.0  
**Display format:** Show to 2 decimal places (e.g., 7.43 / 10)

---

## 5. Officer Transparency Display

For each report, the officer dashboard must display:

```
Report #1042 â€” Priority Score: 7.43 / 10
---
Factor Breakdown:
  Health/Environmental Risk  : 8.0/10 Ã— 30% = 2.40
  Population Impact          : 7.0/10 Ã— 25% = 1.75
  Waste Severity             : 8.5/10 Ã— 20% = 1.70
  Public Obstruction         : 10/10  Ã— 10% = 1.00
  Urgency (18 hrs pending)   : 5.0/10 Ã— 10% = 0.50
  Evidence Confidence (87%)  : 8.7/10 Ã—  5% = 0.44
                                     Total = 7.43
```

This breakdown is non-negotiable. Officers must be able to understand exactly why each report received its score.

---

## 6. Resource Constraints

### 6.1 Resource State (loaded from database before each run)

```json
{
  "vehicles": [
    { "type": "large_truck", "available": 1, "capacity_cubic_meters": 15 },
    { "type": "small_truck", "available": 2, "capacity_cubic_meters": 5 },
    { "type": "tractor", "available": 1, "capacity_cubic_meters": 3 }
  ],
  "workers_available": 12,
  "budget_remaining_inr": 25000,
  "time_window_hours": 8
}
```

> Resource data is simulated for the prototype. It must be seeded in the database and configurable.

### 6.2 Per-Report Resource Estimate

The engine estimates resource requirements per report based on AI evidence:

| Estimated Scale | Vehicle Required | Workers | Estimated Time | Estimated Cost (INR) |
|---|---|---|---|---|
| small | small_truck | 2 | 1 hour | 500 |
| medium | small_truck | 4 | 2 hours | 1,200 |
| large | large_truck | 6 | 4 hours | 3,000 |
| massive | large_truck + tractor | 10 | 8 hours | 7,500 |

For `hazardous_waste`: add 20% cost premium and require specialized handling note.

---

## 7. Allocation Algorithm

```
Input:
  - ranked_reports: list of reports sorted by total_score descending
  - resource_state: current available resources

Output:
  - selected_reports: reports to address in this run
  - deferred_reports: reports not addressed, with reason
  - allocation_plan: which resources go to which report
  - total_cost_estimate: INR
  - total_time_estimate: hours

Algorithm:
  remaining_resources = copy of resource_state
  selected = []
  deferred = []

  for each report in ranked_reports:
    required = estimate_resources(report.ai_evidence.estimated_scale)
    if can_fulfill(required, remaining_resources):
      selected.append(report)
      remaining_resources = subtract(remaining_resources, required)
      allocation_plan[report.id] = required
    else:
      reason = identify_constraint(required, remaining_resources)
      deferred.append({ report, reason })

  return { selected, deferred, allocation_plan }
```

### 7.1 Constraint Reasons (for deferred reports)

| Reason Code | Description |
|---|---|
| `NO_VEHICLE` | Required vehicle type not available |
| `INSUFFICIENT_WORKERS` | Not enough workers for this job |
| `BUDGET_EXCEEDED` | Remaining budget insufficient |
| `TIME_EXCEEDED` | Job would exceed available time window |
| `LOWER_PRIORITY` | Higher-priority reports consumed resources |

---

## 8. Output Format (sent to officer dashboard)

```json
{
  "engine_version": "1.0",
  "generated_at": "2026-08-29T15:00:00Z",
  "resource_snapshot": { "...resource state at time of calculation..." },
  "selected_reports": [
    {
      "report_id": "RPT-1042",
      "priority_score": 7.43,
      "score_breakdown": { "...factor scores..." },
      "allocated_resources": {
        "vehicle": "large_truck",
        "workers": 6,
        "estimated_hours": 4,
        "estimated_cost_inr": 3000
      }
    }
  ],
  "deferred_reports": [
    {
      "report_id": "RPT-1038",
      "priority_score": 5.12,
      "deferral_reason": "NO_VEHICLE",
      "deferral_reason_detail": "Large truck already allocated to RPT-1042"
    }
  ],
  "total_cost_estimate_inr": 3000,
  "total_time_estimate_hours": 4
}
```

---

## 9. Officer Override Handling

When an officer overrides the recommendation:
- Record the override reason (required field)
- Record which reports were manually selected vs. deferred
- Decrement resources according to officer's modified plan
- Log the decision for audit (officer_id, timestamp, original_recommendation, override_reason)

---

## 10. Edge Cases

| Situation | Handling |
|---|---|
| No pending reports | Return empty recommendation |
| All resources exhausted | All remaining reports â†’ deferred with `LOWER_PRIORITY` reason |
| Single report exceeds total budget | Flag as `BUDGET_EXCEEDED`, offer partial resource suggestion |
| All reports at same score | Sort by submission time (oldest first) |
| Report with `requires_manual_verification = true` | Exclude from automatic recommendation; show separately for manual officer review |