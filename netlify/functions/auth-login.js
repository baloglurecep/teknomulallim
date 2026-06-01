import { verifyAdminPassword, createSessionToken } from '../lib/auth.js';
import { json, options, parseBody } from '../lib/http.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return options();
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const body = parseBody(event);
    const passcode = body?.passcode;
    if (!passcode) return json(400, { error: 'Şifre gerekli' });

    const valid = await verifyAdminPassword(passcode);
    if (!valid) return json(401, { error: 'Hatalı şifre', success: false });

    const token = await createSessionToken();
    return json(200, { success: true, token, expiresIn: 30 * 60 });
  } catch (err) {
    console.error('[auth-login]', err);
    return json(500, { error: err.message || 'Giriş hatası' });
  }
}
