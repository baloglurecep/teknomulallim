import { apiFetch } from './apiClient';

/**
 * Cloudinary imzalı doğrudan yükleme (Netlify Function aracılığıyla imza alır)
 * @returns {Promise<string>} secure_url
 */
export async function uploadMediaToCloud(file, { folder = 'teknomuallim', resourceType } = {}) {
  const type = resourceType || (file.type?.startsWith('video/') ? 'video' : file.type?.startsWith('image/') ? 'image' : 'auto');

  const sign = await apiFetch('/media/sign', {
    method: 'POST',
    body: JSON.stringify({ folder, resourceType: type }),
  });

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sign.apiKey);
  form.append('timestamp', String(sign.timestamp));
  form.append('signature', sign.signature);
  form.append('folder', sign.folder);

  const uploadType = type === 'auto' ? 'auto' : type;
  const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/${uploadType}/upload`, {
    method: 'POST',
    body: form,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Cloudinary yükleme hatası');
  }

  return data.secure_url;
}

/** http(s) veya cloudinary URL */
export function isRemoteMediaUrl(url) {
  return !!url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//'));
}

export function isLocalDbUrl(url) {
  return !!url && url.startsWith('localdb://');
}
