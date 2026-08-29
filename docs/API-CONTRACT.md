# Kopargaon Civic Intelligence Platform — API Contract

**Version:** 1.0 (MVP)  
**Base URL:** `http://localhost:5000/api`  
**Content-Type:** `application/json` (except image upload: `multipart/form-data`)

---

## 1. Core Data Model: Complaint / Report Object

All endpoints exposing complaint entities return or consume the following standardized JSON object:

```typescript
interface Complaint {
  id: string;                                // Unique identifier (e.g., "RPT-20260829-0012")
  category: "waste_management";             // Fixed as "waste_management" for MVP
  imageUrl: string;                         // Relative or public URL to uploaded photograph
  latitude: number;                         // Geolocation latitude (e.g., 19.8845)
  longitude: number;                        // Geolocation longitude (e.g., 74.4671)
  zoneId: string;                           // Kopargaon Zone ID (e.g., "Z01")
  zonePopulation: number;                   // Simulated ward population (e.g., 12000)
  estimatedPopulationExposure: number;      // Calculated 0-100 exposure score based on location density
  
  // AI Observations (From Gemini Vision - strictly observational)
  aiAnalysis: {
    wasteType: string;                      // e.g. "mixed_solid_waste", "organic", "plastic", "hazardous"
    detectedElements: string[];             // Visual items identified
    requiresManualVerification: boolean;    // true if image is blurry or confidence < 0.5
    notes?: string;                         // AI descriptive observation
  };
  severity: number;                         // 0-100 (from AI visual scale)
  healthRisk: number;                       // 0-100 (from AI risk evaluation)
  environmentalRisk: number;                // 0-100 (from AI environmental evaluation)
  obstruction: number;                      // 0-100 (from AI road/drainage blockage evaluation)
  confidence: number;                       // 0.00 - 1.00 (AI evidence confidence)
  
  // Backend Calculated Priority (Deterministic)
  priorityScore: number | null;             // 0.00 - 100.00 (Calculated by backend engine)
  priorityReasons: {
    severityContribution: number;          // Severity × 0.30
    exposureContribution: number;          // Population Exposure × 0.25
    healthRiskContribution: number;        // Health Risk × 0.20
    environmentalContribution: number;     // Environmental Risk × 0.15
    obstructionContribution: number;       // Obstruction × 0.10
    summary: string;                       // Human-readable explanation for municipal supervisor
  } | null;

  // Status & Lifecycle
  status: "PENDING" | "AI_ANALYSIS" | "UNDER_REVIEW" | "APPROVED" | "DEFERRED" | "MANUAL_REVIEW" | "IN_PROGRESS" | "RESOLVED";
  assignedResources?: {
    crewId?: string;
    vehicleType?: string;
    estimatedHours?: number;
    estimatedCostINR?: number;
  };
  deferralReason?: string | null;           // Reason code if deferred (e.g., "NO_VEHICLE")
  officerNotes?: string | null;

  createdAt: string;                        // ISO 8601 Timestamp
  updatedAt: string;                        // ISO 8601 Timestamp
}
```

---

## 2. Gemini AI Analysis Contract (`@google/genai`)

### Principle:
Gemini Vision is an **evidence observer**. It **never** computes or dictates the authoritative `priorityScore`.

### Expected Gemini JSON Schema:
```json
{
  "wasteType": "mixed_solid_waste",
  "severity": 82,
  "healthRisk": 76,
  "environmentalRisk": 68,
  "obstruction": 90,
  "confidence": 0.91,
  "detectedElements": [
    "plastic bags",
    "rotting vegetable waste",
    "blocked open gutter"
  ],
  "requiresManualVerification": false,
  "notes": "Large refuse heap encroaching on pedestrian footpath and obstructing roadside drainage."
}
```

---

## 3. Endpoints

### 3.1 Create Complaint / Report
Submit a new citizen waste report with photo evidence and location.

- **Method:** `POST`
- **Route:** `/api/reports`
- **Content-Type:** `multipart/form-data`

#### Request Payload (FormData):
| Field | Type | Required | Description |
|---|---|---|---|
| `image` | File | Yes | Photo evidence (JPEG, PNG, WebP; max 10MB) |
| `latitude` | Number | Yes | GPS Latitude |
| `longitude` | Number | Yes | GPS Longitude |
| `description` | String | No | Citizen optional remark (max 500 chars) |
| `category` | String | No | Defaults to `waste_management` |

#### Response `201 Created`:
```json
{
  "success": true,
  "message": "Complaint registered. AI verification and prioritization initiated.",
  "data": {
    "id": "RPT-20260829-0012",
    "status": "AI_ANALYSIS",
    "createdAt": "2026-08-29T16:20:00Z"
  }
}
```

---

### 3.2 Get Complaints (Queue / List)
Retrieve list of complaints with optional status and zone filters.

- **Method:** `GET`
- **Route:** `/api/reports`
- **Query Parameters:**
  - `status` (optional): Filter by status (e.g. `UNDER_REVIEW`, `APPROVED`)
  - `zoneId` (optional): Filter by zone (e.g. `Z01`)
  - `sortBy` (optional): `priorityScore` (default) or `createdAt`
  - `order` (optional): `desc` (default) or `asc`

