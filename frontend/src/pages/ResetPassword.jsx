import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setErrorMessage('');

    if (password.length < 8) {
      setErrorMessage('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!sessionData.session) {
        throw new Error(
          'Your reset link is invalid or expired. Please request a new one.'
        );
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      await supabase.auth.signOut();

      setMessage('Password updated successfully! Redirecting to Login...');

      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      setErrorMessage(error.message || 'Unable to update password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.heading}>Set New Password 🔐</h1>

        <p style={styles.subtitle}>
          Choose a strong password for your account.
        </p>

        <label htmlFor="password">New Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />

        <label htmlFor="confirmPassword">Confirm New Password</label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Updating...' : 'Update Password'}
        </button>

        {message && <p role="status" style={styles.success}>{message}</p>}
        {errorMessage && <p role="alert" style={styles.error}>{errorMessage}</p>}

        <p style={styles.footer}>
          <Link to="/login">Back to Login</Link>
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
  heading: { color: '#9A3412', marginBottom: 0 },
  subtitle: { color: '#666666', marginTop: 0 },
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
  success: { color: '#15803D' },
  error: { color: '#B91C1C' },
  footer: { textAlign: 'center', fontSize: '14px' },
};