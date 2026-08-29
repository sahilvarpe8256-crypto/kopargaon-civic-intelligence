# Kopargaon Waste Intelligence — Database Layer

Foundational MongoDB & Mongoose data tier for the Kopargaon Waste Intelligence Platform.

---

## 1. Database Purpose & Architecture

The database layer serves as the single source of truth supporting the end-to-end civic waste workflow:

```
Citizen 
  → Waste Report (Photos + Location)
  → GeoJSON Point & Kopargaon Zone Mapping
  → AI Vision Observation Assessment (Evidence)
  → Deterministic Priority Score Breakdown
  → Resource Feasibility & Allocation Snapshot
  → Municipal Officer Decision (Approve / Override)
  → Audit Trail
```

### Core Tenet
- **AI is NOT the decision maker:** Gemini Vision provides structured evidence observations only.
- **Deterministic Priority:** The priority engine computes transparent scores stored with full factor breakdowns.
- **Officer Authority & Auditing:** The `decisions` collection preserves original recommendations alongside officer decisions and mandatory override reasons.

---

## 2. Directory Structure

```
database/
├── config/
│   └── db.js                 # MongoDB connection & disconnection handler
├── models/
│   ├── index.js              # Central export for all models
│   ├── User.js               # Citizen & Municipal Officer accounts
│   ├── WasteReport.js        # Citizen reports, AI observations, priority scores
│   ├── Zone.js               # Kopargaon municipal zones (GeoJSON Polygons)
│   ├── ResourceState.js      # Active vehicle, crew, and budget inventory
│   └── Decision.js           # Officer decision audit trail
├── seed/
│   └── seed.js               # Simulated Kopargaon dataset (30 reports, 5 zones, audit logs)
├── tests/
│   ├── User.test.js          # User validation & password_hash privacy tests
│   ├── WasteReport.test.js   # GeoJSON, AI evidence, priority, & 2dsphere tests
│   ├── Zone.test.js          # Polygon validity & $geoIntersects tests
│   ├── ResourceState.test.js # Resource capacity & constraint tests
│   └── Decision.test.js      # Audit log & override validation tests
├── package.json              # Minimal database dependencies & test scripts
├── .env.example              # Database environment variable template
└── README.md                 # Complete database documentation
```

---

## 3. MongoDB Setup & Environment Configuration

### Prerequisites
- Node.js 20+
- MongoDB 6.0+ (Local Community Server or MongoDB Atlas cluster)

