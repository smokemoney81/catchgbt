import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, AlertTriangle } from "lucide-react";
import WeatherAlertsSettings from "@/components/settings/WeatherAlertsSettings";

export default function WeatherAlerts() {
  return (
    <div className="min-h-screen bg-gray-950 p-6 pb-32">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-8 h-8 text-amber-400" />
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
              Wetter-Warnungen
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Konfiguriere automatische Benachrichtigungen für Wetterbedingungen
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="glass-morphism border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="font-medium text-amber-400 mb-1">Wie funktionieren Wetter-Warnungen?</p>
                <p>
                  Sobald du Wetter-Daten abrufst (z.B. auf der Startseite oder Wetter-Seite), 
                  prüft die App automatisch deine eingestellten Schwellenwerte und benachrichtigt 
                  dich per Toast-Meldung, wenn die Bedingungen erfüllt sind.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alarm Settings */}
        <WeatherAlertsSettings />
      </div>
    </div>
  );
}