import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, MapPin, Save } from "lucide-react";
import { toast } from "sonner";
import { useHaptic } from "@/components/utils/HapticFeedback";

export default function AddSpotModal({ isOpen, onClose, onSave, initialCoords }) {
  const { triggerHaptic } = useHaptic();
  const [formData, setFormData] = useState({
    name: "",
    water_type: "see",
    notes: "",
    depth_meters: "",
    is_favorite: false
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Bitte gib einen Namen für den Spot ein");
      triggerHaptic('light');
      return;
    }

    if (!initialCoords || !initialCoords.lat || !initialCoords.lng) {
      toast.error("Keine gültigen Koordinaten verfügbar");
      triggerHaptic('light');
      return;
    }

    setIsSaving(true);
    triggerHaptic('medium');

    try {
      const spotData = {
        name: formData.name.trim(),
        latitude: initialCoords.lat,
        longitude: initialCoords.lng,
        water_type: formData.water_type,
        notes: formData.notes.trim() || "",
        is_favorite: formData.is_favorite,
        ...(formData.depth_meters && { depth_meters: parseFloat(formData.depth_meters) })
      };

      console.log("Creating spot with data:", spotData);

      await base44.entities.Spot.create(spotData);
      
      toast.success("Spot erfolgreich gespeichert! 🎣", {
        description: `${formData.name} wurde zur Karte hinzugefügt`
      });
      
      triggerHaptic('success');
      
      if (onSave) {
        onSave(spotData);
      }
      
      onClose();
    } catch (error) {
      console.error("Error adding spot:", error);
      toast.error("Fehler beim Speichern des Spots", {
        description: error.message || "Bitte versuche es erneut"
      });
      triggerHaptic('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[9999]" onClick={onClose}>
      <Card 
        className="w-full max-w-md glass-morphism border-gray-800 rounded-2xl" 
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)] flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Neuer Spot
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Koordinaten-Anzeige */}
          {initialCoords && initialCoords.lat && initialCoords.lng && (
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Koordinaten</div>
              <div className="text-sm text-white font-mono">
                {initialCoords.lat.toFixed(6)}, {initialCoords.lng.toFixed(6)}
              </div>
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Name *</label>
            <Input
              placeholder="z.B. Forellensee"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-gray-800/50 border-gray-700 text-white"
            />
          </div>

          {/* Gewässertyp */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Gewässertyp *</label>
            <Select
              value={formData.water_type}
              onValueChange={(value) => setFormData({ ...formData, water_type: value })}
            >
              <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fluss">Fluss</SelectItem>
                <SelectItem value="see">See</SelectItem>
                <SelectItem value="teich">Teich</SelectItem>
                <SelectItem value="kanal">Kanal</SelectItem>
                <SelectItem value="meer">Meer</SelectItem>
                <SelectItem value="bach">Bach</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tiefe (optional) */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Tiefe (Meter)</label>
            <Input
              type="number"
              placeholder="z.B. 5"
              value={formData.depth_meters}
              onChange={(e) => setFormData({ ...formData, depth_meters: e.target.value })}
              className="bg-gray-800/50 border-gray-700 text-white"
            />
          </div>

          {/* Notizen */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Notizen</label>
            <Textarea
              placeholder="z.B. Guter Spot für Forellen..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-gray-800/50 border-gray-700 text-white h-24"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSaving}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {isSaving ? (
                <>Speichert...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Speichern
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}