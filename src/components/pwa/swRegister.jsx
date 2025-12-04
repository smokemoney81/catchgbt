
export const register = () => {
  // Service Worker-Registrierung ist deaktiviert, da die Plattform das Hosten von sw.js im Stammverzeichnis nicht unterstützt.
  // Dies behebt den "unsupported MIME type"-Fehler in der Konsole.
  // Wir versuchen auch, alle vorhandenen Service Worker zu deregistrieren, um den Client zu bereinigen.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      if (registrations.length > 0) {
        console.log('Bestehende Service Worker gefunden, versuche Deregistrierung...');
      }
      for(let registration of registrations) {
        registration.unregister()
          .then(unregistered => {
            if (unregistered) {
              console.log('Bestehender Service Worker wurde erfolgreich deregistriert.');
              // Seite neu laden, um die Änderungen wirksam zu machen
              window.location.reload();
            } else {
              console.log('Service Worker konnte nicht deregistriert werden.');
            }
          })
          .catch(err => {
            console.error('Fehler bei der Deregistrierung eines einzelnen Service Workers:', err);
          });
      }
    }).catch(function(err) {
      console.error('Fehler beim Abrufen der Service Worker-Registrierungen zur Deregistrierung:', err);
    });
  } else {
    console.log('Service Worker wird von diesem Browser nicht unterstützt.');
  }
};
