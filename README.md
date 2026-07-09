# healthscope

AI-powered medical triage and lab report explainer — instant access, no login required.

## Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Python FastAPI + Google Gemini + Google Places

## Setup

### 1. Environment variables

Copy `.env.example` to `.env` at the project root and add your API keys:

```
GEMINI_API_KEY=...
GOOGLE_PLACES_API_KEY=...
```

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/api` requests to the backend on port 8000.

## Features

- Quick Start intake (name + age) persisted in `localStorage`
- Symptom check and lab report analysis via Gemini structured JSON
- Color-coded triage badge with urgency score bar
- Interactive recommended next steps checklist
- Geolocation with Accra, Ghana fallback for nearby hospitals
- Client-side PDF export via `html2pdf.js`

## Disclaimer

This is an AI prototype and not official medical advice. Always consult a qualified healthcare professional.
