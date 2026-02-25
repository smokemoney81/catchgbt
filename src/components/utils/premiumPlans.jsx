// Hilfsfunktionen für Premium-Plan-Prüfungen

export const PLAN_HIERARCHY = {
  free: 0,
  basic: 1,
  pro: 2,
  elite: 3
};

export const PLAN_PRICES = {
  free: 0,
  basic: 4.99,
  pro: 9.99,
  elite: 19.99
};

export const PLAN_NAMES = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro',
  elite: 'Elite'
};

/**
 * Prüft ob der Benutzer Zugriff auf ein Feature hat
 */
export function hasFeatureAccess(userPlan, requiredPlan) {
  const userLevel = PLAN_HIERARCHY[userPlan] || 0;
  const requiredLevel = PLAN_HIERARCHY[requiredPlan] || 0;
  return userLevel >= requiredLevel;
}

/**
 * Gibt den minimalen Plan zurück, der für ein Feature benötigt wird
 */
export function getRequiredPlan(featureId) {
  const featureMap = {
    // Free
    'dashboard': 'free',
    'logbook': 'free',
    'ranking': 'free',
    'community': 'free',
    
    // Basic
    'map_advanced': 'basic',
    'rules': 'basic',
    'trips': 'basic',
    'ai_chat_standard': 'basic',
    
    // Pro
    'licenses': 'pro',
    'devices': 'pro',
    'ai_chat_deluxe': 'pro',
    'exam_prep': 'pro',
    
    // Elite
    'camera_analysis': 'elite',
    'bite_detector': 'elite',
    'ai_chat_deluxe_detailed': 'elite',
    'ar_full': 'elite',
    'shop_full': 'elite'
  };
  
  return featureMap[featureId] || 'free';
}