import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
).replace(/\/$/, '');

export default function Signup() {
  const navigate = useNavigate();
  const pollingRef = useRef(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  async function startConfirmationPolling(token) {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    setWaiting(true);

    const checkConfirmation = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/confirmation-status?token=${encodeURIComponent(token)}`
        );

        if (response.status === 410 || response.status === 404) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setWaiting(false);
          setMessage('Confirmation session expired. Please sign up again.');
          return;
        }

        if (!response.ok) return;

        const result = await response.json();

        if (result.confirmed) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setWaiting(false);
          setMessage('Email confirmed! Redirecting to Login...');
          setTimeout(() => navigate('/login'), 1000);
        }
      } catch {
        // Retry on the next polling interval.
      }
    };

    await checkConfirmation();

    if (!pollingRef.current) {
      pollingRef.current = setInterval(checkConfirmation, 4000);
    }
  }

  async function handleSignup(event) {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) throw error;

      setFullName('');
      setPassword('');

      if (data.session) {
        setEmail('');
        navigate('/');
        return;
      }

      // Create a private, temporary session for this browser.
      const sessionResponse = await fetch(
        `${API_URL}/api/auth/signup-session`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail }),
        }
      );

      if (!sessionResponse.ok) {
        setMessage(
          'Signup submitted. Please confirm your email, then log in manually.'
        );
        return;
      }

      const sessionData = await sessionResponse.json();

      setMessage(
        'Please confirm your email. This page will redirect you to Login automatically.'
      );

      await startConfirmationPolling(sessionData.token);
    } catch (error) {
      setMessage(error.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.container}>
      <form onSubmit={handleSignup} style={styles.form}>
        <h1>Create Account ✈️</h1>
        <p>Start planning your next adventure.</p>

        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          type="text"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
          required
        />

        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />

        <button type="submit" disabled={loading || waiting} style={styles.button}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>

        {message && <p role="status">{message}</p>}

        {waiting && (
          <p role="status">Waiting for email confirmation…</p>
        )}

        <p style={styles.footer}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </main>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#FFF7ED',
    padding: '20px',
    boxSizing: 'border-box',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    maxWidth: '420px',
    padding: '32px',
    background: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    boxSizing: 'border-box',
  },
  button: {
    marginTop: '8px',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    background: '#EA580C',
    color: '#FFFFFF',
    fontSize: '16px',
    cursor: 'pointer',
  },
  footer: {
    textAlign: 'center',
    fontSize: '14px',
  },
};