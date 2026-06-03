function BudgetBar({ budget, totalSpent, isOverspent, remaining, isCurrentMonth, monthName }) {
  const percentage = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;

  function getColor() {
    if (percentage >= 100) return '#E24B4A';
    if (percentage >= 80) return '#EF9F27';
    return '#1D9E75';
  }

  if (budget === 0) return null;

  return (
    <div style={{
      background: 'var(--card-bg, white)',
      border: `2px solid ${getColor()}`,
      borderRadius: '16px',
      padding: '1.2rem 1.5rem',
      marginBottom: '1.5rem',
      boxShadow: `0 4px 16px ${percentage >= 100 ? 'rgba(226,75,74,0.2)' : percentage >= 80 ? 'rgba(239,159,39,0.2)' : 'rgba(29,158,117,0.2)'}`,
    }}>

      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-color, #333)' }}>
          📊 Monthly Budget
        </span>
        <span style={{
          background: getColor(),
          color: 'white',
          borderRadius: '20px',
          padding: '3px 12px',
          fontSize: '13px',
          fontWeight: '700'
        }}>
          {percentage}% used
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{
        background: '#e9ecef',
        borderRadius: '99px',
        height: '18px',
        overflow: 'hidden',
        marginBottom: '14px',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          width: percentage + '%',
          height: '100%',
          borderRadius: '99px',
          background: `linear-gradient(90deg, ${getColor()}, ${getColor()}cc)`,
          transition: 'width 0.5s ease',
          boxShadow: `0 2px 6px ${getColor()}88`
        }}></div>
      </div>

      {/* Summary message */}
      <div style={{
        background: isOverspent ? '#FCEBEB' : '#EAF3DE',
        border: `1px solid ${isOverspent ? '#F09595' : '#97C459'}`,
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          <p style={{ fontSize: '13px', color: isOverspent ? '#501313' : '#3B6D11', fontWeight: '600', margin: 0 }}>
            {isOverspent
              ? `🚨 Overspent in ${monthName}!`
              : isCurrentMonth
                ? `💰 ${monthName} — You're doing great!`
                : `🎉 ${monthName} — Month complete!`}
          </p>
          <p style={{ fontSize: '12px', color: isOverspent ? '#791F1F' : '#27500A', margin: '4px 0 0 0' }}>
            {isOverspent
              ? `Over by ₹${Math.abs(remaining).toLocaleString('en-IN')}`
              : isCurrentMonth
                ? `₹${remaining.toLocaleString('en-IN')} remaining`
                : `Saved ₹${remaining.toLocaleString('en-IN')} this month!`}
          </p>
        </div>
        <div style={{
          background: isOverspent ? '#E24B4A' : '#1D9E75',
          color: 'white',
          borderRadius: '10px',
          padding: '8px 16px',
          fontSize: '15px',
          fontWeight: '600'
        }}>
          {isOverspent ? '-' : ''}₹{Math.abs(remaining).toLocaleString('en-IN')}
        </div>
      </div>

      {/* Warning messages */}
      {percentage >= 100 && (
        <div style={{ marginTop: '12px', padding: '10px 14px', background: '#FCEBEB', border: '1px solid #F09595', borderRadius: '10px', fontSize: '13px', color: '#501313', fontWeight: '500' }}>
          🚨 You have exceeded your budget!
        </div>
      )}
      {percentage >= 80 && percentage < 100 && (
        <div style={{ marginTop: '12px', padding: '10px 14px', background: '#FAEEDA', border: '1px solid #EF9F27', borderRadius: '10px', fontSize: '13px', color: '#633806', fontWeight: '500' }}>
          ⚠️ Warning: You have used over 80% of your budget!
        </div>
      )}
    </div>
  );
}

export default BudgetBar;