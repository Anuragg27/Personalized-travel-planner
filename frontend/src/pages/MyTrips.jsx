import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, CalendarDays, ArrowRight, Plane, LoaderCircle } from 'lucide-react'
import { getMyTrips } from '../services/tripsAPI.js'

function MyTrips() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTrips() {
      try {
        const response = await getMyTrips()
        setTrips(response.trips || [])
      } catch (err) {
        setError(err.message || 'Failed to load your trips.')
      } finally {
        setLoading(false)
      }
    }

    loadTrips()
  }, [])

  if (loading) {
    return (
      <main className="my-trips-page">
        <LoaderCircle className="spin" size={32} />
        <p>Loading your trips...</p>
      </main>
    )
  }

  return (
    <main className="my-trips-page">
      <div className="my-trips-container">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="my-trips-heading"
        >
          <p className="my-trips-eyebrow">YOUR TRAVEL COLLECTION</p>
          <h1>My Trips</h1>
          <p>All your saved adventures, together in one place.</p>
        </motion.div>

        {error && <div className="my-trips-error">{error}</div>}

        {!error && trips.length === 0 && (
          <div className="my-trips-empty">
            <Plane size={42} />
            <h2>No trips yet</h2>
            <p>Create your first personalized travel itinerary.</p>
            <Link to="/" className="my-trips-button">
              Plan a Trip <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {!error && trips.length > 0 && (
          <div className="my-trips-grid">
            {trips.map((trip, index) => (
              <motion.article
                key={trip.id}
                className="my-trip-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.06 }}
              >
                <div className="my-trip-icon">
                  <MapPin size={22} />
                </div>

                <h2>{trip.destination}</h2>
                <p className="my-trip-origin">From {trip.origin}</p>

                <div className="my-trip-date">
                  <CalendarDays size={16} />
                  <span>
                    {trip.start_date} – {trip.end_date}
                  </span>
                </div>

                {trip.budget != null && (
                  <p className="my-trip-budget">
                    Budget: {trip.budget}
                  </p>
                )}

                <Link
                  to={`/trips/${trip.id}`}
                  className="my-trips-button"
                >
                  View Trip <ArrowRight size={16} />
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default MyTrips