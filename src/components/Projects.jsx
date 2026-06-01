import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getMedia, persistMediaFile, deleteMedia, isRemoteMediaUrl } from '../utils/mediaStore';
import ProjectCard from './ProjectCard';
import ScaleSimulator from './simulators/ScaleSimulator';
import { useInView } from '../hooks/useInView';
import { normalizeProject } from '../utils/contentStore';

function projectViewMode(project) {
  const mode = project?.simulatorViewMode;
  return mode === 'video' || mode === 'image' ? mode : 'interactive';
}

function simTabLabel(mode) {
  if (mode === 'video') return '🎥 TANITIM VİDEOSU';
  if (mode === 'image') return '📐 TEKNİK ŞEMA';
  return '🛠️ PROJE SİMÜLASYONU';
}

export default function Projects({ profile, projects, onSaveProjects, isAdminMode, onRegisterCloseModal }) {
  const projSite = profile.site?.projects || {};
  const [filter, setFilter] = useState('Hepsi');
  const [activeSim, setActiveSim] = useState(null); // stores project object for active simulator
  const [visibleFeaturesCount, setVisibleFeaturesCount] = useState(0);
  const [consoleTab, setConsoleTab] = useState('sim'); // sim or gallery

  // Feature Steps Inline Manager States
  const [editingFeatureIndex, setEditingFeatureIndex] = useState(null);
  const [featureIconInput, setFeatureIconInput] = useState('');
  const [featureTextInput, setFeatureTextInput] = useState('');

  useEffect(() => {
    if (activeSim) {
      setVisibleFeaturesCount(0);
      const maxCount = activeSim.features ? activeSim.features.length : 0;
      if (maxCount > 0) {
        const interval = setInterval(() => {
          setVisibleFeaturesCount(prev => {
            if (prev >= maxCount) {
              clearInterval(interval);
              return prev;
            }
            return prev + 1;
          });
        }, 250); // Stagger interval (250ms)
        return () => clearInterval(interval);
      }
    } else {
      setVisibleFeaturesCount(0);
    }
  }, [activeSim]);

  const categories = [projSite.filterAll || 'Hepsi', ...(projSite.categories || [])];

  // Admin panelinden proje güncellenince açık simülatörü de senkronize et
  useEffect(() => {
    if (!activeSim) return;
    const updated = projects.find((p) => p.id === activeSim.id);
    if (!updated) return;

    const merged = normalizeProject({
      ...updated,
      customVideoUrl: activeSim.customVideoUrl || updated.customVideoUrl || '',
      customImageUrl: activeSim.customImageUrl || updated.customImageUrl || '',
      images: activeSim.images?.length ? activeSim.images : updated.images,
      simulatorViewMode: activeSim.simulatorViewMode || updated.simulatorViewMode,
    });

    if (JSON.stringify(merged) !== JSON.stringify(activeSim)) {
      setActiveSim(merged);
    }
  }, [projects]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredProjects = filter === (projSite.filterAll || 'Hepsi')
    ? projects
    : projects.filter(p => p.category === filter);

  const handleOpenSim = (project) => {
    const latest = projects.find((p) => p.id === project.id) || project;
    setActiveSim(normalizeProject(latest));
    setConsoleTab('sim');
    document.body.style.overflow = 'hidden';
  };

  const handleCloseSim = useCallback(() => {
    setActiveSim(null);
    setConsoleTab('sim');
    document.body.style.overflow = 'auto';
  }, []);

  useEffect(() => {
    onRegisterCloseModal?.(handleCloseSim);
    return () => onRegisterCloseModal?.(null);
  }, [onRegisterCloseModal, handleCloseSim]);

  const handleUpdateProject = async (updatedProject) => {
    const normalized = normalizeProject(updatedProject);
    if (onSaveProjects) {
      const updatedList = projects.map((p) => (p.id === normalized.id ? normalized : p));
      await onSaveProjects(updatedList);
    }
    setActiveSim(normalized);
  };

  const startEditFeature = (idx, feat) => {
    setEditingFeatureIndex(idx);
    setFeatureIconInput(feat.icon || '⚙️');
    setFeatureTextInput(feat.text || '');
  };

  const saveFeatureEdit = (idx) => {
    if (!featureTextInput.trim()) {
      alert("Adım açıklaması boş bırakılamaz!");
      return;
    }
    const updatedFeatures = [...(activeSim.features || [])];
    updatedFeatures[idx] = {
      icon: featureIconInput.trim() || '⚙️',
      text: featureTextInput.trim()
    };
    handleUpdateProject({
      ...activeSim,
      features: updatedFeatures
    });
    setEditingFeatureIndex(null);
  };

  const cancelFeatureEdit = () => {
    setEditingFeatureIndex(null);
  };

  const deleteFeature = (idx) => {
    if (window.confirm("Bu Ar-Ge adımını silmek istediğinize emin misiniz?")) {
      const updatedFeatures = (activeSim.features || []).filter((_, i) => i !== idx);
      handleUpdateProject({
        ...activeSim,
        features: updatedFeatures
      });
      if (editingFeatureIndex === idx) {
        setEditingFeatureIndex(null);
      }
    }
  };

  const addNewFeature = () => {
    const newStep = { icon: '⚙️', text: 'Yeni Ar-Ge veya uygulama adımı açıklaması...' };
    const updatedFeatures = [...(activeSim.features || []), newStep];
    const newIdx = updatedFeatures.length - 1;
    
    handleUpdateProject({
      ...activeSim,
      features: updatedFeatures
    });
    
    // Automatically open in edit mode
    setEditingFeatureIndex(newIdx);
    setFeatureIconInput('⚙️');
    setFeatureTextInput('Yeni Ar-Ge veya uygulama adımı açıklaması...');
  };

  const [headerRef, headerVisible] = useInView(0.2);

  return (
    <section 
      id="projects" 
      className="section-padding"
      style={{
        position: 'relative',
        zIndex: 5,
        borderTop: '1px solid rgba(0, 240, 255, 0.05)'
      }}
    >
      <div className="container">
        <div ref={headerRef} className={`section-header reveal ${headerVisible ? 'visible' : ''}`}>
          <span className="section-label">{projSite.label}</span>
          <h2 className="section-title">{projSite.title}</h2>
          <p className="section-subtitle">{projSite.subtitle}</p>
          <div className="section-divider" />
        </div>

        <div className="filter-tabs">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setFilter(cat)}
              className={`filter-tab ${filter === cat ? 'active' : ''}`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="projects-grid">
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              onOpen={handleOpenSim}
              btnLabel={projSite.btnSimulate}
            />
          ))}
        </div>

        <div className="projects-scroll-mobile">
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              onOpen={handleOpenSim}
              btnLabel={projSite.btnSimulate}
            />
          ))}
        </div>
      </div>

      {activeSim && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && handleCloseSim()}>
          <div className="modal-portal crt-overlay crt-scanline">
            <div className="modal-portal-ring" aria-hidden="true" />
            {/* Simulator Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
              background: 'rgba(6, 8, 20, 0.8)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--green)',
                  boxShadow: '0 0 8px var(--green)'
                }}></span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--cyan)' }}>
                  AKTİF SİMÜLASYON: {activeSim.title.toUpperCase()}
                </span>
              </div>
              
              <button 
                onClick={handleCloseSim}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={(e) => e.target.style.color = '#ff4d4d'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.4)'}
              >
                ✕
              </button>
            </div>

            {/* Simulator Body */}
            <div className="modal-body-scroll" style={{ padding: '24px', flexGrow: 1 }}>
              {/* Project explanation inside modal */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--white)', marginBottom: '8px' }}>Proje Detayı</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
                  {activeSim.longDescription}
                </p>

                {/* Cyber Tab Selector */}
                {activeSim.galleryEnabled && (
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    paddingBottom: '12px'
                  }}>
                    <button
                      onClick={() => setConsoleTab('sim')}
                      className={`glass-panel ${consoleTab === 'sim' ? 'glow-border-cyan glow-text-cyan' : ''}`}
                      style={{
                        padding: '8px 20px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        color: consoleTab === 'sim' ? 'var(--cyan)' : 'var(--text-secondary)',
                        border: consoleTab === 'sim' ? '1px solid var(--cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                        background: consoleTab === 'sim' ? 'rgba(0, 240, 255, 0.05)' : 'transparent',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      {simTabLabel(projectViewMode(activeSim))}
                    </button>
                    <button
                      onClick={() => setConsoleTab('gallery')}
                      className={`glass-panel ${consoleTab === 'gallery' ? 'glow-border-purple glow-text-purple' : ''}`}
                      style={{
                        padding: '8px 20px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        color: consoleTab === 'gallery' ? 'var(--purple)' : 'var(--text-secondary)',
                        border: consoleTab === 'gallery' ? '1px solid var(--purple)' : '1px solid rgba(255, 255, 255, 0.08)',
                        background: consoleTab === 'gallery' ? 'rgba(188, 60, 242, 0.05)' : 'transparent',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      🖼️ AR-GE RESİM GALERİSİ
                    </button>
                  </div>
                )}

              </div>

              {/* Tab Content Area */}
              {consoleTab === 'sim' ? (
                <>
                  {(() => {
                    const viewMode = projectViewMode(activeSim);
                    return (
                      <>
                        {isAdminMode ? (
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(6, 8, 20, 0.6)',
                            border: '1px solid rgba(0, 240, 255, 0.1)',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            marginBottom: '16px',
                            gap: '10px'
                          }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--cyan)' }} className="glow-text-cyan">
                              🛰️ [ MODÜL GÖRÜNÜM AYARI ]
                            </span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              <button
                                onClick={() => handleUpdateProject({ ...activeSim, simulatorViewMode: 'interactive' })}
                                className="btn-futuristic"
                                style={{
                                  padding: '3px 8px', fontSize: '9px',
                                  borderColor: viewMode === 'interactive' ? 'var(--cyan)' : 'rgba(255,255,255,0.08)',
                                  color: viewMode === 'interactive' ? 'var(--cyan)' : 'rgba(255,255,255,0.4)',
                                  background: viewMode === 'interactive' ? 'rgba(0, 240, 255, 0.08)' : 'transparent'
                                }}
                              >
                                ⚡ İNTERAKTİF SİMÜLATÖR
                              </button>
                              <button
                                onClick={() => handleUpdateProject({ ...activeSim, simulatorViewMode: 'video' })}
                                className="btn-futuristic"
                                style={{
                                  padding: '3px 8px', fontSize: '9px',
                                  borderColor: viewMode === 'video' ? 'var(--purple)' : 'rgba(255,255,255,0.08)',
                                  color: viewMode === 'video' ? 'var(--purple)' : 'rgba(255,255,255,0.4)',
                                  background: viewMode === 'video' ? 'rgba(188, 60, 242, 0.08)' : 'transparent'
                                }}
                              >
                                🎥 TANITIM VİDEOSU
                              </button>
                              <button
                                onClick={() => handleUpdateProject({ ...activeSim, simulatorViewMode: 'image' })}
                                className="btn-futuristic"
                                style={{
                                  padding: '3px 8px', fontSize: '9px',
                                  borderColor: viewMode === 'image' ? 'var(--cyan)' : 'rgba(255,255,255,0.08)',
                                  color: viewMode === 'image' ? 'var(--cyan)' : 'rgba(255,255,255,0.4)',
                                  background: viewMode === 'image' ? 'rgba(0, 240, 255, 0.08)' : 'transparent'
                                }}
                              >
                                📐 TEKNİK ŞEMA
                              </button>
                            </div>
                          </div>
                        ) : viewMode !== 'interactive' && (
                          <div style={{
                            marginBottom: '12px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '10px',
                            letterSpacing: '1px',
                            color: viewMode === 'video' ? 'var(--purple)' : 'var(--cyan)',
                            border: `1px solid ${viewMode === 'video' ? 'rgba(188,60,242,0.35)' : 'rgba(0,240,255,0.35)'}`,
                            background: viewMode === 'video' ? 'rgba(188,60,242,0.08)' : 'rgba(0,240,255,0.06)',
                          }}>
                            {viewMode === 'video' ? '🎥 TANITIM VİDEOSU MODU' : '📐 TEKNİK ŞEMA MODU'}
                          </div>
                        )}

                        <div style={{ marginBottom: '24px' }}>
                          {viewMode === 'video' ? (
                            <CyberVideoPlayer project={activeSim} onUpdateProject={handleUpdateProject} isAdminMode={isAdminMode} />
                          ) : viewMode === 'image' ? (
                            <SchematicViewer project={activeSim} onUpdateProject={handleUpdateProject} isAdminMode={isAdminMode} />
                          ) : (
                            <div
                              className="glass-panel"
                              style={{
                                background: '#040715',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '12px',
                                padding: 'clamp(12px, 3vw, 24px)',
                                minHeight: '300px',
                                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
                              }}
                            >
                              {activeSim.simulatorType === 'summoner' && <SummonerSimulator />}
                              {activeSim.simulatorType === 'scoreboard' && <ScoreboardSimulator />}
                              {activeSim.simulatorType === 'scale' && <ScaleSimulator />}
                              {activeSim.simulatorType === 'bell' && <BellSimulator />}
                              {activeSim.simulatorType === 'custom' && <CustomSimulator />}
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}

                  {activeSim.features && activeSim.featuresEnabled !== false && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <h5 style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--cyan)', letterSpacing: '1px', margin: 0 }}>
                        [ ⚙️ AR-GE VE UYGULAMA ADIMLARI ]
                      </h5>
                      {isAdminMode && (
                        <button
                          onClick={addNewFeature}
                          className="btn-futuristic btn-green"
                          style={{ padding: '2px 8px', fontSize: '9px' }}
                        >
                          ➕ YENİ ADIM EKLE
                        </button>
                      )}
                    </div>

                    {activeSim.features.map((feat, idx) => {
                      const isVisible = idx < visibleFeaturesCount;
                      const isEditing = idx === editingFeatureIndex;

                      if (isEditing) {
                        return (
                          <div 
                            key={idx}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                              padding: '12px 16px',
                              background: 'rgba(188, 60, 242, 0.04)',
                              border: '1px solid var(--purple)',
                              borderRadius: '8px',
                              borderLeft: '3px solid var(--purple)'
                            }}
                          >
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <input 
                                type="text"
                                placeholder="İkon (Emoji)"
                                value={featureIconInput}
                                onChange={(e) => setFeatureIconInput(e.target.value)}
                                style={{ width: '80px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--purple)', padding: '6px', borderRadius: '4px', color: '#fff', fontSize: '13px', outline: 'none', fontFamily: 'var(--font-mono)' }}
                              />
                              <input 
                                type="text"
                                placeholder="Adım açıklama metni..."
                                value={featureTextInput}
                                onChange={(e) => setFeatureTextInput(e.target.value)}
                                style={{ flexGrow: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid var(--purple)', padding: '6px', borderRadius: '4px', color: '#fff', fontSize: '13px', outline: 'none' }}
                              />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button 
                                onClick={cancelFeatureEdit}
                                className="btn-futuristic"
                                style={{ padding: '2px 8px', fontSize: '9px', borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}
                              >
                                İPTAL
                              </button>
                              <button 
                                onClick={() => saveFeatureEdit(idx)}
                                className="btn-futuristic btn-green"
                                style={{ padding: '2px 8px', fontSize: '9px' }}
                              >
                                💾 KAYDET
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div 
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'start',
                            justifyContent: 'space-between',
                            gap: '12px',
                            padding: '12px 16px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.04)',
                            borderRadius: '8px',
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
                            transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
                            borderLeft: isVisible ? '3px solid var(--cyan)' : '1px solid rgba(255,255,255,0.04)',
                            boxShadow: isVisible ? '0 0 10px rgba(0, 240, 255, 0.02)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'start', gap: '12px', flexGrow: 1 }}>
                            <span style={{ fontSize: '20px', filter: 'drop-shadow(0 0 4px var(--cyan))' }}>{feat.icon}</span>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                              {feat.text}
                            </p>
                          </div>

                          {isAdminMode && (
                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginLeft: '10px' }}>
                              <button
                                onClick={() => startEditFeature(idx, feat)}
                                className="btn-futuristic"
                                style={{ padding: '2px 6px', fontSize: '9px', borderColor: 'rgba(0, 240, 255, 0.3)', color: 'var(--cyan)' }}
                              >
                                ✏️ DÜZENLE
                              </button>
                              <button
                                onClick={() => deleteFeature(idx)}
                                className="btn-futuristic"
                                style={{ padding: '2px 6px', fontSize: '9px', borderColor: 'rgba(255, 77, 77, 0.3)', color: '#ff4d4d' }}
                              >
                                🗑️ SİL
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  )}
                </>
              ) : (
                /* Ar-Ge Gallery Tab - Robotic Pull Down Screen Slider */
                <RoboticGallery project={activeSim} onUpdateProject={handleUpdateProject} isAdminMode={isAdminMode} />
              )}
            </div>

            {/* Simulator Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              background: 'rgba(6, 8, 20, 0.5)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                LAB CONSOLE: v1.0.0 // WEB-SYNTH AUDIO LAYER ENABED
              </span>
              <button 
                onClick={handleCloseSim}
                className="btn-futuristic"
                style={{ padding: '6px 16px', fontSize: '11px' }}
              >
                KONSOLU KAPAT
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ==========================================================================
   1. NÖBETÇİ ÇAĞIRMA SİSTEMİ SİMÜLATÖRÜ (SUMMONER)
   ========================================================================== */
function SummonerSimulator() {
  const [activeCall, setActiveCall] = useState(null);
  const [isAlerting, setIsAlerting] = useState(false);
  const [displayScroll, setDisplayScroll] = useState("HAZIR");
  const intervalRef = useRef(null);

  // Web Audio Synth for Custom Alarms
  const triggerBuzzer = (roomKey) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Configure alarm frequencies and patterns based on rooms to represent custom auditory signals
      let frequencies = [880];
      let pattern = [0.15]; // beep durations
      let repeats = 2;

      if (roomKey === 'mudur') {
        frequencies = [1200, 1000]; // High-pitched alternation
        pattern = [0.1, 0.1];
        repeats = 4;
      } else if (roomKey === 'murd-yard') {
        frequencies = [980];
        pattern = [0.2, 0.1];
        repeats = 3;
      } else if (roomKey === 'ogretmenler') {
        frequencies = [780];
        pattern = [0.15, 0.15];
        repeats = 2;
      } else if (roomKey === 'rehberlik') {
        frequencies = [650, 750];
        pattern = [0.25];
        repeats = 2;
      }

      let timeOffset = 0;
      for (let r = 0; r < repeats; r++) {
        frequencies.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = roomKey === 'mudur' ? 'sawtooth' : 'square'; // Müdür sounds sharper!
          osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);
          
          gain.gain.setValueAtTime(0.0, ctx.currentTime + timeOffset);
          gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + timeOffset + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + timeOffset + (pattern[idx] || 0.15));

          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(ctx.currentTime + timeOffset);
          osc.stop(ctx.currentTime + timeOffset + (pattern[idx] || 0.15));
          
          timeOffset += (pattern[idx] || 0.15) + 0.1;
        });
      }
    } catch (e) {
      console.warn("Audio block/error:", e);
    }
  };

  const handleCall = (roomName, roomKey, ledCode) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    setActiveCall(roomName);
    setIsAlerting(true);
    triggerBuzzer(roomKey);

    // Visual matrix simulation text
    setDisplayScroll(ledCode);

    // Alert flash cycle
    let flash = true;
    intervalRef.current = setInterval(() => {
      flash = !flash;
      setDisplayScroll(flash ? ledCode : "     ");
    }, 450);

    // Stop alert after 6 seconds
    setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsAlerting(false);
      setDisplayScroll("HAZIR");
      setActiveCall(null);
    }, 6000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px'
    }}>
      {/* Admin Panel (Sender) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
          <h5 style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>[ İDARİ ODALAR - VERİCİ ]</h5>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Nöbetçi çağırmak için ilgili odaya tıklayın.</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            onClick={() => handleCall("Müdür Odası", "mudur", "MUDUR")}
            className="btn-futuristic"
            style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: 'rgba(255, 60, 60, 0.4)', color: '#ff4d4d' }}
          >
            <span>🚪 MÜDÜR ODASI</span>
            <span style={{ fontSize: '9px', background: 'rgba(255,60,60,0.1)', padding: '2px 6px', borderRadius: '4px' }}>ACİL (SAWTOOTH)</span>
          </button>

          <button 
            onClick={() => handleCall("Müdür Yardımcısı", "murd-yard", "M.YRD")}
            className="btn-futuristic"
            style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>🚪 MÜDÜR YARDIMCISI</span>
            <span style={{ fontSize: '9px', background: 'rgba(0, 240, 255, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>3 x BUZZ</span>
          </button>

          <button 
            onClick={() => handleCall("Öğretmenler Odası", "ogretmenler", "OGRT")}
            className="btn-futuristic"
            style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>🚪 ÖĞRETMENLER ODASI</span>
            <span style={{ fontSize: '9px', background: 'rgba(0, 240, 255, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>2 x BUZZ</span>
          </button>

          <button 
            onClick={() => handleCall("Rehberlik Servisi", "rehberlik", "REHB")}
            className="btn-futuristic"
            style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>🚪 REHBERLİK SERVİSİ</span>
            <span style={{ fontSize: '9px', background: 'rgba(0, 240, 255, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>YAVAŞ BUZZ</span>
          </button>
        </div>
      </div>

      {/* Receiver Device Panel (Guard Student Table) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: '#0a0d24',
        borderRadius: '12px',
        border: '1px solid rgba(0, 240, 255, 0.1)',
        position: 'relative'
      }}>
        {/* Antenna / Wireless Signal */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          color: isAlerting ? 'var(--green)' : 'var(--text-secondary)'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: isAlerting ? 'var(--green)' : 'rgba(255,255,255,0.2)',
            animation: isAlerting ? 'blink 0.5s infinite' : 'none'
          }}></span>
          {isAlerting ? "SİNYAL ALINDI // RX" : "BEKLEMEDE // RX"}
        </div>

        <h5 style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '16px', alignSelf: 'flex-start' }}>
          [ ALICI CİHAZ: NÖBETÇİ MASASI ]
        </h5>

        {/* LED Matrix Screen (MAX7219 Grid simulation) */}
        <div style={{
          width: '100%',
          maxWidth: '240px',
          height: '75px',
          background: '#040000',
          border: '6px solid #1a1a1a',
          borderRadius: '4px',
          boxShadow: 'inset 0 0 15px rgba(0,0,0,0.95), 0 0 20px rgba(255, 17, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          marginBottom: '20px',
          overflow: 'hidden'
        }}>
          {/* Ultra-realistic crisp P10 pixel mesh grid line pattern overlay */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(rgba(4, 0, 0, 0.92) 1px, transparent 1px), linear-gradient(90deg, rgba(4, 0, 0, 0.92) 1px, transparent 1px)',
            backgroundSize: '3px 3px',
            zIndex: 3,
            pointerEvents: 'none',
            opacity: 0.55
          }}></div>

          <span style={{
            fontFamily: '"JetBrains Mono", "Courier New", Courier, monospace',
            fontSize: '36px',
            fontWeight: '900',
            color: displayScroll === "HAZIR" ? 'rgba(255, 17, 0, 0.12)' : '#ff1100',
            letterSpacing: '5px',
            textShadow: displayScroll === "HAZIR" ? 'none' : '0 0 8px rgba(255, 17, 0, 0.9), 0 0 15px rgba(255, 17, 0, 0.6)',
            zIndex: 1,
            textTransform: 'uppercase'
          }}>
            {displayScroll}
          </span>
        </div>

        {/* Speaker / Buzzer Module visualization */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(0,0,0,0.3)',
          padding: '12px 16px',
          borderRadius: '8px',
          width: '100%'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: isAlerting ? 'var(--green)' : '#222',
            border: '2px solid #333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isAlerting ? '0 0 15px var(--green)' : 'none',
            transition: 'var(--transition-smooth)',
            animation: isAlerting ? 'blink 0.3s infinite' : 'none'
          }}>
            🔊
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12px', color: 'var(--white)', fontWeight: 600 }}>Dahili Aktif Buzzer</span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
              {isAlerting ? `🔔 ÇALIYOR: ${activeCall}` : "🔇 Sessiz / Tetikleme Bekliyor"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Upgraded ScoreboardSimulator component relocated below ScaleSimulator */

/* ==========================================================================
   2. HALI SAHA LED SKORBOARD SİMÜLATÖRÜ (SCOREBOARD)
   ========================================================================== */
function ScoreboardSimulator() {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0); // Starts chronometer at 0!
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isGoalFlashing, setIsGoalFlashing] = useState(false);
  const [goalSide, setGoalSide] = useState(""); // EV SAHİBİ or MİSAFİR
  const [scrollingMessage, setScrollingMessage] = useState("Teknomuallim Akilli Matris Skorboard Sistemine Hos Geldiniz!");
  const [infoCycle, setInfoCycle] = useState(0); // 0: Saat/Tarih, 1: Sıcaklık/Nem, 2: Kayan Yazı
  const [simulatedTemp, setSimulatedTemp] = useState(24.8);
  const [simulatedHum, setSimulatedHum] = useState(42);
  const [liveTime, setLiveTime] = useState(new Date());
  const [displayMode, setDisplayMode] = useState("bilgi"); // bilgi or mac

  const timerInterval = useRef(null);
  const infoInterval = useRef(null);
  const clockInterval = useRef(null);

  // Synthesize a stadium air-horn (sawtooth oscillator combo)
  const triggerHorn = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(320, ctx.currentTime); // Base low tone
      
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(324, ctx.currentTime); // Detuned for chorus thickness
      
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0); // 2-second horn blast
 
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      
      osc1.stop(ctx.currentTime + 2.0);
      osc2.stop(ctx.currentTime + 2.0);
    } catch (e) {}
  };

  // Score increments trigger GOOOL flash & horn, and auto-switch to match mode
  const handleScoreIncrease = (side) => {
    if (isGoalFlashing) return; // Prevent double trigger
    
    if (side === 'home') {
      setHomeScore(s => s + 1);
      setGoalSide("EV SAHİBİ");
    } else {
      setAwayScore(s => s + 1);
      setGoalSide("MİSAFİR");
    }
    
    setDisplayMode("mac"); // Auto switch to match view on score change
    setIsGoalFlashing(true);
    triggerHorn();
    
    setTimeout(() => {
      setIsGoalFlashing(false);
    }, 3000);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Scoreboard clock and cycles
  useEffect(() => {
    // Cycle Screen content in information mode every 3.5s
    infoInterval.current = setInterval(() => {
      setInfoCycle(prev => (prev + 1) % 3);
    }, 3500);

    // Dynamic date time updates
    clockInterval.current = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);

    // Slow ambient shifts
    const ambientTimer = setInterval(() => {
      setSimulatedTemp(t => +(t + (Math.random() - 0.5) * 0.2).toFixed(1));
      setSimulatedHum(h => Math.min(100, Math.max(10, h + Math.floor((Math.random() - 0.5) * 4))));
    }, 8000);

    return () => {
      if (infoInterval.current) clearInterval(infoInterval.current);
      if (clockInterval.current) clearInterval(clockInterval.current);
      clearInterval(ambientTimer);
    };
  }, []);

  // Chronometer logic - auto switch to match mode when timer is started
  useEffect(() => {
    if (isTimerRunning) {
      setDisplayMode("mac"); // Auto switch to match mode when active
      timerInterval.current = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerInterval.current) clearInterval(timerInterval.current);
    }
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [isTimerRunning]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', width: '100%' }}>
      
      {/* SINGLE UNIFIED HIGH-READABILITY LED PANEL */}
      <div 
        className="led-scoreboard-display crt-overlay" 
        style={{ 
          minHeight: '160px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          background: '#040000',
          padding: '16px 20px',
          width: '100%',
          maxWidth: '480px',
          border: '8px solid #222222',
          borderRadius: '8px',
          boxShadow: 'inset 0 0 15px rgba(0,0,0,0.95), 0 0 25px rgba(255, 17, 0, 0.12)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Ultra-realistic crisp P10 pixel mesh grid pattern overlay */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(rgba(4, 0, 0, 0.94) 1px, transparent 1px), linear-gradient(90deg, rgba(4, 0, 0, 0.94) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
          zIndex: 3,
          pointerEvents: 'none',
          opacity: 0.5
        }}></div>

        {isGoalFlashing ? (
          /* GOOOL BLINKING ALERT SCREEN */
          <div style={{ textAlign: 'center', width: '100%', zIndex: 1 }}>
            <h3 
              style={{ 
                fontSize: '44px', 
                fontWeight: '900', 
                fontFamily: '"JetBrains Mono", "Courier New", monospace',
                letterSpacing: '5px', 
                animation: 'blink 0.25s infinite', 
                margin: '0 0 4px 0',
                color: '#ffaa00',
                textShadow: '0 0 15px rgba(255, 170, 0, 0.95), 0 0 30px rgba(255, 170, 0, 0.6)'
              }}
            >
              GOOOLL!!!
            </h3>
            <span style={{ fontSize: '11px', fontFamily: '"JetBrains Mono", monospace', color: '#ffffff', letterSpacing: '1px', textShadow: '0 0 6px #fff' }}>
              🎉 {goalSide.toUpperCase()} GOLLÜ BULDU 🎉
            </span>
          </div>
        ) : displayMode === 'mac' ? (
          /* MATCH MODE DASHBOARD */
          <div style={{ width: '100%', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 17, 0, 0.15)', paddingBottom: '6px', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontFamily: '"JetBrains Mono", monospace', letterSpacing: '1px', color: '#ff3333', textShadow: '0 0 6px rgba(255,51,51,0.5)' }}>EV SAHİBİ</span>
              <span style={{ fontSize: '11px', fontFamily: '"JetBrains Mono", monospace', letterSpacing: '1px', color: '#ffcc00', textShadow: '0 0 6px rgba(255,204,0,0.5)' }}>KRONOMETRE</span>
              <span style={{ fontSize: '11px', fontFamily: '"JetBrains Mono", monospace', letterSpacing: '1px', color: '#ff3333', textShadow: '0 0 6px rgba(255,51,51,0.5)' }}>MİSAFİR</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', alignItems: 'center', textAlign: 'center' }}>
              {/* Home Score */}
              <div style={{ fontSize: '58px', fontWeight: 'bold', fontFamily: '"JetBrains Mono", "Courier New", monospace', color: '#ff1100', textShadow: '0 0 12px rgba(255, 17, 0, 0.9)' }}>
                {homeScore.toString().padStart(2, '0')}
              </div>

              {/* Counting-Up Match Time */}
              <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: '"JetBrains Mono", "Courier New", monospace', color: '#ffaa00', textShadow: '0 0 10px rgba(255, 170, 0, 0.9)' }}>
                {formatTime(secondsElapsed)}
              </div>

              {/* Away Score */}
              <div style={{ fontSize: '58px', fontWeight: 'bold', fontFamily: '"JetBrains Mono", "Courier New", monospace', color: '#ff1100', textShadow: '0 0 12px rgba(255, 17, 0, 0.9)' }}>
                {awayScore.toString().padStart(2, '0')}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '9px', fontFamily: '"JetBrains Mono", monospace', color: isTimerRunning ? '#00ffcc' : '#ff3333', opacity: 0.8, textShadow: isTimerRunning ? '0 0 5px #00ffcc' : '0 0 5px #ff3333' }}>
              {isTimerRunning ? "⏱️ MAÇ DEVAM EDİYOR..." : "⏱️ OYUN DURAKLATILDI"}
            </div>
          </div>
        ) : (
          /* INFORMATION SCREEN MODE (Non-match state cycle) */
          <div style={{ width: '100%', textAlign: 'center', fontFamily: '"JetBrains Mono", "Courier New", monospace', zIndex: 1 }}>
            
            {infoCycle === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 8px' }}>
                <span style={{ fontSize: '11px', color: '#95a5a6', letterSpacing: '1px' }}>[ SİSTEM ZAMANI ]</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: '#ffaa00', textShadow: '0 0 8px rgba(255,170,0,0.8)', padding: '0 12px' }}>
                  <span>📅 {liveTime.toLocaleDateString('tr-TR')}</span>
                  <span>⏰ {liveTime.toLocaleTimeString('tr-TR')}</span>
                </div>
              </div>
            )}
            
            {infoCycle === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 8px' }}>
                <span style={{ fontSize: '11px', color: '#95a5a6', letterSpacing: '1px' }}>[ ORTAM TELEMETRİSİ ]</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: '#ff1100', textShadow: '0 0 8px rgba(255,17,0,0.8)', padding: '0 16px' }}>
                  <span>🌡️ ORTAM: {simulatedTemp}°C</span>
                  <span>💧 NEM: %{simulatedHum}</span>
                </div>
              </div>
            )}

            {infoCycle === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                <span style={{ fontSize: '11px', color: '#95a5a6', letterSpacing: '1px' }}>[ DUYURU VE BİLGİ ]</span>
                <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', position: 'relative', height: '24px' }}>
                  <div 
                    style={{
                      display: 'inline-block',
                      paddingLeft: '100%',
                      animation: 'marquee-ticker 12s linear infinite',
                      fontSize: '14px',
                      letterSpacing: '1px',
                      color: '#ffaa00',
                      textShadow: '0 0 8px rgba(255,170,0,0.8)',
                      fontWeight: 'bold'
                    }}
                  >
                    📣 {scrollingMessage.toUpperCase()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RF Remote Control Panel */}
      <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--cyan)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px', textAlign: 'center' }}>
          📻 433MHz KABLOSUZ RF EL KUMANDASI & PANEL GİRİŞİ
        </div>

        {/* Mode Selector and Ticker text input */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button 
            onClick={() => setDisplayMode(m => m === 'mac' ? 'bilgi' : 'mac')} 
            className={`btn-futuristic ${displayMode === 'mac' ? 'btn-green' : 'btn-purple'}`} 
            style={{ padding: '8px', fontSize: '11px', gridColumn: 'span 2' }}
          >
            📺 EKRAN GÖRÜNTÜ MODU: {displayMode === 'mac' ? 'MAÇ SKORBOARD' : 'BİLGİLENDİRME (DÖNGÜ)'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Bilgi Paneli Kayan Yazısı</span>
            <span>({scrollingMessage.length}/70 Harf)</span>
          </label>
          <input 
            type="text" 
            maxLength="70"
            value={scrollingMessage} 
            onChange={(e) => setScrollingMessage(e.target.value)}
            placeholder="Kayan yazı metni girin..."
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              borderRadius: '4px',
              padding: '6px 10px',
              color: 'var(--white)',
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              outline: 'none',
              transition: 'var(--transition-smooth)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--cyan)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(0, 240, 255, 0.2)'}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'center' }}>EV SAHİBİ GOL</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setHomeScore(s => Math.max(0, s - 1))} className="btn-futuristic" style={{ flexGrow: 1, padding: '4px 0', fontSize: '11px' }}>-</button>
              <button onClick={() => handleScoreIncrease('home')} className="btn-futuristic btn-green" style={{ flexGrow: 1, padding: '4px 0', fontSize: '11px' }}>+</button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'center' }}>MİSAFİR GOL</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setAwayScore(s => Math.max(0, s - 1))} className="btn-futuristic" style={{ flexGrow: 1, padding: '4px 0', fontSize: '11px' }}>-</button>
              <button onClick={() => handleScoreIncrease('away')} className="btn-futuristic btn-green" style={{ flexGrow: 1, padding: '4px 0', fontSize: '11px' }}>+</button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setIsTimerRunning(!isTimerRunning)} 
            className={`btn-futuristic ${isTimerRunning ? 'btn-purple' : 'btn-green'}`} 
            style={{ flexGrow: 1, padding: '8px', fontSize: '11px' }}
          >
            {isTimerRunning ? "⏱️ KRONOMETREYİ DURDUR" : "⏱️ KRONOMETREYİ BAŞLAT"}
          </button>
          
          <button 
            onClick={() => {
              setIsTimerRunning(false);
              setSecondsElapsed(0);
            }}
            className="btn-futuristic"
            style={{ padding: '8px 12px', fontSize: '11px' }}
          >
            🔄 SIFIRLA
          </button>
        </div>

        <button 
          onClick={triggerHorn} 
          className="btn-futuristic" 
          style={{ padding: '8px', borderStyle: 'dashed', fontSize: '11px' }}
        >
          🎛️ RF MANUEL SİREN / HORN TETİKLE
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee-ticker {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }
      `}} />
    </div>
  );
}



/* ==========================================================================
   4. AKILLI ZİL SİSTEMİ SİMÜLATÖRÜ (BELL)
   ========================================================================== */
function BellSimulator() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMelody, setSelectedMelody] = useState("klasik");
  const playTimer = useRef(null);

  const melodies = {
    klasik: { name: "Klasik Ding-Dong", desc: "Temel okul zili tonu", notes: [523.25, 659.25, 587.33, 440] },
    neveser: { name: "Siber Melodi", desc: "Fütüristik alarm tınısı", notes: [880, 1100, 950, 1300] },
    istiklal: { name: "Öğretmen Zili", desc: "Yavaş ve sakinleştirici", notes: [330, 392, 440, 523, 440] }
  };

  const triggerBell = () => {
    if (isPlaying) return;
    setIsPlaying(true);

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        setIsPlaying(false);
        return;
      }
      const ctx = new AudioCtx();
      const notes = melodies[selectedMelody].notes;
      
      let delay = 0;
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = selectedMelody === 'neveser' ? 'sawtooth' : 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          
          gain.gain.setValueAtTime(0.001, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        }, delay);
        delay += 400;
      });

      playTimer.current = setTimeout(() => {
        setIsPlaying(false);
      }, notes.length * 400 + 100);

    } catch (e) {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (playTimer.current) clearTimeout(playTimer.current);
    };
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
      {/* Control panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
          <h5 style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>[ ZİL MODÜLÜ KONTROLÜ ]</h5>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Zil melodisini seçip amfiyi tetikleyin.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.keys(melodies).map((key) => (
            <div 
              key={key} 
              onClick={() => !isPlaying && setSelectedMelody(key)}
              className="glass-panel"
              style={{
                padding: '12px',
                borderRadius: '8px',
                cursor: isPlaying ? 'not-allowed' : 'pointer',
                borderColor: selectedMelody === key ? 'var(--cyan)' : 'rgba(255,255,255,0.05)',
                background: selectedMelody === key ? 'rgba(0, 240, 255, 0.04)' : 'transparent',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'var(--transition-smooth)'
              }}
            >
              <div>
                <div style={{ fontSize: '13px', color: 'var(--white)', fontWeight: 600 }}>{melodies[key].name}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{melodies[key].desc}</div>
              </div>
              <input 
                type="radio" 
                checked={selectedMelody === key} 
                onChange={() => {}} 
                disabled={isPlaying}
                style={{ accentColor: 'var(--cyan)' }}
              />
            </div>
          ))}
        </div>

        <button 
          onClick={triggerBell} 
          disabled={isPlaying}
          className="btn-futuristic btn-purple"
          style={{ width: '100%', padding: '12px' }}
        >
          {isPlaying ? "🔔 MELODİ AMFİDE ÇALIYOR..." : "🔔 AKILLI ZİLİ TETİKLE"}
        </button>
      </div>

      {/* Visual Vibrating Bell */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: '#070a1a',
        borderRadius: '12px',
        border: '1px solid rgba(0, 240, 255, 0.1)',
        position: 'relative'
      }}>
        {/* Animated Speaker Icon */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: isPlaying ? 'rgba(188, 60, 242, 0.1)' : 'rgba(255,255,255,0.02)',
          border: `2px solid ${isPlaying ? 'var(--purple)' : '#333'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '64px',
          boxShadow: isPlaying ? '0 0 25px rgba(188, 60, 242, 0.4)' : 'none',
          animation: isPlaying ? 'shake 0.25s infinite alternate' : 'none',
          transition: 'var(--transition-smooth)'
        }}>
          🔔
        </div>

        <span style={{
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: isPlaying ? 'var(--purple)' : 'var(--text-secondary)',
          marginTop: '20px'
        }}>
          {isPlaying ? "AMFİ YAYINI AKTİF // 100V OUTPUT" : "AMFİ BEKLEMEDE // STANDBY"}
        </span>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes shake {
            0% { transform: rotate(-8deg); }
            100% { transform: rotate(8deg); }
          }
        `}} />
      </div>
    </div>
  );
}

/* ==========================================================================
   5. ÖZEL GELİŞTİRME TERMİNALİ (CUSTOM)
   ========================================================================== */
function CustomSimulator() {
  const [terminalHistory, setTerminalHistory] = useState([
    "Teknomuallim Siber Terminal Başlatıldı...",
    "Hazır. Komut girmek için aşağıdaki butonlara tıklayın."
  ]);
  const [isCompiling, setIsCompiling] = useState(false);

  const runCommand = (cmdTitle, cmdLines, outputLines) => {
    setIsCompiling(true);
    setTerminalHistory(prev => [...prev, `\n>_ compile_project --src=${cmdTitle}.ino`]);

    setTimeout(() => {
      setIsCompiling(false);
      setTerminalHistory(prev => [
        ...prev,
        ...cmdLines.map(l => `[CODE] ${l}`),
        "[OK] Compilation Successful. Uploading firmware...",
        "[OK] Connection established with target microcontroller.",
        ...outputLines.map(o => `[MCU] ${o}`)
      ]);
    }, 1500);
  };

  const clearLogs = () => {
    setTerminalHistory(["Terminal temizlendi."]);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
      {/* Simulation Command selectors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
          <h5 style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>[ AR-GE KOD PARÇACIKLARI ]</h5>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Örnek kod parçacığını seçip simüle edin.</p>
        </div>

        <button 
          disabled={isCompiling}
          onClick={() => runCommand(
            "esp32_mqtt_telemetry", 
            ["WiFi.begin(ssid, pass);", "mqttClient.publish('sensor/data', payload);"],
            ["Wi-Fi connected. IP: 192.168.1.104", "Publishing: {'temp':24.2,'hum':58}"]
          )}
          className="btn-futuristic"
          style={{ textAlign: 'left', fontSize: '12px' }}
        >
          🌐 ESP32 MQTT Telemetri Kodu
        </button>

        <button 
          disabled={isCompiling}
          onClick={() => runCommand(
            "arduino_adc_filter", 
            ["val = analogRead(A0);", "filteredVal = (val * 0.1) + (prevVal * 0.9);"],
            ["ADC Channel 0 initiated.", "Sensor raw: 512, Filtered: 511.8"]
          )}
          className="btn-futuristic btn-purple"
          style={{ textAlign: 'left', fontSize: '12px' }}
        >
          ⚡ ADC Gürültü Filtreleme Kodu
        </button>

        <button 
          disabled={isCompiling}
          onClick={() => runCommand(
            "custom_timer_isr", 
            ["Timer1.initialize(1000000);", "Timer1.attachInterrupt(flashLedISR);"],
            ["Hardware Timer 1 configured at 1Hz.", "ISR trigger: LED Toggled."]
          )}
          className="btn-futuristic btn-green"
          style={{ textAlign: 'left', fontSize: '12px' }}
        >
          🕰️ Donanım Kesmesi (Timer ISR)
        </button>

        <button 
          onClick={clearLogs}
          className="btn-futuristic"
          style={{ borderStyle: 'dotted', fontSize: '11px' }}
        >
          🗑️ Terminal Loglarını Temizle
        </button>
      </div>

      {/* Terminal View */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#02040b',
        border: '1px solid rgba(0, 240, 255, 0.2)',
        borderRadius: '10px',
        padding: '16px',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        height: '240px',
        overflowY: 'auto'
      }}>
        {terminalHistory.map((line, idx) => (
          <div 
            key={idx} 
            style={{ 
              color: line.startsWith("[CODE]") 
                ? 'var(--purple)' 
                : line.startsWith("[MCU]") 
                ? 'var(--green)' 
                : line.startsWith("[OK]")
                ? 'var(--cyan)'
                : 'var(--text-secondary)',
              whiteSpace: 'pre-wrap',
              marginBottom: '4px'
            }}
          >
            {line}
          </div>
        ))}
        {isCompiling && <div className="terminal-cursor" style={{ color: 'var(--cyan)' }}>Derleniyor ve yükleniyor...</div>}
      </div>
    </div>
  );
}

/* ==========================================================================
   EKLENTİ BİLEŞENLERİ: VİDEO, TEKNİK ŞEMA VE ROBOTİK GALERİ KANVASİ
   ========================================================================== */

// Yerel IndexedDB Blob nesnelerini anlık güvenli Object URL'lere dönüştüren React Hook
function useLocalMedia(url) {
  const [mediaUrl, setMediaUrl] = useState(url);

  useEffect(() => {
    if (!url) {
      setMediaUrl('');
      return;
    }

    if (isRemoteMediaUrl(url)) {
      setMediaUrl(url);
      return;
    }

    if (url.startsWith('localdb://')) {
      const dbKey = url.replace('localdb://', '');
      let activeObjectUrl = null;

      getMedia(dbKey).then(blob => {
        if (blob) {
          activeObjectUrl = URL.createObjectURL(blob);
          setMediaUrl(activeObjectUrl);
        } else {
          setMediaUrl('');
        }
      }).catch(err => {
        console.error('Error reading localdb media:', err);
        setMediaUrl('');
      });

      return () => {
        if (activeObjectUrl) {
          URL.revokeObjectURL(activeObjectUrl);
        }
      };
    } else {
      setMediaUrl(url);
    }
  }, [url]);

  return mediaUrl;
}

function CyberVideoPlayer({ project, onUpdateProject, isAdminMode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const videoUrl = project.customVideoUrl || '';
  const resolvedVideoUrl = useLocalMedia(videoUrl);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const url = await persistMediaFile(file, `videos/${project.id}`);
      await onUpdateProject({ ...project, customVideoUrl: url });
      alert('Video buluta yüklendi ve kaydedildi.');
    } catch (err) {
      alert(`Video yükleme hatası: ${err.message}`);
    }
  };

  const handleClearVideo = async () => {
    if (window.confirm("Bu videoyu silmek istediğinize emin misiniz?")) {
      try {
        if (videoUrl.startsWith('localdb://')) {
          const dbKey = videoUrl.replace('localdb://', '');
          await deleteMedia(dbKey);
        }
        const updatedProject = {
          ...project,
          customVideoUrl: ''
        };
        onUpdateProject(updatedProject);
        alert("Video başarıyla silindi!");
      } catch (err) {
        alert("Video silme hatası: " + err.message);
      }
    }
  };

  // Video URL'si boş ise siber tarzda zengin bir terminal animasyon/döngüsü çiz
  if (!videoUrl) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        background: '#02040b',
        border: '1px solid rgba(188,60,242,0.2)',
        borderRadius: '12px',
        position: 'relative',
        minHeight: '280px',
        overflow: 'hidden',
        boxShadow: '0 0 20px rgba(188,60,242,0.05)'
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle, transparent 55%, rgba(188,60,242,0.05) 100%)',
          zIndex: 3
        }} />
        <div className="laser-scanner" style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '2px',
          background: 'var(--purple)',
          boxShadow: '0 0 10px var(--purple)',
          zIndex: 4,
          animation: 'scanner-sweep 3s infinite linear'
        }} />

        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: '2px dashed var(--purple)',
          borderTopColor: 'var(--cyan)',
          animation: 'stepper-spin 8s infinite linear',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 0 15px rgba(188,60,242,0.1)',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: '2px dotted var(--cyan)',
            borderBottomColor: 'var(--purple)',
            animation: 'stepper-spin 3s infinite linear reverse',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '20px' }}>🎥</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <div>
            <h6 style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--purple)', margin: '0 0 6px 0', letterSpacing: '1px' }} className="glow-text-purple">
              {isAdminMode ? "🛰️ [ TANITIM VİDEOSU TANIMLANMAMIŞ ]" : "🛰️ [ TANITIM VİDEOSU ÇEVRİMDIŞI ]"}
            </h6>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', maxWidth: '380px', lineHeight: '1.6', margin: 0 }}>
              {isAdminMode 
                ? "Bu proje için henüz bir tanıtım videosu eklenmemiş. Harici linklere gerek kalmadan bilgisayarınızdan doğrudan MP4 dosyası yükleyebilirsiniz."
                : "Bu proje için henüz bir tanıtım videosu tanımlanmamış. Donanım terminali çevrimiçi telemetri verilerini tarıyor..."
              }
            </p>
          </div>

          {isAdminMode && (
            <label className="btn-futuristic btn-purple" style={{ padding: '8px 20px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 10px rgba(188,60,242,0.2)' }}>
              📁 BİLGİSAYARDAN MP4 VİDEO SEÇ VE EKLE
              <input 
                type="file" accept="video/*" onChange={handleVideoUpload}
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>

        <div style={{ position: 'absolute', bottom: '10px', left: '12px', fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'rgba(188,60,242,0.3)' }}>
          SYS: STANDBY // LAYER: LOCAL
        </div>
        <div style={{ position: 'absolute', bottom: '10px', right: '12px', fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'rgba(0,240,255,0.3)' }}>
          DB: INDEXEDDB // BUFFER: EMPTY
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes scanner-sweep {
            0% { top: 0%; }
            50% { top: 100%; }
            100% { top: 0%; }
          }
          @keyframes stepper-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  return (
    <div className="project-media-shell">
      <div className="project-media-viewport">
        <video
          ref={videoRef}
          className="project-media-video"
          src={resolvedVideoUrl}
          loop
          playsInline
          controls={false}
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlay}
        />

        {!isPlaying && resolvedVideoUrl && (
          <div
            onClick={togglePlay}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && togglePlay()}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
            }}
          >
            <div style={{
              width: 'clamp(48px, 12vw, 64px)',
              height: 'clamp(48px, 12vw, 64px)',
              borderRadius: '50%',
              background: 'rgba(188,60,242,0.85)',
              border: '2px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(20px, 5vw, 28px)',
              color: '#fff',
              boxShadow: '0 0 20px var(--purple)',
              paddingLeft: '4px',
            }}>
              ▶
            </div>
          </div>
        )}
      </div>

      <div className="project-media-controls">
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={togglePlay}
            className="btn-futuristic"
            style={{ padding: '4px 12px', fontSize: '10px', borderColor: 'var(--purple)', color: 'var(--purple)' }}
          >
            {isPlaying ? "⏸️ DURAKLAT" : "▶️ OYNAT"}
          </button>
          
          {isAdminMode && (
            <label className="btn-futuristic btn-purple" style={{ padding: '4px 12px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              🔄 VİDEOYU DEĞİŞTİR
              <input 
                type="file" accept="video/*" onChange={handleVideoUpload}
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>

        {isAdminMode && (
          <button 
            onClick={handleClearVideo}
            className="btn-futuristic"
            style={{ padding: '4px 12px', fontSize: '10px', borderColor: '#ff4d4d', color: '#ff4d4d' }}
          >
            🗑️ VİDEOYU SİL
          </button>
        )}
      </div>
    </div>
  );
}

function SchematicViewer({ project, onUpdateProject, isAdminMode }) {
  const fallbackUrl = "https://images.unsplash.com/photo-1631553127988-3486c67efbc8?q=80&w=800";
  const imageUrl = project.customImageUrl || '';
  const displayUrl = imageUrl || fallbackUrl;
  const resolvedImageUrl = useLocalMedia(displayUrl);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const url = await persistMediaFile(file, `schemas/${project.id}`);
      await onUpdateProject({ ...project, customImageUrl: url });
      alert('Teknik şema buluta yüklendi.');
    } catch (err) {
      alert(`Görsel yükleme hatası: ${err.message}`);
    }
  };

  return (
    <div style={{
      background: '#010610',
      border: '2px solid rgba(0, 240, 255, 0.2)',
      borderRadius: '12px',
      padding: '16px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 0 20px rgba(0, 240, 255, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(0, 240, 255, 0.15)',
        paddingBottom: '8px',
        marginBottom: '12px',
        fontFamily: 'var(--font-mono)',
        fontSize: '9px',
        color: 'var(--cyan)'
      }}>
        <span>📐 AR-GE TEKNİK ŞEMA VE RENDER MODELİ</span>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isAdminMode && (
            <label className="btn-futuristic btn-cyan" style={{ padding: '2px 8px', fontSize: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              📁 GÖRSEL YÜKLE
              <input 
                type="file" accept="image/*" onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
          )}
          <span>STATUS: SECURE // GRID ON</span>
        </div>
      </div>

      <div style={{
        position: 'relative',
        borderRadius: '6px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        background: '#000',
        minHeight: 'clamp(200px, 42vw, 380px)',
        maxHeight: 'min(72dvh, 560px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <img
          src={resolvedImageUrl}
          alt="Teknik Şema"
          style={{ width: '100%', height: '100%', maxHeight: 'min(72dvh, 560px)', objectFit: 'contain', display: 'block' }}
        />
        
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '8px',
          color: 'rgba(255, 255, 255, 0.6)',
          background: 'rgba(0, 240, 255, 0.25)',
          padding: '2px 6px',
          borderRadius: '3px',
          backdropFilter: 'blur(2px)'
        }}>
          ZOOM: 100% // RES: HIGH
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '10px',
        fontFamily: 'var(--font-mono)',
        fontSize: '8px',
        color: 'rgba(255, 255, 255, 0.3)'
      }}>
        <span>[0.00mm, 0.00mm]</span>
        <span>------------------ COMPONENT OVERVIEW ------------------</span>
        <span>[320.00mm, 240.00mm]</span>
      </div>
    </div>
  );
}

// Film karesi formatında IndexedDB uyumlu küçük resim (thumbnail) alt bileşeni
function FilmstripThumb({ imgUrl, active, onSelect }) {
  const resolvedThumbUrl = useLocalMedia(imgUrl);
  return (
    <div 
      onClick={onSelect}
      style={{
        width: '64px',
        height: '48px',
        flexShrink: 0,
        borderRadius: '4px',
        overflow: 'hidden',
        cursor: 'pointer',
        border: active ? '2px solid var(--purple)' : '1px solid rgba(255,255,255,0.15)',
        boxShadow: active ? '0 0 8px var(--purple)' : 'none',
        opacity: active ? 1 : 0.4,
        transition: 'var(--transition-smooth)',
        position: 'relative',
        background: '#151515'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.opacity = '0.85';
          e.currentTarget.style.borderColor = 'var(--cyan)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.opacity = '0.4';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
        }
      }}
    >
      <img 
        src={resolvedThumbUrl} 
        alt="thumbnail" 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
}

function RoboticGallery({ project, onUpdateProject, isAdminMode }) {
  const [pulledDown, setPulledDown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const images = project.images || [];
  const projectTitle = project.title;

  const activeImage = images[activeIndex];
  const resolvedActiveImage = useLocalMedia(activeImage);

  // Robotik kolun uzanıp perdeyi çekme animasyonunu tetikle
  useEffect(() => {
    setPulledDown(false);
    const armTimer = setTimeout(() => {
      setPulledDown(true);
    }, 1500);
    return () => clearTimeout(armTimer);
  }, [projectTitle]); // reset animation on project changes

  // Slayt geçiş döngüsü
  useEffect(() => {
    let interval;
    if (isPlaying && pulledDown && images && images.length > 0) {
      interval = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % images.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, pulledDown, images]);

  const handleGalleryUploads = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    try {
      const keys = [];
      for (let i = 0; i < files.length; i++) {
        const url = await persistMediaFile(files[i], `gallery/${project.id}`);
        keys.push(url);
      }

      const newImagesList = [...images, ...keys];
      await onUpdateProject({ ...project, images: newImagesList });
      setActiveIndex(images.length);
      setIsPlaying(true);
      alert(`${files.length} galeri görseli buluta yüklendi.`);
    } catch (err) {
      alert(`Galeri yükleme hatası: ${err.message}`);
    }
  };

  const handleDeleteImage = async (index, e) => {
    e.stopPropagation();
    if (window.confirm("Bu resmi galeriden silmek istediğinize emin misiniz?")) {
      const imgToDelete = images[index];
      try {
        if (imgToDelete.startsWith('localdb://')) {
          const dbKey = imgToDelete.replace('localdb://', '');
          await deleteMedia(dbKey);
        }
        
        const updatedImages = images.filter((_, idx) => idx !== index);
        onUpdateProject({
          ...project,
          images: updatedImages
        });
        
        // Adjust active index
        if (activeIndex >= updatedImages.length && updatedImages.length > 0) {
          setActiveIndex(updatedImages.length - 1);
        } else if (updatedImages.length === 0) {
          setActiveIndex(0);
        }
        alert("Görsel başarıyla silindi!");
      } catch (err) {
        alert("Görsel silme hatası: " + err.message);
      }
    }
  };

  const handleSelect = (idx) => {
    setActiveIndex(idx);
    setIsPlaying(false);
  };

  if (!images || images.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        background: '#02040b',
        border: '1px dashed rgba(188, 60, 242, 0.4)',
        borderRadius: '12px',
        minHeight: '260px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <span style={{ fontSize: '36px', marginBottom: '16px' }}>🖼️</span>
        <h6 style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--purple)', marginBottom: '8px' }} className="glow-text-purple">
          {isAdminMode ? "[ AR-GE GALERİSİ BOŞ ]" : "[ AR-GE GALERİSİ ÇEVRİMDIŞI ]"}
        </h6>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '380px', lineHeight: '1.6', marginBottom: isAdminMode ? '24px' : '0px' }}>
          {isAdminMode 
            ? "Bu projeye ait henüz bir görsel bulunmamaktadır. Ekstra adımlarla uğraşmadan bilgisayarınızdan resimler seçerek anında siber galeri oluşturabilirsiniz."
            : "Bu projeye ait henüz bir görsel tanımlanmamış. Donanım terminali çevrimiçi telemetri verilerini tarıyor..."
          }
        </p>

        {isAdminMode && (
          <label className="btn-futuristic btn-purple" style={{ padding: '8px 20px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 10px rgba(188,60,242,0.2)' }}>
            ➕ 📁 BİLGİSAYARDAN RESİMLER SEÇ VE YÜKLE
            <input 
              type="file" accept="image/*" multiple onChange={handleGalleryUploads}
              style={{ display: 'none' }}
            />
          </label>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden', padding: '20px 0', minHeight: '480px' }}>
      
      {/* Robotik Kol Yapısı (Keyframe Animasyonlu) */}
      <div className="robotic-arm-container" style={{
        position: 'absolute',
        top: 0,
        right: '40px',
        width: '200px',
        height: '240px',
        zIndex: 50,
        pointerEvents: 'none'
      }}>
        <div className="robot-shoulder" style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: '#2c3e50',
          border: '3px solid #7f8c8d',
          boxShadow: '0 0 10px rgba(0,240,255,0.4)',
          transformOrigin: 'center'
        }}>
          <div style={{
            position: 'absolute',
            width: '60px',
            height: '8px',
            background: 'linear-gradient(90deg, #1abc9c, #2c3e50)',
            right: '25px',
            top: '7px',
            transform: 'rotate(-25deg)',
            transformOrigin: 'right center'
          }} />
        </div>

        {/* Üst Kol Segmenti */}
        <div className={`robot-upper-arm ${pulledDown ? 'extend' : ''}`} style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '12px',
          height: '90px',
          background: 'linear-gradient(180deg, #34495e, #7f8c8d)',
          borderRadius: '6px',
          border: '1px solid #16a085',
          transformOrigin: 'top center',
          zIndex: 49,
          transform: 'rotate(-85deg)'
        }}>
          {/* Dirsek Eklemi */}
          <div className="robot-elbow" style={{
            position: 'absolute',
            bottom: '-10px',
            left: '-4px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#2c3e50',
            border: '2px solid #bdc3c7'
          }} />

          {/* Alt Kol Segmenti */}
          <div className="robot-forearm" style={{
            position: 'absolute',
            bottom: '-80px',
            left: '2px',
            width: '8px',
            height: '80px',
            background: 'linear-gradient(180deg, #7f8c8d, #34495e)',
            borderRadius: '4px',
            transformOrigin: 'top center',
            transform: 'rotate(-50deg)'
          }}>
            {/* Wrist / Claw */}
            <div className="robot-claw" style={{
              position: 'absolute',
              bottom: '-12px',
              left: '-8px',
              width: '24px',
              height: '16px',
              background: '#2c3e50',
              border: '2px solid rgba(0, 240, 255, 0.2)',
              borderRadius: '4px 4px 8px 8px',
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0 2px'
            }}>
              <div style={{
                position: 'absolute',
                bottom: '-2px',
                left: '9px',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: 'var(--cyan)',
                boxShadow: '0 0 8px var(--cyan)'
              }} />
              <div style={{ width: '4px', height: '10px', background: '#95a5a6', borderRadius: '2px' }} />
              <div style={{ width: '4px', height: '10px', background: '#95a5a6', borderRadius: '2px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Siber Projektör Merceği ve Işık Huzmesi */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '120px',
        height: '30px',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          width: '50px',
          height: '14px',
          background: 'linear-gradient(180deg, #333 0%, #151515 100%)',
          border: '1px solid rgba(0, 240, 255, 0.4)',
          borderRadius: '0 0 6px 6px',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            bottom: '1px',
            left: '17px',
            width: '16px',
            height: '4px',
            background: 'var(--cyan)',
            boxShadow: '0 0 10px var(--cyan)',
            borderRadius: '100px'
          }} />
        </div>

        {/* Projektör Işık Demeti */}
        {pulledDown && (
          <div style={{
            width: '420px',
            height: '360px',
            background: 'linear-gradient(180deg, rgba(0, 240, 255, 0.15) 0%, transparent 80%)',
            clipPath: 'polygon(45% 0%, 55% 0%, 100% 100%, 0% 100%)',
            pointerEvents: 'none',
            zIndex: 10,
            animation: 'projector-flicker 4s infinite'
          }} />
        )}
      </div>

      {/* Projeksiyon Perdesi Gövdesi */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 20
      }}>
        
        {/* Perde Rulo Kutusu */}
        <div style={{
          width: '90%',
          maxWidth: '560px',
          height: '12px',
          background: 'linear-gradient(180deg, #666 0%, #222 100%)',
          border: '1px solid #777',
          borderRadius: '4px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
          position: 'relative',
          zIndex: 25
        }}>
          <div style={{ position: 'absolute', left: '-5px', top: '-2px', width: '6px', height: '16px', background: '#333', borderRadius: '2px' }} />
          <div style={{ position: 'absolute', right: '-5px', top: '-2px', width: '6px', height: '16px', background: '#333', borderRadius: '2px' }} />
        </div>

        {/* Perde Tuvali */}
        <div 
          className="projection-screen-body"
          style={{
            width: '85%',
            maxWidth: '520px',
            maxHeight: pulledDown ? '320px' : '0px',
            height: '320px',
            background: '#ececec',
            borderLeft: '4px solid #333',
            borderRight: '4px solid #333',
            boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
            transition: 'max-height 1.8s cubic-bezier(0.19, 1, 0.22, 1)',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.05) 50%, rgba(255, 255, 255, 0.05) 50%)',
            backgroundSize: '100% 4px',
            pointerEvents: 'none',
            zIndex: 12
          }} />
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'radial-gradient(circle, transparent 40%, rgba(0, 240, 255, 0.05) 100%)',
            pointerEvents: 'none',
            zIndex: 11
          }} />

          {pulledDown ? (
            <div style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '12px'
            }}>
              <img 
                src={resolvedActiveImage} 
                alt={`${projectTitle} Ar-Ge Görseli`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '4px',
                  border: '2px solid rgba(0, 240, 255, 0.2)',
                  boxShadow: '0 0 15px rgba(0, 240, 255, 0.1)',
                  filter: 'contrast(1.08) brightness(1.02)',
                  transition: 'opacity 0.5s ease-in-out',
                  animation: 'image-flicker-load 0.4s ease-out'
                }}
              />
              
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '20px',
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                color: '#333',
                background: 'rgba(255,255,255,0.7)',
                padding: '2px 8px',
                borderRadius: '3px',
                border: '1px solid #ccc',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 15
              }}>
                <span className="dot-blink" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--cyan)' }}></span>
                <span>AR-GE PROJEKSİYON PERDESİ // GÖRSEL {activeIndex + 1}/{images.length}</span>
              </div>

              {isAdminMode && (
                <button
                  onClick={(e) => handleDeleteImage(activeIndex, e)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '20px',
                    background: 'rgba(255, 77, 77, 0.8)',
                    border: '1px solid rgba(255, 77, 77, 0.9)',
                    borderRadius: '4px',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    padding: '4px 10px',
                    cursor: 'pointer',
                    zIndex: 15,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 0 10px rgba(255, 77, 77, 0.3)',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#ff4c4c'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 77, 77, 0.8)'}
                >
                  🗑️ BU GÖRSELİ KALDIR
                </button>
              )}
            </div>
          ) : (
            <div style={{ color: '#aaa', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              PROJEKSİYON YÜKLENİYOR...
            </div>
          )}
        </div>

        {/* Perde Ağırlık Barı ve Çekme Halkası */}
        <div style={{
          width: '86%',
          maxWidth: '526px',
          height: '10px',
          background: 'linear-gradient(180deg, #333 0%, #111 100%)',
          border: '1px solid #444',
          borderRadius: '0 0 4px 4px',
          position: 'relative',
          zIndex: 25,
          boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            position: 'absolute',
            bottom: '-12px',
            width: '14px',
            height: '14px',
            border: '2.5px solid #555',
            borderRadius: '50%',
            background: 'transparent',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }} />
        </div>
      </div>

      {/* Siber Film Karesi thumbnails şeridi */}
      {pulledDown && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginTop: '32px',
          padding: '16px 20px',
          background: 'rgba(0,0,0,0.85)',
          borderTop: '2px solid rgba(255, 255, 255, 0.05)',
          borderBottom: '2px solid rgba(255, 255, 255, 0.05)',
          position: 'relative',
          overflowX: 'auto',
          maxWidth: '520px',
          margin: '32px auto 0',
          borderRadius: '8px',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)'
        }}>
          <div style={{
            position: 'absolute',
            top: '4px',
            left: 0,
            right: 0,
            height: '6px',
            backgroundImage: 'repeating-linear-gradient(90deg, #111, #111 8px, transparent 8px, transparent 18px)',
            backgroundSize: '18px 6px'
          }} />

          {images.map((img, idx) => (
            <FilmstripThumb 
              key={idx}
              imgUrl={img}
              active={activeIndex === idx}
              onSelect={() => handleSelect(idx)}
            />
          ))}

          {/* ➕ YENİ EKLE THUMBNAIL CARD */}
          {isAdminMode && (
            <label 
              className="filmstrip-add-card"
              style={{
                width: '64px',
                height: '48px',
                flexShrink: 0,
                borderRadius: '4px',
                border: '1px dashed var(--purple)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '18px',
                color: 'var(--purple)',
                background: 'rgba(188, 60, 242, 0.05)',
                transition: 'var(--transition-smooth)',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--cyan)';
                e.currentTarget.style.color = 'var(--cyan)';
                e.currentTarget.style.background = 'rgba(0, 240, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--purple)';
                e.currentTarget.style.color = 'var(--purple)';
                e.currentTarget.style.background = 'rgba(188, 60, 242, 0.05)';
              }}
            >
              ➕
              <input 
                type="file" accept="image/*" multiple onChange={handleGalleryUploads}
                style={{ display: 'none' }}
              />
            </label>
          )}

          <div style={{
            position: 'absolute',
            bottom: '4px',
            left: 0,
            right: 0,
            height: '6px',
            backgroundImage: 'repeating-linear-gradient(90deg, #111, #111 8px, transparent 8px, transparent 18px)',
            backgroundSize: '18px 6px'
          }} />
        </div>
      )}

      {/* Cyberpunk CSS Style block injected directly inside Component */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes projector-flicker {
          0%, 100% { opacity: 0.95; }
          45% { opacity: 0.88; }
          50% { opacity: 0.97; }
          55% { opacity: 0.85; }
          80% { opacity: 0.99; }
          85% { opacity: 0.90; }
        }
        @keyframes image-flicker-load {
          0% { opacity: 0; filter: contrast(1.8) brightness(2.0); }
          50% { opacity: 0.5; filter: contrast(1.4) brightness(1.5); }
          100% { opacity: 1; filter: contrast(1.08) brightness(1.02); }
        }
        .robot-upper-arm.extend {
          animation: swing-arm-down 1.8s forwards cubic-bezier(0.19, 1, 0.22, 1);
        }
        .robot-upper-arm.extend .robot-forearm {
          animation: bend-forearm-down 1.8s forwards cubic-bezier(0.19, 1, 0.22, 1);
        }
        .robot-upper-arm.extend .robot-claw {
          animation: close-claw 1.8s forwards cubic-bezier(0.19, 1, 0.22, 1);
        }
        @keyframes swing-arm-down {
          0% { transform: rotate(-85deg); }
          100% { transform: rotate(-5deg); }
        }
        @keyframes bend-forearm-down {
          0% { transform: rotate(-50deg); }
          100% { transform: rotate(10deg); }
        }
        @keyframes close-claw {
          0% { border-color: rgba(0, 240, 255, 0.2); }
          80% { border-color: var(--cyan); }
          100% { border-color: var(--purple); box-shadow: 0 0 10px var(--purple); }
        }
      `}} />
    </div>
  );
}
