const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const TOKEN_KEY = 'teknomuallim_api_token';

export function getApiToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setApiToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

export function clearApiToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!headers['Content-Type'] && options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }
  const token = getApiToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const err = new Error(data?.error || `API hatası (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export async function fetchLiveContent() {
  try {
    return await apiFetch('/content');
  } catch (err) {
    if (err.status === 404 && err.data?.empty) return null;
    throw err;
  }
}

export async function saveLiveContent(partial) {
  return apiFetch('/content', {
    method: 'PUT',
    body: JSON.stringify(partial),
  });
}

export async function loginApi(passcode) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ passcode }),
  });
  if (data.token) setApiToken(data.token);
  return data;
}
