import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Plane, LogOut } from 'lucide-react'
import { supabase } from '../../services/supabase'

function Header() {
  const [user, setUser] = useState(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function getCurrentUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (!error) {
        setUser(user)
      }
    }

    getCurrentUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    setLoggingOut(true)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      setUser(null)
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error.message)
      alert('Unable to log out. Please try again.')
    } finally {
      setLoggingOut(false)
    }
  }

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

        {user && (
          <NavLink to="/my-trips">
            My Trips
          </NavLink>
        )}

        {user ? (
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="logout-button"
          >
            <LogOut size={17} strokeWidth={2} />
            <span>
              {loggingOut ? 'Logging out...' : 'Logout'}
            </span>
          </button>
        ) : (
          <>
            <NavLink to="/login">
              Login
            </NavLink>

            <NavLink to="/signup" className="signup-link">
              Sign Up
            </NavLink>
          </>
        )}
      </nav>
    </header>
  )
}

export default Header