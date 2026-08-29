# Kopargaon Civic Intelligence Platform — System Architecture

**Version:** 1.0 (Hackathon Foundation)  
**Status:** Technical Source of Truth  
**Target Organization:** Kopargaon Municipal Council  
**Lead Category (MVP):** Waste Management

---

## 1. Product Objective

The **Kopargaon Civic Intelligence Platform** is an AI-assisted, resource-aware civic prioritization and municipal dispatch system built for the Kopargaon Municipal Council.

Instead of operating as an unverified first-come-first-served ticketing queue, the system:
1. Verifies citizen photo evidence using multimodal vision AI (`@google/genai`).
2. Computes an explainable, multi-factor priority score (0–100) on the backend.
3. Evaluates real-time municipal resource constraints (sanitation crews, vehicles, operational hours, budget).
4. Recommends an optimal dispatch plan while explaining why specific complaints are prioritized or deferred.
5. Empowers municipal officers with approval and override authority.
6. Transparently communicates the decision outcome and real-time status to the reporting citizen.

---

## 2. Problem Statement Interpretation & The Resource Paradox

Municipal councils face a fundamental **Resource Paradox**:
- The volume of daily citizen reports will always exceed instant response capacity.
- Complaints differ radically in urgency: an overflowing residential dustbin is inconvenient, but hospital/chemical waste dumped next to a school or main bazaar requires immediate containment.
- Without intelligent triage, municipal supervisors either suffer decision fatigue or dispatch crews haphazardly, leaving high-risk incidents unmitigated.

This platform bridges the gap between raw citizen reports and structured municipal action through **explainable triage and constraint-aware planning**.

---

## 3. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CITIZEN CLIENT                                  │
│  React 18 + Vite | Tailwind CSS | React Leaflet (OSM) | Mobile Responsive   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / Multipart Form (Photo + GPS)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXPRESS REST BACKEND                              │
│  Node.js | Multer (Uploads) | Express Validation | JWT Auth | Error Handler │
└──────┬───────────────────────┬───────────────────────────────┬──────────────┘
       │                       │                               │
       │ Image Buffer / Base64 │ GPS Coordinates               │ Read / Write
       ▼                       ▼                               ▼
┌──────────────┐      ┌─────────────────────────┐     ┌───────────────────────┐
│ GEMINI AI    │      │ LOCATION & ZONE ENGINE  │     │ MONGODB DATABASE      │
│ VISION API   │      │ Kopargaon Polygon Maps  │     │ Mongoose ODM          │
│ @google/genai│      │ Simulated Zone Pop.     │     │ Spatial 2dsphere      │
│ (Observer)   │      │ Exposure Estimation     │     │ Collections:          │
└──────┬───────┘      └────────────┬────────────┘     │  - complaints         │
       │ Structured Observation    │ Population & Zone│  - zones              │
       └───────────────┬───────────┘ Data             │  - resources          │
                       ▼                              │  - users              │
       ┌─────────────────────────────────┐            │  - decisions          │
       │    DETERMINISTIC PRIORITY &     │            └───────────▲───────────┘
       │    RESOURCE ALLOCATION ENGINE   ├────────────────────────┘
       │  - Weighted Scoring (0-100)     │
       │  - Constraint Feasibility Check │
       │  - Explainable Reasons          │
       └───────────────┬─────────────────┘
                       │ Ranked Queue + Resource Plan
                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MUNICIPAL OFFICER DASHBOARD                          │
│  React 18 | Tailwind CSS | Recharts | Lucide React | Officer Override Actions│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Component Responsibilities

| Component | Responsibility | Constraints / Rules |
|---|---|---|
| **Citizen Frontend** | Capture photo, pin location on Kopargaon map, submit report, track status | Never calculate priority on client; validate file types & bounds client-side |
| **Backend API** | Validate payload, store files securely, orchestrate AI & Geo services, persist state | Atomic updates; enforce error boundaries and sanitized outputs |
| **Gemini AI Service** | Analyze image visual evidence; return structured JSON observation | **NEVER** calculate final priority score; **NEVER** decide allocations |
| **Location & Zone Engine**| Map coordinate point to Kopargaon Zone; compute estimated exposure | Maintain distinction between Zone Population and Estimated Exposure |
| **Priority Engine** | Compute deterministic 0–100 score; optimize resource allocation | Must be 100% explainable; all factor contributions visible to officers |
| **MongoDB** | Store persistent complaints, zone definitions, resource state, and audit logs | Index geospatial queries (2dsphere) and priority sorting fields |
| **Municipal Dashboard** | Display ranked queue, factor breakdown, resource availability, approval/override UI | All officer overrides require a recorded reason |

