import { ArrowRight, Compass, Sparkles, Wallet, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import TripPreferenceForm from '../components/TripPreferenceForm.jsx'

const features = [
  {
    icon: Sparkles,
    title: 'AI-powered itineraries',
    description:
      'Get a day-by-day travel plan tailored to your destination, interests, and preferred pace.',
  },
  {
    icon: Compass,
    title: 'Made for your travel style',
    description:
      'Choose your vibe, from peaceful escapes to adventurous explorations.',
  },
  {
    icon: Wallet,
    title: 'Plan around your budget',
    description:
      'Set your budget upfront and get recommendations that help you plan thoughtfully.',
  },
]

const destinations = [
  {
    name: 'Manali',
    location: 'Himachal Pradesh',
    image:
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Jaipur',
    location: 'Rajasthan',
    image:
      'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Goa',
    location: 'India',
    image:
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=85',
  },
]

function HomePage() {
  function scrollToPlanner() {
    document.getElementById('trip-planner')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <main className="home">
      <section className="landing-hero">
        <div className="landing-hero-content">
          <span className="landing-badge">
            <Sparkles size={15} />
            YOUR PERSONAL AI TRAVEL ASSISTANT
          </span>

          <h1>
            Less planning.
            <br />
            <span>More exploring.</span>
          </h1>

          <p>
            Tell us where you want to go, what you love, and your budget.
            We’ll help turn your next trip into a personalized adventure.
          </p>

          <div className="landing-hero-actions">
            <button
              className="landing-primary-button"
              type="button"
              onClick={scrollToPlanner}
            >
              Plan my trip <ArrowRight size={18} />
            </button>

            <a className="landing-secondary-link" href="#how-it-works">
              Discover how it works
            </a>
          </div>

          <div className="landing-trust-line">
            <span><Sparkles size={16} /> AI-personalized plans</span>
            <span><Wallet size={16} /> Your budget, your way</span>
          </div>
        </div>

        <div className="landing-hero-visual">
          <img
            className="landing-hero-image"
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=90"
            alt="Majestic mountains surrounded by clouds"
          />

          <div className="landing-image-overlay">
            <span className="landing-image-label">YOUR NEXT ADVENTURE</span>
            <strong>Find your own way.</strong>
            <span>One trip. Countless memories.</span>
          </div>

          <div className="landing-floating-card">
            <span className="landing-floating-icon">
              <MapPin size={19} />
            </span>
            <div>
              <strong>Your journey, personalized</strong>
              <p>Built around what you love</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-features" id="how-it-works">
        <div className="landing-section-heading">
          <span className="landing-eyebrow">TRAVEL, YOUR WAY</span>
          <h2>A smarter way to plan your next trip</h2>
          <p>
            Everything you need to turn your travel ideas into a thoughtful
            itinerary.
          </p>
        </div>

        <div className="landing-feature-grid">
          {features.map(({ icon: Icon, title, description }, index) => (
            <article className="landing-feature-card" key={title}>
              <div className="landing-feature-icon">
                <Icon size={23} />
              </div>
              <span className="landing-feature-number">
                0{index + 1}
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-destinations">
        <div className="landing-section-heading">
          <span className="landing-eyebrow">A LITTLE INSPIRATION</span>
          <h2>Where will you go next?</h2>
          <p>
            Dream of mountain escapes, colorful cities, or sunny coastlines.
            Your next story starts with a destination.
          </p>
        </div>

        <div className="landing-destination-grid">
          {destinations.map((destination) => (
            <article className="landing-destination-card" key={destination.name}>
              <img
                src={destination.image}
                alt={`${destination.name}, ${destination.location}`}
                loading="lazy"
              />
              <div className="landing-destination-overlay">
                <span><MapPin size={14} /> {destination.location}</span>
                <h3>{destination.name}</h3>
              </div>
            </article>
          ))}
        </div>

        <p className="landing-destination-note">
          Just inspiration—create a trip for any destination you choose.
        </p>
      </section>

      <section className="landing-planner-intro">
        <span className="landing-eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
        <h2>Ready to turn your idea into an itinerary?</h2>
        <p>
          Add your trip details, choose your preferences, and let your
          personalized travel plan take shape.
        </p>
        <button
          className="landing-primary-button"
          type="button"
          onClick={scrollToPlanner}
        >
          Start planning <ArrowRight size={18} />
        </button>
      </section>

      <section className="landing-planner" id="trip-planner">
        <TripPreferenceForm />
      </section>

      <footer className="landing-footer">
        <Link to="/" className="landing-footer-brand">
          <Compass size={20} />
          Travel Planner
        </Link>
        <p>Thoughtful planning. Memorable journeys.</p>
      </footer>
    </main>
  )
}

export default HomePage