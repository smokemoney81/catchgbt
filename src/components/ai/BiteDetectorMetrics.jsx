import React from 'react';

export default function BiteDetectorMetrics({
  running,
  lineScore,
  tipScore,
  debugInfo
}) {
  if (!running) return null;

  return (
    <>
      {/* Live Metrics */}
      <div className="grid grid-cols-2 gap-4" role="region" aria-label="Live Echtzeit-Metriken fuer Schnur- und Spitzen-Aktivitaet" aria-live="polite" aria-atomic="true">
        <div>
          <div className="flex justify-between text-sm text-gray-300 mb-1">
            <span>Schnur-Aktivität</span>
            <span aria-label={`Schnur-Aktivitaetswert: ${lineScore.toFixed(2)}`}>{lineScore.toFixed(2)}</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.min(100, lineScore * 20)} aria-valuemin="0" aria-valuemax="100" aria-label="Schnur-Aktivitaets-Fortschrittsbalken">
            <div
              className="h-full bg-cyan-400 transition-all duration-100"
              style={{ width: `${Math.min(100, lineScore * 20)}%` }}
              aria-hidden="true"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm text-gray-300 mb-1">
            <span>Spitzen-Aktivität</span>
            <span aria-label={`Spitzen-Aktivitaetswert: ${tipScore.toFixed(2)}`}>{tipScore.toFixed(2)}</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.min(100, tipScore * 20)} aria-valuemin="0" aria-valuemax="100" aria-label="Spitzen-Aktivitaets-Fortschrittsbalken">
            <div
              className="h-full bg-yellow-400 transition-all duration-100"
              style={{ width: `${Math.min(100, tipScore * 20)}%` }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="text-xs text-gray-500 font-mono" role="status" aria-label={`Leistungs-Debug-Information: ${debugInfo}`}>
        {debugInfo}
      </div>
    </>
  );
}