# Personalized Travel Itinerary Planner

An AI-powered travel planning application that helps users create personalised travel itineraries based on their destination, budget, interests, and travel dates.

## Features

Planned features:

- Personalised travel recommendations
- Budget-based trip planning
- Day-by-day itinerary generation
- Destination and attraction suggestions
- User preference collection
- Saving, editing, and regenerating trips
- Supabase authentication and database integration

This repository currently contains the Milestone 1 project skeleton. Application features are not implemented yet.

## Tech stack

- Frontend: React with Vite and JavaScript
- Styling: CSS
- Backend: Python with FastAPI
- Database and authentication: Supabase (later)
- AI: a generative AI API (later)
- Version control: Git and GitHub

## Folder structure

```text
.
├── README.md
├── .gitignore
├── docs/
├── frontend/          # React + Vite app
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── services/
│       ├── styles/
│       └── utils/
└── backend/           # FastAPI app
    └── app/
        ├── api/routers/
        ├── core/
        ├── models/
        ├── schemas/
        └── services/
```

## Basic setup

The frontend and backend run independently.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173.

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open http://localhost:8000.

More detail is in `docs/setup.md`. Architecture notes are in `docs/architecture.md`.
