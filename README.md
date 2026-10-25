# ✈️ Personalized Travel Itinerary Planner

An AI-powered travel planning web application that generates personalized travel itineraries based on a user's destination, travel dates, budget, interests, dietary preferences, travel pace, and preferred travel vibe.

🌐 **Live Demo:** https://personalized-travel-planner-drab.vercel.app/

📚 **Backend API:** https://personalized-travel-planner.onrender.com/docs

## ✨ Features

- 🔐 **User Authentication:** Sign up and log in securely using Supabase Auth.
- 🧭 **Personalized Trip Planning:** Enter your origin, destination, travel dates, budget, and number of travelers.
- 🎯 **Interest-Based Recommendations:** Customize trips based on selected interests.
- 🌄 **Travel Vibe Personalization:** Choose a travel style such as adventure, relaxation, luxury, budget, or balanced travel.
- 🤖 **AI-Powered Itinerary Generation:** Generate day-by-day travel plans using Groq AI.
- 🗓️ **Daily Activities:** Organize itinerary activities into morning, afternoon, and evening.
- 💾 **Trip Management:** Save trips and access them later.
- 📋 **My Trips Dashboard:** View your saved trips.
- 📝 **Trip Details:** View generated itinerary information for individual trips.
- 📱 **Responsive Interface:** Use the application across desktop and mobile screen sizes.

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS
- React Router
- Framer Motion
- Lucide React

### Backend
- Python
- FastAPI
- Uvicorn

### Database and Authentication
- Supabase
- PostgreSQL
- Supabase Auth

### Artificial Intelligence
- Groq API
- Large Language Models (LLMs)
- Prompt Engineering
- Structured JSON Responses

### Deployment and Version Control
- Vercel — Frontend deployment
- Render — Backend deployment
- Git and GitHub — Version control

## 🏗️ Application Architecture

```text
User
 |
 v
React Frontend (Vercel)
 |
 | HTTP requests / REST API
 v
FastAPI Backend (Render)
 |
 +--------------------+
 |                    |
 v                    v
Supabase           Groq AI
 |                    |
 v                    v
User Authentication  AI-Generated
and Trip Storage     Itineraries

## 📂 Project Structure

Personalized-travel-planner/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   ├── public/
│   ├── package.json
│   └── .env.example
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routers/
│   │   ├── core/
│   │   ├── schemas/
│   │   └── services/
│   ├── requirements.txt
│   └── .env.example
├── docs/
├── .gitignore
└── README.md
