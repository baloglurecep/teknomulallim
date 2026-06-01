import React, { useState, useEffect } from 'react';

export default function Hero({ profile, projectCount = 5, onNavigate }) {
  const site = profile.site?.hero || {};
  const [titleIndex, setTitleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [speed, setSpeed] = useState(100);

  const titles = profile.titles || [];

  useEffect(() => {
    if (!titles.length) return;
    let timer;
    const currentFullText = titles[titleIndex];

    if (isDeleting) {
      timer = setTimeout(() => {
        setDisplayText(currentFullText.substring(0, displayText.length - 1));
        setSpeed(35);
      }, speed);
    } else {
      timer = setTimeout(() => {
        setDisplayText(currentFullText.substring(0, displayText.length + 1));
        setSpeed(90);
      }, speed);
    }

    if (!isDeleting && displayText === currentFullText) {
      timer = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setTitleIndex((prev) => (prev + 1) % titles.length);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, titleIndex, titles, speed]);

  const scrollTo = (id) => {
    if (onNavigate) onNavigate(id);
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const sloganParts = (profile.slogan || '').split(',');

  return (
    <section id="hero" className="hero-section">
      <div className="hero-orbit" aria-hidden="true">
        <div className="hero-orbit-dot" />
      </div>

      <div className="hero-inner">
        <div className="hero-badge glass-panel">
          <span className="hero-badge-dot" />
          <span>{site.badge}</span>
        </div>

        <h1 className="hero-title">
          <span className="hero-title-line">
            {sloganParts[0]?.trim() || profile.slogan}
          </span>
          {sloganParts[1] && (
            <span className="hero-title-accent">{sloganParts[1].trim()}</span>
          )}
        </h1>

        {titles.length > 0 && (
          <div className="hero-typing">
            <span className="terminal-cursor glow-text-purple">{displayText}</span>
          </div>
        )}

        <div className="hero-stats">
          <div className="hero-stat glass-panel">
            <div className="hero-stat-num">{projectCount}+</div>
            <div className="hero-stat-label">{site.stat1Label}</div>
          </div>
          <div className="hero-stat glass-panel">
            <div className="hero-stat-num">{site.stat2Value}</div>
            <div className="hero-stat-label">{site.stat2Label}</div>
          </div>
          <div className="hero-stat glass-panel">
            <div className="hero-stat-num">{site.stat3Value}</div>
            <div className="hero-stat-label">{site.stat3Label}</div>
          </div>
        </div>

        <div className="hero-panel glass-panel">
          <div className="hero-panel-header">
            <span className="glow-text-cyan">{site.panelCommand}</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>{site.panelTag}</span>
          </div>
          <p className="hero-panel-text">"{profile.aboutText}"</p>
        </div>

        <div className="hero-actions">
          <button onClick={() => scrollTo('projects')} className="btn-futuristic">
            {site.btnProjects}
          </button>
          <button onClick={() => scrollTo('about')} className="btn-futuristic btn-purple">
            {site.btnAbout}
          </button>
        </div>
      </div>

      <div
        className="hero-scroll-hint"
        onClick={() => scrollTo('projects')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && scrollTo('projects')}
      >
        <span>{site.scrollHint}</span>
        <svg className="hero-scroll-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>
        </svg>
      </div>
    </section>
  );
}
