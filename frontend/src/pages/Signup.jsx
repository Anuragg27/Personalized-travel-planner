import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup(event) {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        setMessage('Account created successfully! You are now logged in.');
      } else {
        setMessage(
          'Account created! Please check your email to confirm your account.'
        );
      }

      setFullName('');
      setEmail('');
      setPassword('');
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
          onChange={(event) => setFullName(event.target.value)}
          autoComplete="name"
          required
        />

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
          placeholder="Create a password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>

        {message && <p role="status">{message}</p>}

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
