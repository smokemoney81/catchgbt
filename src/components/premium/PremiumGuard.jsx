import React from 'react';
import { hasFeatureAccess, PLAN_NAMES } from '@/components/utils/premiumPlans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PremiumGuard({ user, children, fallback, feature = "Diese Funktion", requiredPlan = "basic" }) {
  // Alle Features sind freigeschaltet
  return children;
}