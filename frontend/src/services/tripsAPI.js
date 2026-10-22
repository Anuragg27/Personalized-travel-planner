import { supabase } from './supabase.js'

const API_BASE_URL = 'http://127.0.0.1:8000'

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

  // 2. Send preferences and the access token to FastAPI
  const response = await fetch(`${API_BASE_URL}/api/trips/`, {
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