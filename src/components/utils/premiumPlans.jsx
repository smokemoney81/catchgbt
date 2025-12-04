// Hilfsfunktionen für Premium-Plan-Prüfungen

export const PLAN_HIERARCHY = {
  free: 0,
  basic: 1,
  pro: 2,
  ultimate: 3
};

export const PLAN_PRICES = {
  free: 0,
  basic: 10,
  pro: 19,
  ultimate: 29
};

export const PLAN_NAMES = {
  free: 'Kostenlos',
  basic: 'Basic',
  pro: 'Pro',
  ultimate: 'Ultimate'
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
    
    // Ultimate
    'camera_analysis': 'ultimate',
    'bite_detector': 'ultimate',
    'ai_chat_deluxe_detailed': 'ultimate'
  };
  
  return featureMap[featureId] || 'free';
}