import React from 'react';

export default function PremiumGuard({ user, children, fallback, feature = "Diese Funktion", requiredPlan = "basic" }) {
  // Alle Features sind jetzt kostenlos verfügbar
  return children;
}