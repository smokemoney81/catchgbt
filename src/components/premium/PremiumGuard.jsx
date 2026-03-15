import React from 'react';
import { hasFeatureAccess, PLAN_NAMES } from '@/components/utils/premiumPlans';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { usePlan } from '@/components/premium/PlanContext';

export default function PremiumGuard({ children, fallback, feature = "Diese Funktion", requiredPlan = "basic" }) {
  const { plan, loading, hasFeature } = usePlan();

  if (loading) return null;

  if (!hasFeature(requiredPlan)) {
    if (fallback) return fallback;
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center gap-4">
        <div className="text-gray-400 text-lg font-semibold">
          {feature} erfordert mindestens {PLAN_NAMES[requiredPlan]}
        </div>
        <p className="text-gray-500 text-sm max-w-xs">
          Upgrade deinen Plan, um diese Funktion freizuschalten.
        </p>
        <Link to="/PremiumPlans">
          <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
            Jetzt upgraden
          </Button>
        </Link>
      </div>
    );
  }

  return children;
}