---

## 5. Frontend Architecture

- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS (utility-first, responsive, accessible color tokens)
- **Mapping:** React Leaflet with OpenStreetMap tiles (centered on Kopargaon: `19.8833° N, 74.4667° E`)
- **Visualizations:** Recharts (score breakdowns, resource consumption, trend analysis)
- **Icons:** Lucide React
- **State Management & Networking:** React Context / Custom Hooks + Fetch API / Axios

### Key Views:
1. **Citizen Portal:**
   - Landing page & Category Selector (Waste Management active; others flagged "Coming Soon")
   - Multi-step Report Wizard: Camera/Upload → Location Picker → Verification → Submit
   - Complaint Tracking view (lookup by tracking ID or citizen phone)
2. **Officer Dashboard:**
   - Priority-ranked complaint queue with visual urgency badges
   - Deep inspection modal: photo, AI evidence metrics, factor score waterfall, map location
   - Real-time Municipal Resource availability panel
   - Action & Dispatch interface (Approve plan, Reassign, Override, Defer)

---

## 6. Backend Architecture

- **Runtime:** Node.js (v20 LTS recommended)
- **Framework:** Express.js REST API
- **File Handling:** Multer with memory/disk storage in `uploads/`
- **Security:** Helmet, CORS (configured for local & deployment origins), JWT authentication for officers
- **Modular Structure:**
  - `controllers/` — Request handling & response serialization
  - `services/` — Business logic (AI analysis, Priority engine, Geocoding)
  - `models/` — Mongoose schemas
  - `routes/` — Endpoint definitions
  - `middleware/` — Auth, upload validation, error middleware

---

## 7. MongoDB Architecture & Schema Overview

Five primary collections:
1. **`complaints`** — Core civic report document (stores photo URI, GPS location, zone reference, AI observations, priority score, status, timestamps).
2. **`zones`** — Predefined Kopargaon municipal wards with GeoJSON polygons and simulated population counts.
3. **`resources`** — Current available municipal resources (crews, vehicles, hours, budget).
4. **`users`** — Citizens and municipal officers with hashed credentials and roles.
5. **`decisions`** — Immutable audit log of officer decisions (recommended vs. approved allocation, overrides, timestamps).

---

## 8. AI Architecture (`@google/genai`)

### Critical Separation of Concerns:
Gemini Vision is an **evidence observer**, not the authority.

### Structured Observation Schema:
```json
{
  "wasteType": "mixed_solid_waste",
  "severity": 82,
  "healthRisk": 76,
  "environmentalRisk": 68,
  "obstruction": 90,
  "confidence": 0.91,
  "detectedElements": ["plastic bags", "organic refuse", "drainage blockage"],
  "requiresManualVerification": false,
  "analysisNotes": "Large waste pile blocking open storm drainage channel near commercial stalls."
}
```

### AI Failure Fallback:
If the AI call times out, returns unparseable JSON, or encounters an invalid image:
- Status is set to `MANUAL_REVIEW`.
- Default median baseline scores (e.g., 50) are tentatively assigned with `requiresManualVerification = true`.
- The report is surfaced to the officer with an "AI Assessment Inconclusive" banner.

---

## 9. Location & Zone Intelligence

### Kopargaon Boundary Constraints:
- Center: `Lat: 19.8833, Lng: 74.4667`
- The system checks if incoming coordinates fall within predefined Kopargaon zones.

### Population Exposure Distinction:
- **Zone Population:** Total demographic count of the ward (simulated).
- **Estimated Population Exposure:** A calculated score representing how many residents/commuters are impacted by the specific location (e.g., a pile in a dense market area scores 90/100, whereas an isolated plot in the outskirts scores 20/100).

---

## 10. Explainable Priority Engine

### Scoring Formula:
The engine applies a transparent, normalized 0–100 weighted formula:

$$\text{Priority Score} = (S \times 0.30) + (E \times 0.25) + (H \times 0.20) + (R \times 0.15) + (O \times 0.10)$$

Where:
- $S$ = **Severity Score** (0–100) from AI visual analysis
- $E$ = **Estimated Population Exposure** (0–100) based on zone & proximity to high-density hubs
- $H$ = **Health Risk** (0–100) from biohazard/decay potential
- $R$ = **Environmental Risk** (0–100) from proximity to water bodies/soil leaching
- $O$ = **Public Obstruction** (0–100) from road, footpath, or drainage blockage

*Note:* Weights are configurable in backend settings and adjustable during municipal tuning.

---

## 11. Municipal Resource Constraint Model

