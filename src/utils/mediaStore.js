import { getMedia, saveMedia, deleteMedia } from './mediaDB';
import { uploadMediaToCloud, isRemoteMediaUrl, isLocalDbUrl } from './cloudMedia';
import { getApiToken } from './apiClient';

/**
 * Medya yükle — admin oturumu varsa Cloudinary, yoksa yerel IndexedDB
 * @returns {Promise<string>} URL (https://... veya localdb://...)
 */
export async function persistMediaFile(file, keyPrefix) {
  if (getApiToken()) {
    const folder = `teknomuallim/${keyPrefix}`;
    return uploadMediaToCloud(file, { folder });
  }

  const key = `${keyPrefix}_${Date.now()}`;
  await saveMedia(key, file);
  return `localdb://${key}`;
}

export { getMedia, saveMedia, deleteMedia, isRemoteMediaUrl, isLocalDbUrl };
