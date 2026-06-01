import React from 'react';
import { useTilt } from '../hooks/useTilt';

const categoryColors = {
  'IoT & Donanım': { accent: 'var(--cyan)', glow: 'rgba(0, 240, 255, 0.15)' },
  'Otomasyon & Yazılım': { accent: 'var(--purple)', glow: 'rgba(188, 60, 242, 0.15)' },
  'Özel Tasarım': { accent: 'var(--green)', glow: 'rgba(0, 255, 115, 0.15)' },
};

export default function ProjectCard({ project, index, onOpen, btnLabel = 'SİMÜLATÖRÜ BAŞLAT', btnDetailLabel = 'PROJE DETAYI' }) {
  const { ref, onMove, onLeave } = useTilt(10);
  const colors = categoryColors[project.category] || categoryColors['IoT & Donanım'];
  const btnClass = project.category === 'Otomasyon & Yazılım' ? 'btn-purple'
    : project.category === 'Özel Tasarım' ? 'btn-green' : '';

  return (
    <article
      ref={ref}
      className="holo-card"
      style={{ '--card-accent': colors.accent, '--card-glow': colors.glow, animationDelay: `${index * 0.08}s` }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="holo-card-border" />
      <div className="holo-card-shine" />

      <div className="holo-card-accent" />

      <div className="holo-card-body">
        <div className="holo-card-header">
          <span className="holo-badge">{project.category}</span>
          <span className="holo-index">{String(index + 1).padStart(2, '0')}</span>
        </div>

        <h3 className="holo-title">{project.title}</h3>
        <p className="holo-desc">{project.description}</p>

        <div className="holo-tags">
          {project.technology.slice(0, 4).map((tech, i) => (
            <span key={i} className="holo-tag">{tech}</span>
          ))}
          {project.technology.length > 4 && (
            <span className="holo-tag">+{project.technology.length - 4}</span>
          )}
        </div>

        <button
          onClick={() => onOpen(project)}
          className={`btn-futuristic holo-btn ${btnClass}`}
        >
          <span className="holo-btn-icon">▶</span>
          {project.simulatorEnabled !== false ? btnLabel : btnDetailLabel}
        </button>
      </div>
    </article>
  );
}
