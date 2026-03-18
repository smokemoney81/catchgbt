import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { MobileSelect } from '@/components/ui/mobile-select';
import { toast } from 'sonner';

export default function RatingForm({ spot, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [biteActivity, setBiteActivity] = useState('mittel');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Bitte geben Sie eine Bewertung ab');
      return;
    }

    setIsSubmitting(true);
    try {
      await base44.entities.WaterReview.create({
        spot_id: spot.id,
        spot_name: spot.name,
        rating,
        bite_activity: biteActivity,
        comment,
        latitude: spot.latitude,
        longitude: spot.longitude,
        reviewed_at: new Date().toISOString()
      });

      toast.success('Bewertung gespeichert');
      setRating(0);
      setBiteActivity('mittel');
      setComment('');
      onSuccess?.();
    } catch (error) {
      console.error('Rating error:', error);
      toast.error('Fehler beim Speichern');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-gray-900/50 rounded-xl border border-gray-800">
      <h3 className="text-sm font-semibold text-cyan-400">Bewerte dieses Gewaesser</h3>

      <div className="space-y-2">
        <label className="text-xs text-gray-400">Sterne-Bewertung</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl transition-all ${
                rating >= star ? 'text-amber-400 scale-110' : 'text-gray-600'
              }`}
            >
              *
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-gray-400">Beissaktivitaet jetzt</label>
        <MobileSelect
          value={biteActivity}
          onValueChange={setBiteActivity}
          label="Beissaktivitaet"
          options={[
            { value: "sehr_gering", label: "Sehr gering" },
            { value: "gering", label: "Gering" },
            { value: "mittel", label: "Mittel" },
            { value: "hoch", label: "Hoch" },
            { value: "sehr_hoch", label: "Sehr hoch" },
          ]}
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-gray-400">Kommentar (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          placeholder="Aktuelle Bedingungen, Fische, Koeder..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 resize-none h-20"
        />
        <div className="text-xs text-gray-500">{comment.length}/500</div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Speichert...' : 'Bewertung abgeben'}
      </Button>
    </form>
  );
}