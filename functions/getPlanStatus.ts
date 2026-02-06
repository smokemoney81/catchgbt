import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    let user;
    try {
      user = await base44.auth.me();
    } catch (authError) {
      console.log('[getPlanStatus] User not authenticated:', authError.message);
      return Response.json({ 
        ok: true,
        plan: {
          id: 'free',
          name: 'Kostenlos',
          price_eur: 0,
          is_active: true,
          expires_at: null,
          remaining_days: null,
          features: getPlanFeatures('free')
        }
      });
    }
    
    if (!user) {
      return Response.json({ 
        ok: true,
        plan: {
          id: 'free',
          name: 'Kostenlos',
          price_eur: 0,
          is_active: true,
          expires_at: null,
          remaining_days: null,
          features: getPlanFeatures('free')
        }
      });
    }

    console.log('[getPlanStatus] User:', user.email);
    console.log('[getPlanStatus] User plan_id:', user.premium_plan_id);
    console.log('[getPlanStatus] User expires_at:', user.premium_expires_at);
    console.log('[getPlanStatus] User trial_end_date:', user.trial_end_date);
    console.log('[getPlanStatus] User has_had_trial:', user.has_had_trial);

    const planId = user.premium_plan_id || 'free';
    const expiresAt = user.premium_expires_at;
    
    let isActive = true;
    let remainingDays = null;
    
    if (planId !== 'free') {
      if (expiresAt) {
        const now = new Date();
        const expires = new Date(expiresAt);
        isActive = expires > now;
        
        if (isActive) {
          const diff = expires - now;
          remainingDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
        }
        
        console.log('[getPlanStatus] Plan with expiry:', planId, 'isActive:', isActive, 'remainingDays:', remainingDays);
      } else {
        isActive = true;
        console.log('[getPlanStatus] Plan without expiry (permanent):', planId);
      }
      
      if (isActive) {
        const response = {
          ok: true,
          plan: {
            id: planId,
            name: getPlanName(planId),
            price_eur: getPlanPrice(planId),
            is_active: true,
            expires_at: expiresAt,
            remaining_days: remainingDays,
            features: getPlanFeatures(planId)
          }
        };

        console.log('[getPlanStatus] Returning active premium plan:', response);
        return Response.json(response);
      }
    }

    if (planId === 'free' || !isActive) {
      if (user.trial_end_date) {
        const now = new Date();
        const trialEnd = new Date(user.trial_end_date);
        
        if (now < trialEnd) {
          const diff = trialEnd - now;
          const remainingHours = Math.ceil(diff / (1000 * 60 * 60));
          
          return Response.json({
            ok: true,
            plan: {
              id: 'trial',
              name: 'Testphase',
              price_eur: 0,
              is_active: true,
              expires_at: user.trial_end_date,
              remaining_days: Math.ceil(remainingHours / 24),
              remaining_hours: remainingHours,
              features: getPlanFeatures('ultimate')
            }
          });
        }
      }
      
      if (!user.has_had_trial) {
        const now = new Date();
        const trialEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        try {
          await base44.asServiceRole.entities.User.update(user.id, {
            trial_start_date: now.toISOString(),
            trial_end_date: trialEnd.toISOString(),
            has_had_trial: true
          });
          
          console.log('[getPlanStatus] Testphase aktiviert für:', user.email);
          
          return Response.json({
            ok: true,
            plan: {
              id: 'trial',
              name: 'Testphase',
              price_eur: 0,
              is_active: true,
              expires_at: trialEnd.toISOString(),
              remaining_days: 1,
              remaining_hours: 24,
              features: getPlanFeatures('ultimate')
            }
          });
        } catch (updateError) {
          console.error('[getPlanStatus] Fehler beim Aktivieren der Testphase:', updateError);
        }
      }
    }

    const response = {
      ok: true,
      plan: {
        id: 'free',
        name: 'Kostenlos',
        price_eur: 0,
        is_active: true,
        expires_at: null,
        remaining_days: null,
        features: getPlanFeatures('free')
      }
    };

    console.log('[getPlanStatus] Fallback to free plan:', response);

    return Response.json(response);
  } catch (error) {
    console.error('[getPlanStatus] Error:', error);
    return Response.json({ 
      ok: true,
      plan: {
        id: 'free',
        name: 'Kostenlos',
        price_eur: 0,
        is_active: true,
        expires_at: null,
        remaining_days: null,
        features: getPlanFeatures('free')
      }
    });
  }
});

function getPlanName(planId) {
  const names = {
    free: 'Kostenlos',
    basic: 'Basic',
    pro: 'Pro',
    ultimate: 'Ultimate',
    trial: 'Testphase'
  };
  return names[planId] || 'Kostenlos';
}

function getPlanPrice(planId) {
  const prices = {
    free: 0,
    basic: 10,
    pro: 19,
    ultimate: 29,
    trial: 0
  };
  return prices[planId] || 0;
}

function getPlanFeatures(planId) {
  const allFeatures = {
    free: [
      'dashboard',
      'logbook',
      'ranking',
      'community',
      'profile',
      'settings',
      'weather_basic',
      'arcade',
      'gear_basic',
      'weather_alerts_basic'
    ],
    basic: [
      'map_advanced',
      'rules',
      'trips',
      'ai_chat_standard',
      'ai_voice_standard'
    ],
    pro: [
      'licenses',
      'devices',
      'ai_chat_deluxe',
      'ai_voice_deluxe',
      'exam_prep'
    ],
    ultimate: [
      'ai_chat_deluxe_detailed',
      'ai_voice_deluxe_hd',
      'camera_analysis',
      'bite_detector',
      'ar_view',
      'water_analysis'
    ]
  };
  
  const hierarchy = ['free', 'basic', 'pro', 'ultimate'];
  const planIndex = hierarchy.indexOf(planId === 'trial' ? 'ultimate' : planId);
  
  let features = [];
  for (let i = 0; i <= planIndex && i < hierarchy.length; i++) {
    features = [...features, ...allFeatures[hierarchy[i]]];
  }
  
  return features;
}