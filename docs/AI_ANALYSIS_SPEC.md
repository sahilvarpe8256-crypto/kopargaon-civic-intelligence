# AI_ANALYSIS_SPEC.md
## Kopargaon Waste Intelligence â€” AI Analysis Specification

**Version:** 1.0  
**Model:** Google Gemini Vision API (gemini-2.0-flash or equivalent)  
**Role of AI:** Evidence assessment ONLY. AI does not decide resource allocation or prioritization.

---

## 1. Core Principle

The AI vision model receives an uploaded citizen photo and returns a **structured JSON evidence report**.

This evidence report is then consumed by the deterministic Priority Engine (see PRIORITY_ENGINE.md) which produces the actual prioritization and resource recommendation.

> The AI is a witness, not a judge.

---

## 2. Input to AI

```json
{
  "image_base64": "<base64-encoded-image>",
  "citizen_description": "<optional free-text from citizen, max 500 chars>",
  "zone_context": {
    "zone_id": "Z01",
    "zone_name": "Kopargaon Market Area"
  }
}
```

**Notes:**
- If multiple images are uploaded, each image is analyzed separately and results are aggregated
- Citizen description is provided as supplementary context only; AI must not over-rely on it
- Zone context helps the AI understand the urban/rural nature of the location

---

## 3. Expected AI Output â€” Structured JSON

The backend must enforce this schema. If the AI returns a non-conforming response, the backend must parse defensively and flag for manual review.

```json
{
  "analysis_version": "1.0",
  "waste_detected": true,
  "waste_type": "mixed_solid_waste",
  "waste_type_detail": "Plastic bags, food waste, and construction debris mixed",
  "visible_severity": "high",
  "evidence_confidence": 0.87,
  "health_risk": "high",
  "environmental_risk": "medium",
  "public_obstruction": true,
  "estimated_scale": "large",
  "requires_manual_verification": false,
  "image_quality": "acceptable",
  "rejection_reason": null,
  "ai_notes": "Large pile blocking footpath near market stalls. Multiple waste types visible. Possible fly-tipping site."
}
```

---

## 4. Field Definitions and Allowed Values

### 4.1 `waste_detected` â€” Boolean
- `true`: AI identifies waste material in the image
- `false`: No waste visible (triggers rejection handling)

### 4.2 `waste_type` â€” Enum
| Value | Description |
|---|---|
| `mixed_solid_waste` | Multiple types of solid waste combined |
| `organic_waste` | Food waste, agricultural waste |
| `plastic_waste` | Plastic bags, bottles, packaging |
| `construction_debris` | Rubble, cement, wood |
| `hazardous_waste` | Medical, chemical, or industrial waste |
| `liquid_waste` | Sewage, chemical spills |
| `bulk_waste` | Furniture, large items |
| `unknown` | Waste present but type unclear |

### 4.3 `visible_severity` â€” Enum
| Value | Description |
|---|---|
| `low` | Small amount, contained, no immediate risk |
| `medium` | Moderate amount, some spread, noticeable risk |
| `high` | Large pile or hazardous material, significant risk |
| `critical` | Immediate public health threat |

### 4.4 `evidence_confidence` â€” Float [0.0 â€“ 1.0]
- Represents AI's confidence in its own assessment
- < 0.5: Set `requires_manual_verification = true`
- 0.5 â€“ 0.7: Low confidence (flagged in priority engine)
- 0.7 â€“ 0.9: Medium confidence
- > 0.9: High confidence

### 4.5 `health_risk` â€” Enum
`none` | `low` | `medium` | `high` | `critical`

### 4.6 `environmental_risk` â€” Enum
`none` | `low` | `medium` | `high` | `critical`

### 4.7 `public_obstruction` â€” Boolean
- `true`: Waste is visibly blocking a road, footpath, entrance, or public access point

### 4.8 `estimated_scale` â€” Enum
| Value | Approximate Real-World Size |
|---|---|
| `small` | < 1 cubic meter |
| `medium` | 1â€“5 cubic meters |
| `large` | 5â€“20 cubic meters |
| `massive` | > 20 cubic meters |

