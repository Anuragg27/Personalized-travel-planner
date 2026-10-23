import { supabase } from './supabase.js'

const TRIPS_API_URL = 'http://127.0.0.1:8000'
const ITINERARY_API_URL = 'http://127.0.0.1:8000'

// Create a trip and save preferences to Supabase through FastAPI
export async function createTrip(tripPreferences) {
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

  const response = await fetch(`${TRIPS_API_URL}/api/trips/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(tripPreferences),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      typeof data.detail === 'string'
        ? data.detail
        : JSON.stringify(data.detail || 'Failed to create trip'),
    )
  }

  return data
}

// Generate personalized travel recommendations
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

// Generate an itinerary and save it to an existing trip
export async function generateItinerary(tripPreferences, tripId) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    throw new Error(sessionError.message)
  }

  if (!session) {
    throw new Error('Please log in before generating an itinerary.')
  }

  if (!tripId) {
    throw new Error('Trip ID is required to save the itinerary.')
  }

  const response = await fetch(
    `${ITINERARY_API_URL}/api/itinerary/generate?trip_id=${encodeURIComponent(tripId)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(tripPreferences),
    },
  )

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      typeof data.detail === 'string'
        ? data.detail
        : JSON.stringify(data.detail || 'Failed to generate itinerary'),
    )
  }

  return data
}