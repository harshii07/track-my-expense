import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../logo.png';

function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(160deg, #0f1b2d 0%, #1a1040 50%, #2d1030 100%)',
      fontFamily: 'sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>

      {/* Logo */}
      <div style={{
        marginBottom: '2rem',
        animation: 'fadeDown 0.8s ease'
      }}>
        <img
          src={logo}
          alt="Track My Expense"
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '28px',
            boxShadow: '0 20px 60px rgba(127, 119, 221, 0.4)'
          }}
        />
      </div>

      {/* App name */}
      <h1 style={{
        fontSize: '36px',
        fontWeight: '700',
        color: 'white',
        margin: '0 0 12px 0',
        animation: 'fadeUp 0.8s ease 0.2s both'
      }}>
        Track My Expense
      </h1>

      {/* Tagline */}
      <p style={{
        fontSize: '16px',
        color: '#a89dd6',
        margin: '0 0 60px 0',
        maxWidth: '280px',
        lineHeight: '1.6',
        animation: 'fadeUp 0.8s ease 0.35s both'
      }}>
        Your daily money companion.
		<br/>
		Know where every rupee goes.
      </p>

      {/* Get Started button */}
      <button
        onClick={() => navigate('/login')}
        style={{
          background: 'linear-gradient(135deg, #7F77DD, #D4537E)',
          color: 'white',
          border: 'none',
          borderRadius: '16px',
          padding: '16px 48px',
          fontSize: '17px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(127, 119, 221, 0.4)',
          animation: 'fadeUp 0.8s ease 0.5s both',
          letterSpacing: '0.3px'
        }}
      >
        Get Started →
      </button>

      {/* Bottom dots decoration */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '60px', animation: 'fadeUp 0.8s ease 0.6s both' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7F77DD', opacity: 0.7 }}></div>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D4537E', opacity: 0.7 }}></div>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7F77DD', opacity: 0.7 }}></div>
      </div>

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Welcome;