#### Response `200 OK`:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "RPT-20260829-0012",
      "category": "waste_management",
      "imageUrl": "/uploads/rpt_0012.jpg",
      "latitude": 19.8845,
      "longitude": 74.4671,
      "zoneId": "Z01",
      "zonePopulation": 12000,
      "estimatedPopulationExposure": 85,
      "aiAnalysis": {
        "wasteType": "mixed_solid_waste",
        "detectedElements": ["plastic", "organic waste"],
        "requiresManualVerification": false
      },
      "severity": 82,
      "healthRisk": 76,
      "environmentalRisk": 68,
      "obstruction": 90,
      "confidence": 0.91,
      "priorityScore": 80.20,
      "priorityReasons": {
        "severityContribution": 24.60,
        "exposureContribution": 21.25,
        "healthRiskContribution": 15.20,
        "environmentalContribution": 10.20,
        "obstructionContribution": 9.00,
        "summary": "High obstruction in dense commercial zone Z01 with critical health risks."
      },
      "status": "UNDER_REVIEW",
      "createdAt": "2026-08-29T16:20:00Z",
      "updatedAt": "2026-08-29T16:20:15Z"
    }
  ]
}
```

---

### 3.3 Get Complaint by ID
Inspect details and evidence of a specific report.

- **Method:** `GET`
- **Route:** `/api/reports/:id`

#### Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "id": "RPT-20260829-0012",
    "category": "waste_management",
    "imageUrl": "/uploads/rpt_0012.jpg",
    "latitude": 19.8845,
    "longitude": 74.4671,
    "zoneId": "Z01",
    "zonePopulation": 12000,
    "estimatedPopulationExposure": 85,
    "aiAnalysis": {
      "wasteType": "mixed_solid_waste",
      "detectedElements": ["plastic bags", "decaying organic waste"],
      "requiresManualVerification": false,
      "notes": "Large waste pile blocking open storm drainage channel near commercial stalls."
    },
    "severity": 82,
    "healthRisk": 76,
    "environmentalRisk": 68,
    "obstruction": 90,
    "confidence": 0.91,
    "priorityScore": 80.20,
    "priorityReasons": {
      "severityContribution": 24.60,
      "exposureContribution": 21.25,
      "healthRiskContribution": 15.20,
      "environmentalContribution": 10.20,
      "obstructionContribution": 9.00,
      "summary": "High obstruction in dense commercial zone Z01 with critical health risks."
    },
    "status": "UNDER_REVIEW",
    "createdAt": "2026-08-29T16:20:00Z",
    "updatedAt": "2026-08-29T16:20:15Z"
  }
}
```

---

### 3.4 Update Complaint Status (Municipal Officer Action)
Approve dispatch, defer, or update lifecycle stage of a complaint.

- **Method:** `PATCH`
- **Route:** `/api/reports/:id/status`

#### Request Body:
```json
{
  "status": "APPROVED",
  "assignedResources": {
    "crewId": "CREW-NORTH-1",
    "vehicleType": "compactor_truck",
    "estimatedHours": 3,
    "estimatedCostINR": 1800
  },
  "officerNotes": "High priority drainage blockage. Dispatched Crew 1 on morning shift."
}
```

#### Response `200 OK`:
```json
{
  "success": true,
  "message": "Status updated successfully.",
  "data": {
    "id": "RPT-20260829-0012",
    "status": "APPROVED",
    "updatedAt": "2026-08-29T16:30:00Z"
  }
}
```

---

### 3.5 Get Dashboard & Resource Information
Fetch current municipal resource capacity, inventory, and shift availability.

- **Method:** `GET`
- **Route:** `/api/dashboard/resources`

#### Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "date": "2026-08-29",
    "crews": {
      "total": 6,
      "available": 4,
      "dispatched": 2
    },
    "vehicles": [
      { "type": "compactor_truck", "total": 2, "available": 1 },
      { "type": "mini_tipper", "total": 4, "available": 3 },
      { "type": "tractor_trailer", "total": 2, "available": 2 }
    ],
    "workingHoursRemainingToday": 6.5,
    "dailyBudgetINR": {
      "allocated": 25000,
      "spent": 8500,
      "remaining": 16500
    }
  }
}
```

---

### 3.6 Run Priority & Resource Allocation Engine
Calculate resource-constrained recommendation across all active reports.

- **Method:** `POST`
- **Route:** `/api/dashboard/prioritize`

#### Response `200 OK`:
```json
{
  "success": true,
  "recommendation": {
    "timestamp": "2026-08-29T16:35:00Z",
    "selectedComplaints": [
      {
        "id": "RPT-20260829-0012",
        "priorityScore": 80.20,
        "allocatedResources": {
          "crewSize": 4,
          "vehicle": "compactor_truck",
          "estimatedHours": 3,
          "estimatedCostINR": 1800
        }
      }
    ],
    "deferredComplaints": [
      {
        "id": "RPT-20260829-0009",
        "priorityScore": 44.50,
        "deferralReason": "LOWER_PRIORITY",
        "explanation": "Available compactor truck allocated to higher-scoring hazard RPT-20260829-0012."
      }
    ],
    "totalResourceUsage": {
      "crewsRequired": 4,
      "totalHours": 3,
      "estimatedCostINR": 1800
    }
  }
}
```

---

## 4. Standard Error Responses

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid coordinates: latitude must be between 19.80 and 19.95 for Kopargaon."
  }
}
```