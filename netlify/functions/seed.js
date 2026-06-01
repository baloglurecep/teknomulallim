/**
 * Tek seferlik Atlas seed
 * GET /api/seed?secret=SEED_SECRET  veya Authorization: Bearer <admin JWT>
 * force=1 ile mevcut verinin üzerine yazar
 */
import { getSiteDoc, saveSiteDoc } from '../lib/db.js';
import { requireAdmin } from '../lib/auth.js';
import { json, options } from '../lib/http.js';

function siteOrigin(event) {
  const proto = event.headers?.['x-forwarded-proto'] || 'https';
  const host =
    event.headers?.['x-forwarded-host'] ||
    event.headers?.host ||
    process.env.URL?.replace(/^https?:\/\//, '') ||
    'teknomuallim.com';
  return `${proto}://${host}`;
}

async function loadSeedPayload(event) {
  const origin = siteOrigin(event);
  const res = await fetch(`${origin}/site-data.json`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`site-data.json indirilemedi (HTTP ${res.status})`);

  const data = await res.json();
  if (!data.profile || !data.projects) throw new Error('site-data.json geçersiz');
  return data;
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return options();
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const seedSecret = process.env.SEED_SECRET;
    const querySecret = event.queryStringParameters?.secret;
    const auth = await requireAdmin(event);

    if (!auth.ok && (!seedSecret || querySecret !== seedSecret)) {
      return json(401, { error: 'Yetkisiz seed isteği' });
    }

    const existing = await getSiteDoc();
    if (existing?.profile && existing?.projects && event.queryStringParameters?.force !== '1') {
      return json(200, {
        message: 'Atlas zaten dolu. Üzerine yazmak için ?force=1',
        updatedAt: existing.updatedAt,
      });
    }

    const seed = await loadSeedPayload(event);
    const saved = await saveSiteDoc({
      profile: seed.profile,
      projects: seed.projects,
    });

    return json(200, {
      message: 'Atlas seed tamamlandı',
      updatedAt: saved.updatedAt,
      projectCount: saved.projects?.length ?? 0,
    });
  } catch (err) {
    console.error('[seed]', err);
    return json(500, { error: err.message || 'Seed hatası' });
  }
}
