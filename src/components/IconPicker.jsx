import React, { useState, useEffect, useRef } from 'react';
import { STEP_ICONS, DEFAULT_STEP_ICON } from '../utils/stepIcons';

export default function IconPicker({ value, onChange, size = 48, title = 'İkon seç' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const displayIcon = value?.trim() || DEFAULT_STEP_ICON;

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="icon-picker" style={{ position: 'relative' }}>
      <button
        type="button"
        className="icon-picker-trigger"
        title={title}
        aria-label={title}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        style={{ width: size, height: size }}
      >
        <span className="icon-picker-current">{displayIcon}</span>
      </button>

      {open && (
        <div className="icon-picker-popover" role="listbox" aria-label="Hazır ikonlar">
          <p className="icon-picker-popover-title">Hazır ikon seç</p>
          <div className="icon-picker-grid">
            {STEP_ICONS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={displayIcon === item.emoji}
                className={`icon-picker-option ${displayIcon === item.emoji ? 'selected' : ''}`}
                title={item.label}
                onClick={() => {
                  onChange(item.emoji);
                  setOpen(false);
                }}
              >
                <span>{item.emoji}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
