import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CAT_COLORS = {
  Food: '#7F77DD',
  Transport: '#1D9E75',
  Shopping: '#D4537E',
  Health: '#D85A30',
  Entertainment: '#BA7517',
  Other: '#888780',
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const BAR_COLOR = '#38AFCA';

function SummaryChart({ expenses, allExpenses, budget, totalSpent, isOverspent, remaining, isCurrentMonth, monthName }) {
  const all = allExpenses || expenses || [];
  const exp = expenses || [];
  const [showPie, setShowPie] = useState(true);
  const [hoveredMonth, setHoveredMonth] = useState(null);
  const [yearPage, setYearPage] = useState(0);

  if (all.length === 0) {
    return <div className="summary-chart"><p className="empty">No data available yet.</p></div>;
  }

  const categoryTotals = {};
  exp.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const allYears = [...new Set(all.map(e => new Date(e.date).getFullYear()))].sort((a, b) => b - a);

  const monthTotalsByYear = {};
  all.forEach(e => {
    const d = new Date(e.date);
    const year = d.getFullYear();
    const label = MONTH_NAMES[d.getMonth()];
    if (!monthTotalsByYear[year]) monthTotalsByYear[year] = {};
    monthTotalsByYear[year][label] = (monthTotalsByYear[year][label] || 0) + e.amount;
  });

  const totalCurrentView = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));

  const currentViewYear = allYears[yearPage] || allYears[0];

  // Always show all 12 months, 0 if no data
  const allMonthsData = MONTH_NAMES.map(m => ({
    label: m,
    amt: (monthTotalsByYear[currentViewYear] || {})[m] || 0
  }));

  const maxYearMonthValue = Math.max(...allMonthsData.map(m => m.amt), 1);
  const yearTotal = allMonthsData.reduce((a, b) => a + b.amt, 0);

  return (
    <div className="summary-chart" style={{ marginTop: '15px' }}>

      {/* ---- Category Split ---- */}
      <div className="chart-box" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--secondary-text, #666)' }}>
            {monthName} — Category Split
          </h3>
          <button
            onClick={() => setShowPie(!showPie)}
            style={{
              background: !showPie ? '#7F77DD' : '#f0f0f0',
              color: !showPie ? 'white' : '#555',
              border: 'none',
              borderRadius: '8px',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {showPie ? '📊 Bar' : '🥧 Pie'}
          </button>
        </div>

        {Object.entries(categoryTotals).length > 0 ? (
          showPie ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={CAT_COLORS[entry.name] || '#888'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`₹${value.toLocaleString('en-IN')}`, name]}
                  contentStyle={{
                    background: 'var(--card-bg, white)',
                    border: '1px solid var(--border-color, #ddd)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ fontSize: '12px', color: 'var(--text-color, #333)' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {Object.entries(categoryTotals).map(([cat, amt]) => (
                <div key={cat} style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ color: CAT_COLORS[cat] || '#888', fontWeight: '600' }}>● {cat}</span>
                    <span style={{ color: 'var(--text-color, #444)' }}>₹{amt.toLocaleString('en-IN')} ({Math.round((amt / totalCurrentView) * 100)}%)</span>
                  </div>
                  <div style={{ background: '#f0f0f0', borderRadius: '99px', height: '12px' }}>
                    <div style={{
                      width: Math.round((amt / totalCurrentView) * 100) + '%',
                      background: CAT_COLORS[cat] || '#888',
                      height: '12px',
                      borderRadius: '99px',
                      transition: 'width 0.5s ease'
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <p style={{ fontSize: '13px', color: '#999', padding: '20px 0' }}>No spending this month.</p>
        )}
      </div>

      {/* ---- Spending History ---- */}
      <div className="chart-box">

        {/* Year navigator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--secondary-text, #666)' }}>
            Spending History
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setYearPage(p => Math.min(p + 1, allYears.length - 1))}
              disabled={yearPage >= allYears.length - 1}
              style={{ background: '#f0f0f0', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: yearPage >= allYears.length - 1 ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: yearPage >= allYears.length - 1 ? 0.4 : 1 }}
            >
              ‹
            </button>
            <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-color, #333)', minWidth: '50px', textAlign: 'center' }}>
              {currentViewYear}
            </span>
            <button
              onClick={() => setYearPage(p => Math.max(p - 1, 0))}
              disabled={yearPage === 0}
              style={{ background: '#f0f0f0', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: yearPage === 0 ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: yearPage === 0 ? 0.4 : 1 }}
            >
              ›
            </button>
          </div>
        </div>

        {/* Year total */}
        <div style={{ textAlign: 'right', marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--secondary-text, #888)' }}>
            {currentViewYear} Total:{' '}
            <span style={{ fontWeight: '700', color: BAR_COLOR, fontSize: '15px' }}>
              ₹{yearTotal.toLocaleString('en-IN')}
            </span>
          </span>
        </div>

        {/* Bar chart — all 12 months */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '160px', padding: '0 4px' }}>
          {allMonthsData.map(({ label, amt }) => {
            const barHeight = amt > 0 ? Math.max(Math.round((amt / maxYearMonthValue) * 130), 4) : 0;
            const isHovered = hoveredMonth === label;

            return (
              <div
                key={label}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', position: 'relative', cursor: amt > 0 ? 'pointer' : 'default' }}
                onMouseEnter={() => amt > 0 && setHoveredMonth(label)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#333',
                    color: 'white',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                    marginBottom: '4px'
                  }}>
                    ₹{amt.toLocaleString('en-IN')}
                  </div>
                )}

                {/* Bar */}
                <div style={{
                  width: '100%',
                  height: `${barHeight}px`,
                  background: amt > 0
                    ? isHovered
                      ? '#1a8fa8'
                      : `linear-gradient(180deg, ${BAR_COLOR}, #5bc8de)`
                    : '#e9ecef',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.4s ease, background 0.2s',
                  minHeight: amt > 0 ? '4px' : '2px',
                  alignSelf: 'flex-end'
                }}></div>

                {/* Month label */}
                <span style={{ fontSize: '10px', color: 'var(--secondary-text, #888)', fontWeight: '500' }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default SummaryChart;