import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';

function ForgotPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || '');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(location.state?.email ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, []);

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('https://track-my-expense-7cah.onrender.com/api/auth/get-question', {
        email: email.toLowerCase().trim()
      });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Email not found!');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword.length !== 4) return setError('🔢 PIN must be 4 digits!');
    setLoading(true);
    setError('');
    try {
      await axios.post('https://track-my-expense-7cah.onrender.com/api/auth/reset-password', {
        email: email.toLowerCase().trim(),
        answer: answer.toLowerCase().trim(),
        newPassword
      });
      alert("✅ PIN updated successfully!");
      localStorage.removeItem(`loginAttempts_${email.toLowerCase().trim()}`);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect answer!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-color, #f4f4f4)',
      padding: '20px',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: 'var(--card-bg, white)',
        borderRadius: '16px',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #7F77DD, #D4537E)',
            borderRadius: '12px',
            padding: '10px',
            display: 'inline-block'
          }}>
            🔑
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--text-color, #333)', marginTop: '10px' }}>
            Reset Your PIN
          </h2>
          <p style={{ color: 'var(--secondary-text, #888)', fontSize: '14px' }}>
            {step === 1 ? 'Verify your identity' : 'Answer your security question'}
          </p>
        </div>

        {error && (
          <div style={{
            background: '#FCEBEB',
            color: '#501313',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '13px',
            border: '1px solid #F09595'
          }}>
            ⚠️ {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleVerifyEmail} style={formStyle}>
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Registered Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value.toLowerCase())}
                style={inputStyle}
                required
              />
            </div>
            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? 'Checking...' : 'Next'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} style={formStyle}>
            <div style={{
              background: 'var(--input-bg, #F9F9FF)',
              padding: '15px',
              borderRadius: '12px',
              border: '1px dashed #7F77DD'
            }}>
              <label style={{ fontSize: '12px', color: '#7F77DD', fontWeight: 'bold' }}>
                QUESTION: What is your favorite color?
              </label>
              <input
                type="text"
                placeholder="Enter answer"
                value={answer}
                onChange={e => setAnswer(e.target.value.toLowerCase())}
                style={{ ...inputStyle, marginTop: '8px' }}
                required
                autoFocus
              />
            </div>
            <div style={{ marginTop: '15px' }}>
              <label style={labelStyle}>New 4-Digit PIN</label>
              <input
                type="password"
                placeholder="0000"
                value={newPassword}
                onChange={e => {
                  if (/^\d*$/.test(e.target.value) && e.target.value.length <= 4)
                    setNewPassword(e.target.value);
                }}
                style={{ ...inputStyle, textAlign: 'center', letterSpacing: '8px' }}
                maxLength={4}
                required
              />
            </div>
            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? 'Updating...' : 'Reset PIN'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/login" style={{ color: 'var(--secondary-text, #888)', fontSize: '14px', textDecoration: 'none' }}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };

const labelStyle = {
  fontSize: '12px',
  color: 'var(--secondary-text, #666)',
  marginBottom: '4px',
  display: 'block',
  fontWeight: '500'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid var(--border-color, #ddd)',
  fontSize: '14px',
  boxSizing: 'border-box',
  outline: 'none',
  background: 'var(--input-bg, white)',
  color: 'var(--text-color, #333)'
};

const buttonStyle = {
  background: 'linear-gradient(135deg, #7F77DD, #D4537E)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  padding: '12px',
  fontSize: '15px',
  fontWeight: '600',
  cursor: 'pointer',
  marginTop: '10px'
};

export default ForgotPassword;