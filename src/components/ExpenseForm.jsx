import { useState, useEffect } from 'react';

const subCategories = {
  Food: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Groceries', 'Coffee', 'Other Food'],
  Transport: ['Fuel', 'Uber/Ola', 'Bus Fare', 'Train Ticket', 'Parking', 'Other Transport'],
  Shopping: ['Clothes', 'Electronics', 'Home Decor', 'Gifts', 'Personal Care'],
  Health: ['Medicine', 'Doctor Consultation', 'Gym', 'Lab Test', 'Insurance'],
  Entertainment: ['Netflix', 'Movie Ticket', 'Gaming', 'Concert', 'Pub/Bar'],
  Other: ['Rent', 'Electricity Bill', 'Internet', 'Laundry', 'Misc']
};

function ExpenseForm({ onAdd, editingExpense, setEditingExpense }) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'Food',
    date: ''
  });
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (editingExpense) {
      const formattedDate = editingExpense.date
        ? editingExpense.date.slice(0, 10)
        : '';
      setFormData({ ...editingExpense, date: formattedDate });
    } else {
      setFormData({ name: '', amount: '', category: 'Food', date: '' });
    }
  }, [editingExpense]);

  function showError(msg) {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 3000);
  }

  const filteredSuggestions = subCategories[formData.category].filter(s =>
    s.toLowerCase().includes(formData.name.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

    if (!formData.name.trim()) {
      showError('🤔 Hmm... what did you spend on? Give your expense a name!');
      return;
    }
    if (formData.name.trim().length > 30) {
      showError('✂️ Whoa, that name is too long! Keep it under 30 characters.');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showError('💸 Hold on! You spent ₹0? That\'s not how money works!');
      return;
    }
    if (parseFloat(formData.amount) > 100000) {
      showError('🤯 That\'s a lot! Please enter a realistic amount under ₹1,00,000.');
      return;
    }
    if (!formData.date) {
      showError('📅 When did this happen? Pick a date!');
      return;
    }
    if (formData.date > today) {
      showError('🚀 You\'re not a time traveler! Please pick today or a past date.');
      return;
    }

    onAdd(formData);

    setStatusMsg(editingExpense ? '✅ Updated!' : '✅ Added to the list!');
    setFormData({ name: '', amount: '', category: formData.category, date: '' });
    if (editingExpense && setEditingExpense) setEditingExpense(null);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setFormData({ ...formData, category: newCat, name: '' });
  };

  return (
    <div className="expense-form">
      <h2>{editingExpense ? '📝 Edit Expense' : '➕ Add Expense'}</h2>

      {errorMsg && (
        <div style={{
          background: '#FAEEDA',
          border: '1px solid #EF9F27',
          borderRadius: '10px',
          padding: '10px 16px',
          marginBottom: '10px',
          fontSize: '14px',
          color: '#633806',
          fontWeight: '500',
          animation: 'fadeIn 0.3s ease'
        }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        <select value={formData.category} onChange={handleCategoryChange}>
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Shopping">Shopping</option>
          <option value="Health">Health</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Other">Other</option>
        </select>

        <div style={{ position: 'relative', flex: 1, minWidth: '160px' }}>
          <input
            type="text"
            placeholder="Expense name"
            value={formData.name}
            onChange={e => {
              setFormData({ ...formData, name: e.target.value });
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            style={{ width: '100%' }}
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 100,
              marginTop: '4px',
              overflow: 'hidden'
            }}>
              {filteredSuggestions.map(suggestion => (
                <div
                  key={suggestion}
                  onMouseDown={() => {
                    setFormData({ ...formData, name: suggestion });
                    setShowSuggestions(false);
                  }}
                  style={{
                    padding: '10px 14px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    borderBottom: '1px solid #f0f0f0',
                    color: '#333'
                  }}
                  onMouseEnter={e => e.target.style.background = '#f4f4f4'}
                  onMouseLeave={e => e.target.style.background = 'white'}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        <input
          type="number"
          placeholder="Amount (₹)"
          value={formData.amount}
          min="0"
          onKeyDown={e => e.key === '-' && e.preventDefault()}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        />

        <input
          type="date"
          value={formData.date}
          max={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          style={{ color: formData.date ? '#333' : '#999' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <button type="submit">{editingExpense ? 'Update' : 'Add'}</button>
          {editingExpense && (
            <button
              type="button"
              onClick={() => {
                setEditingExpense(null);
                setFormData({ name: '', amount: '', category: 'Food', date: '' });
              }}
              style={{ background: '#eee', color: '#333', border: '1px solid #ddd', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer' }}
            >
              Cancel
            </button>
          )}
          {statusMsg && (
            <span style={{
              fontSize: '13px',
              color: statusMsg.includes('⚠️') ? '#D4537E' : '#2ecc71',
              fontWeight: '600',
              animation: 'fadeIn 0.3s ease'
            }}>
              {statusMsg}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

export default ExpenseForm;