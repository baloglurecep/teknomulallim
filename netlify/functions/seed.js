/**
 * Tek seferlik Atlas seed
 * GET /api/seed?secret=SEED_SECRET  veya Authorization: Bearer <admin JWT>
 * force=1 ile mevcut verinin üzerine yazar
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { getSiteDoc, saveSiteDoc } from '../lib/db.js';
import { requireAdmin } from '../lib/auth.js';
import { json, options } from '../lib/http.js';

function loadSeedPayload() {
  const siteDataPath = join(process.cwd(), 'public', 'site-data.json');
  const raw = readFileSync(siteDataPath, 'utf8');
  const data = JSON.parse(raw);
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

    const seed = loadSeedPayload();
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
