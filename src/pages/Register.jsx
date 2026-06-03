import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [favColor, setFavColor] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, []);

  const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

  const isValidColor = (value) => {
    const trimmed = value.toLowerCase().trim();
    if (!trimmed) return false;
    return /^[a-z]+$/.test(trimmed);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('👤 Name is required!');
    if (!validateEmail(email)) return setError('📧 Only Gmail addresses (@gmail.com) are accepted!');
    if (password.length !== 4) return setError('🔢 PIN must be exactly 4 digits!');
    if (confirmPin !== password) return setError('🔒 PINs do not match!');
    if (!favColor.trim()) return setError('🎨 Favorite color is required!');
    if (!isValidColor(favColor)) return setError('🎨 Please enter a valid color using only letters (e.g. blue, red, coral)');

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        securityQuestion: "What is your favorite color?",
        securityAnswer: favColor.toLowerCase().trim()
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      const existing = JSON.parse(localStorage.getItem('savedUsers') || '[]');
      if (!existing.find(u => u.email === res.data.user.email)) {
        existing.push({ name: res.data.user.name, email: res.data.user.email });
        localStorage.setItem('savedUsers', JSON.stringify(existing));
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed! Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handlePinChange = (val, setter) => {
    if (/^\d*$/.test(val) && val.length <= 4) {
      setter(val);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #6a0dad, #8a2be2, #ff69b4)',
      padding: '20px',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: 'var(--card-bg, #fffaf0)',
        borderRadius: '18px',
        padding: '2rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 15px 40px rgba(0,0,0,0.2)'
      }}>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6a0dad, #ff69b4)',
            borderRadius: '14px',
            padding: '12px',
            display: 'inline-block',
            marginBottom: '1rem'
          }}>
            <span style={{ fontSize: '28px' }}>💰</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--text-color, #333)' }}>Create Account</h1>
          <p style={{ color: 'var(--secondary-text, #777)', fontSize: '14px', marginTop: '4px' }}>Join Track My Expense</p>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value.toLowerCase())}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>4-Digit PIN</label>
              <input
                type="password"
                placeholder="0000"
                value={password}
                onChange={e => handlePinChange(e.target.value, setPassword)}
                style={{ ...inputStyle, textAlign: 'center', letterSpacing: '4px' }}
                maxLength={4}
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
                  letterSpacing: '4px',
                  border: confirmPin && confirmPin !== password ? '1px solid red' : '1px solid var(--border-color, #ddd)'
                }}
                maxLength={4}
              />
            </div>
          </div>

          <div style={{
            background: 'var(--input-bg, #f3e8ff)',
            padding: '15px',
            borderRadius: '12px',
            border: '1px dashed #8a2be2',
            marginTop: '5px'
          }}>
            <label style={{
              fontSize: '12px',
              color: '#8a2be2',
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
            <p style={{ fontSize: '11px', color: '#8a2be2', marginTop: '6px', marginBottom: 0 }}>
              Use only lowercase letters (e.g. blue, coral, crimson)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #6a0dad, #ff69b4)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '15px',
              fontWeight: '600',
              marginTop: '10px',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>

        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '14px',
          color: 'var(--secondary-text, #666)'
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#8a2be2', fontWeight: '600' }}>
            Login
          </Link>
        </p>
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

export default Register;