### 4.9 `requires_manual_verification` â€” Boolean
Set to `true` in any of these cases:
- `evidence_confidence` < 0.5
- `image_quality` is `poor` or `unreadable`
- `waste_detected` is uncertain
- Image contains people, private property, or sensitive content
- AI detects possible evidence mismatch (photo does not match description)

### 4.10 `image_quality` â€” Enum
`good` | `acceptable` | `poor` | `unreadable`

### 4.11 `rejection_reason` â€” String or null
Populated only when the image cannot be analyzed as a valid waste report. Values:
- `no_waste_detected`
- `irrelevant_image`
- `blurry_unreadable`
- `private_property`
- `duplicate_location`
- `possible_evidence_mismatch`

---

## 5. Handling Special Cases

### 5.1 No Waste Detected
```json
{
  "waste_detected": false,
  "rejection_reason": "no_waste_detected",
  "evidence_confidence": 0.91,
  "requires_manual_verification": false,
  "ai_notes": "Image shows a clean road. No waste material visible."
}
```
**Backend action:** Set report status to `REJECTED_NO_WASTE`. Notify citizen that no waste was found in their photo. Offer them the option to re-upload.

### 5.2 Irrelevant Image (selfie, random object, etc.)
```json
{
  "waste_detected": false,
  "rejection_reason": "irrelevant_image",
  "evidence_confidence": 0.95,
  "requires_manual_verification": false,
  "ai_notes": "Image appears to be a selfie or unrelated photograph."
}
```
**Backend action:** Set report status to `REJECTED_IRRELEVANT`. Notify citizen.

### 5.3 Blurry or Unreadable Image
```json
{
  "image_quality": "unreadable",
  "waste_detected": false,
  "rejection_reason": "blurry_unreadable",
  "evidence_confidence": 0.1,
  "requires_manual_verification": true
}
```
**Backend action:** Set report status to `MANUAL_REVIEW`. An officer must inspect the original image.

### 5.4 Low Confidence (waste present but unclear)
```json
{
  "waste_detected": true,
  "visible_severity": "medium",
  "evidence_confidence": 0.42,
  "requires_manual_verification": true,
  "ai_notes": "Some material visible that may be waste, but image angle and lighting make assessment uncertain."
}
```
**Backend action:** Allow report to proceed but flag as `LOW_CONFIDENCE`. Priority engine applies a confidence penalty. Report may be flagged for officer attention.

### 5.5 Possible Evidence Mismatch
Citizen description says "chemical spill" but photo shows dry solid waste.
```json
{
  "waste_detected": true,
  "waste_type": "mixed_solid_waste",
  "rejection_reason": "possible_evidence_mismatch",
  "requires_manual_verification": true,
  "ai_notes": "Citizen reported chemical spill but image shows solid waste. Manual review recommended."
}
```
**Backend action:** Route to `MANUAL_REVIEW`.

---

## 6. System Prompt (Backend-Controlled)

The backend constructs the AI prompt. It must NOT be editable by citizens or officers.

**Required prompt elements:**
- Instruct AI to return ONLY valid JSON (no prose outside JSON)
- Specify exact allowed enum values for each field
- Instruct AI to assess only what is visible in the image
- Instruct AI not to make decisions about resource allocation
- Include the schema as part of the prompt
- Warn AI not to fabricate data it cannot see

**Example system prompt prefix:**
```
You are a waste evidence assessment assistant for Kopargaon Municipal Council.
Analyze the provided image and return ONLY a valid JSON object conforming to the following schema.
Do not include any text outside the JSON object.
Do not make recommendations about resource allocation or prioritization.
Assess only what is visually present in the image.
If you are uncertain, set requires_manual_verification to true.
```

---

## 7. Validation Rules (Backend)

After receiving AI response:
1. Parse JSON â€” if parsing fails, set `requires_manual_verification = true`
2. Validate all enum fields against allowed values
3. Validate `evidence_confidence` is between 0.0 and 1.0
4. If `waste_detected = false` AND `rejection_reason` is null â†’ set `rejection_reason = "no_waste_detected"`
5. If `evidence_confidence < 0.5` â†’ force `requires_manual_verification = true`
6. Store raw AI response in database alongside parsed fields (for audit)

---

## 8. AI Response Storage

The full AI response is stored in the `WasteReport` document under `ai_analysis` field (see DATABASE_SCHEMA.md). The raw response string is also stored for audit purposes.