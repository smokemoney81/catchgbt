export const register = () => {
  if (!('serviceWorker' in navigator)) return;

  // In Dev-Modus: keinen SW registrieren, bestehende abmelden und Caches loeschen,
  // damit kein veralteter React/Vite-Chunk aus dem Cache kommt.
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(reg => reg.unregister());
    }).catch(() => {});
    if (typeof caches !== 'undefined') {
      caches.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(() => {});
    }
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(r => console.log('SW ready:', r.scope))
      .catch(e => console.log('SW:', e));
  });
};