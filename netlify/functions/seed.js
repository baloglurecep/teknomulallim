/**
 * Tek seferlik Atlas seed
 * GET /api/seed?secret=SEED_SECRET  veya Authorization: Bearer <admin JWT>
 * force=1 ile mevcut verinin üzerine yazar
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getSiteDoc, saveSiteDoc } from '../lib/db.js';
import { requireAdmin } from '../lib/auth.js';
import { json, options } from '../lib/http.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseSeedJson(raw) {
  const data = JSON.parse(raw);
  if (!data.profile || !data.projects) throw new Error('site-data.json geçersiz');
  return data;
}

function loadSeedFromDisk() {
  const candidates = [
    join(__dirname, '..', '..', 'public', 'site-data.json'),
    join(process.cwd(), 'public', 'site-data.json'),
  ];
  for (const siteDataPath of candidates) {
    if (existsSync(siteDataPath)) {
      return parseSeedJson(readFileSync(siteDataPath, 'utf8'));
    }
  }
  return null;
}

async function loadSeedFromPublishedSite(event) {
  const proto = event.headers?.['x-forwarded-proto'] || 'https';
  const host =
    event.headers?.['x-forwarded-host'] ||
    event.headers?.host ||
    process.env.URL?.replace(/^https?:\/\//, '');

  if (!host) throw new Error('Site adresi bulunamadı');

  const res = await fetch(`${proto}://${host}/site-data.json`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`site-data.json indirilemedi (HTTP ${res.status})`);
  return parseSeedJson(await res.text());
}

async function loadSeedPayload(event) {
  const fromDisk = loadSeedFromDisk();
  if (fromDisk) return fromDisk;
  return loadSeedFromPublishedSite(event);
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
