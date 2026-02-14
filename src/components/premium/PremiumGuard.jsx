import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock, Loader2 } from 'lucide-react';
import { createPageUrl } from "@/utils";
import { hasFeatureAccess, getRequiredPlanForFeature } from "@/components/utils/featureFlags";
import { trackFeatureClick } from "@/components/utils/upgradeTriggers";
import UpgradeDialog from "./UpgradeDialog";
import { base44 } from "@/api/base44Client";

export default function PremiumGuard({ 
  user, 
  children, 
  fallback, 
  feature = "Diese Funktion", 
  featureName = null,
  requiredPlan = "basic" 
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeTrigger, setUpgradeTrigger] = useState(null);

  useEffect(() => {
    checkAccess();
  }, [user, featureName]);

  const checkAccess = async () => {
    setIsLoading(true);
    
    try {
      const currentUser = user || await base44.auth.me();
      const planId = currentUser?.premium_plan_id || 'free';
      
      setCurrentPlan({ 
        id: planId, 
        name: planId === 'free' ? 'Kostenlos' : planId === 'premium' ? 'Premium' : 'Pro',
        is_active: true 
      });
      
      if (featureName) {
        const featureAccess = hasFeatureAccess(planId, featureName);
        setHasAccess(featureAccess !== false);
      } else {
        setHasAccess(planId === 'pro' || planId === 'ultimate' || planId === 'premium');
      }
    } catch (error) {
      console.error('[PremiumGuard] Error checking access:', error);
      setHasAccess(false);
    }
    
    setIsLoading(false);
  };

  const handleFeatureClick = async () => {
    try {
      const currentUser = user || await base44.auth.me();
      const planId = currentUser?.premium_plan_id || 'free';
      
      if (featureName) {
        const trigger = await trackFeatureClick(featureName, planId);
        if (trigger.showUpgrade) {
          setUpgradeTrigger(trigger);
          setShowUpgradeDialog(true);
        }
      }
    } catch (error) {
      console.error("Error handling feature click:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Pruefe Zugriff...</span>
        </div>
      </div>
    );
  }

  if (hasAccess) {
    return children;
  }

  const getPlanName = (planId) => {
    const names = {
      'basic': 'Basic Plan',
      'premium': 'Premium Plan',
      'pro': 'Pro Plan',
      'ultimate': 'Ultimate Plan'
    };
    return names[planId] || 'Premium Plan';
  };

  return fallback || (
    <>
      <div className="min-h-screen bg-gray-950 p-6 flex items-center justify-center">
        <Card 
          className="glass-morphism border-amber-600/50 bg-gradient-to-br from-amber-500/10 to-orange-500/10 max-w-md cursor-pointer hover:border-amber-500/70 transition-colors"
          onClick={handleFeatureClick}
        >
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex items-center justify-center gap-2 text-amber-400">
              <Crown className="w-10 h-10" />
              <Lock className="w-8 h-8" />
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-white mb-2">Premium Feature</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {feature} ist nur fuer Premium-Nutzer verfuegbar.
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
                Zurueck
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <UpgradeDialog 
        isOpen={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        trigger={upgradeTrigger}
      />
    </>
  );
}