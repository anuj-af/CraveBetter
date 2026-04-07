# CraveBetter

Author: Anuj

CraveBetter is a lightweight AI-powered app for real-time food decisions and habit improvement.

## What Works Now

- Home: instant food decision analysis
- Track: recent meals
- Plan: lightweight guidance
- Dashboard: average score and trend insights
- Backend LLM mode: mock by default (no LM Studio needed)

## Core API

### POST /api/analyze

Request:
```json
{
  "food": "cheese burger and fries",
  "goal": "Fat loss",
  "time": "Dinner"
}
```

Response:
```json
{
  "score": 4,
  "issues": ["High saturated fat and low fiber balance."],
  "improvement": "Keep the same meal but reduce portion by 20% and add a fiber side like salad or fruit.",
  "alternative": "Try a grilled chicken burger or bean burger with baked wedges.",
  "explanation": "For your goal (Fat loss) and timing (Dinner), this choice scores 4/10...",
  "feeling": "Likely satisfied short-term, but may feel sluggish later if this becomes frequent.",
  "tag": "unhealthy",
  "source": "heuristic"
}
```

## Quick Local Run (Mock LLM)

### Backend
```bash
cd src/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export USE_MOCK_LLM=true
python3 api/app.py
```

Backend URL: http://localhost:5000

### Frontend
```bash
cd src/frontend/diet-assistant-ui
npm install
export REACT_APP_API_URL=http://localhost:5000
npm start
```

Frontend URL: http://localhost:3000

## Optional Real LLM Mode

If you later want a real LLM endpoint:

```bash
export USE_MOCK_LLM=false
export LLM_API_URL=http://127.0.0.1:1234/v1/chat/completions
export LLM_MODEL=phi-3.1-mini-128k-instruct
```

## Deploy to Google Cloud Run

This setup deploys backend and frontend as separate services.

### 1. Prerequisites

```bash
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

Set variables:

```bash
export PROJECT_ID=YOUR_GCP_PROJECT_ID
export REGION=us-central1
```

### 2. Deploy backend

```bash
cd src/backend
gcloud run deploy cravebetter-api \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars USE_MOCK_LLM=true
```

Copy backend URL from output:

```bash
export BACKEND_URL=https://YOUR_BACKEND_URL
```

### 3. Build and deploy frontend

```bash
cd ../frontend/diet-assistant-ui
gcloud builds submit --config cloudbuild.yaml --substitutions _REACT_APP_API_URL=$BACKEND_URL

gcloud run deploy cravebetter-ui \
  --image gcr.io/$PROJECT_ID/cravebetter-ui \
  --region $REGION \
  --allow-unauthenticated
```

Open the `cravebetter-ui` URL shown by Cloud Run.

## Deployment Files Included

- `src/backend/Dockerfile`
- `src/backend/.dockerignore`
- `src/frontend/diet-assistant-ui/Dockerfile`
- `src/frontend/diet-assistant-ui/nginx.conf`
- `src/frontend/diet-assistant-ui/cloudbuild.yaml`
- `src/frontend/diet-assistant-ui/.dockerignore`

## Notes

- `USE_MOCK_LLM=true` is ideal for demos and cloud deployment without LM Studio.
- Frontend tracking uses browser local storage.
- For production, restrict CORS and secure service access.
