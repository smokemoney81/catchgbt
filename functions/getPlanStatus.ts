import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    let user;
    try {
      user = await base44.auth.me();
    } catch (authError) {
      console.log('[getPlanStatus] User not authenticated:', authError.message);
    }

    // Alle Features sind jetzt kostenlos verfügbar
    const allFeatures = [
      'dashboard',
      'logbook',
      'ranking',
      'community',
      'profile',
      'settings',
      'weather_basic',
      'arcade',
      'gear_basic',
      'weather_alerts_basic',
      'map_advanced',
      'rules',
      'trips',
      'ai_chat_standard',
      'ai_voice_standard',
      'licenses',
      'devices',
      'ai_chat_deluxe',
      'ai_voice_deluxe',
      'exam_prep',
      'ai_chat_deluxe_detailed',
      'ai_voice_deluxe_hd',
      'camera_analysis',
      'bite_detector',
      'ar_view',
      'water_analysis'
    ];

    const response = {
      ok: true,
      plan: {
        id: 'free',
        name: 'Kostenlos',
        price_eur: 0,
        is_active: true,
        expires_at: null,
        remaining_days: null,
        features: allFeatures
      }
    };

    console.log('[getPlanStatus] All features are now free:', response);

    return Response.json(response);
  } catch (error) {
    console.error('[getPlanStatus] Error:', error);
    
    const allFeatures = [
      'dashboard', 'logbook', 'ranking', 'community', 'profile', 'settings',
      'weather_basic', 'arcade', 'gear_basic', 'weather_alerts_basic',
      'map_advanced', 'rules', 'trips', 'ai_chat_standard', 'ai_voice_standard',
      'licenses', 'devices', 'ai_chat_deluxe', 'ai_voice_deluxe', 'exam_prep',
      'ai_chat_deluxe_detailed', 'ai_voice_deluxe_hd', 'camera_analysis',
      'bite_detector', 'ar_view', 'water_analysis'
    ];

    return Response.json({ 
      ok: true,
      plan: {
        id: 'free',
        name: 'Kostenlos',
        price_eur: 0,
        is_active: true,
        expires_at: null,
        remaining_days: null,
        features: allFeatures
      }
    });
  }
});