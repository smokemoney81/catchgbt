import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { feature_id } = body;
    
    if (!feature_id) {
      return Response.json({ error: 'feature_id required' }, { status: 400 });
    }

    const planId = user.premium_plan_id || 'free';
    const expiresAt = user.premium_expires_at;
    
    let isPlanActive = true;
    if (planId !== 'free' && expiresAt) {
      const now = new Date();
      const expires = new Date(expiresAt);
      isPlanActive = expires > now;
    }

    const effectivePlan = isPlanActive ? planId : 'free';
    
    const featureAccess = {
      'dashboard': ['free', 'basic', 'pro', 'ultimate'],
      'logbook': ['free', 'basic', 'pro', 'ultimate'],
      'ranking': ['free', 'basic', 'pro', 'ultimate'],
      'community': ['free', 'basic', 'pro', 'ultimate'],
      'profile': ['free', 'basic', 'pro', 'ultimate'],
      'settings': ['free', 'basic', 'pro', 'ultimate'],
      'weather_basic': ['free', 'basic', 'pro', 'ultimate'],
      'arcade': ['free', 'basic', 'pro', 'ultimate'],
      'gear': ['free', 'basic', 'pro', 'ultimate'],
      'weather_alerts_basic': ['free', 'basic', 'pro', 'ultimate'],
      
      'map_advanced': ['basic', 'pro', 'ultimate'],
      'rules': ['basic', 'pro', 'ultimate'],
      'trips': ['basic', 'pro', 'ultimate'],
      'ai_chat_standard': ['basic', 'pro', 'ultimate'],
      'ai_voice_standard': ['basic', 'pro', 'ultimate'],
      
      'licenses': ['pro', 'ultimate'],
      'devices': ['pro', 'ultimate'],
      'ai_chat_deluxe': ['pro', 'ultimate'],
      'ai_voice_deluxe': ['pro', 'ultimate'],
      'exam_prep': ['pro', 'ultimate'],
      
      'ai_chat_deluxe_detailed': ['ultimate'],
      'ai_voice_deluxe_hd': ['ultimate'],
      'camera_analysis': ['ultimate'],
      'bite_detector': ['ultimate'],
      'ar_view': ['ultimate']
    };

    const allowedPlans = featureAccess[feature_id] || [];
    const hasAccess = allowedPlans.includes(effectivePlan);
    
    const requiredPlanName = hasAccess ? effectivePlan : getMinimumRequiredPlan(feature_id);

    return Response.json({
      ok: true,
      has_access: hasAccess,
      current_plan: effectivePlan,
      feature_id: feature_id,
      required_plan_name: requiredPlanName
    });

  } catch (error) {
    console.error('Check Feature Access Error:', error);
    return Response.json({ 
      ok: false,
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});

function getMinimumRequiredPlan(featureId) {
  const featurePlanMap = {
    'map_advanced': 'Basic',
    'rules': 'Basic',
    'trips': 'Basic',
    'ai_chat_standard': 'Basic',
    'ai_voice_standard': 'Basic',
    
    'licenses': 'Pro',
    'devices': 'Pro',
    'ai_chat_deluxe': 'Pro',
    'ai_voice_deluxe': 'Pro',
    'exam_prep': 'Pro',
    
    'ai_chat_deluxe_detailed': 'Ultimate',
    'ai_voice_deluxe_hd': 'Ultimate',
    'camera_analysis': 'Ultimate',
    'bite_detector': 'Ultimate',
    'ar_view': 'Ultimate'
  };
  
  return featurePlanMap[featureId] || 'Free';
}