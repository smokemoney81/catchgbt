import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock, Loader2 } from 'lucide-react';
import { createPageUrl } from "@/utils";

export default function PremiumGuard({ user, children, fallback, feature = "Diese Funktion", requiredPlan = "basic" }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);

  useEffect(() => {
    checkAccess();
  }, [user]);

  const checkAccess = async () => {
    setIsLoading(true);
    // FREE FOR ALL - Alle Features sind jetzt frei zugänglich
    console.log('[PremiumGuard] FREE FOR ALL MODE - granting access to everyone');
    setHasAccess(true);
    setCurrentPlan({ 
      id: 'free_for_all', 
      name: 'Free for All', 
      is_active: true 
    });
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Prüfe Zugriff...</span>
        </div>
      </div>
    );
  }

  // User hat Zugriff
  if (hasAccess) {
    return children;
  }

  // Zeige Premium-Sperre
  const getPlanName = (planId) => {
    const names = {
      'basic': 'Basic Plan',
      'pro': 'Pro Plan',
      'ultimate': 'Ultimate Plan'
    };
    return names[planId] || 'Premium Plan';
  };

  return fallback || (
    <div className="min-h-screen bg-gray-950 p-6 flex items-center justify-center">
      <Card className="glass-morphism border-amber-600/50 bg-gradient-to-br from-amber-500/10 to-orange-500/10 max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex items-center justify-center gap-2 text-amber-400">
            <Crown className="w-10 h-10" />
            <Lock className="w-8 h-8" />
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold text-white mb-2">Premium Feature</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {feature} ist nur für Premium-Nutzer verfügbar.
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-amber-400 font-semibold text-sm mb-2">
              Erforderlich: {getPlanName(requiredPlan)}
            </p>
            {currentPlan && (
              <p className="text-gray-400 text-xs">
                Dein aktueller Plan: {currentPlan.name || 'Kostenlos'}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => window.location.href = createPageUrl('PremiumPlans')}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              size="lg"
            >
              <Crown className="w-5 h-5 mr-2" />
              Jetzt upgraden
            </Button>
            
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full"
            >
              Zurück
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}