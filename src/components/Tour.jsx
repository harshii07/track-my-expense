import { useEffect, useState } from 'react';

function Tour({ steps, onFinish }) {
  const [current, setCurrent] = useState(0);
  const [box, setBox] = useState(null);

useEffect(() => {
    highlight(steps[current].selector);
    return () => clearHighlight();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  function highlight(selector) {
    clearHighlight();
    if (!selector) { setBox(null); return; }
    const el = document.querySelector(selector);
    if (!el) { setBox(null); return; }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const rect = el.getBoundingClientRect();
    setBox({
      top: rect.top + window.scrollY - 8,
      left: rect.left + window.scrollX - 8,
      width: rect.width + 16,
      height: rect.height + 16,
    });
    el.setAttribute('data-tour-highlight', 'true');
  }

  function clearHighlight() {
    document.querySelectorAll('[data-tour-highlight]').forEach(el => {
      el.removeAttribute('data-tour-highlight');
    });
  }

  function handleNext() {
    if (current < steps.length - 1) {
      setCurrent(current + 1);
    } else {
      finish();
    }
  }

  function handleBack() {
    if (current > 0) setCurrent(current - 1);
  }

  function finish() {
    clearHighlight();
    localStorage.setItem('tourDone', 'true');
    onFinish();
  }

  const step = steps[current];
  const isDark = document.body.classList.contains('dark');

  return (
    <>
      {/* Dark overlay */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.75)',
        zIndex: 9998,
        pointerEvents: 'none'
      }} />

      {/* Spotlight cutout */}
      {box && (
        <div style={{
          position: 'absolute',
          top: box.top,
          left: box.left,
          width: box.width,
          height: box.height,
          borderRadius: '12px',
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.75)',
          zIndex: 9999,
          pointerEvents: 'none',
          border: '2px solid #7F77DD',
          transition: 'all 0.3s ease'
        }} />
      )}

      {/* Tooltip card */}
      <div style={{
        position: 'fixed',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: isDark ? '#16213e' : 'white',
        color: isDark ? '#e0e0e0' : '#333',
        borderRadius: '16px',
        padding: '1.5rem 2rem',
        width: '90%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        zIndex: 10000,
        border: '1px solid #7F77DD',
        textAlign: 'center'
      }}>
        {/* Step indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '1rem' }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: i === current ? '20px' : '8px',
              height: '8px',
              borderRadius: '99px',
              background: i === current ? '#7F77DD' : '#ddd',
              transition: 'all 0.3s'
            }} />
          ))}
        </div>

        {/* Emoji + Title */}
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>{step.emoji}</div>
        <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px', color: isDark ? 'white' : '#333' }}>
          {step.title}
        </h3>
        <p style={{ fontSize: '14px', color: isDark ? '#aaa' : '#666', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          {step.description}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
          {current > 0 && (
            <button onClick={handleBack} style={{
              background: 'none', border: '1px solid #ddd', borderRadius: '8px',
              padding: '8px 16px', cursor: 'pointer', fontSize: '13px',
              color: isDark ? '#aaa' : '#666'
            }}>
              ← Back
            </button>
          )}
          <button onClick={handleNext} style={{
            background: 'linear-gradient(135deg, #7F77DD, #D4537E)',
            color: 'white', border: 'none', borderRadius: '8px',
            padding: '10px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
          }}>
            {current === steps.length - 1 ? 'Finish 🎉' : 'Next →'}
          </button>
          <button onClick={finish} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '12px', color: isDark ? '#777' : '#aaa',
            textDecoration: 'underline'
          }}>
            Skip Tour
          </button>
        </div>
      </div>
    </>
  );
}

export default Tour;