# DATABASE_SCHEMA.md
## Kopargaon Waste Intelligence â€” MongoDB Database Schema

**Version:** 1.0  
**Database:** MongoDB  
**ODM:** Mongoose (Node.js)

---

## 1. Collections Overview

| Collection | Description |
|---|---|
| `users` | Citizens and municipal officers |
| `waste_reports` | Citizen-submitted waste reports with AI evidence |
| `zones` | Predefined Kopargaon municipal zones |
| `resource_states` | Current vehicle, worker, and budget availability |
| `decisions` | Officer decisions and resource allocation records |

---

## 2. User / Citizen Schema

**Collection:** `users`

```javascript
{
  _id: ObjectId,
  role: {
    type: String,
    enum: ['citizen', 'officer'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    // Format: 10-digit Indian mobile number
  },
  password_hash: {
    type: String,
    required: true
    // Never store plain-text passwords
  },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}
```

**Indexes:**
- `email` (unique)
- `role`

---

## 3. WasteReport Schema

**Collection:** `waste_reports`

```javascript
{
  _id: ObjectId,
  report_id: {
    type: String,
    unique: true
    // Format: "RPT-YYYYMMDD-XXXX" (auto-generated)
  },
  citizen_id: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    default: 'waste_management'
    // Hardcoded for now; future: enum of all categories
  },
  status: {
    type: String,
    enum: [
      'PENDING',
      'AI_ANALYSIS',
      'UNDER_REVIEW',
      'APPROVED',
      'DEFERRED',
      'MANUAL_REVIEW',
      'REJECTED_NO_WASTE',
      'REJECTED_IRRELEVANT'
    ],
    default: 'PENDING'
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  images: [
    {
      filename: String,      // stored filename
      original_name: String, // original upload name
      mimetype: String,
      size_bytes: Number,
      uploaded_at: Date
    }
  ],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude] â€” GeoJSON order
      required: true
    }
  },
  zone_id: {
    type: ObjectId,
    ref: 'Zone',
    default: null
    // null if zone could not be determined
  },
  ai_analysis: {
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED']
    },
    waste_detected: Boolean,
    waste_type: String,
    waste_type_detail: String,
    visible_severity: String,
    evidence_confidence: Number,
    health_risk: String,
    environmental_risk: String,
    public_obstruction: Boolean,
    estimated_scale: String,
    requires_manual_verification: Boolean,
    image_quality: String,
    rejection_reason: { type: String, default: null },
    ai_notes: String,
    raw_response: String, // full AI JSON string for audit
    analyzed_at: Date
  },
  priority_score: {
    total: { type: Number, default: null },
    breakdown: {
      health_risk_score: Number,
      population_score: Number,
      waste_severity_score: Number,
      obstruction_score: Number,
      urgency_score: Number,
      confidence_score: Number
    },
    calculated_at: Date
  },
  decision_id: {
    type: ObjectId,
    ref: 'Decision',
    default: null
  },
  outcome: {
    status: String,         // mirrors top-level status at time of decision
    reason: String,         // deferral or override reason
    decided_at: Date
  },
  submitted_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}
```

**Indexes:**
- `location` (2dsphere for geo queries)
- `zone_id`
- `status`
- `citizen_id`
- `submitted_at`
- `priority_score.total` (descending)

---

## 4. Zone Schema

**Collection:** `zones`

```javascript
{
  _id: ObjectId,
  zone_id: {
    type: String,
    unique: true
    // Format: "Z01", "Z02", etc.
  },
  zone_name: {
    type: String,
    required: true
  },
  population: {
    type: Number,
    required: true
    // Simulated value for prototype
  },
  boundary: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true
    },
    coordinates: [[[ Number ]]]
    // GeoJSON Polygon: array of rings, each ring is array of [lng, lat] pairs
  },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
}
```

**Indexes:**
- `boundary` (2dsphere for point-in-polygon queries)
- `zone_id` (unique)

**Seed Data (simulated):**
5 zones covering Kopargaon with approximate polygon boundaries and simulated populations. See PROJECT_SPEC.md Section 6.3 for zone list.

---

## 5. ResourceState Schema

**Collection:** `resource_states`

There is only one active ResourceState document at any time (the current state). Historical states may be archived.

```javascript
{
  _id: ObjectId,
  snapshot_date: { type: Date, default: Date.now },
  is_current: { type: Boolean, default: true },
  vehicles: [
    {
      type: {
        type: String,
        enum: ['large_truck', 'small_truck', 'tractor']
      },
      total: Number,
      available: Number
      // available = total - allocated
    }
  ],
  workers_total: Number,
  workers_available: Number,
  budget_total_inr: Number,
  budget_remaining_inr: Number,
  time_window_hours: Number,
  // Time window represents the working hours available today
  last_updated_by: {
    type: ObjectId,
    ref: 'User'
  },
  updated_at: { type: Date, default: Date.now }
}
```

**Seed Data (simulated):**
```json
{
  "vehicles": [
    { "type": "large_truck", "total": 1, "available": 1 },
    { "type": "small_truck", "total": 2, "available": 2 },
    { "type": "tractor", "total": 1, "available": 1 }
  ],
  "workers_total": 15,
  "workers_available": 12,
  "budget_total_inr": 50000,
  "budget_remaining_inr": 25000,
  "time_window_hours": 8
}
```

---

## 6. Decision / Allocation Schema

**Collection:** `decisions`

A Decision document is created each time an officer makes a final resource allocation decision.

```javascript
{
  _id: ObjectId,
  officer_id: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  decision_type: {
    type: String,
    enum: ['APPROVED', 'OVERRIDDEN']
    // APPROVED: officer accepted the engine recommendation
    // OVERRIDDEN: officer modified the recommendation
  },
  engine_recommendation: {
    // The full recommendation object from the Priority Engine
    selected_reports: [{ report_id: String, allocated_resources: Object }],
    deferred_reports: [{ report_id: String, deferral_reason: String }],
    total_cost_estimate_inr: Number,
    total_time_estimate_hours: Number,
    generated_at: Date
  },
  officer_decision: {
    // What the officer actually decided (same structure, may differ if overridden)
    selected_reports: [{ report_id: String, allocated_resources: Object }],
    deferred_reports: [{ report_id: String, deferral_reason: String }],
    override_reason: { type: String, default: null }
    // Required if decision_type === 'OVERRIDDEN'
  },
  resource_state_before: {
    type: ObjectId,
    ref: 'ResourceState'
  },
  resource_state_after: Object, // snapshot of resource state after allocation
  reports_affected: [{ type: ObjectId, ref: 'WasteReport' }],
  decided_at: { type: Date, default: Date.now }
}
```

**Indexes:**
- `officer_id`
- `decided_at`
- `reports_affected`

---

## 7. Relationships Summary

```
User (citizen) â”€â”€< WasteReport >â”€â”€ Zone
                        |
                        â””â”€â”€ ai_analysis (embedded)
                        â””â”€â”€ priority_score (embedded)
                        â””â”€â”€ Decision (ref) â”€â”€â”€â”€ User (officer)
                                          â”€â”€â”€â”€ ResourceState (ref)
```

---

## 8. Important Notes

- All timestamps stored as UTC
- All monetary values in Indian Rupees (INR), stored as integers (paise-level precision not needed for prototype)
- GeoJSON coordinates are always [longitude, latitude] order (not lat/lng)
- Password hashes use bcrypt (min 10 rounds)
- Report IDs are human-readable (`RPT-YYYYMMDD-XXXX`) for citizen communication
- Raw AI response is stored as a string for complete audit trail
- ResourceState `is_current = true` enforces that only one record is "live"