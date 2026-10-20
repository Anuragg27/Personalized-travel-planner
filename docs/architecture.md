# Architecture

This project is a full-stack web application with a React frontend and a FastAPI backend. Supabase and a generative AI API will be added in later milestones.

## Request flow (planned)

1. The user uses the React app in `frontend/`.
2. The frontend calls the FastAPI app in `backend/` using `VITE_API_BASE_URL`.
3. FastAPI routers in `backend/app/api/routers/` receive HTTP requests.
4. Services in `backend/app/services/` will later call Supabase and the AI API.
5. Pydantic schemas in `backend/app/schemas/` will describe request and response shapes.

## Where secrets live

- Frontend `.env` files may contain public values such as the API base URL and the Supabase anon key.
- Backend `.env` files hold private values such as the Supabase service role key and the AI API key.
- Never commit `.env` files. Use `.env.example` files as templates only.
