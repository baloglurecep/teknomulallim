import React from 'react';
import { useInView } from '../hooks/useInView';

export default function About({ profile }) {
  const [headerRef, headerVisible] = useInView(0.2);
  const [contentRef, contentVisible] = useInView(0.1);
  const about = profile.site?.about || {};
  const skills = profile.skills || [];

  return (
    <section
      id="about"
      className="section-padding"
      style={{
        position: 'relative',
        zIndex: 5,
        borderTop: '1px solid rgba(0, 240, 255, 0.05)',
        background: 'linear-gradient(180deg, transparent 0%, rgba(10, 15, 36, 0.3) 100%)',
      }}
    >
      <div className="container">
        <div ref={headerRef} className={`section-header reveal ${headerVisible ? 'visible' : ''}`}>
          <span className="section-label">{about.label}</span>
          <h2 className="section-title">{about.title}</h2>
          <div className="section-divider" />
        </div>

        <div
          ref={contentRef}
          className={`reveal ${contentVisible ? 'visible' : ''}`}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: '32px',
            alignItems: 'start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px', borderLeft: '3px solid var(--purple)' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }} className="glow-text-purple">
                {about.visionTitle}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.75', marginBottom: '16px' }}>
                {about.visionText1}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.75' }}>
                {about.visionText2}
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div className="glow-text-green" style={{ fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>
                  {about.educatorTitle}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {about.educatorText}
                </p>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: '20px' }}>
                <div className="glow-text-cyan" style={{ fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>
                  {about.developerTitle}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {about.developerText}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }} className="glow-text-cyan">
              {about.skillsTitle}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {skills.map((skill, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                    <span>{skill.name}</span>
                    <span style={{ color: skill.color }}>{skill.percentage}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                    <div
                      className="skill-bar-fill"
                      style={{
                        width: contentVisible ? `${skill.percentage}%` : '0%',
                        height: '100%',
                        background: `linear-gradient(90deg, ${skill.color}, #ffffff)`,
                        borderRadius: '100px',
                        boxShadow: `0 0 8px ${skill.color}`,
                        transitionDelay: `${idx * 0.08}s`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '32px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', color: 'var(--green)', filter: 'drop-shadow(0 0 4px var(--green))' }}>µC</div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                <span style={{ color: 'var(--white)' }}>{about.hardwareLabel}</span> {about.hardwareText}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
