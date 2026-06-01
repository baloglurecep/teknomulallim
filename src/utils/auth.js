import { loginApi, getApiToken, clearApiToken } from './apiClient';

const AUTH_FAIL_KEY = 'teknomuallim_auth_fails';
const AUTH_LOCK_KEY = 'teknomuallim_auth_lock';
const SESSION_KEY = 'teknomuallim_admin_session';
const SESSION_DURATION = 30 * 60 * 1000;
const MAX_ATTEMPTS = 3;
const LOCKOUT_MS = 30 * 1000;

function setLocalSession() {
  const session = { token: 'local', expires: Date.now() + SESSION_DURATION };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  sessionStorage.setItem('teknomuallim_admin_active', 'true');
}

/** Eski sürüm uyumluluğu — şifre artık yalnızca Netlify API üzerinden doğrulanır */
export function initAuthHash() {}

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
  } catch (err) {
    return {
      success: false,
      attemptsLeft: MAX_ATTEMPTS - 1,
      error: err.message || 'API girişi başarısız',
    };
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
