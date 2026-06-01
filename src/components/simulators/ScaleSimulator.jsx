import React, { useState, useEffect, useRef, useMemo, Suspense, lazy } from 'react';
import { PHASES } from './scalePhases';
import { speakWithEmel, unlockEmelAudio } from '../../utils/edgeTts';

const BioScaleScene3D = lazy(() => import('./BioScaleScene3D'));

export default function ScaleSimulator() {
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(72);
  const [phase, setPhase] = useState(PHASES.IDLE);
  const [liveWeight, setLiveWeight] = useState(null);
  const [displayResult, setDisplayResult] = useState(null);
  const [pipelineStep, setPipelineStep] = useState(0);
  const timers = useRef([]);

  const isBusy = phase !== PHASES.IDLE && phase !== PHASES.COMPLETE;

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const schedule = (fn, ms) => {
    timers.current.push(setTimeout(fn, ms));
  };

  useEffect(() => () => clearTimers(), []);

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch { /* ignore */ }
  };

  const speakResult = (bmi, status) => {
    speakWithEmel(
      `Ölçüm tamamlandı. Boy ${height} santimetre, kilo ${weight} kilogram. Vücut kitle indeksi ${bmi}. Durum: ${status}. Veriler bilgisayara kaydedildi ve e-Okul sistemine aktarıldı.`
    );
  };

  const handleStartMeasure = () => {
    if (isBusy) return;
    unlockEmelAudio();
    clearTimers();
    setDisplayResult(null);
    setLiveWeight(null);
    setPipelineStep(0);
    setPhase(PHASES.DESCENDING);

    schedule(() => {
      setPhase(PHASES.CONTACT);
      playChime();
    }, 2800);

    schedule(() => {
      setPhase(PHASES.WEIGHING);
      let w = 30;
      const tick = setInterval(() => {
        w += (weight - w) * 0.35;
        setLiveWeight(Math.round(w * 10) / 10);
        if (Math.abs(w - weight) < 0.3) {
          setLiveWeight(weight);
          clearInterval(tick);
        }
      }, 60);
    }, 3200);

    schedule(() => {
      setPhase(PHASES.ASCENDING);
    }, 4200);

    schedule(() => {
      const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
      let status = 'İDEAL';
      if (bmi < 18.5) status = 'ZAYIF';
      else if (bmi >= 25 && bmi < 30) status = 'HAFİF KİLOLU';
      else if (bmi >= 30) status = 'KİLOLU';
      setDisplayResult({ bmi, status });
      setPhase(PHASES.PROCESSING);
    }, 5800);

    schedule(() => {
      setPhase(PHASES.SAVE_PC);
      setPipelineStep(1);
    }, 6400);

    schedule(() => {
      setPhase(PHASES.UPLOAD_EOKUL);
      setPipelineStep(2);
    }, 7600);

    schedule(() => {
      const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
      let status = 'İDEAL';
      if (bmi < 18.5) status = 'ZAYIF';
      else if (bmi >= 25 && bmi < 30) status = 'HAFİF KİLOLU';
      else if (bmi >= 30) status = 'KİLOLU';
      setPhase(PHASES.COMPLETE);
      setPipelineStep(3);
      speakResult(bmi, status);
    }, 9200);

    schedule(() => {
      setPhase(PHASES.IDLE);
      setPipelineStep(0);
    }, 14000);
  };

  const motorActive = [PHASES.DESCENDING, PHASES.ASCENDING].includes(phase);
  const headContact = [PHASES.CONTACT, PHASES.WEIGHING].includes(phase);

  const statusText = useMemo(() => {
    if (phase === PHASES.IDLE) return 'HAZIR';
    if (phase === PHASES.DESCENDING) return 'KOL İNİYOR ↓';
    if (phase === PHASES.CONTACT) return 'BAŞ TEMASI ✓';
    if (phase === PHASES.WEIGHING) return 'TARTILIYOR...';
    if (phase === PHASES.ASCENDING) return "HOME'A DÖNÜYOR ↑";
    if ([PHASES.PROCESSING, PHASES.SAVE_PC, PHASES.UPLOAD_EOKUL, PHASES.COMPLETE].includes(phase)) return 'VERİ İŞLENİYOR';
    return '';
  }, [phase]);

  return (
    <div className="scale-sim-root">
      <div className="scale-sim-grid">
        {/* Kontroller */}
        <div className="scale-sim-panel">
          <h5 className="scale-sim-label">[ ÖLÇÜM PARAMETRELERİ ]</h5>
          <p className="scale-sim-hint">Sanal öğrencinin boy ve kilo değerlerini ayarlayın, ardından ölçümü tetikleyin.</p>

          <label className="scale-sim-field">
            <span>Boy: <strong>{height} cm</strong></span>
            <input type="range" min="100" max="220" value={height} disabled={isBusy} onChange={(e) => setHeight(+e.target.value)} />
          </label>
          <label className="scale-sim-field">
            <span>Kilo: <strong>{weight} kg</strong></span>
            <input type="range" min="30" max="150" value={weight} disabled={isBusy} onChange={(e) => setWeight(+e.target.value)} />
          </label>

          <button type="button" onClick={handleStartMeasure} disabled={isBusy} className="btn-futuristic btn-green scale-sim-trigger">
            {isBusy ? '⏳ ÖLÇÜM DEVAM EDİYOR...' : '⚡ ÖLÇÜMÜ TETİKLE'}
          </button>

          <div className="scale-sim-legend">
            <div><span className="dot cyan" /> Sigma profil + lineer kızak</div>
            <div><span className="dot purple" /> NEMA 17 step motor</div>
            <div><span className="dot green" /> Boy ölçüm kolu (HOME üstte)</div>
          </div>
        </div>

        {/* 3D makine — BİO VERİ İSTASYONU */}
        <div className="scale-machine-wrap">
          <div className="scale-machine-title">BİO VERİ İSTASYONU — 3D Mekanik Simülasyon</div>
          <Suspense fallback={<div className="scale-3d-loading">3D sahne yükleniyor…</div>}>
            <BioScaleScene3D
              heightCm={height}
              phase={phase}
              headContact={headContact}
              motorActive={motorActive}
              statusText={statusText}
            />
          </Suspense>
        </div>

        {/* Ekran + veri hattı */}
        <div className="scale-sim-side">
          <div className="nextion-display">
            <div className="nextion-header">
              <span>NEXTION HMI</span>
              <span className={isBusy ? 'blink' : ''}>{isBusy ? 'ÖLÇÜM' : 'HAZIR'}</span>
            </div>
            <div className="nextion-body">
              {!displayResult && !liveWeight && phase === PHASES.IDLE && (
                <p className="nextion-idle">Cihaz hazır — ölçüm tetiklemesi bekleniyor</p>
              )}
              {(liveWeight || displayResult) && (
                <>
                  <div className="nextion-row"><span>BOY</span><strong>{height} cm</strong></div>
                  <div className="nextion-row"><span>KİLO</span><strong>{liveWeight ?? weight} kg</strong></div>
                  {displayResult && (
                    <>
                      <div className="nextion-row"><span>VKİ</span><strong>{displayResult.bmi}</strong></div>
                      <div className="nextion-row highlight"><span>DURUM</span><strong>{displayResult.status}</strong></div>
                    </>
                  )}
                </>
              )}
              {isBusy && !displayResult && (
                <p className="nextion-status">
                  {phase === PHASES.DESCENDING && 'Step motor: kol HOME → baş seviyesi'}
                  {phase === PHASES.CONTACT && 'Limit sensör: baş teması algılandı'}
                  {phase === PHASES.WEIGHING && 'Loadcell stabilizasyonu...'}
                  {phase === PHASES.ASCENDING && 'Kol HOME pozisyonuna dönüyor'}
                </p>
              )}
            </div>
          </div>

          {/* Veri akışı: İstasyon → PC → e-Okul */}
          <div className="data-pipeline">
            <div className="pipeline-title">[ VERİ AKTARIM HATTI ]</div>
            <div className="pipeline-track">
              <div className={`pipeline-node ${pipelineStep >= 0 ? 'done' : ''} ${phase === PHASES.PROCESSING ? 'active' : ''}`}>
                <span className="node-icon">📟</span>
                <span>İstasyon</span>
                <small>Ölçüm tamam</small>
              </div>
              <div className={`pipeline-arrow ${pipelineStep >= 1 ? 'flow' : ''}`}>→</div>
              <div className={`pipeline-node ${pipelineStep >= 1 ? 'done' : ''} ${phase === PHASES.SAVE_PC ? 'active' : ''}`}>
                <span className="node-icon">💻</span>
                <span>Bilgisayar</span>
                <small>SQLite / Excel kayıt</small>
              </div>
              <div className={`pipeline-arrow ${pipelineStep >= 2 ? 'flow' : ''}`}>→</div>
              <div className={`pipeline-node ${pipelineStep >= 2 ? 'done' : ''} ${phase === PHASES.UPLOAD_EOKUL ? 'active' : ''}`}>
                <span className="node-icon">🏫</span>
                <span>e-Okul</span>
                <small>Mebbis yükleme</small>
              </div>
            </div>

            {(phase === PHASES.SAVE_PC || pipelineStep >= 1) && (
              <div className="pc-screen">
                <div className="pc-titlebar">● ● ●  bio_veri_kayit.exe</div>
                <div className="pc-log">
                  <div className="log-line ok">[OK] Ölçüm paketi alındı</div>
                  <div className="log-line">{`→ Boy: ${height} cm | Kilo: ${weight} kg`}</div>
                  <div className={`log-line ${pipelineStep >= 1 ? 'ok' : 'pending'}`}>
                    {pipelineStep >= 1 ? '[OK] Yerel veritabanına kaydedildi' : '[...] Kaydediliyor...'}
                  </div>
                </div>
              </div>
            )}

            {(phase === PHASES.UPLOAD_EOKUL || pipelineStep >= 2) && (
              <div className="eokul-screen">
                <div className="eokul-header">
                  <span className="eokul-logo">e-Okul</span>
                  <span>Mebbis Entegrasyonu</span>
                </div>
                <div className="eokul-body">
                  <div className="eokul-row"><span>Öğrenci No</span><span>****42</span></div>
                  <div className="eokul-row"><span>Boy (cm)</span><span>{height}</span></div>
                  <div className="eokul-row"><span>Kilo (kg)</span><span>{weight}</span></div>
                  <div className={`eokul-upload ${pipelineStep >= 3 ? 'success' : 'loading'}`}>
                    {pipelineStep >= 3 ? '✓ e-Okul\'a başarıyla yüklendi' : '↑ Sunucuya gönderiliyor...'}
                  </div>
                  {pipelineStep >= 3 && <div className="eokul-bar"><div className="eokul-bar-fill" /></div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .scale-sim-root { width: 100%; }
        .scale-sim-grid {
          display: grid;
          grid-template-columns: minmax(200px, 240px) 1fr minmax(220px, 280px);
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .scale-sim-grid { grid-template-columns: 1fr; }
        }
        .scale-sim-panel { display: flex; flex-direction: column; gap: 14px; }
        .scale-sim-label { font-size: 12px; font-family: var(--font-mono); color: var(--cyan); margin: 0; }
        .scale-sim-hint { font-size: 11px; color: var(--text-secondary); margin: 0; line-height: 1.5; }
        .scale-sim-field { display: flex; flex-direction: column; gap: 6px; font-size: 12px; }
        .scale-sim-field input { width: 100%; accent-color: var(--cyan); }
        .scale-sim-trigger { width: 100%; padding: 12px; font-size: 11px; }
        .scale-sim-legend { font-size: 10px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
        .scale-sim-legend .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
        .scale-sim-legend .dot.cyan { background: var(--cyan); box-shadow: 0 0 6px var(--cyan); }
        .scale-sim-legend .dot.purple { background: var(--purple); }
        .scale-sim-legend .dot.green { background: var(--green); }

        .scale-machine-wrap { min-width: 0; }
        .scale-machine-title {
          font-size: 10px; font-family: var(--font-mono); color: var(--cyan);
          letter-spacing: 2px; margin-bottom: 8px; text-align: center;
        }
        .scale-3d-viewport {
          position: relative;
          height: clamp(300px, 44vw, 420px);
          border: 1px solid rgba(0, 240, 255, 0.18);
          border-radius: 12px;
          overflow: hidden;
          background: #060810;
          box-shadow: inset 0 0 50px rgba(0,0,0,0.55), 0 8px 32px rgba(0,0,0,0.35);
        }
        .scale-3d-viewport canvas { display: block; width: 100% !important; height: 100% !important; }
        .scale-3d-hud {
          position: absolute; top: 10px; right: 10px; z-index: 2;
          padding: 5px 12px; border-radius: 4px;
          font-size: 9px; font-family: var(--font-mono);
          background: rgba(0,0,0,0.55); color: var(--text-secondary);
          border: 1px solid rgba(255,255,255,0.08);
          pointer-events: none;
        }
        .scale-3d-hud.active {
          color: var(--cyan); border-color: rgba(0,240,255,0.45);
          box-shadow: 0 0 12px rgba(0,240,255,0.25);
        }
        .scale-3d-badge {
          position: absolute; bottom: 10px; left: 10px; z-index: 2;
          font-size: 8px; font-family: var(--font-mono); letter-spacing: 1.5px;
          color: rgba(0,240,255,0.55); pointer-events: none;
        }
        .scale-3d-orbit-hint {
          position: absolute; bottom: 10px; right: 10px; z-index: 2;
          font-size: 9px; font-family: var(--font-mono); letter-spacing: 0.5px;
          color: rgba(0,240,255,0.45); pointer-events: none;
          animation: fade-hint 2.5s ease-in-out infinite;
        }
        .scale-3d-slowmo {
          position: absolute; bottom: 28px; left: 10px; z-index: 2;
          font-size: 8px; font-family: var(--font-mono); letter-spacing: 2px;
          color: rgba(255,180,80,0.75); pointer-events: none;
        }
        @keyframes fade-hint {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.85; }
        }
        .scale-3d-loading {
          height: clamp(300px, 44vw, 420px);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-family: var(--font-mono); color: var(--cyan);
          border: 1px solid rgba(0,240,255,0.15); border-radius: 12px;
          background: linear-gradient(180deg, #0a0e1a, #060810);
          animation: blink 1.2s ease-in-out infinite;
        }

        /* Nextion */
        .scale-sim-side { display: flex; flex-direction: column; gap: 14px; }
        .nextion-display {
          background: #031203; border: 4px solid #222; border-radius: 8px;
          padding: 10px; font-family: var(--font-mono); min-height: 120px;
        }
        .nextion-header {
          display: flex; justify-content: space-between; font-size: 9px;
          color: #1cd61c; border-bottom: 1px solid rgba(28,214,28,0.3);
          padding-bottom: 4px; margin-bottom: 8px;
        }
        .nextion-header .blink { animation: blink 0.6s infinite; }
        .nextion-idle { font-size: 11px; color: rgba(28,214,28,0.45); text-align: center; margin: 12px 0; }
        .nextion-status { font-size: 10px; color: #1cd61c; text-align: center; line-height: 1.5; }
        .nextion-row {
          display: flex; justify-content: space-between; font-size: 12px;
          color: #1cd61c; padding: 3px 0;
        }
        .nextion-row.highlight strong { text-shadow: 0 0 8px rgba(0,255,136,0.6); }

        /* Pipeline */
        .data-pipeline {
          background: rgba(0,0,0,0.35); border: 1px solid rgba(0,240,255,0.12);
          border-radius: 10px; padding: 12px;
        }
        .pipeline-title {
          font-size: 10px; font-family: var(--font-mono); color: var(--cyan);
          margin-bottom: 12px; letter-spacing: 1px;
        }
        .pipeline-track {
          display: flex; align-items: center; justify-content: space-between;
          gap: 4px; flex-wrap: wrap;
        }
        .pipeline-node {
          flex: 1; min-width: 70px; text-align: center; padding: 8px 4px;
          border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          font-size: 9px; color: var(--text-secondary);
          transition: all 0.4s;
        }
        .pipeline-node .node-icon { display: block; font-size: 18px; margin-bottom: 4px; }
        .pipeline-node small { display: block; font-size: 7px; opacity: 0.7; margin-top: 2px; }
        .pipeline-node.active {
          border-color: var(--cyan); color: var(--cyan);
          box-shadow: 0 0 16px rgba(0,240,255,0.2);
          animation: node-pulse 0.8s ease-in-out infinite;
        }
        .pipeline-node.done {
          border-color: rgba(0,255,136,0.4); color: var(--green);
        }
        @keyframes node-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        .pipeline-arrow {
          font-size: 14px; color: rgba(255,255,255,0.15);
          transition: color 0.4s;
        }
        .pipeline-arrow.flow { color: var(--cyan); animation: arrow-flow 0.6s ease infinite; }
        @keyframes arrow-flow {
          0%, 100% { opacity: 0.4; transform: translateX(0); }
          50% { opacity: 1; transform: translateX(3px); }
        }

        .pc-screen, .eokul-screen {
          margin-top: 12px; border-radius: 8px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          animation: screen-in 0.4s ease;
        }
        @keyframes screen-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .pc-titlebar {
          background: #2a2a3a; padding: 6px 10px; font-size: 9px;
          font-family: var(--font-mono); color: var(--text-secondary);
        }
        .pc-log { background: #0a0a12; padding: 10px; font-size: 9px; font-family: var(--font-mono); }
        .log-line { color: var(--text-secondary); margin: 4px 0; }
        .log-line.ok { color: var(--green); }
        .log-line.pending { color: var(--amber, #ffb020); animation: blink 0.8s infinite; }

        .eokul-header {
          background: linear-gradient(90deg, #1e40af, #2563eb);
          padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;
          font-size: 10px; color: #fff;
        }
        .eokul-logo { font-weight: 800; font-size: 13px; }
        .eokul-body { background: #f8fafc; padding: 10px; color: #1e293b; font-size: 10px; }
        .eokul-row {
          display: flex; justify-content: space-between; padding: 4px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .eokul-upload {
          margin-top: 10px; padding: 8px; border-radius: 6px; text-align: center;
          font-weight: 600; font-size: 10px;
        }
        .eokul-upload.loading { background: #fef3c7; color: #92400e; }
        .eokul-upload.success { background: #d1fae5; color: #065f46; }
        .eokul-bar {
          height: 4px; background: #e2e8f0; border-radius: 2px; margin-top: 8px; overflow: hidden;
        }
        .eokul-bar-fill {
          height: 100%; width: 100%; background: #059669;
          animation: bar-fill 1s ease forwards;
        }
        @keyframes bar-fill { from { width: 0; } to { width: 100%; } }
      `}</style>
    </div>
  );
}
