import { initialData } from '../data/initialData';
import { fetchLiveContent, saveLiveContent, getApiToken } from './apiClient';

export const STORAGE_KEYS = {
  profile: 'teknomuallim_profile',
  projects: 'teknomuallim_projects',
};

export const PUBLISHED_DATA_URL = '/site-data.json';
export const CONTENT_EVENT = 'teknomuallim:content-updated';

function deepMergeSite(defaults, saved) {
  if (!saved) return { ...defaults };
  const merged = { ...defaults };
  for (const key of Object.keys(defaults)) {
    if (saved[key] && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
      merged[key] = { ...defaults[key], ...saved[key] };
    } else if (saved[key] !== undefined) {
      merged[key] = saved[key];
    }
  }
  return merged;
}

export function normalizeProfile(raw) {
  const base = initialData.profile;
  if (!raw) return structuredClone(base);

  return {
    ...base,
    ...raw,
    titles: Array.isArray(raw.titles) && raw.titles.length ? raw.titles : base.titles,
    skills: Array.isArray(raw.skills) && raw.skills.length ? raw.skills : base.skills,
    site: deepMergeSite(base.site, raw.site),
    social: normalizeSocial(raw, base.social),
  };
}

function normalizeSocial(raw, baseSocial) {
  if (raw.social?.links && Array.isArray(raw.social.links)) {
    return {
      enabled: !!raw.social.enabled,
      links: raw.social.links
        .filter((l) => l?.label?.trim() && l?.url?.trim())
        .map((l, i) => ({
          id: l.id || `social-${i}`,
          label: l.label.trim(),
          url: l.url.trim(),
          enabled: l.enabled !== false,
        })),
    };
  }

  const legacy = [];
  if (raw.github?.trim()) legacy.push({ id: 'github', label: 'GITHUB', url: raw.github.trim(), enabled: false });
  if (raw.linkedin?.trim()) legacy.push({ id: 'linkedin', label: 'LINKEDIN', url: raw.linkedin.trim(), enabled: false });
  if (raw.instagram?.trim()) legacy.push({ id: 'instagram', label: 'INSTAGRAM', url: raw.instagram.trim(), enabled: false });

  if (legacy.length) return { enabled: false, links: legacy };
  return baseSocial ? { ...baseSocial, links: [...(baseSocial.links || [])] } : { enabled: false, links: [] };
}

export function getActiveSocialLinks(profile) {
  const social = profile?.social || {};
  if (!social.enabled) return [];
  return (social.links || []).filter((l) => l.enabled && l.label && l.url);
}

function cacheLocally(profile, projects) {
  if (profile) localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
  if (projects) localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
}

export function loadProfile() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.profile);
    return saved ? normalizeProfile(JSON.parse(saved)) : structuredClone(initialData.profile);
  } catch {
    return structuredClone(initialData.profile);
  }
}

export function normalizeProject(raw) {
  if (!raw) return raw;
  const mode = raw.simulatorViewMode;
  const validMode = mode === 'video' || mode === 'image' ? mode : 'interactive';
  return {
    ...raw,
    simulatorViewMode: validMode,
    customVideoUrl: raw.customVideoUrl || '',
    customImageUrl: raw.customImageUrl || '',
    galleryEnabled: raw.galleryEnabled ?? false,
    featuresEnabled: raw.featuresEnabled !== false,
  };
}

export function normalizeProjects(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeProject);
}

export function loadProjects() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.projects);
    return saved ? normalizeProjects(JSON.parse(saved)) : normalizeProjects(structuredClone(initialData.projects));
  } catch {
    return normalizeProjects(structuredClone(initialData.projects));
  }
}

