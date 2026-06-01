import { getSiteDoc, saveSiteDoc } from '../lib/db.js';
import { requireAdmin } from '../lib/auth.js';
import { json, options, parseBody } from '../lib/http.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return options();

  try {
    if (event.httpMethod === 'GET') {
      const doc = await getSiteDoc();
      if (!doc) {
        return json(404, { error: 'İçerik henüz yüklenmemiş', empty: true });
      }
      return json(200, {
        profile: doc.profile,
        projects: doc.projects,
        updatedAt: doc.updatedAt,
      });
    }

    if (event.httpMethod === 'PUT') {
      const auth = await requireAdmin(event);
      if (!auth.ok) return json(401, { error: auth.error });

      const body = parseBody(event);
      if (!body) return json(400, { error: 'Geçersiz JSON' });

      const patch = {};
      if (body.profile) patch.profile = body.profile;
      if (body.projects) patch.projects = body.projects;
      if (!patch.profile && !patch.projects) {
        return json(400, { error: 'profile veya projects gerekli' });
      }

      const existing = (await getSiteDoc()) || {};
      const merged = {
        profile: patch.profile ?? existing.profile,
        projects: patch.projects ?? existing.projects,
      };

      const saved = await saveSiteDoc(merged);
      return json(200, {
        profile: saved.profile,
        projects: saved.projects,
        updatedAt: saved.updatedAt,
      });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('[content]', err);
    return json(500, { error: err.message || 'Sunucu hatası' });
  }
}
