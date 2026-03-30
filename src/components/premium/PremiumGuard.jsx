import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const PLAN_HIERARCHY = {
  free: 0,
  basic: 1,
  pro: 2,
  elite: 3,
  ultimate: 4
};

export default function PremiumGuard({ children, requiredPlan = 'basic', fallback = null }) {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      try {
        const user = await base44.auth.me();
        if (!user) {
          setAllowed(false);
          setLoading(false);
          return;
        }

        const wallets = await base44.entities.PremiumWallet.filter({ user_id: user.email });
        const wallet = wallets?.[0];

        if (!wallet) {
          // No wallet means free plan
          const userLevel = PLAN_HIERARCHY['free'] ?? 0;
          const requiredLevel = PLAN_HIERARCHY[requiredPlan] ?? 1;
          setAllowed(userLevel >= requiredLevel);
          setLoading(false);
          return;
        }

        // Check if premium is active via credits
        const available = (wallet.purchased_credits ?? 0) - (wallet.consumed_credits ?? 0);
        const hasPremium = available > 0;

        // Determine effective plan
        const effectivePlan = hasPremium ? (user.premium_plan ?? 'basic') : 'free';
        const userLevel = PLAN_HIERARCHY[effectivePlan] ?? 0;
        const requiredLevel = PLAN_HIERARCHY[requiredPlan] ?? 1;

        setAllowed(userLevel >= requiredLevel);
      } catch {
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [requiredPlan]);

  if (loading) return null;
  if (!allowed) return fallback;
  return children;
}