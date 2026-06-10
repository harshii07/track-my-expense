import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

function Login() {
  const [step, setStep] = useState('select');
  const [selectedUser, setSelectedUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedUsers, setSavedUsers] = useState([]);
  const [attempts, setAttempts] = useState(() => {
    const saved = localStorage.getItem(`loginAttempts_${localStorage.getItem('lastLoginEmail') || ''}`)
    return saved ? parseInt(saved) : 0;
  });
  const [isDark, setIsDark] = useState(() => localStorage.getItem('darkMode') === 'true');
  const navigate = useNavigate();

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('savedUsers') || '[]');
    setSavedUsers(users);
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('darkMode', newDark);
    if (newDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setEmail(user.email.toLowerCase());
    setStep('password');
    setError('');
    localStorage.setItem('lastLoginEmail', user.email.toLowerCase());
    const saved = localStorage.getItem(`loginAttempts_${user.email.toLowerCase()}`);
    const savedAttempts = saved ? parseInt(saved) : 0;
    setAttempts(savedAttempts);
    if (savedAttempts >= 3) {
      setError(
        <span>
          🔒 Locked! Too many attempts.{' '}
          <span
            onClick={() => navigate('/forgot-password', { state: { email: user.email.toLowerCase() } })}
            style={{ color: '#7F77DD', cursor: 'pointer', textDecoration: 'underline', fontWeight: '600' }}
          >
            Reset PIN?
          </span>
        </span>
      );
    }
  };
  const handleNewUser = () => {
    setSelectedUser(null);
    setEmail('');
    setStep('email');
    setError('');
    setAttempts(0);
  };

  const removeSavedUser = (e, email) => {
    e.stopPropagation();
    const existing = JSON.parse(localStorage.getItem('savedUsers') || '[]');
    const filtered = existing.filter(u => u.email !== email);
    localStorage.setItem('savedUsers', JSON.stringify(filtered));
    setSavedUsers(filtered);
  };

