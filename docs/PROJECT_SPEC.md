# PROJECT_SPEC.md
## Kopargaon Waste Intelligence â€” Complete Product Specification

**Version:** 1.0 â€” Hackathon Foundation  
**Scope:** Waste Management only (fully functional). All other categories: Coming Soon.  
**Status:** Single source of truth for all agents and developers.

---

## 1. Platform Identity

- **Name:** Kopargaon Waste Intelligence
- **Purpose:** AI-assisted civic waste management and resource prioritization for Kopargaon Municipal Council
- **Geographic Restriction:** Prototype is restricted to Kopargaon, Maharashtra, India
- **Users:** Citizens of Kopargaon, Municipal Officers of Kopargaon Municipal Council

---

## 2. Fundamental Principle

> **AI IS NOT THE FINAL DECISION MAKER.**
>
> - AI (Gemini Vision) provides structured visual evidence assessment only.
> - A deterministic priority/resource engine produces a scored, explainable recommendation.
> - The municipal officer retains absolute final authority to approve or override any recommendation.
> - Every officer action is recorded with a timestamp and optional reason.

---

## 3. User Roles

### 3.1 Citizen
- Registers with name, phone number (Kopargaon area), and email
- Can submit waste management reports
- Can track the status of their own reports
- Receives status notifications (in-app; SMS/email as future scope)

### 3.2 Municipal Officer
- Pre-registered by system admin (no public self-registration for officers)
- Can view all pending reports with AI evidence and priority scores
- Can compare competing reports
- Can view available resource inventory
- Can approve, modify, or override the system recommendation
- All decisions are recorded with a timestamp and optional override reason

### 3.3 System Admin (future scope)
- Manages officer accounts
- Manages zone configuration and resource inventory

---

## 4. Citizen Journey â€” Waste Management Report

```
Step 1: Landing Page
  â†’ Select Category: "Waste Management"
  â†’ All other categories shown as "Coming Soon" (non-clickable)

Step 2: Upload Evidence
  â†’ Upload 1â€“3 photos of the waste issue
  â†’ Accepted formats: JPEG, PNG, WebP
  â†’ Max size: 10 MB per image
  â†’ At least 1 photo is required

Step 3: Add Description (Optional)
  â†’ Free-text field, max 500 characters
  â†’ Pre-fill suggestions for common waste types

Step 4: Select Location
  â†’ Kopargaon interactive map (Google Maps)
  â†’ Citizen pins the exact location
  â†’ Map is pre-centered on Kopargaon (lat: 19.8833, lng: 74.4667)
  â†’ Citizen can search for a landmark/address within Kopargaon
  â†’ System automatically maps pin to a predefined Kopargaon zone

Step 5: Confirm and Submit
  â†’ Summary card shows: photo preview, description, location, zone
  â†’ Citizen confirms and submits
  â†’ System returns a Report ID immediately

Step 6: AI Analysis (background, ~5â€“15 seconds)
  â†’ Gemini Vision analyzes uploaded images
  â†’ Returns structured evidence JSON (see AI_ANALYSIS_SPEC.md)
  â†’ If AI confidence is too low, report is flagged for manual review

Step 7: Report Status
  â†’ Citizen can check status using Report ID or via their account
  â†’ Statuses: PENDING â†’ AI_ANALYSIS â†’ UNDER_REVIEW â†’ APPROVED | DEFERRED | MANUAL_REVIEW
  â†’ Citizen sees: status, zone, submitted time, outcome (if decided)
```

---

## 5. Municipal Officer Journey

