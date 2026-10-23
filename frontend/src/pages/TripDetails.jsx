import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Wallet,
  Users,
  Share2,
  Download,
  Copy,
  LoaderCircle,
  Clock,
  Plane,
  Pencil,
  RefreshCw,
  Save,
  X,
} from 'lucide-react'

import {
  getTripById,
  generateItinerary,
  updateTrip,
} from '../services/tripsAPI.js'

// Parse JSON strings safely.
function parseData(value) {
  let result = value

  for (let i = 0; i < 5 && typeof result === 'string'; i++) {
    const trimmed = result.trim()

    if (!trimmed) return null

    try {
      result = JSON.parse(trimmed)
    } catch {
      return result
    }
  }

  return result
}

// Normalize different itinerary formats.
function normalizeItinerary(value) {
  let data = parseData(value)

  for (let i = 0; i < 5; i++) {
    data = parseData(data)

    if (!data) return null

    if (Array.isArray(data)) {
      return { days: data }
    }

    if (typeof data !== 'object') {
      return { summary: String(data) }
    }

    if (Array.isArray(data.days)) {
      return data
    }

    if (Array.isArray(data.daily_itinerary)) {
      return { ...data, days: data.daily_itinerary }
    }

    if (Array.isArray(data.itinerary)) {
      data = data.itinerary
      continue
    }

    if (data.itinerary && typeof data.itinerary === 'object') {
      data = data.itinerary
      continue
    }

    if (data.plan) {
      data = data.plan
      continue
    }

    return data
  }

  return null
}

// Convert activities and objects into readable text.
function formatActivity(value) {
  value = parseData(value)

  if (value == null) return ''

  if (typeof value === 'string') return value

  if (typeof value === 'number') return String(value)

  if (Array.isArray(value)) {
    return value.map(formatActivity).filter(Boolean).join('\n')
  }

  if (typeof value === 'object') {
    const fields = [
      ['time', 'Time'],
      ['activity', 'Activity'],
      ['title', ''],
      ['description', ''],
      ['location', 'Location'],
      ['notes', 'Notes'],
      ['place', 'Place'],
      ['duration', 'Duration'],
    ]

    const lines = fields
      .filter(([key]) => value[key] != null)
      .map(([key, label]) => {
        const text = formatActivity(value[key])
        return text ? (label ? `${label}: ${text}` : text) : ''
      })
      .filter(Boolean)

    if (lines.length) {
      return [...new Set(lines)].join('\n')
    }

    const ignoredKeys = ['day', 'date', 'id']

    return Object.entries(value)
      .filter(([key, item]) => !ignoredKeys.includes(key) && item != null)
      .map(([key, item]) => {
        const text = formatActivity(item)
        if (!text) return ''

        const label = key
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (letter) => letter.toUpperCase())

        return `${label}: ${text}`
      })
      .filter(Boolean)
      .join('\n')
  }

  return ''
}

// Convert FastAPI validation errors into readable messages.
function getReadableError(error) {
  const rawMessage = error?.message || 'Something went wrong.'

  try {
    const parsed = JSON.parse(rawMessage)

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          const field = Array.isArray(item.loc)
            ? item.loc.filter((part) => part !== 'body').join('. ')
            : 'Request'

          return `${field}: ${item.msg || 'Invalid value'}`
        })
        .join('. ')
    }

    if (parsed.detail) {
      if (typeof parsed.detail === 'string') {
        return parsed.detail
      }

      if (Array.isArray(parsed.detail)) {
        return parsed.detail
          .map((item) => {
            const field = Array.isArray(item.loc)
              ? item.loc.filter((part) => part !== 'body').join('. ')
              : 'Request'

            return `${field}: ${item.msg || 'Invalid value'}`
          })
          .join('. ')
      }
    }
  } catch {
    // Use the original error message.
  }

  return rawMessage
}

