// Feature-Flags System für CATCHGBT
// Definiert Zugriff basierend auf Free/Premium/Pro

export const PLANS = {
  FREE: 'free',
  PREMIUM: 'premium',
  PRO: 'pro'
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

// Prüft ob User Zugriff auf Feature hat
export const hasFeatureAccess = (userPlan, featureName) => {
  const plan = userPlan || PLANS.FREE;
  const access = FEATURE_ACCESS[featureName];
  
  if (!access) return false;
  
  return access[plan];
};

// Gibt Feature Level zurück (false, 'basic', 'advanced', 'limited', 'unlimited', true)
export const getFeatureLevel = (userPlan, featureName) => {
  return hasFeatureAccess(userPlan, featureName);
};

// Prüft ob Feature vollständig freigeschaltet ist
export const hasFullFeatureAccess = (userPlan, featureName) => {
  const level = getFeatureLevel(userPlan, featureName);
  return level === true || level === 'unlimited' || level === 'advanced';
};

// Gibt nächsthöheren Plan zurück der Feature freischaltet
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