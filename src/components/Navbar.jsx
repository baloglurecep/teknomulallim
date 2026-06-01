import React, { useState, useEffect } from 'react';
import TeacherMascot from './TeacherMascot';

export default function Navbar({ profile, onOpenAdmin, activeSection, isAdminMode, onLogout, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const nav = profile.site?.nav || {};

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    if (onNavigate) onNavigate(id);
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const links = [
    { id: 'projects', label: nav.projects },
    { id: 'about', label: nav.about },
    { id: 'contact', label: nav.contact },
  ];

  return (
    <>
      <nav className={`navbar glass-panel ${scrolled ? 'scrolled' : ''}`}>
        <div
          className="nav-brand"
          onClick={() => scrollTo('hero')}
          onDoubleClick={onOpenAdmin}
        >
          <TeacherMascot size={56} />
          <span className="nav-brand-text">{nav.brand || profile.name}</span>
        </div>

        <div className="nav-links">
          {links.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`nav-link ${activeSection === id ? 'active' : ''}`}
            >
              {label}
            </button>
          ))}
          {isAdminMode && (
            <button onClick={onLogout} className="nav-logout" aria-label="Oturumu kapat">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4d4d', display: 'inline-block' }} />
            </button>
          )}
        </div>

        <button
          className={`nav-hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menü"
        >
          <span /><span /><span />
        </button>
      </nav>

      <div className={`nav-mobile-menu glass-panel ${menuOpen ? 'open' : ''}`}>
        {links.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={`nav-mobile-link ${activeSection === id ? 'active' : ''}`}
          >
            {label}
          </button>
        ))}
        {isAdminMode && (
          <button
            onClick={() => { setMenuOpen(false); onLogout(); }}
            className="nav-mobile-link"
            style={{ color: '#ff4d4d' }}
            aria-label="Oturumu kapat"
          >
            ●
          </button>
        )}
      </div>
    </>
  );
}
