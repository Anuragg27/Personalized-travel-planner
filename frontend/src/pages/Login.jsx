import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function Login() {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [message, setMessage] = useState('');
const [errorMessage, setErrorMessage] = useState('');
const [loading, setLoading] = useState(false);

async function handleLogin(event) {
event.preventDefault();
setMessage('');
setErrorMessage('');
setLoading(true);

try {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw error;
  }

  setMessage('Login successful!');
  setPassword('');
} catch (error) {
  setErrorMessage(error.message || 'Unable to log in.');
} finally {
  setLoading(false);
}
}

return (

    <main>
      <form onSubmit={handleLogin}>
        <p style={styles.subtitle}>
          Log in to continue planning your trip.
        </p>
  
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
  
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
  
        <button
          type="submit"
          disabled={loading}
          style={styles.button}
        >
          {loading ? "Logging In..." : "Log In"}
        </button>
  
        {message && (
          <p role="status" style={styles.success}>
            {message}
          </p>
        )}
  
        {errorMessage && (
          <p role="alert" style={styles.error}>
            {errorMessage}
          </p>
        )}
  
        <p style={styles.footer}>
          Don't have an account? <Link to="/signup">Sign up</Link>
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
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    boxSizing: 'border-box',
    },
    heading: {
    marginBottom: '0',
    color: '#9A3412',
    },
    subtitle: {
    marginTop: '0',
    color: '#666666',
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
    success: {
    color: '#15803D',
    },
    error: {
    color: '#B91C1C',
    },
    footer: {
    textAlign: 'center',
    fontSize: '14px',
    },
    };