import React from 'react';

export default function PremiumGuard({ children, fallback, feature = "Diese Funktion", requiredPlan = "basic" }) {
  return children;
}