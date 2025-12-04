import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      console.error('[activatePlan] No user authenticated');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[activatePlan] User:', user.email);

    const body = await req.json();
    const { plan_id, payment_method, transaction_id } = body;

    console.log('[activatePlan] Request:', { plan_id, payment_method, transaction_id });

    // Validiere Plan-ID
    const validPlans = ['free', 'basic', 'pro', 'ultimate'];
    if (!validPlans.includes(plan_id)) {
      console.error('[activatePlan] Invalid plan_id:', plan_id);
      return Response.json({ 
        ok: false,
        error: 'Ungültiger Plan' 
      }, { status: 400 });
    }

    // Berechne Ablaufdatum (30 Tage ab jetzt)
    let expiresAt = null;
    if (plan_id !== 'free') {
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      expiresAt = expires.toISOString();
    }

    console.log('[activatePlan] Activating plan:', plan_id, 'expires:', expiresAt);

    // Aktiviere Plan für den aktuellen User
    const updateData = {
      premium_plan_id: plan_id,
      premium_expires_at: expiresAt
    };

    console.log('[activatePlan] Updating user with:', updateData);

    await base44.auth.updateMe(updateData);

    console.log('[activatePlan] ✅ Plan activated successfully');

    return Response.json({
      ok: true,
      message: `${getPlanName(plan_id)} Plan erfolgreich aktiviert!`,
      plan: {
        id: plan_id,
        expires_at: expiresAt,
        duration_days: 30
      }
    });
  } catch (error) {
    console.error('[activatePlan] ❌ Error:', error);
    console.error('[activatePlan] Stack:', error.stack);
    return Response.json({ 
      ok: false,
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});

function getPlanName(planId) {
  const names = {
    free: 'Kostenlos',
    basic: 'Basic',
    pro: 'Pro',
    ultimate: 'Ultimate'
  };
  return names[planId] || 'Kostenlos';
}