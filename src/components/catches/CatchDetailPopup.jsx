import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function CatchDetailPopup({ catchData, onClose }) {
  if (!catchData) return null;

  const catchDate = new Date(catchData.catch_time).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Card className="glass-morphism border-gray-800 w-full max-w-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="flex-1">
          <CardTitle className="text-cyan-400">{catchData.species}</CardTitle>
          <p className="text-xs text-gray-400 mt-1">{catchDate}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {catchData.photo_url && (
          <img
            src={catchData.photo_url}
            alt={catchData.species}
            className="w-full h-40 object-cover rounded-lg"
          />
        )}

        <div className="grid grid-cols-2 gap-2">
          {catchData.length_cm && (
            <div>
              <p className="text-xs text-gray-400">Laenge</p>
              <p className="text-sm font-semibold text-white">{catchData.length_cm} cm</p>
            </div>
          )}
          {catchData.weight_kg && (
            <div>
              <p className="text-xs text-gray-400">Gewicht</p>
              <p className="text-sm font-semibold text-white">{catchData.weight_kg} kg</p>
            </div>
          )}
        </div>

        {catchData.bait_used && (
          <div>
            <p className="text-xs text-gray-400">Koeder</p>
            <p className="text-sm text-gray-300">{catchData.bait_used}</p>
          </div>
        )}

        {catchData.notes && (
          <div>
            <p className="text-xs text-gray-400">Notizen</p>
            <p className="text-sm text-gray-300">{catchData.notes}</p>
          </div>
        )}

        {catchData.is_released && (
          <div className="bg-emerald-500/20 border border-emerald-500/50 rounded px-2 py-1">
            <p className="text-xs font-semibold text-emerald-400">Fisch wurde zurueckgesetzt</p>
          </div>
        )}

        {catchData.created_by && (
          <div className="pt-2 border-t border-gray-800">
            <p className="text-xs text-gray-500">von {catchData.created_by}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}