import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setupGooglePin } from '../api';

function GooglePinSetup() {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [favColor, setFavColor] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    // If no token, redirect to login
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  const handlePinChange = (val, setter) => {
    if (/^\d*$/.test(val) && val.length <= 4) setter(val);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (pin.length !== 4) return setError('🔢 PIN must be exactly 4 digits!');
    if (pin !== confirmPin) return setError('🔒 PINs do not match!');
    if (!favColor.trim()) return setError('🎨 Security answer is required!');
    if (!/^[a-z]+$/.test(favColor.trim())) return setError('🎨 Use only lowercase letters!');

    try {
      setLoading(true);
      await setupGooglePin({ pin, securityAnswer: favColor.toLowerCase().trim() });

      // Update user in localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.hasPin = true;
      localStorage.setItem('user', JSON.stringify(user));

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  }

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
        borderRadius: '18px',
        padding: '2rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 15px 40px rgba(0,0,0,0.15)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #7F77DD, #D4537E)',
            borderRadius: '14px',
            padding: '12px',
            display: 'inline-block',
            marginBottom: '1rem',
            fontSize: '28px'
          }}>🔐</div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--text-color, #333)' }}>Set Up Your PIN</h1>
          <p style={{ color: 'var(--secondary-text, #777)', fontSize: '14px', marginTop: '4px' }}>
            Create a PIN to secure your account
          </p>
        </div>

        {error && (
          <div style={{
            background: '#ffe6e6',
            border: '1px solid #ff4d4d',
            borderRadius: '8px',
            padding: '10px',
            marginBottom: '1rem',
            fontSize: '13px',
            color: '#800000'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>4-Digit PIN</label>
              <input
                type="password"
                placeholder="0000"
                value={pin}
                onChange={e => handlePinChange(e.target.value, setPin)}
                style={{ ...inputStyle, textAlign: 'center', letterSpacing: '6px' }}
                maxLength={4}
                autoFocus
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Confirm PIN</label>
              <input
                type="password"
                placeholder="0000"
                value={confirmPin}
                onChange={e => handlePinChange(e.target.value, setConfirmPin)}
                style={{
                  ...inputStyle,
                  textAlign: 'center',
                  letterSpacing: '6px',
                  border: confirmPin && confirmPin !== pin ? '1px solid red' : '1px solid var(--border-color, #ddd)'
                }}
                maxLength={4}
              />
            </div>
          </div>

          <div style={{
            background: 'var(--input-bg, #f3e8ff)',
            padding: '15px',
            borderRadius: '12px',
            border: '1px dashed #7F77DD'
          }}>
            <label style={{
              fontSize: '12px',
              color: '#7F77DD',
              fontWeight: 'bold',
              display: 'block',
              marginBottom: '8px'
            }}>
              🔐 RECOVERY: What is your favorite color?
            </label>
            <input
              type="text"
              placeholder="e.g. blue"
              value={favColor}
              onChange={e => setFavColor(e.target.value.toLowerCase())}
              style={{ ...inputStyle }}
            />
            <p style={{ fontSize: '11px', color: '#7F77DD', marginTop: '6px', marginBottom: 0 }}>
              Use only lowercase letters (e.g. blue, coral, crimson)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #7F77DD, #D4537E)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '15px',
              fontWeight: '600',
              marginTop: '6px',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Setting up...' : 'Set PIN & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: '12px',
  color: 'var(--secondary-text, #555)',
  marginBottom: '4px',
  display: 'block',
  fontWeight: '500'
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid var(--border-color, #ddd)',
  fontSize: '14px',
  boxSizing: 'border-box',
  outline: 'none',
  background: 'var(--input-bg, white)',
  color: 'var(--text-color, #333)'
};

export default GooglePinSetup;