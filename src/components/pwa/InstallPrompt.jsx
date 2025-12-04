import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Prüfe ob bereits als App installiert
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone 
      || document.referrer.includes('android-app://');
    
    setIsStandalone(standalone);

    // Prüfe ob Installation bereits abgelehnt wurde
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const now = Date.now();
    const daysSinceDismissed = (now - dismissedTime) / (1000 * 60 * 60 * 24);

    // Zeige Prompt nur wenn:
    // 1. Nicht bereits installiert
    // 2. Nicht kürzlich dismissed (< 7 Tage)
    // 3. Progressier ist geladen (Progressier kümmert sich um Installation)
    if (!standalone && (!dismissed || daysSinceDismissed > 7)) {
      // Warte bis Progressier geladen ist
      const checkProgressier = setInterval(() => {
        if (window.progressier) {
          clearInterval(checkProgressier);
          // Zeige Prompt nach 10 Sekunden
          setTimeout(() => setShowPrompt(true), 10000);
        }
      }, 500);

      // Timeout nach 30 Sekunden
      setTimeout(() => clearInterval(checkProgressier), 30000);
    }
  }, []);

  const handleInstall = async () => {
    // Nutze Progressier's Installation
    if (window.progressier && window.progressier.requestInstall) {
      try {
        await window.progressier.requestInstall();
        toast.success('App wird installiert! 🎣');
        setShowPrompt(false);
      } catch (error) {
        console.log('Installation via Progressier abgebrochen:', error);
      }
    } else {
      // Fallback: Zeige Info wie man manuell installiert
      toast.info('Tippe auf das Teilen-Symbol und wähle "Zum Startbildschirm"', {
        duration: 8000
      });
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_install_dismissed', Date.now().toString());
    setShowPrompt(false);
    toast.info('Du kannst CatchGBT jederzeit über dein Browser-Menü installieren');
  };

  // Nicht anzeigen wenn bereits installiert
  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-[100] sm:left-auto sm:right-6 sm:w-96"
        >
          <Card className="glass-morphism border-cyan-500/50 shadow-2xl shadow-cyan-500/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Download className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm mb-1">
                    CatchGBT installieren
                  </h3>
                  <p className="text-gray-400 text-xs mb-3">
                    Installiere die App für schnelleren Zugriff, Push-Benachrichtigungen und Offline-Nutzung
                  </p>
                  
                  <Button 
                    size="sm" 
                    onClick={handleInstall}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-xs h-8"
                  >
                    Jetzt installieren
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDismiss}
                  className="flex-shrink-0 h-6 w-6 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}