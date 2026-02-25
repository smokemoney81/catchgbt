import React from 'react';
import { hasFeatureAccess, PLAN_NAMES } from '@/components/utils/premiumPlans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PremiumGuard({ user, children, fallback, feature = "Diese Funktion", requiredPlan = "basic" }) {
  const userPlan = user?.current_plan || 'free';
  const hasAccess = hasFeatureAccess(userPlan, requiredPlan);

  if (hasAccess) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <Card className="glass-morphism border-gray-800 max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-cyan-400">
            Premium Feature
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-gray-300">
            {feature} ist nur für <span className="text-amber-400 font-semibold">{PLAN_NAMES[requiredPlan]}</span>-Nutzer verfügbar.
          </p>
          <p className="text-sm text-gray-400">
            Dein aktueller Plan: <span className="text-white font-semibold">{PLAN_NAMES[userPlan]}</span>
          </p>
          <Link to={createPageUrl('PremiumPlans')}>
            <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
              <Crown className="w-4 h-4 mr-2" />
              Jetzt upgraden
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}