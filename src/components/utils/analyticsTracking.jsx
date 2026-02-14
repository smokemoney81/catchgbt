// Analytics-Tracking System für CATCHGBT
// DSGVO-konform, anonymisiert, Opt-in

import { base44 } from "@/api/base44Client";

// Event-Kategorien
export const EVENT_CATEGORIES = {
  FEATURE_USAGE: 'feature_usage',
  UPGRADE: 'upgrade',
  CONVERSION: 'conversion',
  ENGAGEMENT: 'engagement',
  CATCH: 'catch',
  SPOT: 'spot',
  COMPETITION: 'competition'
};

// Standard-Events
export const EVENTS = {
  // Feature Usage
  FEATURE_ACCESSED: 'feature_accessed',
  FEATURE_USED: 'feature_used',
  FEATURE_LOCKED_CLICKED: 'feature_locked_clicked',
  
  // Upgrade Flow
  UPGRADE_PROMPT_SHOWN: 'upgrade_prompt_shown',
  UPGRADE_PROMPT_CLICKED: 'upgrade_prompt_clicked',
  UPGRADE_PROMPT_DISMISSED: 'upgrade_prompt_dismissed',
  UPGRADE_STARTED: 'upgrade_started',
  UPGRADE_COMPLETED: 'upgrade_completed',
  
  // Conversion
  TRIAL_STARTED: 'trial_started',
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  
  // Engagement
  APP_OPENED: 'app_opened',
  PAGE_VIEWED: 'page_viewed',
  SESSION_DURATION: 'session_duration',
  
  // Catches
  CATCH_LOGGED: 'catch_logged',
  CATCH_PHOTO_UPLOADED: 'catch_photo_uploaded',
  CATCH_AI_ANALYZED: 'catch_ai_analyzed',
  
  // Spots
  SPOT_CREATED: 'spot_created',
  SPOT_VIEWED: 'spot_viewed',
  HEATMAP_VIEWED: 'heatmap_viewed',
  
  // Competitions
  COMPETITION_JOINED: 'competition_joined',
  COMPETITION_COMPLETED: 'competition_completed'
};

// Prüft ob User Tracking erlaubt hat
const hasTrackingConsent = async () => {
  try {
    const user = await base44.auth.me();
    return user?.settings?.analytics_enabled !== false;
  } catch {
    return false;
  }
};

// Trackt Event
export const trackEvent = async (eventName, properties = {}) => {
  try {
    const hasConsent = await hasTrackingConsent();
    if (!hasConsent) {
      return;
    }
    
    const user = await base44.auth.me();
    const planId = user?.premium_plan_id || 'free';
    
    await base44.analytics.track({
      eventName,
      properties: {
        ...properties,
        plan: planId,
        timestamp: new Date().toISOString(),
        app_version: '1.0.0'
      }
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Feature Usage Tracking
export const trackFeatureUsage = async (featureName, action = 'used') => {
  await trackEvent(EVENTS.FEATURE_USED, {
    category: EVENT_CATEGORIES.FEATURE_USAGE,
    feature: featureName,
    action
  });
};

// Upgrade Flow Tracking
export const trackUpgradePromptShown = async (targetPlan, reason, feature) => {
  await trackEvent(EVENTS.UPGRADE_PROMPT_SHOWN, {
    category: EVENT_CATEGORIES.UPGRADE,
    target_plan: targetPlan,
    reason,
    feature
  });
};

export const trackUpgradePromptClicked = async (targetPlan, reason) => {
  await trackEvent(EVENTS.UPGRADE_PROMPT_CLICKED, {
    category: EVENT_CATEGORIES.UPGRADE,
    target_plan: targetPlan,
    reason
  });
};

export const trackUpgradePromptDismissed = async (targetPlan, reason) => {
  await trackEvent(EVENTS.UPGRADE_PROMPT_DISMISSED, {
    category: EVENT_CATEGORIES.UPGRADE,
    target_plan: targetPlan,
    reason
  });
};

// Conversion Tracking
export const trackSubscriptionStarted = async (planId, price) => {
  await trackEvent(EVENTS.SUBSCRIPTION_STARTED, {
    category: EVENT_CATEGORIES.CONVERSION,
    plan_id: planId,
    price
  });
};

export const trackSubscriptionCompleted = async (planId, price) => {
  await trackEvent(EVENTS.UPGRADE_COMPLETED, {
    category: EVENT_CATEGORIES.CONVERSION,
    plan_id: planId,
    price
  });
};

// Engagement Tracking
export const trackPageView = async (pageName) => {
  await trackEvent(EVENTS.PAGE_VIEWED, {
    category: EVENT_CATEGORIES.ENGAGEMENT,
    page: pageName
  });
};

export const trackAppOpened = async () => {
  await trackEvent(EVENTS.APP_OPENED, {
    category: EVENT_CATEGORIES.ENGAGEMENT
  });
};

// Session Duration (call on app close/unmount)
export const trackSessionDuration = async (durationSeconds) => {
  await trackEvent(EVENTS.SESSION_DURATION, {
    category: EVENT_CATEGORIES.ENGAGEMENT,
    duration_seconds: durationSeconds
  });
};

// Catch Tracking
export const trackCatchLogged = async (species, hasPhoto, hasAI) => {
  await trackEvent(EVENTS.CATCH_LOGGED, {
    category: EVENT_CATEGORIES.CATCH,
    species,
    has_photo: hasPhoto,
    has_ai: hasAI
  });
};

// Competition Tracking
export const trackCompetitionJoined = async (competitionId, competitionType) => {
  await trackEvent(EVENTS.COMPETITION_JOINED, {
    category: EVENT_CATEGORIES.COMPETITION,
    competition_id: competitionId,
    competition_type: competitionType
  });
};