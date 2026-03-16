import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Star, Sparkles, Mail, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";


export default function PremiumPlans() {
  const [user, setUser] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);

  useEffect(() => {
    loadData();
    
    // Check for successful payment redirect
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const planId = urlParams.get('plan_id');
    const sessionId = urlParams.get('session_id');
    
    if (success === 'true' && planId && sessionId) {
      handleStripeSuccess(planId, sessionId);
    }
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      console.log('[PremiumPlans] Current user:', currentUser.email);

      const planStatusResponse = await base44.functions.invoke('getPlanStatus');
      console.log('[PremiumPlans] Plan status response:', planStatusResponse.data);
      
      if (planStatusResponse.data && planStatusResponse.data.plan) {
        setCurrentPlan(planStatusResponse.data.plan);
      } else {
        setCurrentPlan({ id: 'free', name: 'Kostenlos' });
      }
    } catch (error) {
      console.error("[PremiumPlans] Fehler beim Laden:", error);
      setCurrentPlan({ id: 'free', name: 'Kostenlos' }); 
    }
    setLoading(false);
  };

  const handleStripeSuccess = async (planId, sessionId) => {
    try {
      toast.info('Aktiviere deinen Premium-Plan...');
      console.log('[PremiumPlans] Activating plan:', planId, sessionId);
      
      const response = await base44.functions.invoke('activatePlan', {
        plan_id: planId,
        payment_method: 'stripe',
        transaction_id: sessionId
      });

      console.log('[PremiumPlans] Activation response:', response.data);

      toast.success('Premium-Plan aktiviert', {
        description: 'Dein Plan wurde erfolgreich aktiviert'
      });

      // Reload data
      await loadData();
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('[PremiumPlans] Plan activation error:', error);
      toast.error('Fehler bei der Aktivierung', {
        description: error.message || 'Bitte kontaktiere den Support'
      });
    }
  };

  const handleStripeCheckout = async (planId) => {
    try {
      setProcessingPlan(planId);
      
      console.log('[Frontend] Starting Stripe checkout for plan:', planId);
      
      toast.info('Erstelle Checkout-Session...', {
        duration: 2000
      });
      
      const response = await base44.functions.invoke('createStripeCheckoutSession', {
        plan_id: planId
      });

      console.log('[Frontend] Stripe response:', response);
      console.log('[Frontend] Response data:', response.data);

      // Prüfe auf Fehler
      if (response.data?.error) {
        console.error('[Frontend] Stripe Error:', response.data.error);
        console.error('[Frontend] Debug Info:', response.data.debug);
        
        toast.error('Stripe Fehler', {
          description: response.data.error,
          duration: 5000
        });
        setProcessingPlan(null);
        return;
      }

      // Prüfe checkout_url
      if (!response.data?.checkout_url) {
        console.error('[Frontend] Keine checkout_url in Response:', response.data);
        
        toast.error('Fehler beim Checkout', {
          description: 'Keine Checkout-URL erhalten. Bitte versuche es erneut.',
          duration: 5000
        });
        setProcessingPlan(null);
        return;
      }

      console.log('[Frontend] Redirecting to:', response.data.checkout_url);
      
      toast.success('Weiterleitung zu Stripe...', {
        duration: 1000
      });
      
      // Redirect nach kurzer Verzögerung
      setTimeout(() => {
        window.location.href = response.data.checkout_url;
      }, 500);

    } catch (error) {
      console.error('[Frontend] Exception:', error);
      console.error('[Frontend] Stack:', error.stack);
      
      toast.error('Fehler beim Checkout', {
        description: error.message || 'Unbekannter Fehler',
        duration: 5000
      });
      setProcessingPlan(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      icon: Check,
      color: 'from-gray-600 to-gray-700',
      description: 'Alles Wichtige zum Einstieg',
      features: [
        'Digitales Fangbuch (unbegrenzt)',
        'KI-Foto-Analyse (3x pro Monat)',
        'Interaktive Karte mit Community-Spots',
        'Wetter aktuell + 1 Tag',
        'Schonzeiten & Mindestmasse',
        'Angelschein-Pruefungsvorbereitung',
        'Tutorials & Knotentechniken',
        'Offline-Fangbuch'
      ]
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 4.99,
      icon: Zap,
      color: 'from-blue-600 to-cyan-600',
      description: 'Mehr KI, mehr Daten',
      popular: false,
      features: [
        'Alles aus Free',
        'KI-Foto-Analyse (unbegrenzt)',
        'KI-Buddy Chat (unbegrenzt)',
        'Wetter 5 Tage + Wetter-Alarme',
        'Eigene Spots speichern (unbegrenzt)',
        'KI-Koeder-Mischer',
        'Gewaesser-Wasseranalyse (Basis)',
        'Trip-Planer mit KI',
        'Fang-Statistiken & Filter'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9.99,
      icon: Star,
      color: 'from-purple-600 to-violet-600',
      description: 'Vollstaendige KI-Power',
      popular: true,
      features: [
        'Alles aus Basic',
        'Satelliten-Gewaesseranalyse (Echtdaten)',
        'KI-Fangprognosen & Hotspot-Erkennung',
        'AR-Gewaesser-Ansicht (3D)',
        'Tiefenkarten & Crowdsourcing-Daten',
        'Geraete-Integration (Bissanzeiger, Echolot)',
        'Voice Control: Hey Buddy',
        'Community-Ranking, Clans & Events',
        'Fang-Export (PDF & CSV)',
        'Digitale Lizenzverwaltung'
      ]
    },
    {
      id: 'elite',
      name: 'Ultimate',
      price: 19.99,
      icon: Crown,
      color: 'from-amber-500 to-orange-600',
      description: 'Profi-Angler Level',
      popular: false,
      features: [
        'Alles aus Pro',
        'Live-Bissanzeiger per Smartphone-Kamera',
        'KI-Kamera Echtzeit-Fischerkennung',
        'Individuelle Spot-Tiefenanalysen',
        'Profi-Statistiken: Zeitreihen & Trends',
        'Detaillierte KI-Trip-Berichte (Premium)',
        'Prioritaets-Synchronisation & Backup',
        'Exklusive Ultimate-Features & fruehzeitiger Zugang'
      ]
    },
    {
      id: 'friends',
      name: 'Freundschaft',
      price: 54.99,
      priceLabel: '54,99 / Jahr',
      icon: Sparkles,
      color: 'from-emerald-600 to-teal-600',
      description: 'Jahresplan mit Einladungen',
      popular: false,
      yearly: true,
      features: [
        'Alles aus Ultimate (12 Monate)',
        '3 Freundes-Einladungen inklusive (Basic)',
        'Gemeinsame Spot-Gruppen mit Freunden',
        'Geteilte Fangbuecher & Statistiken',
        'Freunde zu Clans & Events einladen',
        'Gruppen-Ranking & Team-Challenges',
        'Spar 20% gegenueber monatlichem Elite-Plan'
      ]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Lädt...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6 pb-32">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)] mb-4">
            Premium-Pläne
          </h1>
          <p className="text-gray-400 text-lg">
            Wähle den Plan, der am besten zu deinem Angel-Abenteuer passt
          </p>
          {currentPlan && currentPlan.id !== 'free' && (
            <div className="mt-4">
              <Badge className="bg-emerald-600 text-white">
                Aktueller Plan: {currentPlan.name}
                {currentPlan.remaining_days && ` - Noch ${currentPlan.remaining_days} Tage`}
              </Badge>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentPlan?.id === plan.id;
            const isProcessing = processingPlan === plan.id;

            return (
              <Card 
                key={plan.id}
                className={`glass-morphism relative overflow-hidden ${
                  isCurrentPlan ? 'border-emerald-500 border-2' : 'border-gray-800'
                } ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-purple-600 text-white">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Beliebt
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]">
                    {plan.name}
                  </CardTitle>
                  <p className="text-xs text-gray-400 mt-1">{plan.description}</p>
                  <CardDescription>
                    <div className="text-3xl font-bold text-white mt-2">
                      {plan.price === 0 ? 'Gratis' : `${plan.price}€`}
                      {plan.price > 0 && (
                        <span className="text-sm text-gray-400 font-normal">
                          {plan.yearly ? '/Jahr' : '/Monat'}
                        </span>
                      )}
                    </div>
                    {plan.yearly && (
                      <div className="mt-1">
                        <Badge className="bg-emerald-700 text-white text-xs">Jahresplan</Badge>
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <Button disabled className="w-full bg-emerald-600">
                      Aktiver Plan
                    </Button>
                  ) : plan.price === 0 ? (
                    <Button disabled className="w-full bg-gray-700">
                      Kostenlos nutzen
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleStripeCheckout(plan.id)}
                      disabled={isProcessing}
                      className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 flex items-center justify-center gap-2`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Weiterleitung...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          Mit Google Pay bezahlen
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center space-y-4">
          <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-2 flex items-center justify-center gap-2">
              <Mail className="w-5 h-5 text-cyan-400" />
              Fragen zu Premium?
            </h3>
            <p className="text-gray-400 mb-4">
              Kontaktiere uns per E-Mail für ein individuelles Angebot oder bei Fragen zu den Premium-Plänen.
            </p>
            <Button
              onClick={() => {
                window.location.href = `mailto:support@catchgbt.app?subject=Premium Anfrage&body=Hallo,%0D%0A%0D%0AIch interessiere mich für einen Premium-Plan.%0D%0A%0D%0AMeine E-Mail: ${user?.email || ''}`;
              }}
              variant="outline"
              className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
            >
              <Mail className="w-4 h-4 mr-2" />
              Support kontaktieren
            </Button>
          </div>
          
          <p className="text-gray-500 text-sm">
            Alle Preise verstehen sich pro Monat. Jederzeit kündbar.
          </p>
        </div>
      </div>
    </div>
  );
}