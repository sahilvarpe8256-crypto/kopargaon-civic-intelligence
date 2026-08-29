# API_SPEC.md
## Kopargaon Waste Intelligence â€” REST API Specification

**Version:** 1.0  
**Base URL:** `http://localhost:5000/api`  
**Authentication:** JWT Bearer token (required for officer endpoints and citizen-specific data)  
**Content-Type:** `application/json` (except file upload endpoints: `multipart/form-data`)

---

## 1. Authentication

### POST /api/auth/register
Register a new citizen account.

**Request Body:**
```json
{
  "name": "Rahul Patil",
  "email": "rahul@example.com",
  "phone": "9876543210",
  "password": "securePassword123"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "<jwt_token>",
  "user": {
    "id": "...",
    "name": "Rahul Patil",
    "email": "rahul@example.com",
    "role": "citizen"
  }
}
```

**Response 400:** Validation error (missing fields, invalid email, weak password)  
**Response 409:** Email already registered

---

### POST /api/auth/login
Login for both citizens and officers.

**Request Body:**
```json
{
  "email": "officer@kopargaon.gov.in",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "success": true,
  "token": "<jwt_token>",
  "user": {
    "id": "...",
    "name": "Officer Name",
    "role": "officer"
  }
}
```

**Response 401:** Invalid credentials

---

## 2. Reports â€” Citizen Submission

### POST /api/reports
Submit a new waste management report.

**Auth:** Required (citizen token)  
**Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Required | Description |
|---|---|---|---|
| `images` | File(s) | Yes | 1â€“3 image files (JPEG, PNG, WebP, max 10 MB each) |
| `description` | String | No | Max 500 characters |
| `latitude` | Number | Yes | GPS latitude |
| `longitude` | Number | Yes | GPS longitude |

**Response 201:**
```json
{
  "success": true,
  "report_id": "RPT-20260829-0042",
  "message": "Report submitted. AI analysis in progress.",
  "status": "AI_ANALYSIS"
}
```

**Response 400:** Missing images, invalid coordinates, file too large  
**Response 401:** Not authenticated  
**Response 422:** Location outside Kopargaon bounds

---

### GET /api/reports/:reportId/status
Get the current status of a report (citizen-facing).

**Auth:** Optional (public report ID lookup; no sensitive data returned to unauthenticated users)

**Response 200:**
```json
{
  "report_id": "RPT-20260829-0042",
  "status": "UNDER_REVIEW",
  "zone_name": "Kopargaon Market Area",
  "submitted_at": "2026-08-29T09:15:00Z",
  "outcome": null
}
```

**Response 200 (decided):**
```json
{
  "report_id": "RPT-20260829-0042",
  "status": "APPROVED",
  "zone_name": "Kopargaon Market Area",
  "submitted_at": "2026-08-29T09:15:00Z",
  "outcome": {
    "status": "APPROVED",
    "decided_at": "2026-08-29T14:30:00Z"
  }
}
```

**Response 404:** Report ID not found

---

### GET /api/reports/my
Get all reports submitted by the authenticated citizen.

**Auth:** Required (citizen token)

**Response 200:**
```json
{
  "success": true,
  "reports": [
    {
      "report_id": "RPT-20260829-0042",
      "status": "APPROVED",
      "submitted_at": "2026-08-29T09:15:00Z",
      "zone_name": "Kopargaon Market Area"
    }
  ],
  "total": 1
}
```

---

## 3. Reports â€” Officer Endpoints

All officer endpoints require `Authorization: Bearer <token>` where the token belongs to a user with `role: 'officer'`.

### GET /api/officer/reports
Get all pending reports sorted by priority score.

**Auth:** Required (officer)  
**Query Params:** `status=UNDER_REVIEW` (default), `zone=Z01`, `page=1`, `limit=20`

**Response 200:**
```json
{
  "success": true,
  "reports": [
    {
      "report_id": "RPT-20260829-0042",
      "status": "UNDER_REVIEW",
      "zone": { "zone_id": "Z01", "zone_name": "Kopargaon Market Area" },
      "priority_score": { "total": 7.43 },
      "ai_summary": {
        "waste_type": "mixed_solid_waste",
        "visible_severity": "high",
        "evidence_confidence": 0.87,
        "public_obstruction": true
      },
      "submitted_at": "2026-08-29T09:15:00Z",
      "image_thumbnail_url": "/api/uploads/thumb_rpt042_img1.jpg"
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 20
}
```

---

### GET /api/officer/reports/:reportId
Get full detail of a specific report including AI evidence and priority breakdown.

**Auth:** Required (officer)

