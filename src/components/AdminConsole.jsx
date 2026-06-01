import React, { useState, useEffect } from 'react';
import { persistMediaFile, deleteMedia } from '../utils/mediaStore';
import { verifyPasscode, changePasscode, getLockRemaining } from '../utils/auth';
import { normalizeProfile, normalizeProject, normalizeProjects, downloadPublishFile } from '../utils/contentStore';
import { getApiToken } from '../utils/apiClient';
import SiteContentForm from './SiteContentForm';

export default function AdminConsole({ profile, projects, onSaveProfile, onSaveProjects, onResetData, onClose, isAdminMode, onAuthorize }) {
  const [authorized, setAuthorized] = useState(isAdminMode || false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [lockRemaining, setLockRemaining] = useState(0);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  useEffect(() => {
    const remaining = getLockRemaining();
    if (remaining > 0) {
      setLockRemaining(remaining);
      const timer = setInterval(() => {
        const r = getLockRemaining();
        setLockRemaining(r);
        if (r <= 0) clearInterval(timer);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [authError]);

  // Form states - Profile
  const [profileForm, setProfileForm] = useState(() => normalizeProfile(profile));
  const [saveNotice, setSaveNotice] = useState('');

  // Admin paneli açıkken site güncellenirse formu senkronize et
  useEffect(() => {
    setProfileForm(normalizeProfile(profile));
  }, [profile]);
  
  // Form states - Projects list
  const [editingProject, setEditingProject] = useState(null); // stores project object or 'new'
  const [projectForm, setProjectForm] = useState({
    id: '',
    title: '',
    description: '',
    longDescription: '',
    category: 'IoT & Donanım',
    technology: '',
    simulatorType: 'custom',
    galleryEnabled: false,
    featuresEnabled: true,
    simulatorViewMode: 'interactive',
    customVideoUrl: '',
    customImageUrl: '',
    images: ''
  });

  const handleAuthorize = async (e) => {
    e.preventDefault();
    if (lockRemaining > 0) return;

    const result = await verifyPasscode(passcode);
    if (result.success) {
      setAuthorized(true);
      setAuthError('');
      setPasscode('');
      if (onAuthorize) onAuthorize(true);
    } else if (result.locked) {
      setLockRemaining(result.remaining || 30);
      setAuthError(`Çok fazla deneme. ${result.remaining || lockRemaining}s bekleyin.`);
    } else {
      setAuthError(`Hatalı şifre. ${result.attemptsLeft} deneme hakkınız kaldı.`);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      alert('Yeni şifreler eşleşmiyor!');
      return;
    }
    const result = await changePasscode(currentPass, newPass);
    if (result.success) {
      alert('Şifre başarıyla değiştirildi. Lütfen tekrar giriş yapın.');
      setShowPasswordChange(false);
      setAuthorized(false);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      if (onAuthorize) onAuthorize(false);
    } else {
      alert(result.error);
    }
  };

  const handleProfileSubmit = async (e) => {
    e?.preventDefault?.();
    const normalized = normalizeProfile({
      ...profileForm,
      titles: typeof profileForm.titles === 'string'
        ? profileForm.titles.split(',').map((t) => t.trim()).filter(Boolean)
        : profileForm.titles,
    });
    try {
      await onSaveProfile(normalized);
      setProfileForm(normalized);
      setSaveNotice('✓ Site içeriği buluta kaydedildi — tüm ziyaretçilere yansır');
      setTimeout(() => setSaveNotice(''), 4000);
    } catch (err) {
      alert(`Kayıt hatası: ${err.message}`);
    }
  };

  const handleAddOrEditProjectClick = (proj) => {
    if (proj === 'new') {
      setEditingProject('new');
      setProjectForm({
        id: 'proje-' + Date.now(),
        title: '',
        description: '',
        longDescription: '',
        category: 'IoT & Donanım',
        technology: '',
        simulatorType: 'custom',
        galleryEnabled: false,
        featuresEnabled: true,
        simulatorViewMode: 'interactive',
        customVideoUrl: '',
        customImageUrl: '',
        images: ''
      });
    } else {
      setEditingProject(proj.id);
      setProjectForm({
        ...proj,
        technology: proj.technology ? proj.technology.join(', ') : '',
        images: proj.images ? proj.images.join(', ') : '',
        galleryEnabled: proj.galleryEnabled || false,
        featuresEnabled: proj.featuresEnabled !== false,
        simulatorViewMode: proj.simulatorViewMode || 'interactive',
        customVideoUrl: proj.customVideoUrl || '',
        customImageUrl: proj.customImageUrl || ''
      });
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const url = await persistMediaFile(file, `videos/${projectForm.id}`);
      setProjectForm((prev) => ({ ...prev, customVideoUrl: url }));
      alert('Video buluta yüklendi — kaydettiğinizde tüm cihazlarda görünür.');
    } catch (err) {
      alert(`Video yükleme hatası: ${err.message}`);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const url = await persistMediaFile(file, `schemas/${projectForm.id}`);
      setProjectForm((prev) => ({ ...prev, customImageUrl: url }));
      alert('Şema görseli buluta yüklendi.');
    } catch (err) {
      alert(`Görsel yükleme hatası: ${err.message}`);
    }
  };

  const handleGalleryUploads = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const keys = [];
      for (let i = 0; i < files.length; i++) {
        const url = await persistMediaFile(files[i], `gallery/${projectForm.id}`);
        keys.push(url);
      }

      const currentImages = projectForm.images
        ? projectForm.images.split(',').map((t) => t.trim()).filter((t) => t !== '')
        : [];

      const newImagesList = [...currentImages, ...keys].join(', ');
      setProjectForm((prev) => ({ ...prev, images: newImagesList }));
      alert(`${files.length} galeri görseli buluta yüklendi.`);
    } catch (err) {
      alert(`Galeri yükleme hatası: ${err.message}`);
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    
    // Parse tags string into array
    const techArray = projectForm.technology
      ? projectForm.technology.split(',').map(t => t.trim()).filter(t => t !== '')
      : [];

    // Parse image URLs string into array
    const imagesArray = projectForm.images && typeof projectForm.images === 'string'
      ? projectForm.images.split(',').map(img => img.trim()).filter(img => img !== '')
      : Array.isArray(projectForm.images) ? projectForm.images : [];

    const parsedProject = normalizeProject({
      ...projectForm,
      technology: techArray,
      images: imagesArray
    });

    let updatedProjectsList = [];
    if (editingProject === 'new') {
      updatedProjectsList = [...projects, parsedProject];
    } else {
      updatedProjectsList = projects.map(p => p.id === editingProject ? parsedProject : p);
    }

    try {
      await onSaveProjects(updatedProjectsList);
      setEditingProject(null);
      setSaveNotice('✓ Proje listesi buluta kaydedildi');
      setTimeout(() => setSaveNotice(''), 4000);
    } catch (err) {
      alert(`Kayıt hatası: ${err.message}`);
    }
  };

  const handleDeleteProject = async (projId) => {
    if (!window.confirm('Bu projeyi silmek istediğinize emin misiniz?')) return;

    try {
      await onSaveProjects(projects.filter((p) => p.id !== projId));
      setSaveNotice('✓ Proje silindi — buluta kaydedildi');
      setTimeout(() => setSaveNotice(''), 3000);
    } catch (err) {
      alert(`Silme hatası: ${err.message}`);
    }
  };

  const handlePublishToNetlify = () => {
    const publishedAt = downloadPublishFile(profileForm, projects);
    setSaveNotice(`✓ site-data.json yedek indirildi (${new Date(publishedAt).toLocaleString('tr-TR')})`);
    setTimeout(() => setSaveNotice(''), 6000);
  };

  // Yerel tarayıcıya yedek (sadece sizin cihazınız)
  const handleExportLocalBackup = () => {
    downloadPublishFile(profileForm, projects);
    setSaveNotice('✓ Yerel yedek indirildi (sadece bu tarayıcıda geçerli)');
    setTimeout(() => setSaveNotice(''), 4000);
  };

  // Import — sadece yerel önizleme; ziyaretçiler görmez
  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.readAsText(file, 'UTF-8');
    fileReader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.profile || !parsed.projects) {
          alert('Hatalı yedekleme dosyası formatı!');
          return;
        }

        const profileData = normalizeProfile(parsed.profile);
        const projectsData = normalizeProjects(parsed.projects);
        await onSaveProfile(profileData);
        await onSaveProjects(projectsData);
        setProfileForm(profileData);
        setSaveNotice(getApiToken()
          ? '✓ Yedek buluta yüklendi — tüm ziyaretçilere yansır'
          : '✓ Yedek yerel önizleme olarak yüklendi');
        setTimeout(() => setSaveNotice(''), 4000);
      } catch {
        alert('Dosya okuma hatası! Lütfen geçerli bir JSON yedek dosyası seçin.');
      }
    };
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(3, 4, 12, 0.95)',
      zIndex: 2000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)'
    }}>
      
      {/* Access Gate (Cyber Lock Screen) */}
      {!authorized ? (
        <div className="glass-panel admin-gate crt-overlay" style={{ borderColor: 'var(--purple)', boxShadow: '0 0 40px rgba(168, 85, 247, 0.15)' }}>
          <div className="admin-scan-ring">🛡️</div>
          <div>
            <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', color: 'var(--purple)' }} className="glow-text-purple">
              Güvenli Yönetici Girişi
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
              İçerik yönetim paneline erişmek için yönetici şifrenizi girin.
            </p>
          </div>

          <form onSubmit={handleAuthorize} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="password"
              placeholder="••••••••••••"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="admin-input"
              disabled={lockRemaining > 0}
              autoComplete="current-password"
            />
            {authError && <span className="admin-error">{authError}</span>}
            {lockRemaining > 0 && (
              <span className="admin-error">Kilit: {lockRemaining}s</span>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={onClose} className="btn-futuristic" style={{ flex: 1 }}>
                İptal
              </button>
              <button
                type="submit"
                className="btn-futuristic btn-purple"
                style={{ flex: 1 }}
                disabled={lockRemaining > 0}
              >
                Giriş Yap
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Main Developer Dashboard UI */
        <div 
          className="glass-panel" 
          style={{
            width: '100%',
            maxWidth: '850px',
            maxHeight: '90vh',
            borderRadius: '16px',
            borderColor: 'var(--purple)',
            boxShadow: '0 0 25px rgba(188, 60, 242, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            borderBottom: '1px solid rgba(188, 60, 242, 0.2)',
            background: 'rgba(6, 8, 20, 0.8)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--purple)', boxShadow: '0 0 8px var(--purple)' }}></span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--purple)' }}>
                YÖNETİCİ KONSOLU // YETKİLİ BAĞLANTI
              </span>
            </div>
            
            <button 
              onClick={onClose}
              style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center'
              }}
              onMouseEnter={(e) => e.target.style.color = '#ff4d4d'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.4)'}
            >
              ✕
            </button>
          </div>

          {/* Scrollable Panel Area */}
          <div style={{ padding: '24px', overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Row 1: Profile information form */}
            <section>
              <h4 style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', color: 'var(--cyan)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px', marginBottom: '16px' }}>
                [ 1. KİŞİSEL BİLGİLER VE BRANŞ ]
              </h4>
              {saveNotice && (
                <div style={{ marginBottom: '12px', padding: '10px 14px', background: 'rgba(0, 255, 136, 0.08)', border: '1px solid rgba(0, 255, 136, 0.3)', borderRadius: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>
                  {saveNotice}
                </div>
              )}
              <form onSubmit={handleProfileSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Kullanıcı Adı / Rumuz</label>
                  <input 
                    type="text" value={profileForm.name} 
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '6px', color: '#fff', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Slogan / Motto</label>
                  <input 
                    type="text" value={profileForm.slogan} 
                    onChange={(e) => setProfileForm({ ...profileForm, slogan: e.target.value })}
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '6px', color: '#fff', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Dönen Unvanlar (virgülle ayırın)</label>
                  <input
                    type="text"
                    value={Array.isArray(profileForm.titles) ? profileForm.titles.join(', ') : profileForm.titles || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, titles: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '6px', color: '#fff', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Hakkımda Detaylı Tanıtım (Hero paneli)</label>
                  <textarea 
                    rows="3" value={profileForm.aboutText} 
                    onChange={(e) => setProfileForm({ ...profileForm, aboutText: e.target.value })}
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '6px', color: '#fff', outline: 'none', fontFamily: 'var(--font-sans)', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>İletişim E-Postaları (virgülle ayırın)</label>
                  <input 
                    type="text" value={profileForm.email} 
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '6px', color: '#fff', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Form Gönderim E-Postası</label>
                  <input type="text" value={profileForm.formSubmitEmail || ''} onChange={(e) => setProfileForm({ ...profileForm, formSubmitEmail: e.target.value })} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '6px', color: '#fff', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Form CC E-Postası</label>
                  <input type="text" value={profileForm.formSubmitCc || ''} onChange={(e) => setProfileForm({ ...profileForm, formSubmitCc: e.target.value })} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '6px', color: '#fff', outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Sosyal ağlar — &quot;Site Metinleri&quot; bölümündeki SOSYAL AĞLAR sekmesinden yönetilir (onay + özel ekleme).
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: 'span 2' }}>
                  <button type="submit" className="btn-futuristic btn-green" style={{ width: '100%', padding: '10px' }}>
                    TÜM İÇERİĞİ KAYDET VE YAYINLA
                  </button>
                </div>
              </form>
            </section>

            {/* Row 1.5: Site-wide text content */}
            <section>
              <h4 style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', color: 'var(--purple)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px', marginBottom: '16px' }}>
                [ 1.5 SİTE METİNLERİ — TÜM BÖLÜMLER ]
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Aşağıdaki alanlar menü, hero, projeler, hakkımda ve iletişim bölümlerindeki tüm yazıları yönetir. Kaydettiğinizde site anında güncellenir.
              </p>
              <SiteContentForm profileForm={profileForm} setProfileForm={setProfileForm} />
              <button type="button" onClick={handleProfileSubmit} className="btn-futuristic btn-green" style={{ width: '100%', padding: '12px', marginTop: '16px' }}>
                SİTE METİNLERİNİ KAYDET
              </button>
            </section>

            {/* Row 2: Projects List Manager */}
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>
                  [ 2. PROJELER VE SİMÜLATÖRLER ]
                </h4>
                {!editingProject && (
                  <button 
                    onClick={() => handleAddOrEditProjectClick('new')}
                    className="btn-futuristic btn-green" 
                    style={{ padding: '4px 12px', fontSize: '10px' }}
                  >
                    + YENİ PROJE EKLE
                  </button>
                )}
              </div>

              {/* Render Edit Project Form inline if active */}
              {editingProject ? (
                <form onSubmit={handleProjectSubmit} className="glass-panel" style={{ padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h5 style={{ fontSize: '13px', color: 'var(--purple)', fontFamily: 'var(--font-mono)' }}>
                    {editingProject === 'new' ? "🆕 YENİ PROJE EKLEME FORMU" : `✏️ PROJEYİ DÜZENLE: ${projectForm.title}`}
                  </h5>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Proje Başlığı</label>
                      <input 
                        type="text" required value={projectForm.title}
                        onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '6px', color: '#fff', outline: 'none' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Kategori</label>
                      <select 
                        value={projectForm.category}
                        onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                        style={{ background: '#0a0d24', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '6px', color: '#fff', outline: 'none' }}
                      >
                        <option value="IoT & Donanım">IoT & Donanım</option>
                        <option value="Otomasyon & Yazılım">Otomasyon & Yazılım</option>
                        <option value="Özel Tasarım">Özel Tasarım</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Kısa Kart Açıklaması (Maks 200 karakter)</label>
                      <input 
                        type="text" required value={projectForm.description}
                        onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '6px', color: '#fff', outline: 'none' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Detaylı Teknik Açıklama (Simülatör içi)</label>
                      <textarea 
                        rows="2" required value={projectForm.longDescription}
                        onChange={(e) => setProjectForm({ ...projectForm, longDescription: e.target.value })}
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '6px', color: '#fff', outline: 'none', fontFamily: 'var(--font-sans)' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Teknoloji Etiketleri (Virgülle ayırın)</label>
                      <input 
                        type="text" placeholder="Arduino, P10 Panel, RF" value={projectForm.technology}
                        onChange={(e) => setProjectForm({ ...projectForm, technology: e.target.value })}
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '6px', color: '#fff', outline: 'none', fontFamily: 'var(--font-mono)' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Eşleşen Simülatör Modülü</label>
                      <select 
                        value={projectForm.simulatorType}
                        onChange={(e) => setProjectForm({ ...projectForm, simulatorType: e.target.value })}
                        style={{ background: '#0a0d24', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '6px', color: '#fff', outline: 'none' }}
                      >
                        <option value="summoner">Nöbetçi Çağırma Sistemi Simülatörü</option>
                        <option value="scoreboard">Halı Saha LED Skorboard Simülatörü</option>
                        <option value="scale">Boy Kilo Ölçer Otomasyon Simülatörü</option>
                        <option value="bell">Akıllı Zil Sistemi Simülatörü</option>
                        <option value="custom">Donanım Geliştirme/Terminal Simülatörü</option>
                      </select>
                    </div>

                    {/* NEW FIELDS FOR CUSTOM SIMULATOR VIEW AND GALLERY */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Simülatör Görünüm Modu</label>
                      <select 
                        value={projectForm.simulatorViewMode}
                        onChange={(e) => setProjectForm({ ...projectForm, simulatorViewMode: e.target.value })}
                        style={{ background: '#0a0d24', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '6px', color: '#fff', outline: 'none' }}
                      >
                        <option value="interactive">⚡ İnteraktif Donanım Simülatörü</option>
                        <option value="video">🎥 Konsept Tanıtım Videosu</option>
                        <option value="image">📐 Teknik Şema / 3D Render</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 0 0 0' }}>
                      <input 
                        type="checkbox" 
                        id="galleryEnabled"
                        checked={projectForm.galleryEnabled}
                        onChange={(e) => setProjectForm({ ...projectForm, galleryEnabled: e.target.checked })}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--purple)', cursor: 'pointer' }}
                      />
                      <label htmlFor="galleryEnabled" style={{ fontSize: '12px', color: '#fff', cursor: 'pointer', userSelect: 'none' }}>
                        🖼️ Proje Resim Galerisini Aktifleştir
                      </label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 0 0 0' }}>
                      <input 
                        type="checkbox" 
                        id="featuresEnabled"
                        checked={projectForm.featuresEnabled}
                        onChange={(e) => setProjectForm({ ...projectForm, featuresEnabled: e.target.checked })}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--purple)', cursor: 'pointer' }}
                      />
                      <label htmlFor="featuresEnabled" style={{ fontSize: '12px', color: '#fff', cursor: 'pointer', userSelect: 'none' }}>
                        ⚙️ Ar-Ge ve Uygulama Adımlarını Aktifleştir
                      </label>
                    </div>

                    {projectForm.simulatorViewMode === 'video' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Özel Video (MP4 / Youtube Linki veya Doğrudan Bilgisayardan Yükle)</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <input 
                            type="text" placeholder="https://example.com/demo.mp4 veya yerel dosya..." value={projectForm.customVideoUrl}
                            onChange={(e) => setProjectForm({ ...projectForm, customVideoUrl: e.target.value })}
                            style={{ flexGrow: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '6px', color: '#fff', outline: 'none', fontFamily: 'var(--font-mono)' }}
                          />
                          <label className="btn-futuristic btn-purple" style={{ padding: '8px 12px', fontSize: '10px', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            📁 VİDEO SEÇ
                            <input 
                              type="file" accept="video/*" onChange={handleVideoUpload}
                              style={{ display: 'none' }}
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {projectForm.simulatorViewMode === 'image' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Özel Teknik Şema (Resim Linki veya Doğrudan Bilgisayardan Yükle)</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <input 
                            type="text" placeholder="https://example.com/schema.png veya yerel dosya..." value={projectForm.customImageUrl}
                            onChange={(e) => setProjectForm({ ...projectForm, customImageUrl: e.target.value })}
                            style={{ flexGrow: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '6px', color: '#fff', outline: 'none', fontFamily: 'var(--font-mono)' }}
                          />
                          <label className="btn-futuristic btn-purple" style={{ padding: '8px 12px', fontSize: '10px', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            📁 GÖRSEL SEÇ
                            <input 
                              type="file" accept="image/*" onChange={handleImageUpload}
                              style={{ display: 'none' }}
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {projectForm.galleryEnabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Galeri Görselleri (Görsel Linkleri veya Doğrudan Bilgisayardan Çoklu Yükle)</label>
                        <textarea 
                          rows="2" placeholder="Linkler virgülle ayrılmış olmalıdır veya aşağıdaki butondan yerel resim ekleyin..." value={projectForm.images}
                          onChange={(e) => setProjectForm({ ...projectForm, images: e.target.value })}
                          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '6px', color: '#fff', outline: 'none', fontFamily: 'var(--font-mono)' }}
                        />
                        <label className="btn-futuristic btn-purple" style={{ padding: '6px 12px', fontSize: '10px', cursor: 'pointer', alignSelf: 'flex-start', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ➕ 📁 BİLGİSAYARDAN RESİM EKLE (ÇOKLU)
                          <input 
                            type="file" accept="image/*" multiple onChange={handleGalleryUploads}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button 
                      type="button" 
                      onClick={() => setEditingProject(null)}
                      className="btn-futuristic"
                      style={{ flexGrow: 1, padding: '10px 0' }}
                    >
                      İPTAL
                    </button>
                    <button 
                      type="submit" 
                      className="btn-futuristic btn-green"
                      style={{ flexGrow: 1, padding: '10px 0' }}
                    >
                      PROJEYİ KAYDET
                    </button>
                  </div>
                </form>
              ) : (
                /* Projects List Table */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {projects.map((proj) => (
                    <div 
                      key={proj.id} 
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>{proj.title}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                          SIM: {proj.simulatorType.toUpperCase()} // KAT: {proj.category}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleAddOrEditProjectClick(proj)}
                          className="btn-futuristic" 
                          style={{ padding: '4px 10px', fontSize: '10px', color: 'var(--cyan)', borderColor: 'var(--cyan)' }}
                        >
                          DÜZENLE
                        </button>
                        <button 
                          onClick={() => handleDeleteProject(proj.id)}
                          className="btn-futuristic" 
                          style={{ padding: '4px 10px', fontSize: '10px', color: '#ff4d4d', borderColor: '#ff4d4d' }}
                        >
                          SİL
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Security: Password Change */}
            <section style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', color: 'var(--purple)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px', marginBottom: '16px' }}>
                [ GÜVENLİK — ŞİFRE YÖNETİMİ ]
              </h4>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '10px', border: '1px solid rgba(168, 85, 247, 0.15)' }}>
                {!showPasswordChange ? (
                  <button type="button" onClick={() => setShowPasswordChange(true)} className="btn-futuristic btn-purple" style={{ fontSize: '11px' }}>
                    🔐 Yönetici Şifresini Değiştir
                  </button>
                ) : (
                  <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
                    <input type="password" placeholder="Mevcut şifre" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} className="admin-input" style={{ letterSpacing: '1px', textAlign: 'left' }} required />
                    <input type="password" placeholder="Yeni şifre (min. 8 karakter)" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="admin-input" style={{ letterSpacing: '1px', textAlign: 'left' }} required minLength={8} />
                    <input type="password" placeholder="Yeni şifre tekrar" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="admin-input" style={{ letterSpacing: '1px', textAlign: 'left' }} required />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" className="btn-futuristic btn-green" style={{ fontSize: '11px' }}>Güncelle</button>
                      <button type="button" onClick={() => setShowPasswordChange(false)} className="btn-futuristic" style={{ fontSize: '11px' }}>İptal</button>
                    </div>
                  </form>
                )}
              </div>
            </section>

            {/* Row 3: Live CMS + backup */}
            <section>
              <h4 style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', color: 'var(--cyan)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px', marginBottom: '16px' }}>
                [ 3. CANLI CMS — NETLIFY + ATLAS + CLOUDINARY ]
              </h4>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '10px', border: '1px solid rgba(0, 240, 255, 0.15)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                  <strong style={{ color: 'var(--green)' }}>Canlı yayın aktif:</strong> Yönetici girişi yaptıktan sonra &quot;Kaydet&quot; dediğinizde metinler MongoDB Atlas&apos;a, görseller/videolar Cloudinary&apos;ye gider —{' '}
                  <strong style={{ color: '#fff' }}>yeniden deploy gerekmez</strong>, tüm ziyaretçiler anında görür.
                  <br /><br />
                  {getApiToken() ? (
                    <span style={{ color: 'var(--green)' }}>● Bulut oturumu açık — kayıtlar canlıya gider.</span>
                  ) : (
                    <span style={{ color: 'var(--amber, #ffb020)' }}>● Yerel önizleme modu — API oturumu yok. Netlify&apos;de ortam değişkenlerini ayarlayın.</span>
                  )}
                  <br /><br />
                  <strong style={{ color: 'var(--cyan)' }}>Yedek:</strong> Aşağıdaki butonlar JSON yedeği indirir veya geri yükler. İlk kurulumda{' '}
                  <code style={{ color: 'var(--green)' }}>/api/seed?secret=...</code> ile Atlas&apos;a başlangıç verisi aktarılır (SETUP-CMS.md).
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <button onClick={handlePublishToNetlify} className="btn-futuristic btn-green" style={{ padding: '10px 18px', fontSize: '11px' }}>
                    📥 JSON Yedek İndir (site-data.json)
                  </button>
                  <button onClick={handleExportLocalBackup} className="btn-futuristic" style={{ padding: '10px 18px', fontSize: '11px' }}>
                    💾 Yerel Yedek İndir
                  </button>
                  <label className="btn-futuristic btn-purple" style={{ padding: '10px 18px', fontSize: '11px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    📂 Yedekten Yükle (Buluta veya Yerel)
                    <input type="file" accept=".json" onChange={handleImportData} style={{ display: 'none' }} />
                  </label>
                  <button
                    onClick={() => {
                      if (window.confirm('Tüm değişiklikleri silip şablon verilerine dönmek istediğinize emin misiniz?')) {
                        onResetData();
                      }
                    }}
                    className="btn-futuristic"
                    style={{ padding: '10px 18px', fontSize: '11px', borderColor: '#ff4d4d', color: '#ff4d4d' }}
                  >
                    ⚠️ Sıfırla
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(188, 60, 242, 0.2)',
            background: 'rgba(6, 8, 20, 0.8)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              CMS: {getApiToken() ? 'ATLAS + CLOUDINARY // CANLI' : 'YEREL ÖNİZLEME // API BEKLENİYOR'}
            </span>
            <button 
              onClick={onClose}
              className="btn-futuristic btn-purple"
              style={{ padding: '6px 20px', fontSize: '11px' }}
            >
              KONSOLU KAPAT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
