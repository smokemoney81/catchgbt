import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function BiteDetectorMetrics({
  running,
  lineScore,
  tipScore,
  debugInfo
}) {
  return (
    <Card className="glass-morphism border-gray-800">
      <CardContent className="p-4">
        <div 
          className="space-y-3"
          role="region"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Echtzeit Bissanzeiger Messwerte"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
              <p className="text-xs text-gray-400 mb-1">Angelschnur</p>
              <p className="text-2xl font-mono text-cyan-400">
                {running ? lineScore.toFixed(2) : '-'}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
              <p className="text-xs text-gray-400 mb-1">Rutenspitze</p>
              <p className="text-2xl font-mono text-amber-400">
                {running ? tipScore.toFixed(2) : '-'}
              </p>
            </div>
          </div>

          {debugInfo && (
            <div 
              className="text-xs text-gray-500 bg-gray-900/50 rounded p-2 font-mono"
              role="status"
              aria-label="Debug-Informationen"
            >
              {debugInfo}
            </div>
          )}

          {running && (
            <div 
              className="text-xs text-emerald-400 text-center py-1"
              role="status"
              aria-label="Bissanzeiger aktiv"
            >
              Aktiv - Erkennungen laufen
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}