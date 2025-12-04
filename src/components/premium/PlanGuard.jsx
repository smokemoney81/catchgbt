import React, { useState, useEffect } from 'react';
import { checkFeatureAccess } from '@/functions/checkFeatureAccess';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock, Zap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PlanGuard({ featureId, children, fallback }) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requiredPlan, setRequiredPlan] = useState(null);

  useEffect(() => {
    checkAccess();
  }, [featureId]);

  const checkAccess = async () => {
    try {
      const response = await checkFeatureAccess({ feature_id: featureId });
      setHasAccess(response.data.has_access);
      setRequiredPlan(response.data.required_plan);
    } catch (error) {
      console.error('Fehler beim Prüfen des Zugriffs:', error);
      setHasAccess(false);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!hasAccess) {
    if (fallback) {
      return fallback;
    }

    const planIcons = {
      basic: Zap,
      pro: Star,
      ultimate: Crown
    };

    const planColors = {
      basic: 'from-blue-600 to-blue-700',
      pro: 'from-purple-600 to-purple-700',
      ultimate: 'from-amber-600 to-orange-600'
    };

    const PlanIcon = planIcons[requiredPlan] || Lock;
    const planColor = planColors[requiredPlan] || 'from-gray-600 to-gray-700';

    return (
      <Card className="glass-morphism border-gray-700">
        <CardContent className="p-8 text-center space-y-4">
          <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${planColor} flex items-center justify-center`}>
            <PlanIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white">Premium Feature</h3>
          <p className="text-gray-300">
            Dieses Feature ist nur im <span className="text-cyan-400 font-semibold">{requiredPlan?.toUpperCase()}</span> Plan verfügbar.
          </p>
          <Link to={createPageUrl('PremiumPlans')}>
            <Button className={`bg-gradient-to-r ${planColor} hover:opacity-90`}>
              Jetzt upgraden
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return children;
}