### Environment Variable
Copy `.env.example` to `.env` inside `database/` (or use root `.env`):

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/kopargaon_waste_intelligence
```

---

## 4. Primary Collections & Models

| Model | Collection | Primary Purpose | Key Indexes |
|---|---|---|---|
| `User` | `users` | Citizens & Municipal Officers | `email` (unique), `role` |
| `WasteReport` | `waste_reports` | Civic reports, AI observations, priority score | `location` (`2dsphere`), `zone_id`, `status`, `citizen_id`, `submitted_at`, `priority_score.total` (desc) |
| `Zone` | `zones` | 5 Kopargaon municipal wards | `zone_id` (unique), `boundary` (`2dsphere`) |
| `ResourceState` | `resource_states` | Vehicle, crew & budget availability | `is_current` |
| `Decision` | `decisions` | Immutable audit log of officer actions | `officer_id`, `decided_at`, `reports_affected` |

---

## 5. Model Specifications & Important Fields

### 5.1 `User`
- `role`: Enum `['citizen', 'officer']` (required)
- `name`: String, trimmed, max 100 chars (required)
- `email`: String, unique, lowercase, trimmed, email regex validation (required)
- `phone`: String, 10-digit Indian mobile number validation (required)
- `password_hash`: String, `select: false` (never leaked in normal queries)
- `is_active`: Boolean (default `true`)
- Timestamps: `created_at`, `updated_at`

### 5.2 `WasteReport`
- `report_id`: Unique human-readable string (e.g. `RPT-20260829-0001`)
- `citizen_id`: `ObjectId` referencing `User` (required)
- `category`: String (default `'waste_management'`)
- `status`: Enum `['PENDING', 'AI_ANALYSIS', 'UNDER_REVIEW', 'APPROVED', 'DEFERRED', 'MANUAL_REVIEW', 'REJECTED_NO_WASTE', 'REJECTED_IRRELEVANT']`
- `description`: String, max 500 characters
- `images`: Array of upload metadata objects (`filename`, `original_name`, `mimetype`, `size_bytes`, `uploaded_at`)
- `location`: GeoJSON Point with `[longitude, latitude]` coordinates
- `zone_id`: `ObjectId` referencing `Zone`
- `ai_analysis`: Embedded observation schema (`waste_detected`, `waste_type`, `visible_severity`, `evidence_confidence`, `health_risk`, `environmental_risk`, `public_obstruction`, `estimated_scale`, `requires_manual_verification`, `rejection_reason`, `ai_notes`)
- `priority_score`: Embedded score + factor breakdown (`health_risk_score`, `population_score`, `waste_severity_score`, `obstruction_score`, `urgency_score`, `confidence_score`, `calculated_at`)
- `decision_id`: `ObjectId` referencing `Decision`
- `outcome`: Embedded decision outcome summary (`status`, `reason`, `decided_at`)

### 5.3 `Zone`
- `zone_id`: Unique identifier (e.g. `Z01`, `Z02`, `Z03`, `Z04`, `Z05`)
- `zone_name`: Human-readable zone name (e.g. `Kopargaon Market Area`)
- `population`: Number (simulated demographic data for prototype)
- `boundary`: GeoJSON Polygon with valid closed ring coordinates `[[[lng, lat], ...]]`
- `is_active`: Boolean (default `true`)

### 5.4 `ResourceState`
- `snapshot_date`: Timestamp
- `is_current`: Boolean (flags active prototype resource pool)
- `vehicles`: Array of vehicle objects (`type`: `large_truck` | `small_truck` | `tractor`, `total`, `available`, `capacity_cubic_meters`)
- `workers_total` & `workers_available` (with validation ensuring `available <= total`)
- `budget_total_inr` & `budget_remaining_inr` (with validation ensuring `remaining <= total`)
- `time_window_hours`: Daily operational shift window (e.g. 8 hours)
- `last_updated_by`: `ObjectId` referencing `User`

### 5.5 `Decision`
- `officer_id`: `ObjectId` referencing `User` (required)
- `decision_type`: Enum `['APPROVED', 'OVERRIDDEN']` (required)
- `engine_recommendation`: Deterministic priority engine output snapshot (`selected_reports`, `deferred_reports`, `total_cost_estimate_inr`, `total_time_estimate_hours`, `generated_at`)
- `officer_decision`: Officer action record (`selected_reports`, `deferred_reports`, `override_reason`)
  - **Validation Rule:** When `decision_type === 'OVERRIDDEN'`, `override_reason` is strictly mandatory.
- `resource_state_before`: `ObjectId` referencing `ResourceState`
- `resource_state_after`: Snapshot object after resource deduction
- `reports_affected`: Array of `ObjectId`s referencing `WasteReport`
- `decided_at`: Timestamp

---

## 6. GeoJSON Coordinate Convention

> **CRITICAL RULE FOR MONGODB GEOJSON:**  
> All coordinates in MongoDB MUST strictly follow the GeoJSON standard order:  
> **`[longitude, latitude]`**  
> (e.g., Kopargaon Center: `[74.4667, 19.8833]`)

### Spatial Indexes:
- `WasteReport.location`: Indexed with `'2dsphere'` for proximity queries (`$nearSphere`), radius bounding (`$geoWithin`), and heatmap aggregation.
- `Zone.boundary`: Indexed with `'2dsphere'` for point-in-polygon queries (`$geoIntersects`).

---

## 7. Civic Heatmap Database Support

The database is optimized for the Snap-Map-style Civic Heatmap without requiring artificial hotspot collections:
1. **Dynamic Spatial Aggregation:** Use `$geoNear` and `$group` on `WasteReport` to aggregate issue density.
2. **Zone Density Aggregation:** `$lookup` between `WasteReport` and `Zone` to compute per-zone severity and priority averages.
3. **Compound Filters:** Filter by `status: 'UNDER_REVIEW'`, `zone_id`, and `priority_score.total` using compound indexes.

---

## 8. Seed System & Commands

The seed script creates a complete simulated Kopargaon environment:
- 2 Municipal Officers (`officer.shinde@kopargaon.gov.in`, `officer.deshmukh@kopargaon.gov.in`)
- 4 Citizens (`rahul.patil@example.com`, `pooja.kulkarni@example.com`, etc.)
- 5 Predefined Kopargaon Zones (`Z01` through `Z05`)
- 30 Geographically distributed waste reports with full AI evidence observations and priority breakdowns
- 1 Active Resource State matching prototype capacity (1 large truck, 2 small trucks, 1 tractor, 15 workers, ₹50,000 budget)
- Historical Decision records (including audited overrides)

### Run Seeding:
```bash
# From database/ directory:
npm run seed

# To reset collections before seeding:
npm run seed:reset
```

> **Security Note:** All seed passwords are encrypted using `bcrypt` (hash rounds: 10). Never store plaintext credentials.

---

## 9. Running Tests

Tests run in-memory using `mongodb-memory-server` and `jest`. No external MongoDB connection is required for testing.

```bash
# From database/ directory:
npm test
```

---

## 10. Backend Integration Guide

Backend controllers can easily import models from the database package:

```javascript
// In backend service or controller:
const { 
  User, 
  WasteReport, 
  Zone, 
  ResourceState, 
  Decision 
} = require('../../database/models');

// Example: Query active high-priority reports in Kopargaon Market Area
const urgentReports = await WasteReport.find({
  status: 'UNDER_REVIEW'
})
.sort({ 'priority_score.total': -1 })
.populate('zone_id')
.populate('citizen_id', 'name phone');
```

---

## 11. Security Considerations

1. **Password Protection:** `password_hash` is explicitly marked `select: false` in the Mongoose schema.
2. **Zero Credentials in Git:** `.env.example` contains only non-sensitive templates.
3. **Input Sanitization:** All string fields use `trim: true`, and phone/email fields enforce strict regular expressions.
4. **Non-Destructive Defaults:** Default seeding does not wipe collections unless explicitly requested with `--reset`.
