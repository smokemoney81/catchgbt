// Offline-Datencache mit IndexedDB fuer Entities
const DB_NAME = 'CatchGBT';
const DB_VERSION = 2;

let db = null;

export async function initOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      
      // Stores fuer verschiedene Entity-Typen
      const stores = ['catches', 'spots', 'rules', 'bathymetric_maps'];
      
      stores.forEach(store => {
        if (!database.objectStoreNames.contains(store)) {
          database.createObjectStore(store, { keyPath: 'id' });
        }
      });
    };
  });
}

export async function cacheEntityData(storeName, data) {
  if (!db) await initOfflineDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const objectStore = transaction.objectStore(storeName);
    
    if (Array.isArray(data)) {
      data.forEach(item => objectStore.put(item));
    } else {
      objectStore.put(data);
    }
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getOfflineData(storeName) {
  if (!db) await initOfflineDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function clearOfflineDB() {
  if (!db) await initOfflineDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['catches', 'spots', 'rules', 'bathymetric_maps'], 'readwrite');
    
    transaction.objectStoreNames.forEach((storeName) => {
      transaction.objectStore(storeName).clear();
    });
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export function isOnline() {
  return navigator.onLine;
}

export function onOnlineStatusChange(callback) {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
  
  return () => {
    window.removeEventListener('online', () => callback(true));
    window.removeEventListener('offline', () => callback(false));
  };
}