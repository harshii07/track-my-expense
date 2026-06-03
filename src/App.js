import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import Welcome from './pages/Welcome';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import SummaryChart from './components/SummaryChart';
import BudgetBar from './components/BudgetBar';
import GooglePinSetup from './pages/GooglePinSetup';
import { getExpenses, addExpense, updateExpense, deleteExpense } from './api';
import './App.css';

function ExpensePage() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  
  const budgetKey = user.id ? `monthBudgets_${user.id}` : 'monthBudgets';

  const [monthBudgets, setMonthBudgets] = useState(() => {
    return JSON.parse(localStorage.getItem(budgetKey) || '{}');
  });

  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());

  const currentMonthKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
  const budget = monthBudgets[currentMonthKey] || 0;

  useEffect(() => { fetchExpenses(); }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  async function fetchExpenses() {
    try {
      const res = await getExpenses();
      setExpenses(res.data);
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(expenseData) {
    if (!expenseData) {
      setEditingExpense(null);
      return;
    }
    if (!editingExpense) {
      const duplicate = expenses.find(e =>
        e.name.toLowerCase() === expenseData.name.toLowerCase() &&
        e.amount === parseFloat(expenseData.amount) &&
        e.category === expenseData.category &&
        e.date.slice(0, 10) === expenseData.date
      );
      if (duplicate) {
        const confirm = window.confirm(
          `⚠️ "${expenseData.name}" with ₹${expenseData.amount} on ${expenseData.date} already exists!\n\nAdd anyway?`
        );
        if (!confirm) return;
      }
    }
    try {
      if (editingExpense) {
        const res = await updateExpense(editingExpense._id, expenseData);
        setExpenses(expenses.map(e => e._id === editingExpense._id ? res.data : e));
        setEditingExpense(null);
      } else {
        const res = await addExpense(expenseData);
        setExpenses([res.data, ...expenses]);
      }
    } catch (err) {
      console.error('Error saving:', err);
    }
  }

  async function handleDelete(id) {
    if (window.confirm('Poof! Make this financial mistake disappear?')) {
      try {
        await deleteExpense(id);
        setExpenses(expenses.filter(e => e._id !== id));
      } catch (err) {
        console.error('Delete Error:', err);
      }
    }
  }

  function handleBudgetChange(val) {
    const updated = { ...monthBudgets, [currentMonthKey]: parseFloat(val) || 0 };
    setMonthBudgets(updated);
    // ✅ Save under per-user key
    localStorage.setItem(budgetKey, JSON.stringify(updated));
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function nextMonth() {
    const now = new Date();
    if (viewYear === now.getFullYear() && viewMonth === now.getMonth()) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const filteredExpenses = expenses.filter(e => {
    const expMonth = e.date.slice(0, 7);
    return expMonth === currentMonthKey;
  });

  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear();
  const remaining = budget - totalSpent;
  const isOverspent = totalSpent > budget && budget > 0;

  return (
    <div className="app">
      <div className="header">
        <div>
          <h1>Track My Expense</h1>
          <p style={{ fontSize: '13px', opacity: 0.85 }}>Welcome, {user.name}!</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          
          <button className="dark-toggle" onClick={() => navigate('/profile')}>👤 Profile</button>
          <button
            className="dark-toggle"
            onClick={handleLogout}
            style={{ background: '#ff4d4d', color: 'white' }}
          >
            Logout
          </button>
        </div>
      </div>

      <main className="main-container">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Loading...</p>
        ) : (
          <>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              color: '#333'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {!isCurrentMonth && (
                  <button
                    onClick={() => { setViewMonth(now.getMonth()); setViewYear(now.getFullYear()); }}
                    style={{ background: '#7F77DD', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                  >
                    Go to Today
                  </button>
                )}
                <button
                  onClick={prevMonth}
                  style={{ background: '#f0f0f0', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '16px' }}
                >
                  ‹
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <select
                    value={viewMonth}
                    onChange={e => setViewMonth(parseInt(e.target.value))}
                    style={{ padding: '4px 6px', borderRadius: '8px', border: '1px solid var(--border-color, #ddd)', background: 'var(--input-bg, white)', color: 'var(--text-color, #333)', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    {monthNames.map((m, i) => (
                      <option key={i} value={i}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={viewYear}
                    onChange={e => setViewYear(parseInt(e.target.value))}
                    style={{ padding: '4px 6px', borderRadius: '8px', border: '1px solid var(--border-color, #ddd)', background: 'var(--input-bg, white)', color: 'var(--text-color, #333)', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    {Array.from({ length: 5 }, (_, i) => now.getFullYear() - i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  {isCurrentMonth && (
                    <span style={{ fontSize: '11px', color: '#7F77DD', fontWeight: '600' }}>● current</span>
                  )}
                </div>
                <button
                  onClick={nextMonth}
                  disabled={isCurrentMonth}
                  style={{ background: '#f0f0f0', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: isCurrentMonth ? 'not-allowed' : 'pointer', fontSize: '16px', opacity: isCurrentMonth ? 0.4 : 1 }}
                >
                  ›
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: '#666' }}>
                 Set Budget for {monthNames[viewMonth]}:
                </label>
                <input
                  type="number"
                  value={budget === 0 ? '' : budget}
                  onChange={e => handleBudgetChange(e.target.value)}
                  placeholder="Set budget"
                  min="0"
                  onKeyDown={e => e.key === '-' && e.preventDefault()}
                  style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', width: '130px' }}
                />
              </div>
            </div>

            <BudgetBar budget={budget} totalSpent={totalSpent} isOverspent={isOverspent} remaining={remaining} isCurrentMonth={isCurrentMonth} monthName={monthNames[viewMonth]} />

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>BUDGET</p>
                <h3 style={{ color: '#7F77DD', fontSize: '20px' }}>
                  {budget > 0 ? '₹' + budget.toLocaleString('en-IN') : 'Not set'}
                </h3>
              </div>
              <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>SPENT</p>
                <h3 style={{ color: '#D4537E', fontSize: '20px' }}>
                  ₹{totalSpent.toLocaleString('en-IN')}
                </h3>
              </div>
              <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>
                  {isOverspent ? 'OVERSPENT' : isCurrentMonth ? 'REMAINING' : 'SAVINGS'}
                </p>
                <h3 style={{ color: isOverspent ? '#E24B4A' : '#1D9E75', fontSize: '20px' }}>
                  {budget > 0 ? (isOverspent ? '-' : '') + '₹' + Math.abs(remaining).toLocaleString('en-IN') : 'N/A'}
                </h3>
                {isOverspent && (
                  <p style={{ fontSize: '11px', color: '#E24B4A', marginTop: '4px' }}>
                    🚨 Over by ₹{Math.abs(remaining).toLocaleString('en-IN')}
                  </p>
                )}
                {!isOverspent && !isCurrentMonth && budget > 0 && (
                  <p style={{ fontSize: '11px', color: '#1D9E75', marginTop: '4px' }}>
                    🎉 Saved this month!
                  </p>
                )}
                {!isOverspent && isCurrentMonth && budget > 0 && (
                  <p style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                    💰 Left to spend
                  </p>
                )}
              </div>
            </div>

           {budget === 0 && (
              <div style={{ background: '#f8f8ff', border: '1px dashed #7F77DD', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#7F77DD', textAlign: 'center' }}>
                💡 Please set a budget for {monthNames[viewMonth]} before adding expenses.
              </div>
            )}

            {budget > 0 && (
              <ExpenseForm
                onAdd={handleAdd}
                editingExpense={editingExpense}
                setEditingExpense={setEditingExpense}
              />
            )}

            

            <ExpenseList
              expenses={filteredExpenses}
              onDelete={handleDelete}
              onEdit={setEditingExpense}
            />

            <SummaryChart
              expenses={filteredExpenses}
              allExpenses={expenses}
              budget={budget}
              totalSpent={totalSpent}
              isOverspent={isOverspent}
              remaining={remaining}
              isCurrentMonth={isCurrentMonth}
              monthName={monthNames[viewMonth]}
            />
          </>
        )}
      </main>
    </div>
  );
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/expenses" element={<PrivateRoute><ExpensePage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
		<Route path="/google-pin-setup" element={<PrivateRoute><GooglePinSetup /></PrivateRoute>} />
		<Route path="/" element={<Welcome />} />
      </Routes>
    </BrowserRouter>
  );
}