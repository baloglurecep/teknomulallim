const DB_NAME = 'teknomuallim_media_db';
const STORE_NAME = 'media_store';
const DB_VERSION = 1;

let dbInstance = null;

// Initialize IndexedDB
export function initDB() {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

// Save a File Blob to IndexedDB
export async function saveMedia(key, blob) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(blob, key);

    request.onsuccess = () => {
      resolve(key);
    };

    request.onerror = (event) => {
      console.error('IndexedDB write error:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Get a File Blob from IndexedDB by Key
export async function getMedia(key) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = (event) => {
      resolve(event.target.result); // Returns the Blob object
    };

    request.onerror = (event) => {
      console.error('IndexedDB read error:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Delete a File Blob from IndexedDB by Key
export async function deleteMedia(key) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(key);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      console.error('IndexedDB delete error:', event.target.error);
      reject(event.target.error);
    };
  });
}
