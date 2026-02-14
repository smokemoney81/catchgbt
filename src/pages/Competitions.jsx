import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { checkFeatureAccess, getPaymentStatus, FEATURES, PAYMENT_STATUS } from "@/components/utils/featureFlags";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Lock, Crown, Loader2, Filter } from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import CompetitionCard from "@/components/competitions/CompetitionCard";
import CompetitionDetails from "@/components/competitions/CompetitionDetails";

export default function Competitions() {
  const [user, setUser] = useState(null);
  const [competitions, setCompetitions] = useState([]);
  const [myParticipations, setMyParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState('all');
  const [hasBasicAccess, setHasBasicAccess] = useState(false);
  const [hasProAccess, setHasProAccess] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(PAYMENT_STATUS.NONE);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const planId = currentUser?.premium_plan_id || 'free';
      const status = getPaymentStatus(currentUser);
      setPaymentStatus(status);

      const basicAccess = checkFeatureAccess(planId, status, FEATURES.COMPETITIONS);
      const proAccess = checkFeatureAccess(planId, status, FEATURES.PREMIUM_COMPETITIONS);
      
      setHasBasicAccess(basicAccess !== false);
      setHasProAccess(proAccess !== false);

      if (!basicAccess) {
        setLoading(false);
        return;
      }

      const allCompetitions = await base44.entities.Competition.list('-created_date');
      setCompetitions(allCompetitions);

      const participations = await base44.entities.CompetitionParticipant.filter({
        user_id: currentUser.email
      });
      setMyParticipations(participations);
    } catch (error) {
      console.error('Error loading competitions:', error);
      toast.error('Fehler beim Laden der Wettbewerbe');
    }
    setLoading(false);
  };

  const handleJoin = async (competition) => {
    if (!user) {
      toast.error('Bitte melde dich an');
      return;
    }

    const isPremium = competition.competition_type === 'premium';
    
    if (isPremium && !hasProAccess) {
      toast.error('Nur für Pro-Benutzer verfügbar');
      return;
    }

    if (paymentStatus !== PAYMENT_STATUS.ACTIVE && user.premium_plan_id !== 'free') {
      toast.error('Zahlung abgelaufen - Plan erneuern');
      return;
    }

    if (competition.max_participants && competition.participant_count >= competition.max_participants) {
      toast.error('Wettbewerb ist voll');
      return;
    }

    try {
      await base44.entities.CompetitionParticipant.create({
        competition_id: competition.id,
        user_id: user.email,
        joined_at: new Date().toISOString()
      });

      await base44.entities.Competition.update(competition.id, {
        participant_count: (competition.participant_count || 0) + 1
      });

      toast.success('Erfolgreich angemeldet');
      loadData();
    } catch (error) {
      console.error('Error joining competition:', error);
      toast.error('Fehler beim Anmelden');
    }
  };

  const filteredCompetitions = competitions.filter(comp => {
    if (filter === 'active') return comp.status === 'active';
    if (filter === 'upcoming') return comp.status === 'upcoming';
    if (filter === 'my') return myParticipations.some(p => p.competition_id === comp.id);
    if (filter === 'premium') return comp.competition_type === 'premium';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Lade Wettbewerbe...</span>
        </div>
      </div>
    );
  }

  if (!hasBasicAccess) {
    return (
      <div className="min-h-screen bg-gray-950 p-6 flex items-center justify-center">
        <Card className="glass-morphism border-amber-600/50 bg-gradient-to-br from-amber-500/10 to-orange-500/10 max-w-md">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex items-center justify-center gap-2 text-amber-400">
              <Trophy className="w-10 h-10" />
              <Lock className="w-8 h-8" />
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-white mb-2">Premium Feature</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Wettbewerbe sind nur für Premium-Nutzer verfügbar.
              </p>
            </div>

            {paymentStatus !== PAYMENT_STATUS.ACTIVE && user?.premium_plan_id !== 'free' && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3">
                <p className="text-red-300 text-xs font-semibold">Zahlung abgelaufen</p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = createPageUrl('PremiumPlans')}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                size="lg"
              >
                <Crown className="w-5 h-5 mr-2" />
                Jetzt upgraden
              </Button>
              
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="w-full"
              >
                Zurück
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6 pb-32">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Wettbewerbe</h1>
              <p className="text-gray-400 text-sm mt-1">
                Tritt an und zeig dein Können
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            Alle
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
            size="sm"
          >
            Aktiv
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setFilter('upcoming')}
            size="sm"
          >
            Bald
          </Button>
          <Button
            variant={filter === 'my' ? 'default' : 'outline'}
            onClick={() => setFilter('my')}
            size="sm"
          >
            Meine
          </Button>
          {hasProAccess && (
            <Button
              variant={filter === 'premium' ? 'default' : 'outline'}
              onClick={() => setFilter('premium')}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Crown className="w-4 h-4 mr-1" />
              Pro
            </Button>
          )}
        </div>

        {filteredCompetitions.length === 0 ? (
          <Card className="glass-morphism border-gray-800">
            <CardContent className="p-12 text-center">
              <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Keine Wettbewerbe gefunden</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCompetitions.map(competition => {
              const isPremium = competition.competition_type === 'premium';
              const hasAccess = isPremium ? hasProAccess : hasBasicAccess;
              const isParticipating = myParticipations.some(p => p.competition_id === competition.id);

              return (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                  onView={(comp) => {
                    setSelectedCompetition(comp);
                    setShowDetails(true);
                  }}
                  onJoin={handleJoin}
                  userPlan={user?.premium_plan_id || 'free'}
                  hasAccess={hasAccess}
                  isParticipating={isParticipating}
                />
              );
            })}
          </div>
        )}
      </div>

      <CompetitionDetails
        competition={selectedCompetition}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onJoin={handleJoin}
        isParticipating={myParticipations.some(p => p.competition_id === selectedCompetition?.id)}
      />
    </div>
  );
}