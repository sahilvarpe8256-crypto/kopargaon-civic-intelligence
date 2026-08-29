# Kopargaon Waste Intelligence Platform

> AI-assisted civic waste management and resource prioritization platform exclusively for Kopargaon Municipal Council.

---

## Problem Statement

Kopargaon Municipal Council faces multiple competing waste-management issues simultaneously â€” illegal dumping sites, overflowing dustbins, hazardous waste near schools â€” but has limited staff, vehicles, budget, and time. Existing complaint systems merely record issues; they do not verify evidence, prioritize competing reports, or allocate resources intelligently.

---

## Solution Overview

The Kopargaon Waste Intelligence Platform combines AI-powered visual evidence analysis with a deterministic, explainable priority engine to help municipal officers make faster, fairer, and more resource-efficient decisions.

**AI does NOT make final decisions.** It provides structured evidence. A deterministic engine produces a scored, ranked recommendation. A municipal officer retains full authority to approve or override.

---

## Core Workflow

```
Citizen                  Municipal Officer          System
  |                             |                     |
  |-- Select Category --------->|                     |
  |-- Upload Photo ------------>|                     |
  |-- Add Description (opt) --->|                     |
  |-- Pin Location (Map) ------>|                     |
  |-- Submit Report ----------->|                     |
  |                             |<-- AI Evidence      |
  |                             |<-- Priority Score   |
  |                             |<-- Resource Check   |
  |                             |-- Approve/Override->|
  |<-- Status Notification -----|                     |
```

**Step-by-step:**
1. Citizen selects "Waste Management" category
2. Citizen uploads a photo of the issue
3. Citizen adds an optional text description
4. Citizen pins the location on the Kopargaon map
5. Report submitted â†’ AI vision analysis triggers
6. AI returns structured evidence (type, severity, confidence, risk)
7. Priority engine scores the report against all pending reports
8. Engine checks available resources (vehicles, workers, budget, time)
9. Engine produces a ranked recommendation with reasons for each decision
10. Municipal officer reviews evidence + recommendation side-by-side
11. Officer approves or overrides the allocation
12. Citizen receives outcome notification

---

## Key Features

- **AI Evidence Assessment** â€” Gemini Vision API analyzes uploaded photos and returns structured JSON: waste type, severity, health risk, obstruction, confidence
- **Explainable Priority Engine** â€” Deterministic scoring across 6 weighted factors, all shown transparently to the officer
- **Resource Feasibility Check** â€” Recommendations are filtered against real available vehicles, workers, and budget
- **Officer Override** â€” Municipal officers can approve, modify, or reject any recommendation with a recorded reason
- **Citizen Status Tracking** â€” Citizens see real-time report status (Pending â†’ Under Review â†’ Approved/Deferred)
- **Kopargaon Zone Mapping** â€” Reports are automatically mapped to predefined municipal zones based on GPS coordinates
- **Competing Report Comparison** â€” Officers can compare multiple pending reports side-by-side before deciding

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Vanilla CSS |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| AI Analysis | Google Gemini Vision API (gemini-2.0-flash) |
| Maps | Google Maps JavaScript API |
| Authentication | JWT (JSON Web Tokens) |
| File Uploads | Multer |

---

## Project Architecture

```
kopargaon-waste-intelligence/
â”œâ”€â”€ frontend/           # React + Vite (citizen portal + officer dashboard)
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ pages/      # CitizenPortal, OfficerDashboard, ReportStatus
â”‚   â”‚   â”œâ”€â”€ components/ # Map, UploadForm, PriorityPanel, EvidenceCard
â”‚   â”‚   â””â”€â”€ api/        # Axios API client
â”œâ”€â”€ backend/            # Node.js + Express REST API
â”‚   â”œâ”€â”€ routes/         # API route definitions
â”‚   â”œâ”€â”€ controllers/    # Business logic handlers
â”‚   â”œâ”€â”€ models/         # MongoDB/Mongoose schemas
â”‚   â”œâ”€â”€ services/       # AI analysis, priority engine, notification
â”‚   â””â”€â”€ middleware/     # Auth, upload, validation
â”œâ”€â”€ docs/               # Single source of truth for all agents
â”‚   â”œâ”€â”€ PROJECT_SPEC.md
â”‚   â”œâ”€â”€ AI_ANALYSIS_SPEC.md
â”‚   â”œâ”€â”€ PRIORITY_ENGINE.md
â”‚   â”œâ”€â”€ DATABASE_SCHEMA.md
â”‚   â””â”€â”€ API_SPEC.md
â”œâ”€â”€ .env.example        # Environment variable template (no real keys)
â”œâ”€â”€ .gitignore
â””â”€â”€ README.md
```

---

## Civic Categories

| Category | Status |
|---|---|
| Waste Management | âœ… Fully Functional |
| Water & Leakage | ðŸ”œ Coming Soon |
| Street Lighting | ðŸ”œ Coming Soon |
| Roads & Infrastructure | ðŸ”œ Coming Soon |
| Public Spaces | ðŸ”œ Coming Soon |
| Disaster / Hazards | ðŸ”œ Coming Soon |
| Stray Animals | ðŸ”œ Coming Soon |

---

## Development Workflow

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Google Gemini API key (Gemini 2.0 Flash recommended)
- Google Maps JavaScript API key

### Setup
```bash
# 1. Clone the repository
git clone https://github.com/<org>/kopargaon-waste-intelligence.git
cd kopargaon-waste-intelligence

# 2. Copy environment template and fill in values
cp .env.example .env

# 3. Install backend dependencies
cd backend && npm install

# 4. Install frontend dependencies
cd ../frontend && npm install

# 5. Start backend (from /backend)
npm run dev

# 6. Start frontend (from /frontend, separate terminal)
npm run dev
```

### Team Responsibilities
| Developer | Area |
|---|---|
| Dev 1 | Frontend â€” Citizen Portal |
| Dev 2 | Frontend â€” Officer Dashboard |
| Dev 3 | Backend â€” API, AI Service, Priority Engine |
| Dev 4 | Backend â€” Database, Auth, File Upload |

---

## Security Note

- **Never commit `.env` or any file containing real API keys, passwords, or tokens.**
- `.gitignore` excludes all `.env.*` except `.env.example`.
- Uploaded citizen photos must be validated server-side and stored outside the web root.
- All sensitive API endpoints require valid JWT authentication.
- File type and size limits must be enforced server-side (not only client-side).

---

## Future Scope

- Multi-category civic issue support (Water, Roads, Lighting, Hazards, Stray Animals)
- Mobile-first Progressive Web App (PWA)
- Bulk resource scheduling across zones
- Historical analytics dashboard for the municipal council
- Real-time WebSocket status updates for citizens
- Integration with official Kopargaon Municipal Council data systems
- Automated escalation for high-severity unresolved reports

---

## Disclaimer

> This is a **hackathon prototype** built to demonstrate AI-assisted civic management.
> Where official Kopargaon Municipal Council data (zone boundaries, population counts, vehicle/staff inventory) is unavailable, **simulated demographic and resource data** representative of Kopargaon's scale may be used.
> This platform is not affiliated with or endorsed by any government body.