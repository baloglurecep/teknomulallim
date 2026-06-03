import { useInView } from '../hooks/useInView';
import { getAllEmails, getActivePhones, getActiveSocialLinks, getTelHref, getWhatsAppHref } from '../utils/contentStore';

export default function Contact({ profile }) {
  const contact = profile.site?.contact || {};
  const emails = getAllEmails(profile);
  const phones = getActivePhones(profile);
  const socialLinks = getActiveSocialLinks(profile);

  const [headerRef, headerVisible] = useInView(0.2);
  const [contentRef, contentVisible] = useInView(0.1);

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
          ref={contentRef}
          className={`reveal ${contentVisible ? 'visible' : ''}`}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: '32px',
            maxWidth: '900px',
            margin: '0 auto',
          }}
        >
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }} className="glow-text-cyan">
              {contact.infoTitle}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.7', marginBottom: '28px' }}>
              {contact.infoText}
            </p>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              {contact.emailLabel || 'E-POSTA'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {emails.map((em, idx) => (
                <a
                  key={em}
                  href={`mailto:${em}?subject=${encodeURIComponent(`${profile.name || 'Teknomuallim'} — İletişim`)}`}
                  className={`btn-futuristic ${idx % 2 === 1 ? 'btn-purple' : ''}`}
                  style={{
                    padding: '14px 18px',
                    fontSize: '12px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    wordBreak: 'break-all',
                  }}
                >
                  ✉ {em}
                </a>
              ))}
            </div>

            {phones.length > 0 && (
              <>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    marginTop: '28px',
                    marginBottom: '12px',
                  }}
                >
                  {contact.phoneLabel || 'TELEFON'}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {phones.map((phone, idx) => (
                    <div
                      key={phone.id || idx}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(0, 240, 255, 0.12)',
                        background: 'rgba(0, 240, 255, 0.03)',
                      }}
                    >
                      {phone.label && (
                        <div
                          style={{
                            fontSize: '10px',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--purple)',
                            marginBottom: '6px',
                            letterSpacing: '1px',
                          }}
                        >
                          {phone.label.toUpperCase()}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: '14px',
                          color: '#fff',
                          fontFamily: 'var(--font-mono)',
                          marginBottom: '10px',
                          wordBreak: 'break-all',
                        }}
                      >
                        📞 {phone.number}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        <a
                          href={getTelHref(phone.number)}
                          className="btn-futuristic"
                          style={{
                            flex: '1 1 120px',
                            padding: '10px 14px',
                            fontSize: '11px',
                            textAlign: 'center',
                            textDecoration: 'none',
                          }}
                        >
                          📞 {contact.btnCall || 'ARA'}
                        </a>
                        <a
                          href={getWhatsAppHref(phone.number)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-futuristic btn-green"
                          style={{
                            flex: '1 1 120px',
                            padding: '10px 14px',
                            fontSize: '11px',
                            textAlign: 'center',
                            textDecoration: 'none',
                          }}
                        >
                          💬 {contact.btnWhatsapp || 'WHATSAPP'}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {contact.phoneHint && (
                  <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {contact.phoneHint}
                  </p>
                )}
              </>
            )}

            <p style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {phones.length > 0
                ? 'E-posta veya telefon ile doğrudan iletişime geçebilirsiniz.'
                : 'Doğrudan e-posta göndermek için yukarıdaki adreslerden birine tıklayın.'}
            </p>
          </div>

          {socialLinks.length > 0 && (
            <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px' }}>
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
                    style={{ padding: '10px 14px', fontSize: '11px', flex: '1 1 auto', minWidth: '120px', textAlign: 'center' }}
                  >
                    {link.label.toUpperCase()}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: '80px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', textAlign: 'center', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          © {new Date().getFullYear()} {profile.name?.toUpperCase()}. // {contact.footer?.toUpperCase()}
        </div>
      </div>
    </section>
  );
}
