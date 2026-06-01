import { requireAdmin } from '../lib/auth.js';
import { createUploadSignature } from '../lib/cloudinary.js';
import { json, options, parseBody } from '../lib/http.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return options();
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const auth = await requireAdmin(event);
    if (!auth.ok) return json(401, { error: auth.error });

    const body = parseBody(event) || {};
    const folder = body.folder || 'teknomuallim';
    const resourceType = body.resourceType === 'video' ? 'video' : body.resourceType === 'image' ? 'image' : 'auto';

    const sign = createUploadSignature({ folder, resourceType });
    return json(200, sign);
  } catch (err) {
    console.error('[media-sign]', err);
    return json(500, { error: err.message || 'İmza oluşturulamadı' });
  }
}