```
Step 1: Login
  â†’ Officer-only login page (separate URL or role-based routing)
  â†’ JWT-authenticated session

Step 2: Dashboard â€” Pending Reports
  â†’ List of all pending reports sorted by priority score (descending)
  â†’ Each card shows: photo thumbnail, zone, AI summary, priority score, submission time

Step 3: Inspect Report
  â†’ Full photo evidence
  â†’ AI structured evidence breakdown
  â†’ Citizen description
  â†’ Map pin location
  â†’ Priority score breakdown (all 6 factors visible)

Step 4: Compare Competing Reports
  â†’ Side-by-side comparison of top N pending reports
  â†’ Scores, evidence, and resource requirements shown together

Step 5: Resource Status Panel
  â†’ Current available vehicles (type and count)
  â†’ Available workers
  â†’ Budget remaining this period
  â†’ Time windows available

Step 6: View Recommendation
  â†’ System recommendation: which reports to address, in what order
  â†’ Resource allocation plan
  â†’ Reports to defer (with reason)

Step 7: Officer Decision
  â†’ Approve recommendation as-is
  â†’ Modify: change allocation (e.g., assign different vehicle or worker count)
  â†’ Override: select a different set of reports to address
  â†’ Record override reason (required for overrides)
  â†’ Submit decision

Step 8: Outcome
  â†’ Approved reports: status changes to APPROVED, resource decremented
  â†’ Deferred reports: status changes to DEFERRED with reason
  â†’ Citizens notified of outcome
```

---

## 6. Location and Zone System

### 6.1 Map Configuration
- Map library: Google Maps JavaScript API
- Center coordinates: lat 19.8833, lng 74.4667 (Kopargaon town center)
- Default zoom: 14
- Map is restricted to Kopargaon area (bounds enforced)

### 6.2 Zones
- Kopargaon is divided into predefined zones (minimum 5 for prototype)
- Each zone has: zone_id, zone_name, population (simulated), geographic polygon
- Zone is determined server-side by testing if the submitted GPS point falls within a zone polygon
- If no zone match: report flagged as LOCATION_UNVERIFIED

### 6.3 Simulated Data Notice
> Zone boundaries, population figures, and resource data used in the prototype are simulated values representative of Kopargaon's scale. Official municipal data was unavailable at time of development.

**Example Prototype Zones (simulated):**
| Zone ID | Zone Name | Simulated Population |
|---|---|---|
| Z01 | Kopargaon Market Area | 12,000 |
| Z02 | Kopargaon Station Area | 9,500 |
| Z03 | Old Town / Peth | 8,200 |
| Z04 | New Residential Colony | 6,800 |
| Z05 | Industrial / Outskirts | 4,100 |

---

## 7. Civic Categories â€” Current State

| Category | Route | Status |
|---|---|---|
| Waste Management | /report/waste | âœ… Functional |
| Water & Leakage | /report/water | ðŸ”œ Coming Soon |
| Street Lighting | /report/lighting | ðŸ”œ Coming Soon |
| Roads & Infrastructure | /report/roads | ðŸ”œ Coming Soon |
| Public Spaces | /report/spaces | ðŸ”œ Coming Soon |
| Disaster / Hazards | /report/hazards | ðŸ”œ Coming Soon |
| Stray Animals | /report/animals | ðŸ”œ Coming Soon |

All "Coming Soon" routes should render a placeholder page. They must NOT share any logic or data models with Waste Management.

---

## 8. Report Status Lifecycle

```
PENDING
  â†’ AI_ANALYSIS (AI processing started)
    â†’ UNDER_REVIEW (AI done, awaiting officer)
      â†’ APPROVED (officer approved, resources allocated)
      â†’ DEFERRED (officer deferred, with reason)
      â†’ MANUAL_REVIEW (AI confidence too low, needs human inspection)
        â†’ UNDER_REVIEW (after manual inspection)
```

---

## 9. Non-Functional Requirements (Prototype)

- Response time for report submission: < 2 seconds (before AI analysis)
- AI analysis completion: best-effort, displayed asynchronously
- File storage: local `uploads/` directory (not cloud for prototype)
- No real-time WebSocket required for prototype (polling acceptable)
- Mobile-responsive UI is desirable but desktop-first is acceptable for prototype

---

## 10. Out of Scope (Hackathon Prototype)

- SMS/email notifications (in-app status only)
- Multiple municipalities
- Offline support
- Bulk data import
- Admin panel for zone/resource management (hardcoded config acceptable)
- Payment or fine collection
- Automated vehicle dispatch integration