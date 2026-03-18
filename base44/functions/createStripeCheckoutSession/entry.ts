import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Stripe from 'npm:stripe@14.11.0';

Deno.serve(async (req) => {
  try {
    console.log('[Stripe] === START Checkout Session ===');
    
    // 1. Prüfe Stripe Secret Key
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('[Stripe] ❌ STRIPE_SECRET_KEY nicht gesetzt!');
      return Response.json({ 
        error: 'Stripe-Konfiguration fehlt. Bitte kontaktiere den Support.',
        debug: 'STRIPE_SECRET_KEY missing'
      }, { status: 500 });
    }
    console.log('[Stripe] ✅ Secret Key gefunden');

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    // 2. User authentifizieren
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      console.error('[Stripe] ❌ Kein User authentifiziert');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('[Stripe] ✅ User:', user.email);

    // 3. Request Body parsen
    const body = await req.json();
    const { plan_id } = body;
    console.log('[Stripe] Plan ID:', plan_id);

    // 4. Validiere Plan
    const PLAN_PRICES = {
      basic: 1000,    // 10.00 EUR
      pro: 1900,      // 19.00 EUR
      ultimate: 2900  // 29.00 EUR
    };

    if (!['basic', 'pro', 'ultimate'].includes(plan_id)) {
      console.error('[Stripe] ❌ Ungültiger Plan:', plan_id);
      return Response.json({ 
        error: 'Ungültiger Plan' 
      }, { status: 400 });
    }
    console.log('[Stripe] ✅ Plan gültig:', plan_id);

    // 5. App-URL ermitteln
    const appUrl = new URL(req.url).origin;
    const appId = Deno.env.get('BASE44_APP_ID') || '68bb3d3b9f83dc1f55ef532b';
    
    const successUrl = `${appUrl}/apps/${appId}/PremiumPlans?session_id={CHECKOUT_SESSION_ID}&success=true&plan_id=${plan_id}`;
    const cancelUrl = `${appUrl}/apps/${appId}/PremiumPlans?canceled=true`;
    
    console.log('[Stripe] Success URL:', successUrl);
    console.log('[Stripe] Cancel URL:', cancelUrl);

    // 6. Erstelle Stripe Checkout Session
    console.log('[Stripe] Erstelle Session...');
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'sepa_debit'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `CatchGBT ${getPlanName(plan_id)} Plan`,
              description: `Monatliches Abo für ${getPlanName(plan_id)} Plan mit allen Features`,
              images: ['https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bb3d3b9f83dc1f55ef532b/e9d6eda08_icon_512.png'],
            },
            unit_amount: PLAN_PRICES[plan_id],
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        plan_id: plan_id,
        app_id: appId
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    console.log('[Stripe] ✅ Session erstellt:', session.id);
    console.log('[Stripe] Checkout URL:', session.url);
    console.log('[Stripe] === END Checkout Session ===');

    return Response.json({
      ok: true,
      checkout_url: session.url,
      session_id: session.id
    });

  } catch (error) {
    console.error('[Stripe] ❌ FEHLER:', error.message);
    console.error('[Stripe] Stack:', error.stack);
    console.error('[Stripe] Type:', error.type);
    console.error('[Stripe] Code:', error.code);
    
    return Response.json({ 
      error: error.message || 'Fehler beim Erstellen der Checkout-Session',
      debug: {
        type: error.type,
        code: error.code,
        message: error.message
      }
    }, { status: 500 });
  }
});

function getPlanName(planId) {
  const names = {
    basic: 'Basic',
    pro: 'Pro',
    ultimate: 'Ultimate'
  };
  return names[planId] || 'Basic';
}