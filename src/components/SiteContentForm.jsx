import React from 'react';
import { skillsToLines, linesToSkills } from '../utils/contentStore';

const inputStyle = {
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '10px',
  borderRadius: '6px',
  color: '#fff',
  outline: 'none',
  width: '100%',
  fontFamily: 'var(--font-sans)',
  fontSize: '13px',
};

const labelStyle = { fontSize: '11px', color: 'var(--text-secondary)' };

function Field({ label, hint, children, span = 1 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: span === 2 ? 'span 2' : undefined }}>
      <label style={labelStyle}>{label}</label>
      {hint && (
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.45, marginTop: '-2px' }}>
          {hint}
        </span>
      )}
      {children}
    </div>
  );
}

function updateSite(setProfileForm, section, key, value) {
  setProfileForm((prev) => ({
    ...prev,
    site: {
      ...prev.site,
      [section]: {
        ...prev.site?.[section],
        [key]: value,
      },
    },
  }));
}

export default function SiteContentForm({ profileForm, setProfileForm }) {
  const site = profileForm.site || {};
  const hero = site.hero || {};
  const projects = site.projects || {};
  const about = site.about || {};
  const contact = site.contact || {};
  const nav = site.nav || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Field label="Sayfa Başlığı (SEO)" span={2}>
          <input style={inputStyle} value={site.pageTitle || ''} onChange={(e) => setProfileForm({ ...profileForm, site: { ...site, pageTitle: e.target.value } })} />
        </Field>
        <Field label="Sayfa Açıklaması (SEO)" span={2}>
          <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={site.pageDescription || ''} onChange={(e) => setProfileForm({ ...profileForm, site: { ...site, pageDescription: e.target.value } })} />
        </Field>
      </div>

      <h5 style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>— MENÜ —</h5>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Field label="Marka Adı">
          <input style={inputStyle} value={nav.brand || ''} onChange={(e) => updateSite(setProfileForm, 'nav', 'brand', e.target.value)} />
        </Field>
        <Field label="Menü: Projeler">
          <input style={inputStyle} value={nav.projects || ''} onChange={(e) => updateSite(setProfileForm, 'nav', 'projects', e.target.value)} />
        </Field>
        <Field label="Menü: Hakkımda">
          <input style={inputStyle} value={nav.about || ''} onChange={(e) => updateSite(setProfileForm, 'nav', 'about', e.target.value)} />
        </Field>
        <Field label="Menü: İletişim">
          <input style={inputStyle} value={nav.contact || ''} onChange={(e) => updateSite(setProfileForm, 'nav', 'contact', e.target.value)} />
        </Field>
      </div>

      <h5 style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>— ANA SAYFA (HERO) —</h5>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Field label="Üst Rozet Metni" span={2}>
          <input style={inputStyle} value={hero.badge || ''} onChange={(e) => updateSite(setProfileForm, 'hero', 'badge', e.target.value)} />
        </Field>
        <Field
          label="Hakkımda Kutusu — Sol Üst Satır"
          hint="Ana sayfadaki cam panelin üstündeki cyan satır. Terminal/komut satırı görünümünde süs metindir; örn. teknomuallim@atolye:~$ hakkimda"
        >
          <input style={inputStyle} value={hero.panelCommand || ''} onChange={(e) => updateSite(setProfileForm, 'hero', 'panelCommand', e.target.value)} />
        </Field>
        <Field
          label="Hakkımda Kutusu — Sağ Üst Etiket"
          hint="Aynı panelin sağ köşesindeki küçük etiket. Örn. [ MANİFESTO ] veya [ HAKKIMDA ]. Paneldeki asıl paragraf Profil sekmesinden gelir."
        >
          <input style={inputStyle} value={hero.panelTag || ''} onChange={(e) => updateSite(setProfileForm, 'hero', 'panelTag', e.target.value)} />
        </Field>
        <Field label="İstatistik 1 Etiketi (proje sayısı otomatik)">
          <input style={inputStyle} value={hero.stat1Label || ''} onChange={(e) => updateSite(setProfileForm, 'hero', 'stat1Label', e.target.value)} />
        </Field>
        <Field label="İstatistik 2 Değeri">
          <input style={inputStyle} value={hero.stat2Value || ''} onChange={(e) => updateSite(setProfileForm, 'hero', 'stat2Value', e.target.value)} />
        </Field>
        <Field label="İstatistik 2 Etiketi">
          <input style={inputStyle} value={hero.stat2Label || ''} onChange={(e) => updateSite(setProfileForm, 'hero', 'stat2Label', e.target.value)} />
        </Field>
        <Field label="İstatistik 3 Değeri">
          <input style={inputStyle} value={hero.stat3Value || ''} onChange={(e) => updateSite(setProfileForm, 'hero', 'stat3Value', e.target.value)} />
        </Field>
        <Field label="İstatistik 3 Etiketi">
          <input style={inputStyle} value={hero.stat3Label || ''} onChange={(e) => updateSite(setProfileForm, 'hero', 'stat3Label', e.target.value)} />
        </Field>
        <Field label="Projeler Butonu">
          <input style={inputStyle} value={hero.btnProjects || ''} onChange={(e) => updateSite(setProfileForm, 'hero', 'btnProjects', e.target.value)} />
        </Field>
        <Field label="Hakkımda Butonu">
          <input style={inputStyle} value={hero.btnAbout || ''} onChange={(e) => updateSite(setProfileForm, 'hero', 'btnAbout', e.target.value)} />
        </Field>
        <Field label="Kaydır İpucu" span={2}>
          <input style={inputStyle} value={hero.scrollHint || ''} onChange={(e) => updateSite(setProfileForm, 'hero', 'scrollHint', e.target.value)} />
        </Field>
      </div>

      <h5 style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>— PROJELER BÖLÜMÜ —</h5>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Field label="Bölüm Etiketi">
          <input style={inputStyle} value={projects.label || ''} onChange={(e) => updateSite(setProfileForm, 'projects', 'label', e.target.value)} />
        </Field>
        <Field label="Bölüm Başlığı">
          <input style={inputStyle} value={projects.title || ''} onChange={(e) => updateSite(setProfileForm, 'projects', 'title', e.target.value)} />
        </Field>
        <Field label="Alt Başlık" span={2}>
          <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={projects.subtitle || ''} onChange={(e) => updateSite(setProfileForm, 'projects', 'subtitle', e.target.value)} />
        </Field>
        <Field label="Filtre: Hepsi">
          <input style={inputStyle} value={projects.filterAll || ''} onChange={(e) => updateSite(setProfileForm, 'projects', 'filterAll', e.target.value)} />
        </Field>
        <Field label="Simülatör Butonu">
          <input style={inputStyle} value={projects.btnSimulate || ''} onChange={(e) => updateSite(setProfileForm, 'projects', 'btnSimulate', e.target.value)} />
        </Field>
        <Field label="Kategoriler (virgülle ayırın)" span={2}>
          <input
            style={inputStyle}
            value={(projects.categories || []).join(', ')}
            onChange={(e) => updateSite(setProfileForm, 'projects', 'categories', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          />
        </Field>
      </div>

      <h5 style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>— HAKKIMDA BÖLÜMÜ —</h5>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Field label="Bölüm Etiketi"><input style={inputStyle} value={about.label || ''} onChange={(e) => updateSite(setProfileForm, 'about', 'label', e.target.value)} /></Field>
        <Field label="Bölüm Başlığı"><input style={inputStyle} value={about.title || ''} onChange={(e) => updateSite(setProfileForm, 'about', 'title', e.target.value)} /></Field>
        <Field label="Vizyon Başlığı"><input style={inputStyle} value={about.visionTitle || ''} onChange={(e) => updateSite(setProfileForm, 'about', 'visionTitle', e.target.value)} /></Field>
        <Field label="Beceriler Başlığı"><input style={inputStyle} value={about.skillsTitle || ''} onChange={(e) => updateSite(setProfileForm, 'about', 'skillsTitle', e.target.value)} /></Field>
        <Field label="Vizyon Paragraf 1" span={2}><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={about.visionText1 || ''} onChange={(e) => updateSite(setProfileForm, 'about', 'visionText1', e.target.value)} /></Field>
        <Field label="Vizyon Paragraf 2" span={2}><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={about.visionText2 || ''} onChange={(e) => updateSite(setProfileForm, 'about', 'visionText2', e.target.value)} /></Field>
        <Field label="Eğitimci Başlık"><input style={inputStyle} value={about.educatorTitle || ''} onChange={(e) => updateSite(setProfileForm, 'about', 'educatorTitle', e.target.value)} /></Field>
        <Field label="Geliştirici Başlık"><input style={inputStyle} value={about.developerTitle || ''} onChange={(e) => updateSite(setProfileForm, 'about', 'developerTitle', e.target.value)} /></Field>
        <Field label="Eğitimci Metni" span={2}><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={about.educatorText || ''} onChange={(e) => updateSite(setProfileForm, 'about', 'educatorText', e.target.value)} /></Field>
        <Field label="Geliştirici Metni" span={2}><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={about.developerText || ''} onChange={(e) => updateSite(setProfileForm, 'about', 'developerText', e.target.value)} /></Field>
        <Field label="Donanım Etiketi"><input style={inputStyle} value={about.hardwareLabel || ''} onChange={(e) => updateSite(setProfileForm, 'about', 'hardwareLabel', e.target.value)} /></Field>
        <Field label="Donanım Metni"><input style={inputStyle} value={about.hardwareText || ''} onChange={(e) => updateSite(setProfileForm, 'about', 'hardwareText', e.target.value)} /></Field>
        <Field label="Beceriler (her satır: Ad|Yüzde|Renk)" span={2}>
          <textarea
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
            rows={6}
            value={skillsToLines(profileForm.skills)}
            onChange={(e) => setProfileForm({ ...profileForm, skills: linesToSkills(e.target.value) })}
          />
        </Field>
      </div>

      <h5 style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>— İLETİŞİM BÖLÜMÜ —</h5>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Field label="Bölüm Etiketi"><input style={inputStyle} value={contact.label || ''} onChange={(e) => updateSite(setProfileForm, 'contact', 'label', e.target.value)} /></Field>
        <Field label="Bölüm Başlığı"><input style={inputStyle} value={contact.title || ''} onChange={(e) => updateSite(setProfileForm, 'contact', 'title', e.target.value)} /></Field>
        <Field label="Alt Başlık" span={2}><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={contact.subtitle || ''} onChange={(e) => updateSite(setProfileForm, 'contact', 'subtitle', e.target.value)} /></Field>
        <Field label="Bilgi Kutusu Başlığı"><input style={inputStyle} value={contact.infoTitle || ''} onChange={(e) => updateSite(setProfileForm, 'contact', 'infoTitle', e.target.value)} /></Field>
        <Field label="Form Başlığı"><input style={inputStyle} value={contact.formTitle || ''} onChange={(e) => updateSite(setProfileForm, 'contact', 'formTitle', e.target.value)} /></Field>
        <Field label="Bilgi Metni" span={2}><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={contact.infoText || ''} onChange={(e) => updateSite(setProfileForm, 'contact', 'infoText', e.target.value)} /></Field>
        <Field label="E-posta Etiketi"><input style={inputStyle} value={contact.emailLabel || ''} onChange={(e) => updateSite(setProfileForm, 'contact', 'emailLabel', e.target.value)} /></Field>
        <Field label="Sosyal Ağ Başlığı"><input style={inputStyle} value={contact.socialTitle || ''} onChange={(e) => updateSite(setProfileForm, 'contact', 'socialTitle', e.target.value)} /></Field>
        <Field label="Form: İsim Etiketi"><input style={inputStyle} value={contact.labelName || ''} onChange={(e) => updateSite(setProfileForm, 'contact', 'labelName', e.target.value)} /></Field>
        <Field label="Form: E-posta Etiketi"><input style={inputStyle} value={contact.labelEmail || ''} onChange={(e) => updateSite(setProfileForm, 'contact', 'labelEmail', e.target.value)} /></Field>
        <Field label="Form: Konu Etiketi"><input style={inputStyle} value={contact.labelSubject || ''} onChange={(e) => updateSite(setProfileForm, 'contact', 'labelSubject', e.target.value)} /></Field>
        <Field label="Form: Mesaj Etiketi"><input style={inputStyle} value={contact.labelMessage || ''} onChange={(e) => updateSite(setProfileForm, 'contact', 'labelMessage', e.target.value)} /></Field>
        <Field label="Gönder Butonu"><input style={inputStyle} value={contact.btnSend || ''} onChange={(e) => updateSite(setProfileForm, 'contact', 'btnSend', e.target.value)} /></Field>
        <Field label="Gönderiliyor Metni"><input style={inputStyle} value={contact.btnSending || ''} onChange={(e) => updateSite(setProfileForm, 'contact', 'btnSending', e.target.value)} /></Field>
        <Field label="Alt Bilgi (Footer)" span={2}><input style={inputStyle} value={contact.footer || ''} onChange={(e) => updateSite(setProfileForm, 'contact', 'footer', e.target.value)} /></Field>
        <Field label="Form Konuları (her satır bir konu)" span={2}>
          <textarea
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
            rows={4}
            value={(contact.subjects || []).join('\n')}
            onChange={(e) => updateSite(setProfileForm, 'contact', 'subjects', e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))}
          />
        </Field>
      </div>

      <h5 style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>— SOSYAL AĞLAR —</h5>
      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
        Sosyal ağ bölümü varsayılan olarak kapalıdır. Onay verdiğinizde iletişim sayfasında görünür. İstediğiniz ağı ekleyip tek tek açıp kapatabilirsiniz.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={!!profileForm.social?.enabled}
            onChange={(e) => setProfileForm({ ...profileForm, social: { ...profileForm.social, enabled: e.target.checked, links: profileForm.social?.links || [] } })}
          />
          Sosyal ağ bölümünü sitede göster
        </label>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {(profileForm.social?.links || []).map((link, idx) => (
          <div key={link.id || idx} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr auto', gap: '8px', alignItems: 'center', padding: '10px', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <input
              type="checkbox"
              checked={link.enabled !== false}
              title="Bu bağlantıyı göster"
              onChange={(e) => {
                const links = [...(profileForm.social?.links || [])];
                links[idx] = { ...links[idx], enabled: e.target.checked };
                setProfileForm({ ...profileForm, social: { ...profileForm.social, links } });
              }}
            />
            <input
              style={inputStyle}
              placeholder="Etiket (ör. GITHUB)"
              value={link.label || ''}
              onChange={(e) => {
                const links = [...(profileForm.social?.links || [])];
                links[idx] = { ...links[idx], label: e.target.value };
                setProfileForm({ ...profileForm, social: { ...profileForm.social, links } });
              }}
            />
            <input
              style={inputStyle}
              placeholder="https://..."
              value={link.url || ''}
              onChange={(e) => {
                const links = [...(profileForm.social?.links || [])];
                links[idx] = { ...links[idx], url: e.target.value };
                setProfileForm({ ...profileForm, social: { ...profileForm.social, links } });
              }}
            />
            <button
              type="button"
              className="btn-futuristic"
              style={{ padding: '8px 10px', fontSize: '10px', color: '#ff6b6b', borderColor: 'rgba(255,100,100,0.3)' }}
              onClick={() => {
                const links = (profileForm.social?.links || []).filter((_, i) => i !== idx);
                setProfileForm({ ...profileForm, social: { ...profileForm.social, links } });
              }}
            >
              SİL
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn-futuristic btn-green"
          style={{ padding: '10px', fontSize: '11px' }}
          onClick={() => {
            const links = [...(profileForm.social?.links || []), { id: `social-${Date.now()}`, label: 'YENİ AĞ', url: 'https://', enabled: true }];
            setProfileForm({ ...profileForm, social: { enabled: profileForm.social?.enabled || false, links } });
          }}
        >
          + SOSYAL AĞ EKLE
        </button>
      </div>
    </div>
  );
}
