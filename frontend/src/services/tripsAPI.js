import { supabase } from './supabase.js'

const TRIPS_API_URL = 'http://127.0.0.1:8001'
const ITINERARY_API_URL = 'http://127.0.0.1:8001'

// Create a trip and save preferences to Supabase through FastAPI
export async function createTrip(tripPreferences) {
  // 1. Get the current authenticated session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    throw new Error(sessionError.message)
  }

  if (!session) {
    throw new Error('Please log in before creating a trip.')
  }

  // 2. Send preferences and access token to FastAPI
  const response = await fetch(`${TRIPS_API_URL}/api/trips/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(tripPreferences),
  })

  // 3. Handle the API response
  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      typeof data.detail === 'string'
        ? data.detail
        : JSON.stringify(data.detail || 'Failed to create trip'),
    )
  }

  return data
}

// Generate personalized travel recommendations using Gemini
export async function getRecommendations(tripPreferences) {
  const response = await fetch(
    `${ITINERARY_API_URL}/api/itinerary/recommendations`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tripPreferences),
    },
  )

  // Handle the response safely
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      typeof data.detail === 'string'
        ? data.detail
        : JSON.stringify(
            data.detail || 'Failed to generate recommendations',
          ),
    )
  }

  return data
}