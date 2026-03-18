import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { deleteAccount } from '@/functions/deleteAccount';

export default function DeleteAccountSection() {
  const [step, setStep] = useState('idle'); // idle | confirm | deleting | done
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setStep('deleting');
    setError(null);
    try {
      await deleteAccount({});
      setStep('done');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      setError(err.message || 'Fehler beim Löschen des Kontos.');
      setStep('confirm');
    }
  };

  return (
    <Card className="glass-morphism border-red-900/40 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-red-400 text-base">Konto löschen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-400">
          Durch das Löschen deines Kontos werden alle deine Daten unwiderruflich entfernt.
        </p>

        {step === 'idle' && (
          <button
            aria-label="Konto löschen starten"
            onClick={() => setStep('confirm')}
            className="min-h-[44px] px-4 py-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800/50 text-sm font-medium transition w-full"
          >
            Konto löschen
          </button>
        )}

        {step === 'confirm' && (
          <div className="space-y-3 p-4 bg-red-950/30 rounded-lg border border-red-800/40">
            <p className="text-sm text-red-300 font-medium">
              Bist du sicher? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-3">
              <button
                aria-label="Konto unwiderruflich löschen"
                onClick={handleDelete}
                className="min-h-[44px] flex-1 px-4 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white text-sm font-semibold transition"
              >
                Ja, Konto löschen
              </button>
              <button
                aria-label="Abbrechen"
                onClick={() => setStep('idle')}
                className="min-h-[44px] flex-1 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {step === 'deleting' && (
          <p className="text-sm text-gray-400 animate-pulse">Konto wird gelöscht...</p>
        )}

        {step === 'done' && (
          <p className="text-sm text-emerald-400">Konto erfolgreich gelöscht. Du wirst weitergeleitet.</p>
        )}
      </CardContent>
    </Card>
  );
}