### Resource Variables:
1. **Waste Crews:** Available field teams (e.g., 6 total, 4 currently available).
2. **Vehicles:** Available compactors, tippers, and tractors.
3. **Available Hours:** Operational shift hours remaining today.
4. **Budget:** Daily municipal operational / fuel allocation (in INR).

### Allocation & Deferral Algorithm:
1. Rank all `UNDER_REVIEW` complaints by descending `priorityScore`.
2. Iterate through the ranked queue:
   - Calculate required crew size, vehicle type, hours, and estimated cost for the complaint.
   - If available resources can fulfill the requirement: **Select complaint** and decrement remaining resources.
   - If resources are insufficient: **Defer complaint** and attach a specific reason code:
     - `NO_VEHICLE`
     - `INSUFFICIENT_CREW`
     - `BUDGET_EXCEEDED`
     - `SHIFT_TIME_EXCEEDED`
     - `LOWER_PRIORITY` (consumed by higher-ranked items)

---

## 12. Complaint Lifecycle

```
[PENDING] 
    │ (Submission received)
    ▼
[AI_ANALYSIS] 
    │ (Gemini processing image)
    ├─────────────► [MANUAL_REVIEW] (if AI uncertain / confidence < 0.5)
    ▼
[UNDER_REVIEW] 
    │ (Priority score calculated, queued for officer)
    ├─────────────► [DEFERRED] (insufficient resources in current cycle)
    ├─────────────► [APPROVED / SCHEDULED] (crew & vehicle assigned)
    ▼
[IN_PROGRESS] 
    │ (Crew dispatched to site)
    ▼
[RESOLVED] 
    │ (Waste cleared & confirmed)
```

---

## 13. Folder Structure

```
kopargaon-civic-intelligence/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection, env validation
│   │   ├── controllers/     # Route controllers (report, officer, auth)
│   │   ├── middleware/      # Auth, Multer upload, error handlers
│   │   ├── models/          # Mongoose models (Complaint, Zone, Resource, User)
│   │   ├── routes/          # API routes (/api/reports, /api/dashboard)
│   │   ├── services/        # aiService.js, priorityEngine.js, zoneService.js
│   │   └── server.js        # Express app entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/             # API client & endpoints
│   │   ├── components/      # Common UI, MapPicker, PhotoUpload, ChartCard
│   │   ├── pages/           # CitizenPortal, OfficerDashboard, TrackingView
│   │   ├── context/         # Auth & App state
│   │   ├── index.css        # Tailwind directives
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── docs/
│   ├── ARCHITECTURE.md      # This document
│   ├── API-CONTRACT.md      # Precise REST & AI schemas
│   ├── PROJECT_SPEC.md      # Product specifications
│   ├── PRIORITY_ENGINE.md   # Scoring logic details
│   ├── AI_ANALYSIS_SPEC.md  # Gemini Vision prompts & rules
│   └── DATABASE_SCHEMA.md   # MongoDB schemas
├── .gitignore
└── README.md
```

---

## 14. Environment Variables & Security Rules

1. **Zero Secret Policy:** No API keys or connection strings in Git.
2. **Environment Template:** All required variables documented in `.env.example`:
   - `PORT`, `NODE_ENV`, `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`
3. **Upload Sanitization:** Multer enforces MIME validation (image/jpeg, image/png, image/webp) and size limits (max 10MB).
4. **CORS & Rate Limiting:** Enforce strict origin headers in production.

---

## 15. Team Ownership & Git Development Rules

### Branch Responsibilities:
- **`feature/backend-engine`** (Owner / Integration): Backend Express server, MongoDB models, Priority Engine, Resource Allocator, API routes.
- **`feature/citizen-report`** (Citizen Dev): Citizen UI, camera capture, React Leaflet map location picker, status tracking.
- **`feature/ai-analysis`** (AI Dev): `@google/genai` integration, vision prompts, structured JSON observation parser.
- **`feature/municipal-dashboard`** (Dashboard Dev): Officer dashboard, priority queue table, Recharts breakdown, status/override controls.

### The 14 Development Rules:
1. Work strictly on your assigned `feature/*` branch.
2. Pull latest `main` before starting any development session.
3. Push exclusively to your feature branch.
4. Never directly push code to `main`.
5. All code merges into `main` via Pull Requests.
6. Owner reviews and merges Pull Requests.
7. Do not modify another teammate's files without coordination.
8. Do not change `docs/API-CONTRACT.md` without full team agreement.
9. Do not install unapproved or unnecessary dependencies.
10. Do not rewrite architectural foundations without explicit approval.
11. Keep Git commits small, atomic, and descriptive.
12. Locally test every completed feature before creating a PR.
13. Never commit `.env` files, credentials, or API keys.
14. Prioritize the working Waste Management flow; do not build Coming Soon categories.