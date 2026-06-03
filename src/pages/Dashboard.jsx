import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExpenses } from '../api';
import logo from '../logo.png';

function Dashboard() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // ✅ Per-user budget key
  const budgetKey = user.id ? `monthBudgets_${user.id}` : 'monthBudgets';
  const monthBudgets = JSON.parse(localStorage.getItem(budgetKey) || '{}');

  useEffect(() => {
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchData();
    }
  }, [navigate]);

  async function fetchData() {
    try {
      const res = await getExpenses();
      setExpenses(res.data);
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  }

  const now = new Date();
  const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  const currentBudget = monthBudgets[currentMonth] || 0;

  const currentMonthExpenses = expenses.filter(exp => {
    const expMonth = exp.date.slice(0, 7);
    return expMonth === currentMonth;
  });

  const monthlySpent = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const balance = currentBudget - monthlySpent;
  const isOverspent = monthlySpent > currentBudget && currentBudget > 0;
  const percentage = currentBudget > 0 ? Math.min(100, Math.round((monthlySpent / currentBudget) * 100)) : 0;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonthName = monthNames[now.getMonth()];

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  function getGreeting() {
    const hour = now.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color, #f8f9fa)', fontFamily: 'sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg, #7F77DD, #D4537E)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logo} alt="logo" style={{ width: '42px', height: '42px', borderRadius: '10px' }} />
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Track My Expense</h1>
            <p style={{ fontSize: '13px', opacity: 0.85, margin: '4px 0 0 0' }}>{getGreeting()}, {user.name}!</p>
          </div>
        </div>
        <button onClick={handleLogout} style={logoutButtonStyle}>Logout 🚪</button>
      </div>

      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>Loading your data...</p>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '2rem' }}>

              <div style={cardStyle}>
                <span style={labelStyle}>BUDGET — {currentMonthName.toUpperCase()}</span>
                <h2 style={{ margin: '10px 0', color: '#7F77DD' }}>
                  {currentBudget > 0 ? '₹' + currentBudget.toLocaleString('en-IN') : 'Not set'}
                </h2>
                {currentBudget === 0 && (
                  <p onClick={() => navigate('/expenses')} style={{ fontSize: '12px', color: '#7F77DD', cursor: 'pointer', margin: 0 }}>
                    Set budget →
                  </p>
                )}
              </div>

              <div style={cardStyle}>
                <span style={labelStyle}>SPENT THIS MONTH</span>
                <h2 style={{ margin: '10px 0', color: '#D4537E' }}>
                  ₹{monthlySpent.toLocaleString('en-IN')}
                </h2>
                <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>
                  {currentMonthExpenses.length} expense{currentMonthExpenses.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div style={cardStyle}>
                <span style={labelStyle}>
                  {isOverspent ? 'OVERSPENT 🚨' : '💰 REMAINING'}
                </span>
                <h2 style={{ margin: '10px 0', color: isOverspent ? '#E24B4A' : '#1D9E75' }}>
                  {currentBudget > 0
                    ? (isOverspent ? '-' : '') + '₹' + Math.abs(balance).toLocaleString('en-IN')
                    : 'N/A'}
                </h2>
                {isOverspent && currentBudget > 0 && (
                  <p style={{ fontSize: '12px', color: '#E24B4A', margin: 0 }}>
                    Over by ₹{Math.abs(balance).toLocaleString('en-IN')}
                  </p>
                )}
                {!isOverspent && currentBudget > 0 && (
                  <p style={{ fontSize: '12px', color: '#1D9E75', margin: 0 }}>
                    Keep it up! 💪
                  </p>
                )}
              </div>

            </div>

            {currentBudget > 0 && (
              <div style={{ background: isOverspent ? '#FCEBEB' : '#EAF3DE', border: `1px solid ${isOverspent ? '#F09595' : '#97C459'}`, borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: isOverspent ? '#501313' : '#3B6D11', marginBottom: '8px', fontWeight: '500' }}>
                  <span>{isOverspent ? '🚨 Over budget!' : '📊 Budget usage'}</span>
                  <span>{percentage}%</span>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.08)', borderRadius: '99px', height: '10px', overflow: 'hidden' }}>
                  <div style={{
                    width: percentage + '%',
                    height: '100%',
                    borderRadius: '99px',
                    background: isOverspent ? '#E24B4A' : percentage >= 80 ? '#EF9F27' : '#1D9E75',
                    transition: 'width 0.4s'
                  }}></div>
                </div>
                <p style={{ fontSize: '12px', color: isOverspent ? '#791F1F' : '#27500A', marginTop: '8px', margin: '8px 0 0 0' }}>
                  {isOverspent
                    ? `Spent ₹${monthlySpent.toLocaleString('en-IN')} out of ₹${currentBudget.toLocaleString('en-IN')} budget`
                    : percentage >= 80
                      ? `⚠️ You have used over 80% of your ${currentMonthName} budget!`
                      : `Spent ₹${monthlySpent.toLocaleString('en-IN')} of ₹${currentBudget.toLocaleString('en-IN')} budget`}
                </p>
              </div>
            )}

            <div style={{ background: 'var(--card-bg, white)', padding: '2rem', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-color, #333)' }}>What would you like to do?</h3>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/expenses')} style={actionBtnStyle('#7F77DD')}>📊 View Expenses</button>
                <button onClick={() => navigate('/profile')} style={actionBtnStyle('#D4537E')}>👤 My Profile</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const cardStyle = { background: 'var(--card-bg, white)', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' };
const labelStyle = { fontSize: '11px', color: '#888', fontWeight: 'bold', letterSpacing: '0.5px' };
const logoutButtonStyle = { background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' };
const actionBtnStyle = (color) => ({ background: color, color: 'white', border: 'none', borderRadius: '12px', padding: '1rem 2rem', fontSize: '15px', fontWeight: '600', cursor: 'pointer' });

export default Dashboard;