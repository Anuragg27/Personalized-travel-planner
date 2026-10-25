import { useState } from 'react'
import {
  createTrip,
  getRecommendations,
  generateItinerary,
} from '../services/tripsAPI.js'

const initialForm = {
  origin: '',
  destination: '',
  start_date: '',
  end_date: '',
  budget: '',
  travelers: 1,
  interests: [],
  dietary_needs: 'No restrictions',
  travel_pace: 'moderate',
  vibe: 'balanced',
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

const availableVibes = [
  { value: 'relaxed', label: 'Relaxed', description: 'Slow travel and peaceful experiences' },
  { value: 'adventure', label: 'Adventure', description: 'Outdoor activities and exciting experiences' },
  { value: 'luxury', label: 'Luxury', description: 'Premium stays and memorable experiences' },
  { value: 'budget', label: 'Budget-friendly', description: 'Affordable experiences and smart spending' },
  { value: 'balanced', label: 'Balanced', description: 'A little bit of everything' },
]

const itineraryPeriods = [
  { key: 'morning', label: 'Morning', icon: '🌅' },
  { key: 'afternoon', label: 'Afternoon', icon: '☀️' },
  { key: 'evening', label: 'Evening', icon: '🌆' },
]

function formatCurrency(value) {
  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return value
  }

  return `₹${amount.toLocaleString('en-IN')}`
}

function renderItineraryActivity(periodKey, activity) {
  const period = itineraryPeriods.find(
    (item) => item.key === periodKey,
  )

  if (!activity) {
    return null
  }

  const activityDetails =
    typeof activity === 'string'
      ? { activity }
      : activity

  if (
    typeof activityDetails !== 'object' ||
    activityDetails === null ||
    Array.isArray(activityDetails)
  ) {
    return null
  }

  const activityName =
    activityDetails.activity ||
    activityDetails.name ||
    activityDetails.title ||
    'Explore your destination'

  return (
    <div className="generated-activity" key={periodKey}>
      <div className="generated-activity-icon">
        {period?.icon || '📍'}
      </div>

      <div className="generated-activity-content">
        <span className="generated-activity-period">
          {period?.label || periodKey}
        </span>

        <h4>{activityName}</h4>

        {activityDetails.time && (
          <span className="generated-activity-time">
            {activityDetails.time}
          </span>
        )}

        {activityDetails.description && (
          <p>{activityDetails.description}</p>
        )}

        {activityDetails.location && (
          <p>
            <strong>Location:</strong>{' '}
            {activityDetails.location}
          </p>
        )}

        {activityDetails.estimated_cost != null && (
          <p>
            <strong>Estimated cost:</strong>{' '}
            {formatCurrency(activityDetails.estimated_cost)}
          </p>
        )}

        {activityDetails.notes && (
          <div className="generated-activity-tip">
            <strong>Travel tip:</strong>{' '}
            {activityDetails.notes}
          </div>
        )}
      </div>
    </div>
  )
}

