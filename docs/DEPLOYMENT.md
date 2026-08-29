# Kopargaon Civic Intelligence Platform ?" Deployment Guide

This document outlines the production deployment architecture, environment configurations, security guidelines, and containerized deployment procedures for the Kopargaon Civic Intelligence Platform.

---

## 1. System Architecture

```text
+-----------------------------------------------------------+
|                      Internet / DNS                       |
+-----------------------------------------------------------+
                             |
                +------------+------------+
                |                         |
                v                         v
+-------------------------------+  +-------------------------------+
|  Frontend (Static / Nginx)    |  |  Backend (Node.js / Express)  |
|  - React 18 + Vite SPA        |  |  - REST APIs                  |
|  - Security Headers (Nginx)   |  |  - Deterministic Priority     |
|  - Port 80 / 443              |  |  - Resource Allocation Engine |
+-------------------------------+  |  - Port 5000                  |
                                   +-------------------------------+
                                                  |
                                   +--------------+--------------+
                                   |                             |
                                   v                             v
                    +-----------------------------+  +---------------------+
                    | MongoDB / MongoDB Atlas     |  | Google Gemini AI    |
                    | - Persistent Storage        |  | - Vision Evidence   |
                    | - Port 27017                |  | - API Gateway       |
                    +-----------------------------+  +---------------------+
```

---

## 2. Production Environment Variables

### Backend Environment (`backend/.env`)

| Variable | Required | Default / Example | Purpose |
|---|---|---|---|
| `PORT` | Optional | `5000` | Port for the Express HTTP server |
| `NODE_ENV` | Yes | `production` | Enables production optimizations & secure logging |
| `MONGODB_URI` | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/kopargaon` | MongoDB production connection string |
| `JWT_SECRET` | Yes | `[Cryptographically random string]` | Secret key used for signing municipal auth tokens |
| `JWT_EXPIRES_IN` | Optional | `7d` | Session token duration |
| `GEMINI_API_KEY` | Optional | `AIzaSy...` | Google Gemini Vision API key (falls back to mock if empty) |
| `GEMINI_MODEL` | Optional | `gemini-2.0-flash` | Gemini model tag |
| `AI_MODE` | Optional | `mock` / `live` | Toggle deterministic offline mock vs live AI |
| `CONFIDENCE_THRESHOLD` | Optional | `50` | Minimum confidence required before manual review flag |
| `ALLOWED_ORIGINS` | Yes | `https://civic.kopargaon.gov.in` | Comma-separated list of allowed CORS domains |
| `UPLOAD_DIR` | Optional | `uploads` | Directory for uploaded complaint photos |
| `MAX_FILE_SIZE_MB` | Optional | `10` | Maximum allowable upload size in megabytes |

### Frontend Environment (`frontend/.env`)

| Variable | Required | Default / Example | Purpose |
|---|---|---|---|
| `VITE_API_BASE_URL` | Yes | `/api` or `https://api.civic.kopargaon.gov.in/api` | Backend API gateway root |

---

## 3. Containerized Deployment (Docker & Docker Compose)

### 3.1 Quick Start with Docker Compose

Run the entire full-stack platform (MongoDB, Backend, and Frontend Nginx) with a single command:

```bash
docker-compose up -d --build
```

- **Frontend Application:** `http://localhost:80`
- **Backend API & Health:** `http://localhost:5000/api/health`
- **MongoDB:** `localhost:27017`

### 3.2 Stopping Containers

```bash
docker-compose down
```

---

## 4. Production Cloud Hosting Recommendations

### Option A: Cloud Container Services (AWS ECS, GCP Cloud Run, Render, Railway)
1. Build and push the Docker images for `backend` and `frontend`.
2. Deploy `backend` container with environment variables injected from secrets manager.
3. Deploy `frontend` container with Nginx SPA configuration.
4. Attach a managed **MongoDB Atlas** cluster for durable multi-AZ persistence.

### Option B: Decoupled Static Frontend + Node Service
1. **Frontend:** Build static files (`npm run build` in `frontend/`) and host on **Vercel**, **Netlify**, or **Cloudflare Pages**.
2. **Backend:** Deploy `backend/` to **Render Web Service**, **Fly.io**, or **AWS Elastic Beanstalk**.
3. **Database:** **MongoDB Atlas (M0/M10)** with IP whitelist restricted to the backend IP.

---

## 5. Security & Verification Checklist

- [x] Strict Helmet security headers enabled (`X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`).
- [x] CORS restricted to authorized domains via `ALLOWED_ORIGINS`.
- [x] File upload MIME-type filtering (`image/jpeg`, `image/png`, `image/webp`) and 10MB limit.
- [x] Gemini API Key and Database secrets strictly isolated to backend environment.
- [x] Offline deterministic fallback ensures 100% platform availability during network outages.