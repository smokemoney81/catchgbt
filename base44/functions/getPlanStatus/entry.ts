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
          name: 'Free',
          price_eur: 0,
          is_active: false,
          expires_at: null,
          remaining_days: null
        }
      });
    }

    // Alle Premium-Funktionen sind freigeschaltet: jeder Nutzer bekommt den hoechsten Plan.
    const planId = 'ultimate';
    const expiresAt = null;
    const isActive = true;
    const remainingDays = null;

    const planNames = {
      'free': 'Free',
      'basic': 'Basic',
      'pro': 'Pro',
      'elite': 'Elite',
      'ultimate': 'Ultimate'
    };

    const planPrices = {
      'free': 0,
      'basic': 4.99,
      'pro': 9.99,
      'elite': 19.99,
      'ultimate': 29.99
    };

    const response = {
      ok: true,
      plan: {
        id: planId,
        name: planNames[planId] || 'Free',
        price_eur: planPrices[planId] || 0,
        is_active: isActive,
        expires_at: expiresAt,
        remaining_days: remainingDays
      }
    };

    console.log('[getPlanStatus] User plan:', response);
    return Response.json(response);
    
  } catch (error) {
    console.error('[getPlanStatus] Error:', error);
    return Response.json({ 
      ok: true,
      plan: {
        id: 'free',
        name: 'Free',
        price_eur: 0,
        is_active: false,
        expires_at: null,
        remaining_days: null
      }
    });
  }
});