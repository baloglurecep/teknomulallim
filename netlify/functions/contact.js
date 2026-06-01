import { json, options, parseBody } from '../lib/http.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return options();
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const body = parseBody(event);
    if (!body) return json(400, { error: 'Geçersiz JSON' });

    if (body._honey) return json(200, { success: true, message: 'OK' });

    const { name, email, subject, message, to, cc, siteName } = body;
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return json(400, { error: 'İsim, e-posta ve mesaj zorunludur' });
    }

    const submitEmail = (to || process.env.CONTACT_TO || process.env.FORM_SUBMIT_EMAIL || '').trim();
    if (!submitEmail) {
      return json(500, { error: 'Form alıcı e-postası tanımlı değil' });
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim() || 'Genel İletişim',
      message: message.trim(),
      _subject: `[${siteName || 'Teknomuallim'} İletişim] ${subject?.trim() || 'Genel İletişim'}`,
      _captcha: 'false',
      _template: 'table',
      _replyto: email.trim(),
    };

    const ccEmail = (cc || process.env.CONTACT_CC || '').trim();
    if (ccEmail) payload._cc = ccEmail;

    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(submitEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    let result = {};
    try {
      result = await res.json();
    } catch {
      result = {};
    }

    const ok = res.ok && (result.success === true || result.success === 'true');
    if (!ok) {
      return json(502, {
        error: result.message || 'E-posta servisi mesajı iletemedi. FormSubmit hesabınızı doğrulayın.',
      });
    }

    return json(200, { success: true, message: 'Mesaj iletildi' });
  } catch (err) {
    console.error('[contact]', err);
    return json(500, { error: err.message || 'Sunucu hatası' });
  }
}
