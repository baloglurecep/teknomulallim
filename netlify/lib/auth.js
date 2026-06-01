import { SignJWT, jwtVerify } from 'jose';
import crypto from 'crypto';

const SESSION_MS = 30 * 60 * 1000;

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET tanımlı değil');
  return new TextEncoder().encode(secret);
}

export function hashPassword(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

export async function verifyAdminPassword(passcode) {
  const expected = process.env.ADMIN_PASSWORD_HASH;
  if (!expected) throw new Error('ADMIN_PASSWORD_HASH tanımlı değil');
  return hashPassword(passcode) === expected.trim().toLowerCase();
}

export async function createSessionToken() {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MS / 1000}s`)
    .sign(getSecret());
}

export async function requireAdmin(event) {
  const header = event.headers?.authorization || event.headers?.Authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return { ok: false, error: 'Oturum gerekli' };

  try {
    await jwtVerify(token, getSecret());
    return { ok: true };
  } catch {
    return { ok: false, error: 'Oturum süresi doldu veya geçersiz' };
  }
}
