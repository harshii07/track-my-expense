import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [name, setName] = useState(user.name || '');
  const [email] = useState(user.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function getInitials(name) {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || "U";
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) { setError('Name cannot be empty!'); return; }
    if (newPassword && (newPassword.length !== 4 || isNaN(newPassword))) {
      setError('New PIN must be exactly 4 digits!');
      return;
    }
    if (newPassword && !currentPassword) { setError('Please enter your current password!'); return; }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.put(
        'https://track-my-expense-7cah.onrender.com/api/auth/profile',
        { name, currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = { ...user, name: res.data.name };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      const savedUsers = JSON.parse(localStorage.getItem('savedUsers') || '[]');
      const updated = savedUsers.map(u => u.email === email ? { ...u, name: res.data.name } : u);
      localStorage.setItem('savedUsers', JSON.stringify(updated));

      setSuccessMsg('Profile updated successfully!');
      setError('');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed!');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAccount() {
    const confirmDelete = window.confirm(
      "⚠️ Are you sure? This will permanently delete your account and all your expense data!"
    );

    if (confirmDelete) {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        await axios.delete('https://track-my-expense-7cah.onrender.com/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const saved = JSON.parse(localStorage.getItem('savedUsers') || '[]');
        const updatedSaved = saved.filter(u => u.email !== email);
        localStorage.setItem('savedUsers', JSON.stringify(updatedSaved));

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        alert("Account deleted successfully.");
        navigate('/login');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete account.');
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4f4' }}>
      <div style={{ background: 'linear-gradient(135deg, #7F77DD, #D4537E)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: 'white', fontSize: '20px', fontWeight: '600' }}>💰 My Profile</h1>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px' }}
        >
          ← Back
        </button>
      </div>

      <div style={{ maxWidth: '480px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #7F77DD, #D4537E)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '28px', margin: '0 auto 1rem' }}>
              {getInitials(name || 'U')}
            </div>
            <p style={{ color: '#888', fontSize: '13px' }}>{email}</p>
          </div>

          {successMsg && (
            <div style={{ background: '#EAF3DE', border: '1px solid #639922', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', fontSize: '13px', color: '#3B6D11' }}>
              ✅ {successMsg}
            </div>
          )}

          {error && (
            <div style={{ background: '#FCEBEB', border: '1px solid #F09595', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', fontSize: '13px', color: '#501313' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Email (cannot be changed)</label>
              <input
                type="email"
                value={email}
                disabled
                style={{ ...inputStyle, background: '#f8f8f8', color: '#999' }}
              />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Change PIN (optional)</p>

            <div>
              <label style={labelStyle}>Current PIN</label>
              <input
                type="password"
                placeholder="Enter 4-digit PIN"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                style={inputStyle}
                maxLength={4}
              />
            </div>

            <div>
              <label style={labelStyle}>New PIN</label>
              <input
                type="password"
                placeholder="Enter new 4-digit PIN"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={inputStyle}
                maxLength={4}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={buttonStyle}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px dashed #eee' }}>
            <h3 style={{ fontSize: '14px', color: '#E53E3E', marginBottom: '8px' }}>Danger Zone</h3>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '12px' }}>
              Deleting your account will remove all your data permanently.
            </p>
            <button
              onClick={handleDeleteAccount}
              style={{ background: 'none', border: '1px solid #E53E3E', color: '#E53E3E', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', fontWeight: '500', width: '100%' }}
            >
              Delete Account
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

const labelStyle = { fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' };
const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' };
const buttonStyle = { background: 'linear-gradient(135deg, #7F77DD, #D4537E)', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '15px', fontWeight: '500', cursor: 'pointer' };

export default Profile;