import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar, Fish, Lock, Crown } from "lucide-react";
import { format } from "date-fns";

export default function CompetitionCard({ competition, onView, onJoin, userPlan, hasAccess, isParticipating }) {
  const isPremium = competition.competition_type === 'premium';
  const isActive = competition.status === 'active';
  const isUpcoming = competition.status === 'upcoming';
  const isEnded = competition.status === 'ended';
  
  const getStatusBadge = () => {
    if (isActive) return <Badge className="bg-green-600">Aktiv</Badge>;
    if (isUpcoming) return <Badge className="bg-blue-600">Bald</Badge>;
    if (isEnded) return <Badge className="bg-gray-600">Beendet</Badge>;
  };
  
  const isFull = competition.max_participants && competition.participant_count >= competition.max_participants;
  const canJoin = hasAccess && !isParticipating && !isFull && (isActive || isUpcoming);

  return (
    <Card className={`glass-morphism ${isPremium ? 'border-purple-600/50' : 'border-cyan-600/50'} hover:border-opacity-80 transition-all`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Trophy className={`w-6 h-6 ${isPremium ? 'text-purple-400' : 'text-cyan-400'}`} />
            <CardTitle className="text-white">{competition.title}</CardTitle>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge()}
            {isPremium && (
              <Badge className="bg-purple-600">
                <Crown className="w-3 h-3 mr-1" />
                Pro
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-300 text-sm line-clamp-2">{competition.description}</p>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Fish className="w-4 h-4" />
            <span>{competition.target_species || 'Alle Arten'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-400">
            <Users className="w-4 h-4" />
            <span>
              {competition.participant_count || 0}
              {competition.max_participants ? `/${competition.max_participants}` : ''}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-400 col-span-2">
            <Calendar className="w-4 h-4" />
            <span>
              {format(new Date(competition.start_date), 'dd.MM.yyyy')} - {format(new Date(competition.end_date), 'dd.MM.yyyy')}
            </span>
          </div>
        </div>
        
        {!hasAccess && isPremium && (
          <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-xs">Nur für Pro-Benutzer</span>
          </div>
        )}
        
        {isFull && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 text-center">
            <span className="text-red-300 text-xs font-semibold">Wettbewerb voll</span>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onView(competition)}
          >
            Details
          </Button>
          
          {canJoin && (
            <Button
              className={`flex-1 ${isPremium ? 'bg-purple-600 hover:bg-purple-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
              onClick={() => onJoin(competition)}
            >
              Teilnehmen
            </Button>
          )}
          
          {isParticipating && (
            <Badge className="flex-1 bg-green-600 justify-center py-2">Angemeldet</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}