# Kopargaon Civic Intelligence Platform

> **AI-assisted resource-constrained civic decision and response platform for Kopargaon Municipal Council.**

---

## 1. Problem Statement

Municipal councils like Kopargaon Municipal Council receive numerous competing civic complaints daily—ranging from overflowing community garbage bins and illegal road dumping to toxic waste near schools and market blockages. However, the council operates under **strictly limited municipal resources**:
- Fixed number of sanitation and waste crews
- Limited collection and transport vehicles (small tippers, compactors, tractors)
- Constrained daily operational hours and labor shifts
- Capped emergency and maintenance budgets

Traditional civic apps merely act as passive complaint logs. They register tickets first-come, first-served without verifying visual evidence, assessing public health and environmental risks, or calculating whether sufficient municipal resources exist to resolve the issue. This results in severe backlogs, delayed response to hazardous incidents, and inefficient dispatch.

---

## 2. Solution: Resource-Constrained Prioritization

The **Kopargaon Civic Intelligence Platform** transforms civic reporting into an **intelligent, explainable decision-support system**:

1. **Evidence Verification:** Citizens submit geo-tagged photographic evidence.
2. **AI Visual Assessment:** Google Gemini Vision (`@google/genai`) inspects the photo and produces structured observations (waste type, severity, health risk, environmental risk, public obstruction, confidence).
3. **Location & Population Exposure:** Geospatial mapping identifies the Kopargaon zone and estimates population exposure.
4. **Deterministic Priority Scoring:** A transparent, explainable scoring engine calculates an objective 0–100 priority score based on weighted civic factors.
5. **Resource Feasibility & Queue Optimization:** The platform evaluates available municipal crews, vehicles, and budget to recommend an actionable, optimized dispatch schedule with transparent reasons for prioritized vs. deferred reports.
6. **Municipal Officer Authority:** Municipal officers review evidence and the explainable recommendation, approve or override the plan, and dispatch crews.
7. **Citizen Feedback Loop:** Citizens track real-time status and receive clear outcome updates.

> **CRITICAL RULE:** Gemini AI does **NOT** decide the final priority score or resource allocation. AI acts purely as an evidence observer. The backend deterministic engine computes the final score and resource recommendation. The municipal officer retains final authority.

---

## 3. Civic Categories & Scope

| Category | Status | Details |
|---|---|---|
| **Waste Management** | 🟢 **Fully Functional (MVP)** | Solid waste, garbage overflow, illegal dumping, hazardous debris |
| Water & Leakage | 🟡 *Coming Soon* | Pipeline bursts, low pressure, contamination |
| Street Lighting | 🟡 *Coming Soon* | Broken poles, dark stretches, electrical hazards |
| Roads & Infrastructure | 🟡 *Coming Soon* | Potholes, open manholes, damaged pavements |
| Public Spaces | 🟡 *Coming Soon* | Encroachments, park maintenance |
| Disaster / Hazards | 🟡 *Coming Soon* | Fallen trees, waterlogging, building collapse |
| Stray Animals | 🟡 *Coming Soon* | Stray cattle, rabies risk, animal rescue |

---

## 4. End-to-End Workflow

```
[Citizen] 
   │ Select Category ("Waste Management")
   │ Capture/Upload Photograph
   │ Select & Confirm Location on Kopargaon Map (React Leaflet / OSM)
   │ Submit Report
   ▼
[Backend API]
   │ Validates payload & stores image via Multer
   │ Triggers Gemini AI Analysis Service (@google/genai)
   │ Maps GPS to Kopargaon Zone & retrieves simulated population exposure
   ▼
[AI Analysis (@google/genai)]
   │ Detects waste type, severity (0-100), health risk (0-100),
   │ environmental risk (0-100), obstruction (0-100), confidence (0.0-1.0)
   ▼
[Backend Priority Engine]
   │ Priority Score = (Severity × 30%) + (Population Exposure × 25%) +
   │                  (Health Risk × 20%) + (Environmental Risk × 15%) +
   │                  (Obstruction × 10%)
   │ Checks available municipal resources (crews, vehicles, hours, budget)
   │ Generates explainable ranked queue with reasons
   ▼
[Municipal Dashboard]
   │ Officer inspects photo evidence, AI breakdown & explainable score
   │ Officer reviews resource allocation plan & updates status (Approve/Override)
   ▼
[Citizen Notification & Status]
   │ Citizen views live tracking: Pending → Under Review → Approved / Deferred → Resolved
```

