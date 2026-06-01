import { json, options, parseBody } from '../lib/http.js';

async function sendViaWeb3Forms({ name, email, subject, message, to, cc, siteName }) {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY?.trim();
  if (!accessKey) return null;

  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: accessKey,
      name: name.trim(),
      email: email.trim(),
      subject: `[${siteName || 'Teknomuallim'}] ${subject?.trim() || 'Genel İletişim'}`,
      message: message.trim(),
      from_name: siteName || 'Teknomuallim',
      replyto: email.trim(),
      to: to?.trim() || undefined,
      cc: cc?.trim() || undefined,
    }),
  });

  const result = await res.json().catch(() => ({}));
  if (result.success) return { ok: true };

  return {
    ok: false,
    error: result.message || 'Web3Forms gönderimi başarısız',
  };
}

async function sendViaFormSubmit({ name, email, subject, message, to, cc, siteName }) {
  const submitEmail = (to || process.env.CONTACT_TO || process.env.FORM_SUBMIT_EMAIL || '').trim();
  if (!submitEmail) {
    return { ok: false, error: 'Form alıcı e-postası tanımlı değil' };
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

  const result = await res.json().catch(() => ({}));
  const ok = res.ok && (result.success === true || result.success === 'true');
  if (ok) return { ok: true };

  return {
    ok: false,
    error:
      result.message ||
      `${submitEmail} adresine FormSubmit doğrulama maili gitmiş olabilir — gelen kutusu/spam kontrol edin.`,
  };
}

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

    const input = { name, email, subject, message, to, cc, siteName };

    if (process.env.WEB3FORMS_ACCESS_KEY) {
      const web3 = await sendViaWeb3Forms(input);
      if (web3?.ok) return json(200, { success: true, message: 'Mesaj iletildi' });
      if (web3 && !web3.ok) return json(502, { error: web3.error });
    }

    const formSubmit = await sendViaFormSubmit(input);
    if (formSubmit.ok) return json(200, { success: true, message: 'Mesaj iletildi' });

    return json(502, { error: formSubmit.error || 'E-posta gönderilemedi' });
  } catch (err) {
    console.error('[contact]', err);
    return json(500, { error: err.message || 'Sunucu hatası' });
  }
}
