import { Link, NavLink } from 'react-router-dom'
import { Plane } from 'lucide-react'

function Header() {
  return (
    <header className="site-header">
      <Link to="/" className="site-brand">
        <Plane size={24} />
        <span>Travel Planner</span>
      </Link>

      <nav className="site-nav">
        <NavLink to="/" end>
          Home
        </NavLink>

        <NavLink to="/my-trips">
          My Trips
        </NavLink>

        <NavLink to="/login">
          Login
        </NavLink>

        <NavLink to="/signup" className="signup-link">
          Sign Up
        </NavLink>
      </nav>
    </header>
  )
}

export default Header