function TripPreferenceForm() {
  const [form, setForm] = useState(initialForm)
  const [step, setStep] = useState(1)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [createdTrip, setCreatedTrip] = useState(null)
  const [itinerary, setItinerary] = useState(null)
  const [recommendations, setRecommendations] = useState(null)

  function handleChange(event) {
    const { name, value } = event.target

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }))
  }

  function handleInterestChange(interest) {
    setForm((previousForm) => {
      const alreadySelected =
        previousForm.interests.includes(interest)

      return {
        ...previousForm,
        interests: alreadySelected
          ? previousForm.interests.filter(
              (item) => item !== interest,
            )
          : [...previousForm.interests, interest],
      }
    })
  }

  function validateStepOne() {
    if (!form.origin.trim()) {
      setError('Please enter your starting location.')
      return false
    }

    if (!form.destination.trim()) {
      setError('Please enter your destination.')
      return false
    }

    if (!form.start_date || !form.end_date) {
      setError('Please select your travel dates.')
      return false
    }

    if (form.end_date < form.start_date) {
      setError('The return date cannot be before the start date.')
      return false
    }

    if (
      !Number.isFinite(Number(form.budget)) ||
      Number(form.budget) <= 0
    ) {
      setError('Please enter a valid budget greater than zero.')
      return false
    }

    if (
      !Number.isInteger(Number(form.travelers)) ||
      Number(form.travelers) < 1
    ) {
      setError('Please enter at least one traveler.')
      return false
    }

    setError('')
    return true
  }

  function handleContinue() {
    setError('')

    if (!validateStepOne()) {
      return
    }

    setStep(2)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setSuccessMessage('')
    setCreatedTrip(null)
    setItinerary(null)
    setRecommendations(null)

    if (!validateStepOne()) {
      setStep(1)
      return
    }

    setLoading(true)

    const payload = {
      ...form,
      origin: form.origin.trim(),
      destination: form.destination.trim(),
      budget: Number(form.budget),
      travelers: Number(form.travelers),
      interests: form.interests,
      dietary_needs: form.dietary_needs,
      travel_pace: form.travel_pace,
      vibe: form.vibe,
    }

    try {
      const result = await createTrip(payload)

      const tripId = result?.trip?.id ?? result?.id

      if (!tripId) {
        throw new Error(
          'Your trip could not be saved because the server did not return a trip ID.',
        )
      }

      setCreatedTrip(result.trip ?? result)

      let itineraryError = ''
      let recommendationError = ''

      try {
        const itineraryResult = await generateItinerary(
          payload,
          tripId,
        )

        const generatedItinerary =
          itineraryResult?.itinerary ?? itineraryResult

        if (
          generatedItinerary &&
          Array.isArray(generatedItinerary.days)
        ) {
          setItinerary(generatedItinerary)
        } else {
          itineraryError =
            'The itinerary was generated, but its response format was unexpected.'
        }
      } catch (generationError) {
        itineraryError =
          generationError?.message ||
          'We could not generate your itinerary right now.'
      }

      try {
        const recommendationResult =
          await getRecommendations(payload)

        const recommendationData =
          recommendationResult?.recommendations ??
          recommendationResult

        setRecommendations(recommendationData)
      } catch (recommendationFetchError) {
        recommendationError =
          recommendationFetchError?.message ||
          'Recommendations are temporarily unavailable.'
      }

      if (itineraryError && recommendationError) {
        setError(
          `Your trip was saved successfully, but ${itineraryError} ${recommendationError}`,
        )
      } else if (itineraryError) {
        setError(
          `Your trip was saved successfully, but ${itineraryError}`,
        )
      } else if (recommendationError) {
        setError(
          `Your itinerary is ready, but ${recommendationError}`,
        )
      } else {
        setSuccessMessage(
          'Your trip has been saved and your personalized travel plan is ready!',
        )
      }
    } catch (submitError) {
      setError(
        submitError?.response?.data?.detail ||
          submitError?.message ||
          'Something went wrong while creating your trip. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  function handleCreateAnotherTrip() {
    setForm(initialForm)
    setStep(1)
    setError('')
    setSuccessMessage('')
    setCreatedTrip(null)
    setItinerary(null)
    setRecommendations(null)
  }

  function renderRecommendationGroups(data) {
    if (!data) {
      return null
    }

    const groups = Array.isArray(data)
      ? [{ category: 'Recommended for you', items: data }]
      : Object.entries(data).map(([category, value]) => ({
          category,
          items: Array.isArray(value)
            ? value
            : value?.items ?? [],
        }))

    const validGroups = groups.filter(
      (group) =>
        Array.isArray(group.items) &&
        group.items.length > 0,
    )

    if (validGroups.length === 0) {
      return (
        <section className="generated-recommendations">
          <div className="trip-form-heading">
            <h2>Your Recommendations</h2>
          </div>
          <p>
            No recommendations are available right now.
            Try again later.
          </p>
        </section>
      )
    }

    return (
      <section className="recommendations-section generated-recommendations">
        <div className="trip-form-heading">
          <p className="trip-eyebrow">
            ✦ HANDPICKED FOR YOUR TRIP
          </p>
          <h2>Recommendations for you</h2>
          <p>
            Discover experiences that match your travel
            preferences.
          </p>
        </div>

        {validGroups.map((group) => (
          <div
            className="recommendation-category"
            key={group.category}
          >
            <h3>{formatCategory(group.category)}</h3>

            <div className="recommendation-grid">
              {group.items.map((item, index) => {
                const recommendation =
                  typeof item === 'string'
                    ? { name: item }
                    : item

                return (
                  <article
                    className="recommendation-card"
                    key={
                      recommendation.id ??
                      recommendation.name ??
                      recommendation.title ??
                      index
                    }
                  >
                    <h4>
                      {recommendation.name ??
                        recommendation.title ??
                        'Recommended experience'}
                    </h4>

                    {recommendation.description && (
                      <p>{recommendation.description}</p>
                    )}

                    {recommendation.reason && (
                      <p>
                        <strong>Why we recommend it:</strong>{' '}
                        {recommendation.reason}
                      </p>
                    )}

                    {recommendation.estimated_cost != null && (
                      <p>
                        <strong>Estimated cost:</strong>{' '}
                        {formatCurrency(
                          recommendation.estimated_cost,
                        )}
                      </p>
                    )}
                  </article>
                )
              })}
            </div>
          </div>
        ))}
      </section>
    )
  }

  return (
    <div className="trip-preference-container">
      {!itinerary && (
        <form
          className="trip-preference-form"
          onSubmit={handleSubmit}
        >
          <div className="trip-form-heading">
            <p className="trip-eyebrow">
              ✦ YOUR NEXT ADVENTURE STARTS HERE
            </p>
            <h2>Plan your perfect trip</h2>
            <p>
              Tell us what you love, and we will help you
              plan a personalized journey.
            </p>
          </div>

          <div className="trip-form-progress">
            <div
              className={`trip-form-progress-step ${
                step === 1 ? 'active' : 'completed'
              }`}
            >
              <span>1</span>
              <p>Trip details</p>
            </div>

            <div
              className={`trip-form-progress-step ${
                step === 2 ? 'active' : ''
              }`}
            >
              <span>2</span>
              <p>Your preferences</p>
            </div>
          </div>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="trip-form-section">
              <div className="trip-form-heading">
                <h3>Where do you want to go?</h3>
                <p>
                  Start with the basics of your upcoming
                  journey.
                </p>
              </div>

              <div className="trip-form-grid">
                <div className="form-group">
                  <label htmlFor="origin">
                    Starting location
                  </label>
                  <input
                    id="origin"
                    name="origin"
                    type="text"
                    placeholder="e.g. Indore"
                    value={form.origin}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="destination">
                    Destination
                  </label>
                  <input
                    id="destination"
                    name="destination"
                    type="text"
                    placeholder="e.g. Goa"
                    value={form.destination}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="start_date">
                    Departure date
                  </label>
                  <input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={form.start_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="end_date">
                    Return date
                  </label>
                  <input
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={form.end_date}
                    onChange={handleChange}
                    min={
                      form.start_date ||
                      new Date().toISOString().split('T')[0]
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="budget">
                    Total budget (₹)
                  </label>
                  <input
                    id="budget"
                    name="budget"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 15000"
                    value={form.budget}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="travelers">
                    Number of travelers
                  </label>
                  <input
                    id="travelers"
                    name="travelers"
                    type="number"
                    min="1"
                    step="1"
                    value={form.travelers}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button
                className="primary-button"
                type="button"
                onClick={handleContinue}
              >
                Continue to preferences →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="trip-form-section">
              <div className="trip-form-heading">
                <h3>Make this trip yours</h3>
                <p>
                  Choose the experiences and travel style
                  that suit you best.
                </p>
              </div>

              <div className="form-group">
                <label>What are you interested in?</label>
                <p className="form-help-text">
                  Select all that apply.
                </p>

                <div className="interest-options">
                  {availableInterests.map((interest) => {
                    const selected =
                      form.interests.includes(interest)

                    return (
                      <button
                        className={`interest-option ${
                          selected ? 'selected' : ''
                        }`}
                        type="button"
                        key={interest}
                        aria-pressed={selected}
                        onClick={() =>
                          handleInterestChange(interest)
                        }
                      >
                        {selected ? '✓ ' : '+ '}
                        {interest}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="travel_pace">
                  Travel pace
                </label>
                <select
                  id="travel_pace"
                  name="travel_pace"
                  value={form.travel_pace}
                  onChange={handleChange}
                >
                  <option value="relaxed">
                    Relaxed — fewer activities
                  </option>
                  <option value="moderate">
                    Moderate — a balanced schedule
                  </option>
                  <option value="fast">
                    Fast-paced — see more places
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dietary_needs">
                  Dietary preferences
                </label>
                <select
                  id="dietary_needs"
                  name="dietary_needs"
                  value={form.dietary_needs}
                  onChange={handleChange}
                >
                  <option value="No restrictions">
                    No restrictions
                  </option>
                  <option value="Vegetarian">
                    Vegetarian
                  </option>
                  <option value="Vegan">Vegan</option>
                  <option value="Jain">Jain</option>
                  <option value="Gluten-free">
                    Gluten-free
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Choose your travel vibe</label>

                <div className="vibe-options">
                  {availableVibes.map((vibe) => (
                    <button
                      className={`vibe-option ${
                        form.vibe === vibe.value
                          ? 'selected'
                          : ''
                      }`}
                      type="button"
                      key={vibe.value}
                      aria-pressed={
                        form.vibe === vibe.value
                      }
                      onClick={() =>
                        setForm((previousForm) => ({
                          ...previousForm,
                          vibe: vibe.value,
                        }))
                      }
                    >
                      <strong>{vibe.label}</strong>
                      <span>{vibe.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="trip-form-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setError('')
                    setStep(1)
                  }}
                  disabled={loading}
                >
                  ← Back
                </button>

                <button
                  className="primary-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? 'Creating your trip...'
                    : '✨ Create my trip'}
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {error && itinerary && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="form-success" role="status">
          {successMessage}
        </div>
      )}

      {itinerary && (
        <section className="generated-itinerary">
          <header className="generated-itinerary-header">
            <p className="trip-eyebrow">
              ✦ YOUR PERSONALIZED JOURNEY
            </p>

            <h2>
              Your next adventure in{' '}
              {itinerary.destination || form.destination}
            </h2>

            <p>
              A travel plan tailored to your preferences,
              budget, and travel style.
            </p>

            <div className="generated-itinerary-stats">
              <div className="generated-itinerary-stat">
                <span className="generated-stat-icon">
                  📅
                </span>
                <div>
                  <strong>{itinerary.days.length}</strong>
                  <span>
                    {itinerary.days.length === 1
                      ? 'Day'
                      : 'Days'}
                  </span>
                </div>
              </div>

              <div className="generated-itinerary-stat">
                <span className="generated-stat-icon">
                  👥
                </span>
                <div>
                  <strong>{form.travelers}</strong>
                  <span>
                    {Number(form.travelers) === 1
                      ? 'Traveler'
                      : 'Travelers'}
                  </span>
                </div>
              </div>

              <div className="generated-itinerary-stat">
                <span className="generated-stat-icon">
                  💰
                </span>
                <div>
                  <strong>
                    {formatCurrency(form.budget)}
                  </strong>
                  <span>Total budget</span>
                </div>
              </div>
            </div>
          </header>

          <div className="generated-itinerary-days">
            <div className="generated-itinerary-days-heading">
              <p className="trip-eyebrow">
                YOUR TRAVEL PLAN
              </p>
              <h3>Explore day by day</h3>
            </div>

            {itinerary.days.map((day, index) => (
              <article
                className="generated-day-card"
                key={day.day ?? index}
              >
                <div className="generated-day-heading">
                  <span className="generated-day-number">
                    Day {day.day ?? index + 1}
                  </span>

                  {day.date && (
                    <span className="generated-day-date">
                      {day.date}
                    </span>
                  )}
                </div>

                <div className="generated-day-activities">
                  {itineraryPeriods.map((period) =>
                    renderItineraryActivity(
                      period.key,
                      day[period.key],
                    ),
                  )}
                </div>
              </article>
            ))}
          </div>

          {itinerary.summary && (
            <div className="generated-itinerary-footer">
              <h3>Your trip at a glance</h3>
              <p>{itinerary.summary}</p>
            </div>
          )}

          {itinerary.tips && (
            <div className="generated-itinerary-footer">
              <h3>Travel tips</h3>
              {Array.isArray(itinerary.tips) ? (
                <ul>
                  {itinerary.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              ) : (
                <p>{itinerary.tips}</p>
              )}
            </div>
          )}

          <button
            className="secondary-button"
            type="button"
            onClick={handleCreateAnotherTrip}
          >
            Plan another trip
          </button>
        </section>
      )}

      {renderRecommendationGroups(recommendations)}

      {createdTrip && !itinerary && !loading && (
        <div className="trip-saved-message">
          <h3>Your trip has been saved!</h3>
          <p>
            Your trip details are saved. You can find your
            trip in the My Trips section.
          </p>
        </div>
      )}
    </div>
  )
}

function formatCategory(category) {
  return String(category)
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    )
}

export default TripPreferenceForm