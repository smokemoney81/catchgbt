export const register = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW registriert:', reg.scope))
        .catch(err => console.log('SW Fehler (normal in Dev):', err));
    });
  }
};