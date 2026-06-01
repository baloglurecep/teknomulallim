import { loginApi, getApiToken, clearApiToken } from './apiClient';

const AUTH_HASH_KEY = 'teknomuallim_auth_hash';
const AUTH_FAIL_KEY = 'teknomuallim_auth_fails';
const AUTH_LOCK_KEY = 'teknomuallim_auth_lock';
const AUTH_VERSION_KEY = 'teknomuallim_auth_version';
const SESSION_KEY = 'teknomuallim_admin_session';
const SESSION_DURATION = 30 * 60 * 1000;
const MAX_ATTEMPTS = 3;
const LOCKOUT_MS = 30 * 1000;

const AUTH_VERSION = '4';
const ADMIN_PASSWORD = 'Reco7482@@';

async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function setLocalSession() {
  const session = { token: 'local', expires: Date.now() + SESSION_DURATION };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  sessionStorage.setItem('teknomuallim_admin_active', 'true');
}

export async function initAuthHash() {
  const storedVersion = localStorage.getItem(AUTH_VERSION_KEY);
  if (storedVersion !== AUTH_VERSION || !localStorage.getItem(AUTH_HASH_KEY)) {
    const hash = await sha256(ADMIN_PASSWORD);
    localStorage.setItem(AUTH_HASH_KEY, hash);
    localStorage.setItem(AUTH_VERSION_KEY, AUTH_VERSION);
  }
}

async function verifyPasscodeLocal(passcode) {
  await initAuthHash();
  const storedHash = localStorage.getItem(AUTH_HASH_KEY);
  const inputHash = await sha256(passcode);
  return inputHash === storedHash;
}

export async function verifyPasscode(passcode) {
  const lockUntil = parseInt(localStorage.getItem(AUTH_LOCK_KEY) || '0', 10);
  if (Date.now() < lockUntil) {
    const remaining = Math.ceil((lockUntil - Date.now()) / 1000);
    return { success: false, locked: true, remaining };
  }

  try {
    const apiResult = await loginApi(passcode);
    if (apiResult.success) {
      localStorage.removeItem(AUTH_FAIL_KEY);
      localStorage.removeItem(AUTH_LOCK_KEY);
      setLocalSession();
      return { success: true, via: 'api' };
    }
  } catch {
    /* API yoksa yerel doğrulama (sadece geliştirme) */
  }

  if (await verifyPasscodeLocal(passcode)) {
    localStorage.removeItem(AUTH_FAIL_KEY);
    localStorage.removeItem(AUTH_LOCK_KEY);
    setLocalSession();
    return { success: true, via: 'local' };
  }

  const fails = parseInt(localStorage.getItem(AUTH_FAIL_KEY) || '0', 10) + 1;
  localStorage.setItem(AUTH_FAIL_KEY, String(fails));

  if (fails >= MAX_ATTEMPTS) {
    localStorage.setItem(AUTH_LOCK_KEY, String(Date.now() + LOCKOUT_MS));
    localStorage.setItem(AUTH_FAIL_KEY, '0');
    return { success: false, locked: true, remaining: LOCKOUT_MS / 1000 };
  }

  return { success: false, attemptsLeft: MAX_ATTEMPTS - fails };
}

export function isSessionValid() {
  if (getApiToken()) return true;

  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    if (Date.now() > session.expires) {
      clearSession();
      return false;
    }
    session.expires = Date.now() + SESSION_DURATION;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  clearApiToken();
  sessionStorage.setItem('teknomuallim_admin_active', 'false');
}

export async function changePasscode(currentPass, newPass) {
  const result = await verifyPasscode(currentPass);
  if (!result.success) return { success: false, error: 'Mevcut şifre hatalı' };
  if (newPass.length < 8) return { success: false, error: 'Yeni şifre en az 8 karakter olmalı' };
  const hash = await sha256(newPass);
  localStorage.setItem(AUTH_HASH_KEY, hash);
  localStorage.setItem(AUTH_VERSION_KEY, AUTH_VERSION);
  clearSession();
  return {
    success: true,
    note: 'Canlı sitede Netlify ortam değişkeni ADMIN_PASSWORD_HASH güncellenmelidir.',
  };
}

export function getLockRemaining() {
  const lockUntil = parseInt(localStorage.getItem(AUTH_LOCK_KEY) || '0', 10);
  if (Date.now() >= lockUntil) return 0;
  return Math.ceil((lockUntil - Date.now()) / 1000);
}
