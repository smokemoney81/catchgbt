import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock, Loader2, AlertTriangle } from 'lucide-react';
import { createPageUrl } from "@/utils";
import { checkFeatureAccess, getPaymentStatus, getRequiredPlanForFeature, PAYMENT_STATUS } from "@/components/utils/featureFlags";
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
  const [paymentStatus, setPaymentStatus] = useState(PAYMENT_STATUS.NONE);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeTrigger, setUpgradeTrigger] = useState(null);
  const [blockReason, setBlockReason] = useState(null);

  useEffect(() => {
    checkAccess();
  }, [user, featureName]);

  const checkAccess = async () => {
    setIsLoading(true);
    
    try {
      const currentUser = user || await base44.auth.me();
      const planId = currentUser?.premium_plan_id || 'free';
      const status = getPaymentStatus(currentUser);
      
      setPaymentStatus(status);
      setCurrentPlan({ 
        id: planId, 
        name: planId === 'free' ? 'Kostenlos' : planId === 'premium' ? 'Premium' : planId === 'pro' ? 'Pro' : planId,
        is_active: status === PAYMENT_STATUS.ACTIVE
      });
      
      // STRIKTE PRÜFUNG
      if (featureName) {
        const access = checkFeatureAccess(planId, status, featureName);
        
        if (access === false) {
          if (status !== PAYMENT_STATUS.ACTIVE && planId !== 'free') {
            setBlockReason('payment_expired');
          } else if (planId === 'free') {
            setBlockReason('requires_premium');
          } else {
            setBlockReason('requires_higher_plan');
          }
        }
        
        setHasAccess(access !== false);
      } else {
        const isPremium = planId === 'pro' || planId === 'ultimate' || planId === 'premium' || planId === 'basic';
        const hasActivePayment = status === PAYMENT_STATUS.ACTIVE;
        
        setHasAccess(isPremium && hasActivePayment);
        
        if (!hasAccess) {
          if (!hasActivePayment && isPremium) {
            setBlockReason('payment_expired');
          } else {
            setBlockReason('requires_premium');
          }
        }
      }
    } catch (error) {
      console.error('[PremiumGuard] Error checking access:', error);
      setHasAccess(false);
      setBlockReason('error');
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

  const getBlockMessage = () => {
    if (blockReason === 'payment_expired') {
      return {
        title: 'Zahlung abgelaufen',
        message: 'Dein Premium-Plan ist abgelaufen. Erneuere jetzt, um weiterzumachen.',
        icon: <AlertTriangle className="w-10 h-10 text-red-400" />,
        color: 'red'
      };
    }
    
    if (blockReason === 'requires_higher_plan') {
      return {
        title: 'Upgrade erforderlich',
        message: `${feature} ist nur im Pro-Plan verfuegbar.`,
        icon: <Crown className="w-10 h-10 text-purple-400" />,
        color: 'purple'
      };
    }
    
    return {
      title: 'Premium Feature',
      message: `${feature} ist nur fuer Premium-Nutzer verfuegbar.`,
      icon: <Crown className="w-10 h-10 text-amber-400" />,
      color: 'amber'
    };
  };

  const blockMsg = getBlockMessage();
  const colorClass = blockMsg.color === 'red' ? 'border-red-600/50 from-red-500/10 to-red-600/10' : 
                     blockMsg.color === 'purple' ? 'border-purple-600/50 from-purple-500/10 to-purple-600/10' :
                     'border-amber-600/50 from-amber-500/10 to-orange-500/10';

  return fallback || (
    <>
      <div className="min-h-screen bg-gray-950 p-6 flex items-center justify-center">
        <Card 
          className={`glass-morphism ${colorClass} bg-gradient-to-br max-w-md cursor-pointer hover:opacity-90 transition-opacity`}
          onClick={handleFeatureClick}
        >
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex items-center justify-center gap-2">
              {blockMsg.icon}
              <Lock className="w-8 h-8 text-gray-400" />
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-white mb-2">{blockMsg.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {blockMsg.message}
              </p>
            </div>

            {paymentStatus !== PAYMENT_STATUS.ACTIVE && currentPlan?.id !== 'free' && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4">
                <p className="text-red-300 text-xs font-semibold">
                  Status: Zahlung abgelaufen
                </p>
              </div>
            )}

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
                {blockReason === 'payment_expired' ? 'Plan erneuern' : 'Jetzt upgraden'}
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