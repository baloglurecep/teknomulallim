import { useState, useEffect } from 'react';
import { useInView } from '../hooks/useInView';
import { getAllEmails, getActiveSocialLinks } from '../utils/contentStore';

export default function Contact({ profile }) {
  const contact = profile.site?.contact || {};
  const subjects = contact.subjects || ['Genel İletişim'];
  const defaultSubject = subjects[0] || 'Genel İletişim';
  const emails = getAllEmails(profile);
  const socialLinks = getActiveSocialLinks(profile);

  const [headerRef, headerVisible] = useInView(0.2);
  const [formRef, formVisible] = useInView(0.1);
  const [formData, setFormData] = useState({ name: '', email: '', subject: defaultSubject, message: '' });
  const [isSending, setIsSending] = useState(false);
  const [sentLogs, setSentLogs] = useState([]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, subject: subjects.includes(prev.subject) ? prev.subject : defaultSubject }));
  }, [subjects, defaultSubject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setSentLogs(['📡 Mesajınız iletiliyor...']);

    const honeyValue = e.target.elements._honey ? e.target.elements._honey.value : '';
    if (honeyValue) {
      setSentLogs(['[OK] Mesajınız alındı.']);
      setIsSending(false);
      return;
    }

    const submitEmail = profile.formSubmitEmail || emails[0] || '';
    const ccEmail = profile.formSubmitCc || emails[1] || '';

    if (!submitEmail) {
      setSentLogs(['[HATA] Form alıcı e-postası tanımlı değil. Yönetici panelinden ayarlayın.']);
      setIsSending(false);
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          to: submitEmail,
          cc: ccEmail,
          siteName: profile.name,
          _honey: honeyValue,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSentLogs(['[OK] Mesajınız e-posta kutunuza iletildi. En kısa sürede dönüş yapacağız.']);
        setFormData({ name: '', email: '', subject: defaultSubject, message: '' });
      } else {
        throw new Error(result.error || 'Gönderim başarısız');
      }
    } catch (err) {
      setSentLogs([`[HATA] ${err.message || 'Mesaj gönderilemedi. Lütfen tekrar deneyin.'}`]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section
      id="contact"
      className="section-padding"
      style={{
        position: 'relative',
        zIndex: 5,
        borderTop: '1px solid rgba(0, 240, 255, 0.05)',
        background: 'linear-gradient(180deg, rgba(10, 15, 36, 0.3) 0%, transparent 100%)',
      }}
    >
      <div className="container">
        <div ref={headerRef} className={`section-header reveal ${headerVisible ? 'visible' : ''}`}>
          <span className="section-label">{contact.label}</span>
          <h2 className="section-title">{contact.title}</h2>
          <p className="section-subtitle">{contact.subtitle}</p>
          <div className="section-divider" />
        </div>

        <div
          ref={formRef}
          className={`reveal ${formVisible ? 'visible' : ''}`}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: '40px',
            alignItems: 'start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }} className="glow-text-cyan">
                {contact.infoTitle}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                {contact.infoText}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '18px' }}>📧</span>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{contact.emailLabel}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {emails.map((em) => (
                        <a key={em} href={`mailto:${em}`} style={{ color: 'var(--cyan)', textDecoration: 'none' }}>
                          {em}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {socialLinks.length > 0 && (
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                <h4 style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--purple)', marginBottom: '16px' }} className="glow-text-purple">
                  {contact.socialTitle}
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {socialLinks.map((link, idx) => (
                    <a
                      key={link.id || idx}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`btn-futuristic ${idx % 3 === 1 ? 'btn-purple' : idx % 3 === 2 ? 'btn-green' : ''}`}
                      style={{ padding: '8px 12px', fontSize: '11px', flex: '1 1 auto', minWidth: '100px', textAlign: 'center' }}
                    >
                      {link.label.toUpperCase()}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }} className="glow-text-purple">
              {contact.formTitle}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="text" name="_honey" style={{ display: 'none' }} tabIndex="-1" autoComplete="off" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{contact.labelName}</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="form-input" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{contact.labelEmail}</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="form-input" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{contact.labelSubject}</label>
                <select value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="form-input" style={{ background: '#0a0d24' }}>
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{contact.labelMessage}</label>
                <textarea rows="4" required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="form-input" style={{ resize: 'vertical' }} />
              </div>
              <button type="submit" disabled={isSending} className="btn-futuristic" style={{ width: '100%', padding: '12px' }}>
                {isSending ? contact.btnSending : contact.btnSend}
              </button>
            </form>

            {sentLogs.length > 0 && (
              <div style={{ marginTop: '20px', background: '#02040b', border: '1px solid rgba(0, 240, 255, 0.15)', borderRadius: '8px', padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {sentLogs.map((log, idx) => (
                  <div key={idx} style={{ color: log.startsWith('[OK]') ? 'var(--green)' : log.startsWith('[HATA]') ? '#ff6b6b' : 'var(--text-secondary)' }}>{log}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '80px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', textAlign: 'center', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          © {new Date().getFullYear()} {profile.name?.toUpperCase()}. // {contact.footer?.toUpperCase()}
        </div>
      </div>
    </section>
  );
}
