import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Crown } from "lucide-react";

export default function Premium() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <Card className="glass-morphism border-amber-600/50 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Crown className="w-16 h-16 text-amber-400 animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-bold text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]">
              Premium Upgrade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-gray-300 text-lg">
              Entdecke alle Premium-Features und hebe dein Angel-Erlebnis auf die nächste Stufe!
            </p>
            
            <div className="space-y-3">
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h3 className="font-semibold text-white mb-2">✨ Basic Plan - 10€/Monat</h3>
                <p className="text-sm text-gray-400">Erweiterte Karten, KI Chat-Buddy Standard, Trip-Planer</p>
              </div>
              
              <div className="p-4 bg-purple-600/20 rounded-lg border border-purple-500/30">
                <h3 className="font-semibold text-purple-400 mb-2">⭐ Pro Plan - 19€/Monat</h3>
                <p className="text-sm text-gray-400">Alle Basic-Features + Lizenzen, Geräte, Prüfungsvorbereitung, KI Deluxe</p>
              </div>
              
              <div className="p-4 bg-amber-600/20 rounded-lg border border-amber-500/30">
                <h3 className="font-semibold text-amber-400 mb-2">👑 Ultimate Plan - 29€/Monat</h3>
                <p className="text-sm text-gray-400">Alle Pro-Features + KI-Kamera, Bissanzeiger, AR-Analyse, Priority Support</p>
              </div>
            </div>

            <Button
              onClick={() => navigate(createPageUrl('PremiumPlans'))}
              size="lg"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-lg"
            >
              <Crown className="w-5 h-5 mr-2" />
              Zu den Premium-Plänen
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}