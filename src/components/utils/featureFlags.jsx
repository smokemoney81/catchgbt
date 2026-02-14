// STRIKT: Feature-Flags System für CATCHGBT
// KEINE Premium/Pro Nutzung ohne payment_status == "active"

export const PLANS = {
  FREE: 'free',
  PREMIUM: 'premium',
  PRO: 'pro'
};

export const PAYMENT_STATUS = {
  NONE: 'none',
  PENDING: 'pending',
  ACTIVE: 'active',
  EXPIRED: 'expired'
};

export const FEATURES = {
  // KI Features
  BITE_AI: 'biteAI',
  AI_CHAT: 'aiChat',
  
  // Karten & Analyse
  HEATMAPS: 'heatmaps',
  AR_WATER: 'arWater',
  SATELLITE_AI: 'satelliteAI',
  WATER_ANALYSIS: 'waterAnalysis',
  
  // Community & Wettbewerbe
  COMPETITIONS: 'competitions',
  PREMIUM_COMPETITIONS: 'premiumCompetitions',
  
  // Export & Daten
  DATA_EXPORT: 'dataExport',
  
  // Geräte
  DEVICE_INTEGRATION: 'deviceIntegration',
  
  // Spots
  PRIVATE_SPOTS: 'privateSpots',
  SECRET_HEATMAPS: 'secretHeatmaps'
};

// Feature Zuordnung pro Plan
const FEATURE_ACCESS = {
  [FEATURES.BITE_AI]: {
    [PLANS.FREE]: false,
    [PLANS.PREMIUM]: true,
    [PLANS.PRO]: true
  },
  [FEATURES.AI_CHAT]: {
    [PLANS.FREE]: 'limited',  // 10 Nachrichten/Tag
    [PLANS.PREMIUM]: 'limited', // 50 Nachrichten/Tag
    [PLANS.PRO]: 'unlimited'
  },
  [FEATURES.HEATMAPS]: {
    [PLANS.FREE]: false,
    [PLANS.PREMIUM]: 'basic',
    [PLANS.PRO]: 'advanced'
  },
  [FEATURES.AR_WATER]: {
    [PLANS.FREE]: false,
    [PLANS.PREMIUM]: false,
    [PLANS.PRO]: true
  },
  [FEATURES.SATELLITE_AI]: {
    [PLANS.FREE]: false,
    [PLANS.PREMIUM]: false,
    [PLANS.PRO]: true
  },
  [FEATURES.WATER_ANALYSIS]: {
    [PLANS.FREE]: 'basic',
    [PLANS.PREMIUM]: 'advanced',
    [PLANS.PRO]: 'advanced'
  },
  [FEATURES.COMPETITIONS]: {
    [PLANS.FREE]: false,
    [PLANS.PREMIUM]: true,
    [PLANS.PRO]: true
  },
  [FEATURES.PREMIUM_COMPETITIONS]: {
    [PLANS.FREE]: false,
    [PLANS.PREMIUM]: false,
    [PLANS.PRO]: true
  },
  [FEATURES.DATA_EXPORT]: {
    [PLANS.FREE]: false,
    [PLANS.PREMIUM]: 'pdf',
    [PLANS.PRO]: 'csv_api'
  },
  [FEATURES.DEVICE_INTEGRATION]: {
    [PLANS.FREE]: false,
    [PLANS.PREMIUM]: false,
    [PLANS.PRO]: true
  },
  [FEATURES.PRIVATE_SPOTS]: {
    [PLANS.FREE]: false,
    [PLANS.PREMIUM]: false,
    [PLANS.PRO]: true
  },
  [FEATURES.SECRET_HEATMAPS]: {
    [PLANS.FREE]: false,
    [PLANS.PREMIUM]: false,
    [PLANS.PRO]: true
  }
};

// ZENTRALE ZUGRIFFSPRÜFUNG - STRIKT
// Prüft: payment_status + plan + feature
export const checkFeatureAccess = (userPlan, paymentStatus, featureName) => {
  const plan = userPlan || PLANS.FREE;
  
  // REGEL 1: Free Features sind immer verfügbar
  if (plan === PLANS.FREE) {
    const access = FEATURE_ACCESS[featureName];
    if (!access) return false;
    return access[PLANS.FREE];
  }
  
  // REGEL 2: Premium/Pro Features NUR mit payment_status == "active"
  if (paymentStatus !== PAYMENT_STATUS.ACTIVE) {
    // KEINE Premium/Pro Features ohne aktive Zahlung
    return false;
  }
  
  // REGEL 3: Mit aktivem Status - Plan-basierter Zugriff
  const access = FEATURE_ACCESS[featureName];
  if (!access) return false;
  
  return access[plan];
};

// LEGACY KOMPATIBILITÄT - verwendet Free als Fallback
export const hasFeatureAccess = (userPlan, featureName) => {
  const plan = userPlan || PLANS.FREE;
  const access = FEATURE_ACCESS[featureName];
  
  if (!access) return false;
  return access[plan];
};

// Feature Level mit Payment Status
export const getFeatureLevel = (userPlan, paymentStatus, featureName) => {
  return checkFeatureAccess(userPlan, paymentStatus, featureName);
};

// Vollständiger Zugriff Check
export const hasFullFeatureAccess = (userPlan, paymentStatus, featureName) => {
  const level = checkFeatureAccess(userPlan, paymentStatus, featureName);
  return level === true || level === 'unlimited' || level === 'advanced';
};

// Payment Status aus User Object extrahieren
export const getPaymentStatus = (user) => {
  if (!user) return PAYMENT_STATUS.NONE;
  
  const planId = user.premium_plan_id;
  const expiresAt = user.premium_expires_at;
  
  // Free hat keinen Payment Status
  if (!planId || planId === 'free') {
    return PAYMENT_STATUS.NONE;
  }
  
  // Trial gilt als ACTIVE
  if (user.trial_end_date) {
    const now = new Date();
    const trialEnd = new Date(user.trial_end_date);
    if (now < trialEnd) {
      return PAYMENT_STATUS.ACTIVE;
    }
  }
  
  // Premium/Pro: Prüfe Ablaufdatum
  if (expiresAt) {
    const now = new Date();
    const expires = new Date(expiresAt);
    
    if (expires > now) {
      return PAYMENT_STATUS.ACTIVE;
    } else {
      return PAYMENT_STATUS.EXPIRED;
    }
  }
  
  // Kein Ablaufdatum = permanente Lizenz = ACTIVE
  if (planId === 'premium' || planId === 'pro' || planId === 'ultimate' || planId === 'basic') {
    return PAYMENT_STATUS.ACTIVE;
  }
  
  return PAYMENT_STATUS.NONE;
};

// Nächsthöheren Plan ermitteln
export const getRequiredPlanForFeature = (featureName) => {
  const access = FEATURE_ACCESS[featureName];
  if (!access) return null;
  
  if (access[PLANS.PREMIUM] && access[PLANS.PREMIUM] !== false) {
    return PLANS.PREMIUM;
  }
  if (access[PLANS.PRO] && access[PLANS.PRO] !== false) {
    return PLANS.PRO;
  }
  return null;
};