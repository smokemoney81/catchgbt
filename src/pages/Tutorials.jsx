import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonitorPlay, ExternalLink, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Tutorials() {
  useEffect(() => {
    // Automatische Weiterleitung zur Tutorial-Seite nach 2 Sekunden
    const timer = setTimeout(() => {
      window.open('https://Catchgbt-q7scna.manus.space', '_blank');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleDirectLink = () => {
    window.open('https://Catchgbt-q7scna.manus.space', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6 pb-32">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <MonitorPlay className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
              CatchGbt Tutorial Videos
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Lerne alles über CatchGbt mit über 100 Video-Tutorials
            </p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="glass-morphism border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
          <CardHeader>
            <CardTitle className="text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)] flex items-center gap-2">
              <Youtube className="w-6 h-6" />
              100+ Tutorial Videos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Auto-Redirect Message */}
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-cyan-600 rounded-full flex items-center justify-center animate-pulse">
                <MonitorPlay className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Du wirst weitergeleitet...
              </h3>
              <p className="text-gray-300 mb-4">
                Du wirst automatisch zu unserer Tutorial-Plattform weitergeleitet.
              </p>
              <div className="w-48 h-2 mx-auto bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-[loading_2s_ease-in-out]" />
              </div>
            </div>

            {/* Manual Link Button */}
            <div className="text-center">
              <Button
                onClick={handleDirectLink}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-cyan-500/50 transition-all"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Jetzt zu den Tutorials
              </Button>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-cyan-400 font-semibold mb-2">📚 Umfassende Anleitungen</h4>
                <p className="text-gray-400 text-sm">
                  Schritt-für-Schritt Tutorials für jede Funktion
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-cyan-400 font-semibold mb-2">🎯 Für jeden Level</h4>
                <p className="text-gray-400 text-sm">
                  Von Anfänger bis Profi - für jeden etwas dabei
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-cyan-400 font-semibold mb-2">🚀 Schneller Einstieg</h4>
                <p className="text-gray-400 text-sm">
                  Lerne die wichtigsten Features in wenigen Minuten
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-cyan-400 font-semibold mb-2">💡 Tipps & Tricks</h4>
                <p className="text-gray-400 text-sm">
                  Profitiere von Expertenwissen und Best Practices
                </p>
              </div>
            </div>

            {/* Info Text */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-800">
              <p>
                Die Tutorial-Plattform öffnet sich in einem neuen Tab.
              </p>
              <p className="mt-1">
                Link funktioniert nicht? Klicke auf den Button oben.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips Card */}
        <Card className="glass-morphism border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              📌 Beliebte Tutorial-Themen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-sm text-gray-300">✓ Fänge loggen</div>
              <div className="text-sm text-gray-300">✓ KI-Buddy nutzen</div>
              <div className="text-sm text-gray-300">✓ Spots verwalten</div>
              <div className="text-sm text-gray-300">✓ Wetter-Alarme</div>
              <div className="text-sm text-gray-300">✓ Trip-Planer</div>
              <div className="text-sm text-gray-300">✓ Community Features</div>
              <div className="text-sm text-gray-300">✓ Premium-Features</div>
              <div className="text-sm text-gray-300">✓ Geräte verbinden</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes loading {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}