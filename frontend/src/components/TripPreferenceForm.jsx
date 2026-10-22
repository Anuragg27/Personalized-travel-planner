import { useState } from 'react'
import { createTrip } from '../services/tripsAPI.js'

const initialForm = {
  destination: '',
  start_date: '',
  end_date: '',
  budget: '',
  travelers: 1,
  interests: [],
  dietary_needs: 'No restrictions',
  travel_pace: 'moderate',
}

const availableInterests = [
  'Adventure',
  'Nature',
  'Culture',
  'Food',
  'Shopping',
  'Relaxation',
  'History',
]

function TripPreferenceForm() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function handleInterestChange(interest) {
    setForm((previous) => {
      const selected = previous.interests.includes(interest)

      return {
        ...previous,
        interests: selected
          ? previous.interests.filter((item) => item !== interest)
          : [...previous.interests, interest],
      }
    })
  }

  function handleNext(event) {
    event.preventDefault()
    setError('')

    if (
      !form.destination.trim() ||
      !form.start_date ||
      !form.end_date ||
      !form.budget ||
      Number(form.budget) <= 0 ||
      !Number.isInteger(Number(form.travelers)) ||
      Number(form.travelers) < 1 ||
      Number(form.travelers) > 20
    ) {
      setError('Please enter valid details for all trip fields.')
      return
    }

    if (form.end_date < form.start_date) {
      setError('End date cannot be before start date.')
      return
    }

    setStep(2)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (form.interests.length === 0) {
      setError('Please select at least one travel interest.')
      return
    }

    setLoading(true)

    try {
      const payload = {
        ...form,
        destination: form.destination.trim(),
        budget: Number(form.budget),
        travelers: Number(form.travelers),
      }

      const result = await createTrip(payload)
      setSuccess(result.message)
    } catch (err) {
      setError(err.message || 'Unable to submit travel preferences.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="trip-form-section">
      <div className="trip-form-heading">
        <p className="eyebrow">YOUR NEXT ADVENTURE</p>
        <h1>Plan a trip that's uniquely yours</h1>
        <p>
          Tell us what you love, and start building your personalized
          travel experience.
        </p>
      </div>

      <div className="trip-form-card">
        <div className="step-indicator">
          <span className={step === 1 ? 'active' : 'completed'}>
            1. Trip details
          </span>
          <span className={step === 2 ? 'active' : ''}>
            2. Preferences
          </span>
        </div>

        {error && (
          <div className="form-message error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="form-message success" role="status">
            {success}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleNext}>
            <div className="form-grid">
              <label className="form-field full-width">
                Destination
                <input
                  name="destination"
                  value={form.destination}
                  onChange={handleChange}
                  placeholder="e.g. Manali"
                  minLength={2}
                  maxLength={100}
                  required
                />
              </label>

              <label className="form-field">
                Start date
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="form-field">
                End date
                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  min={form.start_date || undefined}
                  required
                />
              </label>

              <label className="form-field">
                Total budget (₹)
                <input
                  type="number"
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  placeholder="20000"
                  min="1"
                  step="0.01"
                  required
                />
              </label>

              <label className="form-field">
                Number of travelers
                <input
                  type="number"
                  name="travelers"
                  value={form.travelers}
                  onChange={handleChange}
                  min="1"
                  max="20"
                  step="1"
                  required
                />
              </label>
            </div>

            <button className="primary-button" type="submit">
              Continue to preferences →
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <fieldset className="interest-fieldset">
              <legend>What are you interested in?</legend>

              <div className="interest-grid">
                {availableInterests.map((interest) => (
                  <label className="interest-option" key={interest}>
                    <input
                      type="checkbox"
                      checked={form.interests.includes(interest)}
                      onChange={() => handleInterestChange(interest)}
                    />
                    <span>{interest}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="form-field">
              Dietary preferences
              <select
                name="dietary_needs"
                value={form.dietary_needs}
                onChange={handleChange}
              >
                <option>No restrictions</option>
                <option>Vegetarian</option>
                <option>Vegan</option>
                <option>Jain</option>
                <option>Gluten-free</option>
                <option>Other</option>
              </select>
            </label>

            <label className="form-field">
              Preferred travel pace
              <select
                name="travel_pace"
                value={form.travel_pace}
                onChange={handleChange}
              >
                <option value="relaxed">Relaxed — fewer activities</option>
                <option value="moderate">Moderate — balanced days</option>
                <option value="fast">Fast — explore as much as possible</option>
              </select>
            </label>

            <div className="form-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={() => {
                  setError('')
                  setStep(1)
                }}
              >
                ← Back
              </button>

              <button
                className="primary-button"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Create My Trip'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

export default TripPreferenceForm