async function handleGoogleSuccess(credentialResponse) {
    try {
      const res = await axios.post('https://track-my-expense-7cah.onrender.com/api/auth/google', {
        credential: credentialResponse.credential
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      const existing = JSON.parse(localStorage.getItem('savedUsers') || '[]');
      if (!existing.find(u => u.email === res.data.user.email)) {
        existing.push({ name: res.data.user.name, email: res.data.user.email });
        localStorage.setItem('savedUsers', JSON.stringify(existing));
      }
      if (!res.data.user.hasPin) {
        navigate('/google-pin-setup');
        return;
      }
      setSelectedUser({ name: res.data.user.name, email: res.data.user.email });
      setEmail(res.data.user.email);
      setStep('google-pin');
    } catch (err) {
      setError('Google login failed! Please try again.');
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    if (attempts >= 3) {
      setError('🔒 Too many failed attempts! Please try again later.');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post('https://track-my-expense-7cah.onrender.com/api/auth/login', {
        email: email.toLowerCase().trim(),
        password
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      const existing = JSON.parse(localStorage.getItem('savedUsers') || '[]');
      if (!existing.find(u => u.email === res.data.user.email)) {
        existing.push({ name: res.data.user.name, email: res.data.user.email });
        localStorage.setItem('savedUsers', JSON.stringify(existing));
      }
      setAttempts(0);
      localStorage.removeItem(`loginAttempts_${email.toLowerCase()}`);
      navigate('/dashboard');
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem(`loginAttempts_${email.toLowerCase()}`, newAttempts);
      if (newAttempts >= 3) {
        setError(
          <span>
            🔒 Locked! Too many attempts.{' '}
            <span
              onClick={() => navigate('/forgot-password', { state: { email } })}
              style={{ color: '#7F77DD', cursor: 'pointer', textDecoration: 'underline', fontWeight: '600' }}
            >
              Reset PIN?
            </span>
          </span>
        );
      } else {
        setError(`❌ Wrong PIN! ${3 - newAttempts} attempts remaining.`);
      }
    } finally {
      setLoading(false);
    }
  }

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const avatarColors = ['#7F77DD', '#D4537E', '#1D9E75', '#BA7517', '#D85A30'];

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <button
          onClick={toggleTheme}
          style={{
            position: 'absolute', top: '15px', right: '15px',
            background: 'var(--input-bg)', color: 'var(--text-color)',
            border: '1px solid var(--border-color)', borderRadius: '20px',
            padding: '5px 12px', cursor: 'pointer', fontSize: '12px'
          }}
        >
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src={require('../logo.png')} alt="logo" style={{ width: '60px', height: '60px', borderRadius: '16px' }} />
          <h1 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--text-color)', marginTop: '15px' }}>Track My Expense</h1>
          <p style={{ color: 'var(--secondary-text)', fontSize: '14px' }}>
            {step === 'select' ? 'Choose your account' : step === 'email' ? 'Enter your email' : 'Welcome back!'}
          </p>
        </div>

        {error && <div style={errorStyle}>⚠️ {error}</div>}

        {step === 'select' && (
          <div>
            {savedUsers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1rem' }}>
                {savedUsers.map((user, index) => (
                  <div
                    key={user.email}
                    onClick={() => handleSelectUser(user)}
                    style={userCardStyle}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-color)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--card-bg)'}
                  >
                    <div style={{ ...avatarStyle, background: avatarColors[index % avatarColors.length] }}>
                      {getInitials(user.name)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="user-name-label">{user.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>{user.email}</div>
                    </div>
                    <button
                      onClick={(e) => removeSavedUser(e, user.email)}
                      style={{ background: 'none', border: 'none', color: 'var(--secondary-text)', cursor: 'pointer', fontSize: '16px' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--secondary-text)', fontSize: '14px', marginBottom: '1.5rem' }}>
                No accounts saved.
              </p>
            )}

            <button onClick={handleNewUser} style={dashBtnStyle}>+ Use different account</button>

            <div style={{ margin: '1rem 0', textAlign: 'center', color: 'var(--secondary-text)', fontSize: '13px' }}>
              ── or ──
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google login failed!')}
                theme={isDark ? 'filled_black' : 'outline'}
                shape="rectangular"
                width="360"
              />
            </div>

            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '14px', color: 'var(--secondary-text)' }}>
              New here?{' '}
              <Link to="/register" style={{ color: '#7F77DD', fontWeight: '600', textDecoration: 'none' }}>
                Register
              </Link>
            </p>
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!email) return;
            if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
              setError('📧 Only Gmail addresses (@gmail.com) are accepted!');
              return;
            }
            setError('');
            setStep('password');
          }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value.toLowerCase())}
                style={inputStyle}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>
            <button type="submit" style={buttonStyle}>Next</button>
            <button type="button" onClick={() => setStep('select')} style={backBtnStyle}>← Back</button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ ...userCardStyle, background: 'var(--bg-color)', cursor: 'default' }}>
              <div style={{ ...avatarStyle, background: '#7F77DD', width: '30px', height: '30px', fontSize: '12px' }}>
                {getInitials(selectedUser ? selectedUser.name : email)}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-color)' }}>
                {selectedUser ? selectedUser.name : email}
              </div>
            </div>
            <div>
              <label style={labelStyle}>4 Digit PIN</label>
              <input
                type="password"
                value={password}
                onChange={e => {
                  if (/^\d*$/.test(e.target.value) && e.target.value.length <= 4)
                    setPassword(e.target.value);
                }}
                style={{ ...inputStyle, textAlign: 'center', letterSpacing: '8px' }}
                placeholder="● ● ● ●"
                maxLength={4}
                required
                autoFocus
                disabled={attempts >= 3}
              />
              {password.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', justifyContent: 'center' }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: password.length > i ? '#7F77DD' : '#eee', transition: 'background 0.2s' }}></div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <Link to="/forgot-password" state={{ email }} style={{ color: '#7F77DD', fontSize: '12px', textDecoration: 'none' }}>
                Forgot PIN?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading || attempts >= 3}
              style={{ ...buttonStyle, opacity: (loading || attempts >= 3) ? 0.6 : 1 }}
            >
              {loading ? 'Checking...' : attempts >= 3 ? 'Locked 🔒' : 'Login'}
            </button>
            <button type="button" onClick={() => { setStep('select'); setPassword(''); setAttempts(0); setError(''); }} style={backBtnStyle}>
              ← Change User
            </button>
          </form>
        )}
		{step === 'google-pin' && (
          <form onSubmit={async (e) => {
            e.preventDefault();
            setError('');
            if (attempts >= 3) return;
            try {
              setLoading(true);
              const { verifyGooglePin } = await import('../api');
              await verifyGooglePin({ email, pin: password });
              setAttempts(0);
              localStorage.removeItem(`loginAttempts_${email.toLowerCase()}`);
              navigate('/dashboard');
            } catch (err) {
              const newAttempts = attempts + 1;
              setAttempts(newAttempts);
              localStorage.setItem(`loginAttempts_${email.toLowerCase()}`, newAttempts);
              if (newAttempts >= 3) {
                setError(
                  <span>
                    🔒 Locked! Too many attempts.{' '}
                    <span
                      onClick={() => navigate('/forgot-password', { state: { email } })}
                      style={{ color: '#7F77DD', cursor: 'pointer', textDecoration: 'underline', fontWeight: '600' }}
                    >
                      Reset PIN?
                    </span>
                  </span>
                );
              } else {
                setError(`❌ Wrong PIN! ${3 - newAttempts} attempts remaining.`);
              }
            } finally {
              setLoading(false);
            }
          }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ ...userCardStyle, background: 'var(--bg-color)', cursor: 'default' }}>
              <div style={{ ...avatarStyle, background: '#7F77DD', width: '30px', height: '30px', fontSize: '12px' }}>
                {getInitials(selectedUser ? selectedUser.name : email)}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-color)' }}>
                {selectedUser ? selectedUser.name : email}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Enter your PIN</label>
              <input
                type="password"
                value={password}
                onChange={e => {
                  if (/^\d*$/.test(e.target.value) && e.target.value.length <= 4)
                    setPassword(e.target.value);
                }}
                style={{ ...inputStyle, textAlign: 'center', letterSpacing: '8px' }}
                placeholder="● ● ● ●"
                maxLength={4}
                autoFocus
                disabled={attempts >= 3}
              />
              {password.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', justifyContent: 'center' }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: password.length > i ? '#7F77DD' : '#eee', transition: 'background 0.2s' }}></div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || attempts >= 3}
              style={{ ...buttonStyle, opacity: (loading || attempts >= 3) ? 0.6 : 1 }}
            >
              {loading ? 'Checking...' : attempts >= 3 ? 'Locked 🔒' : 'Continue'}
            </button>
            <button type="button" onClick={() => { setStep('select'); setPassword(''); setAttempts(0); setError(''); }} style={backBtnStyle}>
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const containerStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', transition: '0.3s' };
const cardStyle = { position: 'relative', background: 'var(--card-bg)', borderRadius: '16px', padding: '2.5rem 2rem', width: '100%', maxWidth: '420px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', transition: '0.3s' };
const labelStyle = { fontSize: '13px', color: 'var(--secondary-text)', marginBottom: '5px', display: 'block' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
const buttonStyle = { background: 'linear-gradient(135deg, #7F77DD, #D4537E)', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: '0.2s' };
const errorStyle = { background: '#FCEBEB', color: '#501313', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '13px', border: '1px solid #F09595' };
const userCardStyle = { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 15px', borderRadius: '12px', border: '1px solid var(--border-color)', cursor: 'pointer', transition: '0.2s', background: 'var(--card-bg)' };
const avatarStyle = { width: '40px', height: '40px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 };
const dashBtnStyle = { width: '100%', padding: '10px', borderRadius: '12px', border: '2px dashed var(--border-color)', background: 'none', color: '#7F77DD', cursor: 'pointer', fontWeight: '500' };
const backBtnStyle = { border: 'none', background: 'none', color: 'var(--secondary-text)', cursor: 'pointer', fontSize: '13px', marginTop: '5px' };

export default Login;