**Response 200:**
```json
{
  "report_id": "RPT-20260829-0042",
  "status": "UNDER_REVIEW",
  "description": "Large pile near bus stop",
  "location": { "lat": 19.8845, "lng": 74.4671 },
  "zone": { "zone_id": "Z01", "zone_name": "Kopargaon Market Area", "population": 12000 },
  "images": ["/api/uploads/rpt042_img1.jpg"],
  "ai_analysis": {
    "waste_detected": true,
    "waste_type": "mixed_solid_waste",
    "visible_severity": "high",
    "evidence_confidence": 0.87,
    "health_risk": "high",
    "environmental_risk": "medium",
    "public_obstruction": true,
    "estimated_scale": "large",
    "ai_notes": "Large pile blocking footpath. Multiple waste types visible.",
    "requires_manual_verification": false,
    "analyzed_at": "2026-08-29T09:16:30Z"
  },
  "priority_score": {
    "total": 7.43,
    "breakdown": {
      "health_risk_score": 8.0,
      "population_score": 7.0,
      "waste_severity_score": 8.5,
      "obstruction_score": 10.0,
      "urgency_score": 5.0,
      "confidence_score": 8.7
    },
    "calculated_at": "2026-08-29T09:17:00Z"
  },
  "submitted_at": "2026-08-29T09:15:00Z"
}
```

---

## 4. AI Analysis (Internal)

### POST /api/internal/analyze
Trigger AI analysis for a report. Called internally by the backend after report submission. Should NOT be exposed publicly.

**Auth:** Internal service call (no JWT; firewall-restricted)

**Request Body:**
```json
{
  "report_id": "RPT-20260829-0042",
  "image_paths": ["uploads/rpt042_img1.jpg"],
  "citizen_description": "Large pile near bus stop",
  "zone_context": { "zone_id": "Z01", "zone_name": "Kopargaon Market Area" }
}
```

**Response 200:**
```json
{
  "success": true,
  "report_id": "RPT-20260829-0042",
  "ai_analysis": { "...full AI analysis object..." }
}
```

---

## 5. Priority Calculation

### POST /api/officer/priority/calculate
Recalculate priority scores for all UNDER_REVIEW reports and generate a resource allocation recommendation.

**Auth:** Required (officer)

**Request Body:** (empty â€” engine uses current resource state from DB)
```json
{}
```

**Response 200:**
```json
{
  "success": true,
  "recommendation": {
    "engine_version": "1.0",
    "generated_at": "2026-08-29T14:00:00Z",
    "resource_snapshot": {
      "vehicles": [
        { "type": "large_truck", "available": 1 },
        { "type": "small_truck", "available": 2 }
      ],
      "workers_available": 12,
      "budget_remaining_inr": 25000,
      "time_window_hours": 8
    },
    "selected_reports": [
      {
        "report_id": "RPT-20260829-0042",
        "priority_score": 7.43,
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
        "report_id": "RPT-20260829-0038",
        "priority_score": 5.12,
        "deferral_reason": "LOWER_PRIORITY",
        "deferral_reason_detail": "Resources exhausted by higher-priority reports"
      }
    ],
    "total_cost_estimate_inr": 3000,
    "total_time_estimate_hours": 4
  }
}
```

---

## 6. Resource Management

### GET /api/officer/resources
Get current resource state.

**Auth:** Required (officer)

**Response 200:**
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
  "time_window_hours": 8,
  "updated_at": "2026-08-29T08:00:00Z"
}
```

---

## 7. Officer Decision

### POST /api/officer/decisions
Submit officer decision (approve or override engine recommendation).

**Auth:** Required (officer)

**Request Body â€” Approve:**
```json
{
  "decision_type": "APPROVED",
  "recommendation_id": "...",
  "selected_report_ids": ["RPT-20260829-0042"],
  "deferred_report_ids": ["RPT-20260829-0038"]
}
```

**Request Body â€” Override:**
```json
{
  "decision_type": "OVERRIDDEN",
  "recommendation_id": "...",
  "override_reason": "Report 0038 is near a school and must be addressed today despite lower score.",
  "selected_report_ids": ["RPT-20260829-0038"],
  "deferred_report_ids": ["RPT-20260829-0042"]
}
```

**Response 200:**
```json
{
  "success": true,
  "decision_id": "DEC-20260829-001",
  "message": "Decision recorded. Citizens notified.",
  "reports_approved": 1,
  "reports_deferred": 1
}
```

**Response 400:** Missing override_reason when decision_type is OVERRIDDEN  
**Response 401:** Not authenticated as officer

---

## 8. Uploads

### GET /api/uploads/:filename
Serve uploaded citizen images.

**Auth:** Required (officer for full image; citizen can access their own)  
**Note:** In production, this should be replaced with a signed URL or CDN. For prototype, direct file serving is acceptable.

---

## 9. Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

**Standard Error Codes:**
| Code | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body or params invalid |
| `UNAUTHORIZED` | 401 | No token or invalid token |
| `FORBIDDEN` | 403 | Valid token but insufficient role |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate resource (email) |
| `LOCATION_ERROR` | 422 | Coordinates outside Kopargaon |
| `AI_ANALYSIS_FAILED` | 500 | Gemini API unavailable |
| `INTERNAL_ERROR` | 500 | Unexpected server error |