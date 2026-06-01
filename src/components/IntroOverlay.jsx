import React, { useEffect, useState } from 'react';

export default function IntroOverlay({ onComplete }) {
  const [phase, setPhase] = useState('boot'); // boot -> reveal -> done

  useEffect(() => {
    const seen = sessionStorage.getItem('teknomuallim_intro_seen');
    if (seen) {
      onComplete();
      return;
    }

    const t1 = setTimeout(() => setPhase('reveal'), 600);
    const t2 = setTimeout(() => setPhase('done'), 1400);
    const t3 = setTimeout(() => {
      sessionStorage.setItem('teknomuallim_intro_seen', '1');
      onComplete();
    }, 1800);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div className={`intro-overlay ${phase === 'reveal' ? 'intro-reveal' : ''}`}>
      <div className="intro-scanline" />
      <div className="intro-content">
        <div className="intro-logo-ring">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z"/>
            <path d="M6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z"/>
            <path d="M12 8v8"/><path d="M8 12h8"/>
          </svg>
        </div>
        <div className="intro-text">
          <span className="intro-label">SİSTEM BAŞLATILIYOR</span>
          <span className="intro-brand">TEKNOMUALLIM</span>
          <div className="intro-progress">
            <div className="intro-progress-bar" />
          </div>
        </div>
      </div>
    </div>
  );
}