function TripDetails() {
  const { tripId } = useParams()

  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    origin: '',
    destination: '',
    start_date: '',
    end_date: '',
    budget: '',
    travelers: '1',
    interests: [],
  })

  async function loadTrip() {
    try {
      setLoading(true)
      setError('')

      const response = await getTripById(tripId)
      const data = response.trip || response

      setTrip(data)

      setForm({
        origin: data.origin || '',
        destination: data.destination || '',
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        budget: data.budget ?? '',
        travelers: String(data.travelers ?? 1),
        interests: Array.isArray(data.interests)
          ? data.interests
          : [],
      })
    } catch (err) {
      setError(getReadableError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrip()
  }, [tripId])

  const itinerary = normalizeItinerary(trip?.itinerary)

  const days = Array.isArray(itinerary?.days)
    ? itinerary.days
    : []

  function createSummary() {
    const lines = [
      `Trip to ${trip?.destination || 'Unknown destination'}`,
      `From: ${trip?.origin || 'Not specified'}`,
      `Dates: ${trip?.start_date || ''} to ${trip?.end_date || ''}`,
      `Budget: ${trip?.budget ?? 'Not specified'}`,
      `Travelers: ${trip?.travelers ?? 1}`,
      '',
      'TRAVEL ITINERARY',
      '',
    ]

    if (days.length) {
      days.forEach((day, index) => {
        lines.push(
          `Day ${day.day || index + 1}${day.title ? `: ${day.title}` : ''}`
        )

        if (day.date) {
          lines.push(`Date: ${day.date}`)
        }

        if (Array.isArray(day.activities)) {
          day.activities.forEach((activity) => {
            const text = formatActivity(activity)
            if (text) lines.push(text)
          })
        }

        ;['morning', 'afternoon', 'evening'].forEach((period) => {
          if (day[period]) {
            lines.push(`${period}: ${formatActivity(day[period])}`)
          }
        })

        lines.push('')
      })
    } else if (itinerary?.summary) {
      lines.push(formatActivity(itinerary.summary))
    } else {
      lines.push('No readable itinerary is available yet.')
    }

    return lines.join('\n')
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(createSummary())
      setMessage('Trip summary copied successfully!')
      setError('')
    } catch {
      setMessage('')
      setError('Unable to copy. Check browser clipboard permissions.')
    }
  }

  async function shareTrip() {
    try {
      const text = createSummary()

      if (navigator.share) {
        await navigator.share({
          title: `Trip to ${trip.destination}`,
          text,
        })
      } else {
        await navigator.clipboard.writeText(text)
        setMessage('Trip details copied. You can now share them.')
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Unable to share this trip.')
      }
    }
  }

  function downloadFile(format) {
    const content =
      format === 'json'
        ? JSON.stringify(
            {
              destination: trip.destination,
              origin: trip.origin,
              start_date: trip.start_date,
              end_date: trip.end_date,
              budget: trip.budget,
              travelers: trip.travelers,
              itinerary,
            },
            null,
            2
          )
        : createSummary()

    const blob = new Blob([content], {
      type:
        format === 'json'
          ? 'application/json'
          : 'text/plain;charset=utf-8',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `trip-${(trip.destination || 'travel')
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()}.${format}`

    document.body.appendChild(link)
    link.click()
    link.remove()

    URL.revokeObjectURL(url)

    setMessage(`Trip exported as ${format.toUpperCase()}.`)
  }

  function handleFormChange(event) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // Save edited trip preferences to the backend.
  async function saveTripChanges(event) {
    event.preventDefault()
  
    try {
      setSaving(true)
      setError('')
      setMessage('')
  
      await updateTrip(tripId, {
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        start_date: form.start_date,
        end_date: form.end_date,
        budget: Number(form.budget),
        travelers: Number(form.travelers),
      })
  
      const response = await getTripById(tripId)
      const updatedTrip = response.trip || response
  
      setTrip(updatedTrip)
  
      setForm({
        origin: updatedTrip.origin || '',
        destination: updatedTrip.destination || '',
        start_date: updatedTrip.start_date || '',
        end_date: updatedTrip.end_date || '',
        budget: updatedTrip.budget ?? '',
        travelers: String(updatedTrip.travelers ?? 1),
        interests: Array.isArray(updatedTrip.interests)
          ? updatedTrip.interests
          : [],
      })
  
      setEditing(false)
      setMessage('Trip updated successfully!')
    } catch (err) {
      setError(getReadableError(err))
    } finally {
      setSaving(false)
    }
  }

  async function regenerateItinerary() {
    try {
      setSaving(true)
      setError('')
      setMessage('')

      const preferences = {
        origin: form.origin || trip.origin,
        destination: form.destination || trip.destination,
        start_date: form.start_date || trip.start_date,
        end_date: form.end_date || trip.end_date,

        budget:
          form.budget === ''
            ? Number(trip.budget)
            : Number(form.budget),

        travelers:
          form.travelers === ''
            ? Number(trip.travelers || 1)
            : Number(form.travelers),

        interests: Array.isArray(form.interests)
          ? form.interests
          : Array.isArray(trip.interests)
            ? trip.interests
            : [],
      }

      if (!preferences.origin || !preferences.destination) {
        throw new Error(
          'Please provide both your starting location and destination.'
        )
      }

      if (!preferences.start_date || !preferences.end_date) {
        throw new Error('Please provide valid travel dates.')
      }

      if (preferences.end_date < preferences.start_date) {
        throw new Error('End date cannot be earlier than start date.')
      }

      if (
        !Number.isFinite(preferences.budget) ||
        preferences.budget <= 0
      ) {
        throw new Error('Please enter a valid budget greater than zero.')
      }

      if (
        !Number.isInteger(preferences.travelers) ||
        preferences.travelers < 1
      ) {
        throw new Error('Please enter at least one traveler.')
      }

      await generateItinerary(preferences, tripId)
      await loadTrip()

      setEditing(false)
      setMessage('Itinerary regenerated successfully!')
    } catch (err) {
      setError(getReadableError(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="trip-details-page">
        <LoaderCircle className="spin" size={34} />
        <p>Loading trip details...</p>
      </main>
    )
  }

  if (error && !trip) {
    return (
      <main className="trip-details-page">
        <h2>Unable to load trip</h2>
        <p>{error}</p>

        <Link to="/my-trips" className="trip-back-link">
          <ArrowLeft size={16} />
          Back to My Trips
        </Link>
      </main>
    )
  }

  if (!trip) return null

  return (
    <main className="trip-details-page">
      <div className="trip-details-container">
        <Link to="/my-trips" className="trip-back-link">
          <ArrowLeft size={17} />
          Back to My Trips
        </Link>

        <motion.section
          className="trip-hero"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="trip-eyebrow">YOUR NEXT ADVENTURE</p>

          <h1>{trip.destination}</h1>

          <p className="trip-route">
            <MapPin size={18} />
            {trip.origin || 'Starting location not specified'}
            {' to '}
            {trip.destination}
          </p>

          <div className="trip-meta-grid">
            <div className="trip-meta-item">
              <CalendarDays size={20} />
              <div>
                <span>Travel Dates</span>
                <strong>
                  {trip.start_date} – {trip.end_date}
                </strong>
              </div>
            </div>

            <div className="trip-meta-item">
              <Wallet size={20} />
              <div>
                <span>Budget</span>
                <strong>
                  {trip.budget != null
                    ? `₹${Number(trip.budget).toLocaleString('en-IN')}`
                    : 'Not specified'}
                </strong>
              </div>
            </div>

            <div className="trip-meta-item">
              <Users size={20} />
              <div>
                <span>Travelers</span>
                <strong>{trip.travelers ?? 1}</strong>
              </div>
            </div>
          </div>
        </motion.section>

        {message && (
          <div className="trip-message" role="status">
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage('')}
              aria-label="Dismiss message"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div className="trip-error" role="alert">
            {error}
          </div>
        )}

        <section className="trip-tools-section">
          <div className="trip-section-heading">
            <div>
              <p className="trip-eyebrow">TRIP MANAGEMENT</p>
              <h2>Manage Your Trip</h2>
            </div>
          </div>

          <div className="trip-actions">
            <button
              type="button"
              onClick={shareTrip}
              className="trip-action-button"
            >
              <Share2 size={17} />
              Share Trip
            </button>

            <button
              type="button"
              onClick={copySummary}
              className="trip-action-button"
            >
              <Copy size={17} />
              Copy Summary
            </button>

            <button
              type="button"
              onClick={() => downloadFile('txt')}
              className="trip-action-button"
            >
              <Download size={17} />
              Export TXT
            </button>

            <button
              type="button"
              onClick={() => downloadFile('json')}
              className="trip-action-button"
            >
              <Download size={17} />
              Export JSON
            </button>

            <button
              type="button"
              onClick={() => {
                setEditing((previous) => !previous)
                setError('')
                setMessage('')
              }}
              className="trip-action-button"
            >
              <Pencil size={17} />
              {editing ? 'Cancel Edit' : 'Edit Trip'}
            </button>

            <button
              type="button"
              onClick={regenerateItinerary}
              className="trip-action-button"
              disabled={saving}
            >
              {saving ? (
                <LoaderCircle className="spin" size={17} />
              ) : (
                <RefreshCw size={17} />
              )}
              {saving ? 'Processing...' : 'Regenerate Itinerary'}
            </button>
          </div>
        </section>

        {editing && (
          <section className="trip-edit-section">
            <h2>Edit Trip Preferences</h2>

            <form
              onSubmit={(event) => {
                console.log('SAVE BUTTON CLICKED')
                saveTripChanges(event)
              }}
              className="trip-edit-form"
            >
              <label>
                Starting Location
                <input
                  name="origin"
                  value={form.origin}
                  onChange={handleFormChange}
                  minLength={2}
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Destination
                <input
                  name="destination"
                  value={form.destination}
                  onChange={handleFormChange}
                  minLength={2}
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Start Date
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleFormChange}
                  required
                />
              </label>

              <label>
                End Date
                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleFormChange}
                  min={form.start_date}
                  required
                />
              </label>

              <label>
                Budget (₹)
                <input
                  type="number"
                  name="budget"
                  value={form.budget}
                  onChange={handleFormChange}
                  min="1"
                  step="any"
                  required
                />
              </label>

              <label>
                Number of Travelers
                <input
                  type="number"
                  name="travelers"
                  value={form.travelers}
                  onChange={handleFormChange}
                  min="1"
                  max="20"
                  step="1"
                  required
                />
              </label>

              <button
                type="submit"
                className="trip-action-button"
                disabled={saving}
              >
                {saving ? (
                  <LoaderCircle className="spin" size={17} />
                ) : (
                  <Save size={17} />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>

              <button
                type="button"
                className="trip-action-button"
                onClick={() => {
                  setForm({
                    origin: trip.origin || '',
                    destination: trip.destination || '',
                    start_date: trip.start_date || '',
                    end_date: trip.end_date || '',
                    budget: trip.budget ?? '',
                    travelers: String(trip.travelers ?? 1),
                    interests: Array.isArray(trip.interests)
                      ? trip.interests
                      : [],
                  })
                  setEditing(false)
                  setError('')
                  setMessage('')
                }}
                disabled={saving}
              >
                <X size={17} />
                Cancel
              </button>
            </form>
          </section>
        )}

        <section className="trip-itinerary-section">
          <div className="trip-section-heading">
            <div>
              <p className="trip-eyebrow">YOUR PERSONALIZED PLAN</p>
              <h2>Travel Itinerary</h2>
            </div>
            <Plane size={28} />
          </div>

          {!itinerary && (
            <div className="trip-empty-itinerary">
              <Clock size={36} />
              <h3>No itinerary available</h3>
              <p>Generate a personalized plan for this trip.</p>

              <button
                type="button"
                className="trip-action-button"
                onClick={regenerateItinerary}
                disabled={saving}
              >
                {saving ? (
                  <LoaderCircle className="spin" size={17} />
                ) : (
                  <RefreshCw size={17} />
                )}
                {saving ? 'Generating...' : 'Generate Itinerary'}
              </button>
            </div>
          )}

          {itinerary?.summary && (
            <div className="trip-itinerary-summary">
              <h3>Trip Overview</h3>
              <p style={{ whiteSpace: 'pre-line' }}>
                {formatActivity(itinerary.summary)}
              </p>
            </div>
          )}

          {days.map((day, index) => (
            <motion.article
              key={day.day || index}
              className="trip-day-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
              }}
            >
              <div className="trip-day-heading">
                <span className="trip-day-number">
                  Day {day.day || index + 1}
                </span>

                <h3>
                  {day.title ||
                    day.name ||
                    `Day ${day.day || index + 1}`}
                </h3>
              </div>

              {day.date && <p>{day.date}</p>}

              {Array.isArray(day.activities) &&
                day.activities.map((activity, activityIndex) => (
                  <div
                    className="trip-activity"
                    key={activityIndex}
                  >
                    <Clock size={17} />
                    <div>
                      <p style={{ whiteSpace: 'pre-line' }}>
                        {formatActivity(activity)}
                      </p>
                    </div>
                  </div>
                ))}

              {['morning', 'afternoon', 'evening'].map((period) => {
                if (!day[period]) return null

                return (
                  <div className="trip-activity" key={period}>
                    <Clock size={17} />
                    <div>
                      <strong>
                        {period.charAt(0).toUpperCase() +
                          period.slice(1)}
                      </strong>
                      <p style={{ whiteSpace: 'pre-line' }}>
                        {formatActivity(day[period])}
                      </p>
                    </div>
                  </div>
                )
              })}

              {!day.activities &&
                !day.morning &&
                !day.afternoon &&
                !day.evening && (
                  <p style={{ whiteSpace: 'pre-line' }}>
                    {formatActivity(day)}
                  </p>
                )}
            </motion.article>
          ))}

          {itinerary &&
            days.length === 0 &&
            !itinerary.summary && (
              <div className="trip-itinerary-summary">
                <h3>Itinerary Details</h3>
                <p>
                  This saved itinerary does not contain a
                  recognized day-by-day structure. Try
                  regenerating the itinerary.
                </p>
              </div>
            )}
        </section>
      </div>
    </main>
  )
}

export default TripDetails