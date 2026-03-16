import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const SPORTS = [
  "Spinnfischen",
  "Fliegenfischen",
  "Grundangeln",
  "Karpfenangeln",
  "Hechtangeln",
  "Zanderangeln",
  "Forellenfischen",
  "Aalfischen",
  "Friedfische",
  "Barschfischen"
];

export default function SportSelectorModal({ isOpen, onClose, spot }) {
  const [selectedSports, setSelectedSports] = useState(spot?.sports || []);
  const [loading, setLoading] = useState(false);

  const toggleSport = (sport) => {
    setSelectedSports(prev =>
      prev.includes(sport)
        ? prev.filter(s => s !== sport)
        : [...prev, sport]
    );
  };

  const handleSave = async () => {
    if (!spot || selectedSports.length === 0) {
      toast.error("Bitte waehle mindestens eine Sportart aus");
      return;
    }

    setLoading(true);
    try {
      await base44.entities.Spot.update(spot.id, { sports: selectedSports });
      toast.success("Sportarten gespeichert");
      onClose();
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      toast.error("Fehler beim Speichern der Sportarten");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">
            Sportarten fuer {spot?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {SPORTS.map((sport) => (
            <label
              key={sport}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedSports.includes(sport)}
                onChange={() => toggleSport(sport)}
                className="w-4 h-4 rounded"
                disabled={loading}
              />
              <span className="text-sm text-gray-300">{sport}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-gray-700"
            disabled={loading}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700"
            disabled={loading}
          >
            {loading ? "Speichert..." : "Speichern"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}