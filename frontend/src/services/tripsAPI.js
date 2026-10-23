import { supabase } from './supabase.js'

const TRIPS_API_URL = 'http://127.0.0.1:8000'
const ITINERARY_API_URL = 'http://127.0.0.1:8000'

// Get the current authenticated session.
async function getAuthHeaders() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    throw new Error(error.message)
  }

  if (!session) {
    throw new Error('Please log in to continue.')
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  }
}

// Handle API responses consistently.
async function handleResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      typeof data.detail === 'string'
        ? data.detail
        : JSON.stringify(data.detail || fallbackMessage),
    )
  }

  return data
}

// Create a trip and save preferences.
export async function createTrip(tripPreferences) {
  const headers = await getAuthHeaders()

  const response = await fetch(`${TRIPS_API_URL}/api/trips/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(tripPreferences),
  })

  return handleResponse(response, 'Failed to create trip.')
}

// Get all trips belonging to the logged-in user.
export async function getMyTrips() {
  const headers = await getAuthHeaders()

  const response = await fetch(`${TRIPS_API_URL}/api/trips/`, {
    method: 'GET',
    headers,
  })

  return handleResponse(response, 'Failed to fetch your trips.')
}

// Get one saved trip by ID.
export async function getTripById(tripId) {
  if (!tripId) {
    throw new Error('Trip ID is required.')
  }

  const headers = await getAuthHeaders()

  const response = await fetch(
    `${TRIPS_API_URL}/api/trips/${encodeURIComponent(tripId)}`,
    {
      method: 'GET',
      headers,
    },
  )

  return handleResponse(response, 'Failed to fetch trip details.')
}

// Generate personalized travel recommendations.
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

  return handleResponse(response, 'Failed to generate recommendations.')
}

// Generate an itinerary and save it to an existing trip.
export async function generateItinerary(tripPreferences, tripId) {
  if (!tripId) {
    throw new Error('Trip ID is required to save the itinerary.')
  }

  const headers = await getAuthHeaders()

  const response = await fetch(
    `${ITINERARY_API_URL}/api/itinerary/generate?trip_id=${encodeURIComponent(tripId)}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(tripPreferences),
    },
  )

  return handleResponse(response, 'Failed to generate itinerary.')
}
// Update an existing trip.
export async function updateTrip(tripId, tripUpdates) {
  if (!tripId) {
    throw new Error('Trip ID is required to update a trip.')
  }

  const headers = await getAuthHeaders()

  const response = await fetch(
    `${TRIPS_API_URL}/api/trips/${encodeURIComponent(tripId)}`,
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify(tripUpdates),
    },
  )

  return handleResponse(response, 'Failed to update trip.')
}