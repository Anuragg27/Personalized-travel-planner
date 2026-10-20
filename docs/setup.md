# Local setup

## Prerequisites

- Node.js 20 or later
- Python 3.11 or later
- npm (comes with Node.js)

## Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The React app should be available at http://localhost:5173.

## Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API should be available at http://localhost:8000.

- Health check: http://localhost:8000/health
- Interactive docs: http://localhost:8000/docs

On Windows, activate the virtual environment with:

```bash
.venv\Scripts\activate
```

## Environment files

Copy each `.env.example` to `.env` before running the apps. Leave secret values empty until those services are configured. Do not put real credentials in Git.
