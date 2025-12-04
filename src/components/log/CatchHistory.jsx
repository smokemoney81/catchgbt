import React, { memo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import CatchCard from './CatchCard';
import { Badge } from '@/components/ui/badge';

function CatchHistory({ catches, isLoading, onEdit, onDelete }) {
  if (isLoading) {
    return (
      <Card className="glass-morphism border-gray-800 rounded-2xl mt-6">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]">
            Meine Fänge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="glass-morphism border-gray-800 overflow-hidden">
                <div className="h-48 bg-gray-800 animate-pulse" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 bg-gray-700 rounded w-2/3 animate-pulse" />
                  <div className="h-3 bg-gray-700 rounded w-1/2 animate-pulse" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 bg-gray-700 rounded flex-1 animate-pulse" />
                    <div className="h-8 w-10 bg-gray-700 rounded animate-pulse" />
                    <div className="h-8 w-10 bg-gray-700 rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-morphism border-gray-800 rounded-2xl mt-6">
      <CardHeader>
        <CardTitle className="text-cyan-400 flex items-center gap-2 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]">
          Meine Fänge
          <Badge variant="outline" className="ml-2 text-emerald-400 border-emerald-500/30">
            {catches.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {catches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {catches.map(c => (
              <CatchCard 
                key={c.id} 
                catchItem={c} 
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          <Card className="glass-morphism border-gray-800 rounded-2xl text-center p-12">
            <h3 className="text-xl font-semibold text-white">Noch keine Fänge erfasst</h3>
            <p className="text-gray-400 mt-2">
              Lade oben ein Bild deines ersten Fangs hoch, um dein Fangbuch zu starten!
            </p>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

export default memo(CatchHistory);