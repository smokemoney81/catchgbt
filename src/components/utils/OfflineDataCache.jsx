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
      const stores = ['catches', 'spots', 'rules', 'bathymetric_maps', 'weather'];
      
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
    const transaction = db.transaction(['catches', 'spots', 'rules', 'bathymetric_maps', 'weather'], 'readwrite');
    
    transaction.objectStoreNames.forEach((storeName) => {
      transaction.objectStore(storeName).clear();
    });
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function cacheWeatherData(lat, lon, weatherData) {
  if (!db) await initOfflineDB();
  
  const dataToCache = {
    id: `${lat},${lon}`,
    lat,
    lon,
    ...weatherData,
    cached_at: new Date().toISOString()
  };
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['weather'], 'readwrite');
    const objectStore = transaction.objectStore('weather');
    const request = objectStore.put(dataToCache);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getCachedWeather(lat, lon) {
  if (!db) await initOfflineDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['weather'], 'readonly');
    const objectStore = transaction.objectStore('weather');
    const request = objectStore.get(`${lat},${lon}`);
    
    request.onsuccess = () => {
      const result = request.result;
      if (result) {
        const cachedTime = new Date(result.cached_at).getTime();
        const now = new Date().getTime();
        const ageMinutes = (now - cachedTime) / (1000 * 60);
        
        if (ageMinutes < 180) {
          resolve(result);
        } else {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
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