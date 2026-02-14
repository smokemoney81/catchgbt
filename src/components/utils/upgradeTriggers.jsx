// Upgrade-Trigger System für CATCHGBT
// Trackt Feature-Nutzung und zeigt kontextbezogene Upgrade-Prompts

import { base44 } from "@/api/base44Client";

// Trigger-Typen
export const TRIGGER_TYPES = {
  FEATURE_CLICK: 'feature_click',
  USAGE_LIMIT: 'usage_limit',
  SUCCESS_MILESTONE: 'success_milestone',
  ENGAGEMENT: 'engagement'
};

// Upgrade-Trigger Definitionen
const UPGRADE_TRIGGERS = {
  // FREE → PREMIUM
  free_to_premium: {
    triggers: [
      { type: TRIGGER_TYPES.FEATURE_CLICK, feature: 'biteAI', count: 1 },
      { type: TRIGGER_TYPES.FEATURE_CLICK, feature: 'heatmaps', count: 1 },
      { type: TRIGGER_TYPES.FEATURE_CLICK, feature: 'competitions', count: 1 },
      { type: TRIGGER_TYPES.SUCCESS_MILESTONE, metric: 'catches', count: 5 },
      { type: TRIGGER_TYPES.USAGE_LIMIT, feature: 'aiChat', limit: 10 }
    ],
    targetPlan: 'premium'
  },
  
  // PREMIUM → PRO
  premium_to_pro: {
    triggers: [
      { type: TRIGGER_TYPES.FEATURE_CLICK, feature: 'arWater', count: 1 },
      { type: TRIGGER_TYPES.FEATURE_CLICK, feature: 'satelliteAI', count: 1 },
      { type: TRIGGER_TYPES.FEATURE_CLICK, feature: 'deviceIntegration', count: 1 },
      { type: TRIGGER_TYPES.FEATURE_CLICK, feature: 'premiumCompetitions', count: 1 },
      { type: TRIGGER_TYPES.SUCCESS_MILESTONE, metric: 'catches', count: 20 },
      { type: TRIGGER_TYPES.ENGAGEMENT, metric: 'daysActive', count: 7 }
    ],
    targetPlan: 'pro'
  }
};

// Trackt Feature-Klick und prüft ob Upgrade-Prompt gezeigt werden soll
export const trackFeatureClick = async (featureName, userPlan) => {
  try {
    const user = await base44.auth.me();
    if (!user) return { showUpgrade: false };
    
    // Analytics Event
    await base44.analytics.track({
      eventName: 'feature_click_locked',
      properties: {
        feature: featureName,
        current_plan: userPlan || 'free',
        timestamp: new Date().toISOString()
      }
    });
    
    // Trigger-Check
    const triggerKey = userPlan === 'free' ? 'free_to_premium' : 'premium_to_pro';
    const triggers = UPGRADE_TRIGGERS[triggerKey];
    
    const matchingTrigger = triggers.triggers.find(
      t => t.type === TRIGGER_TYPES.FEATURE_CLICK && t.feature === featureName
    );
    
    if (matchingTrigger) {
      return {
        showUpgrade: true,
        targetPlan: triggers.targetPlan,
        reason: 'feature_locked',
        feature: featureName
      };
    }
    
    return { showUpgrade: false };
  } catch (error) {
    console.error('Error tracking feature click:', error);
    return { showUpgrade: false };
  }
};

// Trackt Erfolgs-Meilenstein (z.B. 5 Fänge)
export const trackSuccessMilestone = async (metric, count, userPlan) => {
  try {
    await base44.analytics.track({
      eventName: 'success_milestone',
      properties: {
        metric,
        count,
        current_plan: userPlan || 'free',
        timestamp: new Date().toISOString()
      }
    });
    
    const triggerKey = userPlan === 'free' ? 'free_to_premium' : 'premium_to_pro';
    const triggers = UPGRADE_TRIGGERS[triggerKey];
    
    const matchingTrigger = triggers.triggers.find(
      t => t.type === TRIGGER_TYPES.SUCCESS_MILESTONE && 
           t.metric === metric && 
           count >= t.count
    );
    
    if (matchingTrigger) {
      return {
        showUpgrade: true,
        targetPlan: triggers.targetPlan,
        reason: 'milestone_reached',
        metric,
        count
      };
    }
    
    return { showUpgrade: false };
  } catch (error) {
    console.error('Error tracking milestone:', error);
    return { showUpgrade: false };
  }
};

// Prüft Usage Limit
export const checkUsageLimit = async (feature, currentUsage, userPlan) => {
  try {
    const triggerKey = userPlan === 'free' ? 'free_to_premium' : 'premium_to_pro';
    const triggers = UPGRADE_TRIGGERS[triggerKey];
    
    const matchingTrigger = triggers.triggers.find(
      t => t.type === TRIGGER_TYPES.USAGE_LIMIT && 
           t.feature === feature
    );
    
    if (matchingTrigger && currentUsage >= matchingTrigger.limit) {
      await base44.analytics.track({
        eventName: 'usage_limit_reached',
        properties: {
          feature,
          limit: matchingTrigger.limit,
          current_plan: userPlan || 'free',
          timestamp: new Date().toISOString()
        }
      });
      
      return {
        showUpgrade: true,
        targetPlan: triggers.targetPlan,
        reason: 'limit_reached',
        feature,
        limit: matchingTrigger.limit
      };
    }
    
    return { showUpgrade: false };
  } catch (error) {
    console.error('Error checking usage limit:', error);
    return { showUpgrade: false };
  }
};

// Gibt personalisierten Upgrade-Text zurück
export const getUpgradeMessage = (trigger) => {
  const messages = {
    feature_locked: {
      premium: {
        biteAI: 'Schalte die KI-Bisszeit-Analyse mit Premium frei',
        heatmaps: 'Entdecke Hotspots mit Premium Heatmaps',
        competitions: 'Nimm an Premium-Wettbewerben teil'
      },
      pro: {
        arWater: 'Erlebe AR-Gewasser-Visualisierung mit Pro',
        satelliteAI: 'Nutze Satelliten-KI-Analyse mit Pro',
        deviceIntegration: 'Verbinde deine Gerate mit Pro',
        premiumCompetitions: 'Steige in die PRO-Liga auf'
      }
    },
    milestone_reached: {
      premium: 'Gluckwunsch zu deinen Erfolgen - Premium schaltet noch mehr frei',
      pro: 'Du bist bereit fur Pro - dominiere mit Profi-Tools'
    },
    limit_reached: {
      premium: 'Tageslimit erreicht - Premium gibt dir mehr',
      pro: 'Upgrade zu Pro fur unbegrenzte Nutzung'
    }
  };
  
  const { reason, targetPlan, feature } = trigger;
  
  if (reason === 'feature_locked' && messages[reason][targetPlan][feature]) {
    return messages[reason][targetPlan][feature];
  }
  
  return messages[reason]?.[targetPlan] || 'Upgrade fur mehr Features';
};