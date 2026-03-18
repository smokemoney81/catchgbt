import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Volume2, VolumeX } from "lucide-react";
import VoiceSettings from "./VoiceSettings";
import GeneralSettings from "./GeneralSettings";
import TickerSettings from "./TickerSettings";
import DeleteAccountSection from "./DeleteAccountSection";
import { useSound } from "@/components/utils/SoundManager";
import { Button } from "@/components/ui/button";

export default function SettingsSection() {
  const { soundsEnabled, toggleSounds, playSound } = useSound();

  return (
    <div className="space-y-6">
      <Card className="glass-morphism border-gray-800 rounded-2xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)] flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-emerald-400" />
              Einstellungen
            </CardTitle>
          </div>
          <p className="text-gray-400 text-sm">
            Passe die App an deine Bedürfnisse an. Hier kannst du allgemeine, Sprach- und Ticker-Einstellungen verwalten.
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          <GeneralSettings />
          <VoiceSettings />
          <TickerSettings />
        </CardContent>
      </Card>

      {/* Sound Settings */}
      <Card className="glass-morphism border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-3 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]">
            {soundsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            Sound-Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Sound-Effekte</p>
              <p className="text-xs text-gray-400 mt-1">
                Aktiviert kurze Audio-Rückmeldungen bei Interaktionen
              </p>
            </div>
            <Button
              variant={soundsEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => {
                toggleSounds();
                if (!soundsEnabled) {
                  setTimeout(() => playSound('success'), 100);
                }
              }}
              className={soundsEnabled ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              {soundsEnabled ? "Aktiviert" : "Deaktiviert"}
            </Button>
          </div>

          {soundsEnabled && (
            <div className="p-4 bg-gray-800/30 rounded-lg space-y-2">
              <p className="text-xs text-gray-400 mb-2">Test-Sounds:</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => playSound('click')}>
                  Klick
                </Button>
                <Button size="sm" variant="outline" onClick={() => playSound('success')}>
                  Erfolg
                </Button>
                <Button size="sm" variant="outline" onClick={() => playSound('error')}>
                  Fehler
                </Button>
                <Button size="sm" variant="outline" onClick={() => playSound('warning')}>
                  Warnung
                </Button>
                <Button size="sm" variant="outline" onClick={() => playSound('notification')}>
                  Benachrichtigung
                </Button>
                <Button size="sm" variant="outline" onClick={() => playSound('selection')}>
                  Auswahl
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <DeleteAccountSection />
    </div>
  );
}