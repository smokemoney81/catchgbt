import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { trackUpgradePromptShown, trackUpgradePromptClicked, trackUpgradePromptDismissed } from "@/components/utils/analyticsTracking";

export default function UpgradeDialog({ isOpen, onClose, trigger }) {
  React.useEffect(() => {
    if (isOpen && trigger) {
      trackUpgradePromptShown(trigger.targetPlan, trigger.reason, trigger.feature);
    }
  }, [isOpen, trigger]);
  
  if (!trigger) return null;
  
  const { targetPlan, feature, reason } = trigger;
  
  const handleUpgradeClick = () => {
    trackUpgradePromptClicked(targetPlan, reason);
  };
  
  const handleClose = () => {
    trackUpgradePromptDismissed(targetPlan, reason);
    onClose();
  };
  
  const planInfo = {
    premium: {
      gradient: "from-yellow-500 to-orange-500",
      title: "Upgrade zu Premium",
      price: "9,99 EUR/Monat"
    },
    pro: {
      gradient: "from-purple-500 to-pink-500",
      title: "Upgrade zu Pro",
      price: "19,99 EUR/Monat"
    }
  };
  
  const info = planInfo[targetPlan];
  
  const getDescription = () => {
    if (reason === 'feature_locked' && feature === 'biteAI') {
      return "Die KI-Bisszeit-Analyse hilft dir, den perfekten Zeitpunkt zu finden. Basierend auf Wetter, Mondphase und historischen Daten.";
    }
    if (reason === 'feature_locked' && feature === 'heatmaps') {
      return "Entdecke die besten Angelplatze mit intelligenten Heatmaps basierend auf Community-Daten und Erfolgsprognosen.";
    }
    if (reason === 'feature_locked' && feature === 'arWater') {
      return "Visualisiere Gewasser in AR - Tiefenkarten, Strukturen und Hotspots direkt in deiner Kameraansicht.";
    }
    if (reason === 'milestone_reached') {
      return "Du hast bereits tolle Erfolge erzielt. Mit Premium erhaltst du noch mehr Tools fur bessere Fange.";
    }
    if (reason === 'limit_reached') {
      return "Du hast dein Tageslimit erreicht. Premium bietet dir mehr Kapazitat fur deine Angel-Sessions.";
    }
    return "Schalte Premium-Features frei und angle erfolgreicher.";
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.gradient}`}></div>
            <div>
              <DialogTitle className="text-xl">{info.title}</DialogTitle>
              <p className="text-sm text-gray-400">{info.price}</p>
            </div>
          </div>
          <DialogDescription className="text-gray-300 mt-4">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          <Link to={createPageUrl('PremiumPlans')} onClick={handleUpgradeClick}>
            <Button className={`w-full bg-gradient-to-r ${info.gradient} hover:opacity-90`}>
              Jetzt upgraden
            </Button>
          </Link>
          <Button variant="outline" className="w-full border-gray-700" onClick={handleClose}>
            Spater
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}