---

## 5. Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Leaflet, OpenStreetMap, Recharts, Lucide React
- **Backend:** Node.js, Express, Multer, JWT
- **Database:** MongoDB, Mongoose
- **AI Vision:** Google Gemini API via `@google/genai` (structured JSON observation schema)
- **Maps & Geolocation:** React Leaflet, Leaflet, OpenStreetMap
- **Version Control & Collaboration:** GitHub, Git Feature-Branch Workflow
- **Development Environment:** Antigravity

---

## 6. Project Architecture & Documentation

Full architectural specifications and contracts are located in the [`docs/`](docs/) directory:

- 📄 [**`docs/ARCHITECTURE.md`**](docs/ARCHITECTURE.md) — Technical source of truth (System architecture, data flow, MongoDB models, resource model, Git rules, team ownership)
- 📄 [**`docs/API-CONTRACT.md`**](docs/API-CONTRACT.md) — Exact REST endpoints, JSON payloads, and AI observation schema
- 📄 [**`docs/PRIORITY_ENGINE.md`**](docs/PRIORITY_ENGINE.md) — Deterministic scoring formula, normalization rules, and resource allocation logic
- 📄 [**`docs/AI_ANALYSIS_SPEC.md`**](docs/AI_ANALYSIS_SPEC.md) — Gemini Vision input/output contract and error handling
- 📄 [**`docs/DATABASE_SCHEMA.md`**](docs/DATABASE_SCHEMA.md) — MongoDB schemas and index definitions
- 📄 [**`docs/PROJECT_SPEC.md`**](docs/PROJECT_SPEC.md) — Functional specifications, Kopargaon zones, and user journeys

---

## 7. Team Structure & Branch Ownership

| Role | Branch | Owner / Focus | Core Responsibilities |
|---|---|---|---|
| **Owner / Integration** | `feature/backend-engine` | Backend & Lead | Node.js, Express, MongoDB, REST APIs, Priority Engine, Resource Allocation, Integration Testing |
| **Citizen App** | `feature/citizen-report` | Frontend Dev 1 | Landing page, category selector, Waste report flow, photo upload UI, React Leaflet map UI, tracking UI |
| **AI Analysis** | `feature/ai-analysis` | AI Engineer | `@google/genai` integration, vision prompt design, structured observation parsing, error fallbacks |
| **Municipal Dashboard** | `feature/municipal-dashboard` | Frontend Dev 2 | Officer dashboard, priority queue, explainable score breakdown, resource allocation UI, Recharts charts, status management |

---

## 8. Git Development Workflow

To maintain clean parallel development across 4 team members:

1. **Isolation:** Developers work strictly on their assigned `feature/*` branch.
2. **Sync Before Work:** Always pull the latest `main` before starting a feature: `git pull origin main`.
3. **No Direct Pushes to `main`:** All code enters `main` exclusively through Pull Requests.
4. **Code Reviews:** The Project Owner reviews and merges Pull Requests.
5. **Contract Adherence:** No developer may alter `docs/API-CONTRACT.md` without full team agreement.
6. **Zero Secrets:** Never commit `.env`, `.env.*`, or API keys.

---

## 9. Running Locally (Once Implemented)

### Prerequisites
- Node.js 20+
- MongoDB (local or MongoDB Atlas)
- Google Gemini API Key (`GEMINI_API_KEY`)

### Setup Instructions
```bash
# 1. Clone the repository
git clone https://github.com/sahilvarpe8256-crypto/kopargaon-civic-intelligence.git
cd kopargaon-civic-intelligence

# 2. Configure environment variables
cp .env.example .env
# Edit .env and supply GEMINI_API_KEY and MONGODB_URI

# 3. Setup Backend
cd backend
npm install
npm run dev

# 4. Setup Frontend (in a separate terminal)
cd ../frontend
npm install
npm run dev
```

---

## 10. Disclaimer

> **Hackathon Prototype Note:** This platform is designed as an MVP for demonstration purposes. Where official Kopargaon Municipal Council demographic counts, ward geometries, and vehicle inventories are unavailable, **simulated Kopargaon zone population and resource data** have been modeled to demonstrate realistic municipal operations.