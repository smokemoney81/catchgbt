import React from 'react';

export default function PlanGuard({ featureId, children, fallback }) {
  // Alle Features sind jetzt kostenlos verfügbar
  return children;
}