export async function fetchPublishedContent() {
  try {
    const res = await fetch(`${PUBLISHED_DATA_URL}?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.profile || !data?.projects) return null;
    return {
      profile: normalizeProfile(data.profile),
      projects: normalizeProjects(data.projects),
      publishedAt: data.publishedAt || null,
    };
  } catch {
    return null;
  }
}

/**
 * Yükleme önceliği:
 * 1. MongoDB Atlas (Netlify /api/content)
 * 2. site-data.json (yedek)
 * 3. localStorage / initialData
 */
export async function loadSiteContent() {
  try {
    const live = await fetchLiveContent();
    if (live?.profile && live?.projects) {
      const profile = normalizeProfile(live.profile);
      const projects = normalizeProjects(live.projects);
      cacheLocally(profile, projects);
      return {
        profile,
        projects,
        source: 'live',
        updatedAt: live.updatedAt || null,
      };
    }
  } catch (err) {
    console.warn('[CMS] Canlı API kullanılamıyor:', err.message);
  }

  const published = await fetchPublishedContent();
  if (published) {
    const projects = normalizeProjects(published.projects);
    cacheLocally(published.profile, projects);
    return {
      profile: published.profile,
      projects,
      source: 'published',
      publishedAt: published.publishedAt,
    };
  }

  const hasLocal =
    localStorage.getItem(STORAGE_KEYS.profile) ||
    localStorage.getItem(STORAGE_KEYS.projects);

  if (hasLocal) {
    return {
      profile: loadProfile(),
      projects: loadProjects(),
      source: 'local',
      publishedAt: null,
    };
  }

  return {
    profile: structuredClone(initialData.profile),
    projects: normalizeProjects(structuredClone(initialData.projects)),
    source: 'default',
    publishedAt: null,
  };
}

function emit(type, data) {
  window.dispatchEvent(new CustomEvent(CONTENT_EVENT, { detail: { type, data } }));
}

export async function saveProfile(profile) {
  const normalized = normalizeProfile(profile);
  cacheLocally(normalized, null);
  emit('profile', normalized);

  if (getApiToken()) {
    const projects = loadProjects();
    await saveLiveContent({ profile: normalized, projects });
  }

  return normalized;
}

export async function saveProjects(projects) {
  const normalized = normalizeProjects(projects);
  cacheLocally(null, normalized);
  emit('projects', normalized);

  if (getApiToken()) {
    const profile = loadProfile();
    await saveLiveContent({ profile, projects: normalized });
  }

  return normalized;
}

export function buildPublishPayload(profile, projects) {
  return {
    profile: normalizeProfile(profile),
    projects: normalizeProjects(projects),
    publishedAt: new Date().toISOString(),
    version: 2,
  };
}

export function downloadPublishFile(profile, projects) {
  const payload = buildPublishPayload(profile, projects);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'site-data.json';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return payload.publishedAt;
}

export function subscribeContentUpdates(callback) {
  const onCustom = (e) => callback(e.detail);
  const onStorage = (e) => {
    if (e.key === STORAGE_KEYS.profile && e.newValue) {
      try { callback({ type: 'profile', data: normalizeProfile(JSON.parse(e.newValue)) }); } catch { /* ignore */ }
    }
    if (e.key === STORAGE_KEYS.projects && e.newValue) {
      try { callback({ type: 'projects', data: JSON.parse(e.newValue) }); } catch { /* ignore */ }
    }
  };

  window.addEventListener(CONTENT_EVENT, onCustom);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CONTENT_EVENT, onCustom);
    window.removeEventListener('storage', onStorage);
  };
}

const SKILL_COLORS = ['var(--cyan)', 'var(--purple)', 'var(--green)'];

export function parseSkillLine(line, index) {
  const parts = line.split('|').map((s) => s.trim());
  return {
    name: parts[0] || '',
    percentage: Math.min(100, Math.max(0, parseInt(parts[1], 10) || 0)),
    color: parts[2] || SKILL_COLORS[index % SKILL_COLORS.length],
  };
}

export function skillsToLines(skills) {
  return (skills || []).map((s) => `${s.name}|${s.percentage}|${s.color}`).join('\n');
}

export function linesToSkills(text) {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, i) => parseSkillLine(line, i));
}

export function getPrimaryEmail(profile) {
  const email = profile.email || '';
  return email.split(/[,;]/)[0]?.trim() || '';
}

export function getAllEmails(profile) {
  return (profile.email || '')
    .split(/[,;]/)
    .map((e) => e.trim())
    .filter(Boolean);
}
