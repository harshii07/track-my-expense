import { useState } from 'react';

function ExpenseList({ expenses, onDelete, onEdit }) {
  const [removingId, setRemovingId] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('All');

  function handleDelete(id) {
    setRemovingId(id);
    setTimeout(() => {
      onDelete(id);
      setRemovingId(null);
    }, 300);
  }

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
  };

  function exportCSV() {
    const headers = ['Name', 'Amount', 'Category', 'Date'];
    const rows = filteredExpenses.map(e => [e.name, e.amount, e.category, formatDate(e.date)]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const categoryTotals = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  let filteredExpenses = [...expenses];

  if (search) {
    filteredExpenses = filteredExpenses.filter(e =>
      e.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (filterCategory !== 'All') {
    filteredExpenses = filteredExpenses.filter(e => e.category === filterCategory);
  }

  filteredExpenses.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (sortBy === 'amount') {
      valA = parseFloat(valA);
      valB = parseFloat(valB);
    }
    if (sortBy === 'date') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="expense-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: 0 }}>Expenses</h2>
        <button onClick={exportCSV} style={{ background: '#1D9E75', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px' }}>
          Export CSV
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search expenses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '150px', padding: '7px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px' }}
        />
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px' }}>
          <option value="All">All Categories</option>
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Shopping">Shopping</option>
          <option value="Health">Health</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Other">Other</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px' }}>
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
          <option value="category">Sort by Category</option>
          <option value="name">Sort by Name</option>
        </select>
        <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', cursor: 'pointer', background: 'white' }}>
          {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {Object.entries(categoryTotals).map(([cat, total]) => (
          <div key={cat} className={`expense-category cat-${cat}`} style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '12px' }}>
            {cat}: ₹{total}
          </div>
        ))}
      </div>

      {filteredExpenses.length === 0 ? (
        <p className="empty">No expenses found!</p>
      ) : (
        filteredExpenses.map(expense => (
          <div className={`expense-item ${removingId === expense._id ? 'removing' : ''}`} key={expense._id}>
            <div className="expense-info" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span className="expense-name" style={{ fontWeight: '600', fontSize: '15px' }}>{expense.name}</span>
              <span className="expense-date" style={{ fontSize: '12px', color: '#888' }}>{formatDate(expense.date)}</span>
              <span className={`expense-category cat-${expense.category}`} style={{ fontSize: '10px', marginTop: '4px', width: 'fit-content' }}>
                {expense.category}
              </span>
            </div>
            <div className="expense-right">
              <span className="expense-amount">₹{expense.amount}</span>
              <button onClick={() => onEdit(expense)}>Edit</button>
              <button onClick={() => handleDelete(expense._id)} style={{ color: '#E24B4A' }}>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ExpenseList;