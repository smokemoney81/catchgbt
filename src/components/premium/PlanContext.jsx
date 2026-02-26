import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const PlanContext = createContext();

export function usePlan() {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within PlanProvider');
  }
  return context;
}

export function PlanProvider({ children }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPlan = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('getPlanStatus');
      if (response.data && response.data.plan) {
        setPlan(response.data.plan);
      } else {
        setPlan({ id: 'free', name: 'Kostenlos', is_active: false });
      }
    } catch (error) {
      console.error('[PlanContext] Error loading plan:', error);
      setPlan({ id: 'free', name: 'Kostenlos', is_active: false });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPlan();
    
    window.addEventListener('plan-updated', loadPlan);
    return () => window.removeEventListener('plan-updated', loadPlan);
  }, []);

  const hasFeature = (requiredPlan) => {
    if (!plan) return false;
    
    const planHierarchy = { 
      'free': 0, 
      'basic': 1, 
      'pro': 2, 
      'elite': 3, 
      'ultimate': 4 
    };
    const userLevel = planHierarchy[plan.id] || 0;
    const requiredLevel = planHierarchy[requiredPlan] || 0;
    
    return userLevel >= requiredLevel;
  };

  return (
    <PlanContext.Provider value={{ plan, loading, hasFeature, reload: loadPlan }}>
      {children}
    </PlanContext.Provider>
  );
}