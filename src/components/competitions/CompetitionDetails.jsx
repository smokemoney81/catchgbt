import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Fish, Award, Users, Target, X } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function CompetitionDetails({ competition, isOpen, onClose, onJoin, isParticipating }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && competition) {
      loadLeaderboard();
    }
  }, [isOpen, competition]);

  const loadLeaderboard = async () => {
    if (!competition) return;
    
    setLoading(true);
    try {
      const participants = await base44.entities.CompetitionParticipant.filter(
        { competition_id: competition.id },
        '-total_score',
        10
      );
      setLeaderboard(participants);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
    setLoading(false);
  };

  if (!competition) return null;

  const isPremium = competition.competition_type === 'premium';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Trophy className={`w-6 h-6 ${isPremium ? 'text-purple-400' : 'text-cyan-400'}`} />
              {competition.title}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="flex gap-2">
            <Badge className={isPremium ? 'bg-purple-600' : 'bg-cyan-600'}>
              {competition.status === 'active' ? 'Aktiv' : competition.status === 'upcoming' ? 'Bald' : 'Beendet'}
            </Badge>
            {isPremium && <Badge className="bg-purple-600">Pro-Wettbewerb</Badge>}
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
            <p className="text-gray-300">{competition.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">Zeitraum</span>
              </div>
              <p className="text-sm text-gray-300">
                Start: {format(new Date(competition.start_date), 'dd.MM.yyyy HH:mm')}
              </p>
              <p className="text-sm text-gray-300">
                Ende: {format(new Date(competition.end_date), 'dd.MM.yyyy HH:mm')}
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <Fish className="w-5 h-5" />
                <span className="font-semibold">Zielfisch</span>
              </div>
              <p className="text-gray-300">{competition.target_species || 'Alle Arten'}</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <Users className="w-5 h-5" />
                <span className="font-semibold">Teilnehmer</span>
              </div>
              <p className="text-gray-300">
                {competition.participant_count || 0}
                {competition.max_participants ? ` / ${competition.max_participants}` : ''}
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <Target className="w-5 h-5" />
                <span className="font-semibold">Wertung</span>
              </div>
              <p className="text-gray-300 text-sm">
                {competition.scoring_method === 'biggest_catch' ? 'Größter Fang' :
                 competition.scoring_method === 'total_weight' ? 'Gesamtgewicht' :
                 competition.scoring_method === 'total_length' ? 'Gesamtlänge' : 'Meiste Fänge'}
              </p>
            </div>
          </div>

          {competition.prize_description && (
            <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Award className="w-5 h-5" />
                <span className="font-semibold">Preis</span>
              </div>
              <p className="text-gray-300">{competition.prize_description}</p>
            </div>
          )}

          {competition.rules && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Regeln</h4>
              <p className="text-sm text-gray-300 whitespace-pre-line">{competition.rules}</p>
            </div>
          )}

          {leaderboard.length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Rangliste
              </h4>
              <div className="space-y-2">
                {leaderboard.map((participant, index) => (
                  <div key={participant.id} className="flex items-center justify-between bg-gray-900/50 rounded p-3">
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${index === 0 ? 'text-amber-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-gray-400'}`}>
                        #{index + 1}
                      </span>
                      <span className="text-gray-300">{participant.user_id}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-400 font-semibold">{participant.total_score} Punkte</p>
                      <p className="text-xs text-gray-500">{participant.catches_count} Fänge</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isParticipating && competition.status !== 'ended' && (
            <Button
              className={`w-full ${isPremium ? 'bg-purple-600 hover:bg-purple-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
              onClick={() => {
                onJoin(competition);
                onClose();
              }}
            >
              Jetzt teilnehmen
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}