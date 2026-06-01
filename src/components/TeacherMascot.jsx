import React from 'react';

export default function TeacherMascot({ size = 52, className = '' }) {
  return (
    <div
      className={`teacher-mascot ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tm-body" x1="20" y1="20" x2="60" y2="70" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00f0ff" />
            <stop offset="0.55" stopColor="#7c3aed" />
            <stop offset="1" stopColor="#0ea5e9" />
          </linearGradient>
          <linearGradient id="tm-glow" x1="40" y1="8" x2="40" y2="72" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00f0ff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#a855f7" stopOpacity="0.1" />
          </linearGradient>
          <radialGradient id="tm-face" cx="0" cy="0" r="1" gradientTransform="translate(40 28) rotate(90) scale(16 14)">
            <stop stopColor="#1a2744" />
            <stop offset="1" stopColor="#060814" />
          </radialGradient>
        </defs>

        <ellipse cx="40" cy="68" rx="18" ry="4" fill="url(#tm-glow)" opacity="0.45" />

        <g className="teacher-mascot-ring">
          <ellipse cx="40" cy="38" rx="28" ry="10" stroke="rgba(0,240,255,0.25)" strokeWidth="1" />
          <ellipse cx="40" cy="38" rx="22" ry="8" stroke="rgba(168,85,247,0.2)" strokeWidth="0.8" strokeDasharray="3 4" />
        </g>

        <path
          d="M24 58 C24 48 30 42 40 42 C50 42 56 48 56 58 L56 62 C56 66 52 69 40 69 C28 69 24 66 24 62 Z"
          fill="url(#tm-body)"
          opacity="0.92"
        />
        <path d="M30 58 L50 58" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        <rect x="36" y="54" width="8" height="5" rx="1.5" fill="rgba(6,8,20,0.65)" stroke="rgba(0,240,255,0.45)" />

        <path
          d="M28 42 C28 30 33 18 40 16 C47 18 52 30 52 42"
          fill="url(#tm-face)"
          stroke="rgba(0,240,255,0.35)"
          strokeWidth="1.2"
        />

        <path
          d="M30 30 C32 24 36 21 40 21 C44 21 48 24 50 30"
          fill="rgba(0,240,255,0.12)"
          stroke="#00f0ff"
          strokeWidth="1.4"
        />
        <path d="M33 29 L47 29" stroke="#00f0ff" strokeWidth="1.2" opacity="0.8" />
        <circle cx="36" cy="28" r="1.2" fill="#00f0ff" />
        <circle cx="44" cy="28" r="1.2" fill="#00f0ff" />

        <path d="M36 35 Q40 38 44 35" stroke="#a855f7" strokeWidth="1" strokeLinecap="round" fill="none" />

        <path
          d="M18 34 L24 38 M62 34 L56 38"
          stroke="rgba(0,240,255,0.35)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        <g className="teacher-mascot-tablet">
          <rect x="54" y="46" width="14" height="18" rx="2" fill="#0a1020" stroke="#00f0ff" strokeWidth="1" />
          <path d="M57 50 H65 M57 54 H63 M57 58 H65" stroke="rgba(0,240,255,0.55)" strokeWidth="0.8" />
          <circle cx="61" cy="61" r="1.2" fill="#a855f7" />
        </g>

        <path
          d="M12 24 L18 28 L16 34 L10 30 Z"
          fill="rgba(168,85,247,0.25)"
          stroke="#a855f7"
          strokeWidth="0.8"
        />
        <path
          d="M68 24 L62 28 L64 34 L70 30 Z"
          fill="rgba(0,240,255,0.2)"
          stroke="#00f0ff"
          strokeWidth="0.8"
        />
      </svg>
    </div>
  );
}
