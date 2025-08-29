// Create a new file: src/utils/db.js

import { openDB } from 'idb';

const DB_NAME = 'E2EE-FileKeys';
const STORE_NAME = 'keys';

// Initialize the database
const initDB = async () => {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
  return db;
};

// Store a file key in IndexedDB
export const storeFileKey = async (fileId, key) => {
  const db = await initDB();
  await db.put(STORE_NAME, { id: fileId, key: key });
};

// Retrieve a file key from IndexedDB
export const getFileKey = async (fileId) => {
  const db = await initDB();
  const record = await db.get(STORE_NAME, fileId);
  return record ? record.key : null;
};

// Clear all keys (useful on logout)
export const clearAllKeys = async () => {
    const db = await initDB();
    await db.clear(STORE_NAME);
}