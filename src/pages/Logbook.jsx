import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileSelect } from "@/components/ui/mobile-select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, X, Loader2, Share2 } from "lucide-react";
import { ExtractDataFromUploadedFile } from "@/integrations/Core";
import CatchHistory from "@/components/log/CatchHistory";
import { UploadFile } from "@/integrations/Core";
import PendingPhotoCard from '@/components/log/PendingPhotoCard';
import { AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function Logbook() {
  const [catches, setCatches] = useState([]);
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullStart, setPullStart] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);

  // Individual state for form fields
  const [photoUrl, setPhotoUrl] = useState("");
  const [species, setSpecies] = useState("");
  const [spotId, setSpotId] = useState("");
  const [lengthCm, setLengthCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [baitUsed, setBaitUsed] = useState("");
  const [notes, setNotes] = useState("");
  const [catchTime, setCatchTime] = useState(new Date().toISOString().slice(0, 16));

  const [editingCatch, setEditingCatch] = useState(null);
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [savedCatchData, setSavedCatchData] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareInCommunity, setShareInCommunity] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [catchesData, spotsData] = await Promise.all([
        base44.entities.Catch.list('-catch_time'),
        base44.entities.Spot.list()
      ]);
      setCatches(catchesData);
      setSpots(spotsData);
    } catch (error) {
      console.error("Fehler beim Laden der Daten:", error);
      toast.error("Fehler beim Laden der Daten");
    } finally {
      setLoading(false);
    }
  }, []);

  // Haversine-Formel zur Berechnung der Entfernung zwischen zwei GPS-Koordinaten
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Erdradius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Entfernung in km
  };

  // Finde den nächstgelegenen Spot basierend auf GPS-Koordinaten
  const findNearestSpot = useCallback((gpsLat, gpsLon, maxDistanceKm = 2) => {
    if (!gpsLat || !gpsLon || spots.length === 0) return null;

    let nearestSpot = null;
    let minDistance = Infinity;

    spots.forEach(spot => {
      if (spot.latitude && spot.longitude) {
        const distance = calculateDistance(gpsLat, gpsLon, spot.latitude, spot.longitude);
        if (distance < minDistance && distance <= maxDistanceKm) {
          minDistance = distance;
          nearestSpot = { ...spot, distance };
        }
      }
    });

    return nearestSpot;
  }, [spots]); // Dependency on spots so it recomputes if spots change

  const loadPendingPhotos = () => {
    try {
      const stored = localStorage.getItem('catchgbt_pending_photos');
      if (stored) {
        const photos = JSON.parse(stored);
        setPendingPhotos(photos);
      }
    } catch (error) {
      console.error('Error loading pending photos:', error);
    }
  };

  const handlePhotoAnalyzed = (photoId, nearestSpot) => {
    const updated = pendingPhotos.filter(p => p.id !== photoId);
    setPendingPhotos(updated);
    localStorage.setItem('catchgbt_pending_photos', JSON.stringify(updated));
    loadData(); // Reload catches to show new one
    
    // Optional: Scrolle zur Form wenn ein Spot gefunden wurde
    if (nearestSpot) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePhotoDeleted = (photoId) => {
    const updated = pendingPhotos.filter(p => p.id !== photoId);
    setPendingPhotos(updated);
    localStorage.setItem('catchgbt_pending_photos', JSON.stringify(updated));
  };

  useEffect(() => {
    loadData();
    loadPendingPhotos();

    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        setPullStart(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e) => {
      if (pullStart > 0) {
        const distance = e.touches[0].clientY - pullStart;
        if (distance > 0 && distance < 150) {
          setPullDistance(distance);
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > 80) {
        setIsRefreshing(true);
        await loadData();
        setIsRefreshing(false);
      }
      setPullStart(0);
      setPullDistance(0);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('catch-saved', loadData);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('catch-saved', loadData);
    };
  }, [pullStart, loadData]);

  const resetForm = useCallback(() => {
    setPhotoUrl("");
    setSpecies("");
    setSpotId("");
    setLengthCm("");
    setWeightKg("");
    setBaitUsed("");
    setNotes("");
    setCatchTime(new Date().toISOString().slice(0, 16));
    setEditingCatch(null);
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Bitte nur Bilddateien hochladen");
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("Datei zu groß (max. 10MB)");
      return;
    }

    setUploading(true);
    try {
      toast.info("Lade Foto hoch...");

      const { file_url } = await UploadFile({ file });

      setPhotoUrl(file_url);
      toast.success("Foto hochgeladen!");
    } catch (error) {
      console.error("Fehler beim Upload:", error);
      toast.error("Fehler beim Hochladen des Fotos");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!species?.trim()) {
      toast.error("Bitte Fischart angeben");
      return;
    }

    setSaving(true);

    try {
      const catchData = {
        species: species.trim(),
        spot_id: spotId || null,
        length_cm: lengthCm ? parseFloat(lengthCm) : null,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        bait_used: baitUsed.trim() || null,
        photo_url: photoUrl || null,
        notes: notes.trim() || null,
        catch_time: new Date(catchTime).toISOString(),
        points_earned: 1,
      };

      if (editingCatch) {
        await base44.entities.Catch.update(editingCatch.id, catchData);
        toast.success("Fang aktualisiert!");
      } else {
        // Optimistic update
        const optimisticCatch = {
          id: `temp-${Date.now()}`,
          ...catchData,
          created_date: new Date().toISOString(),
          created_by: 'temp'
        };
        setCatches(prev => [optimisticCatch, ...prev]);
        resetForm();
        toast.success("Fang gespeichert!");

        // Background save
        const savedCatch = await base44.entities.Catch.create(catchData);
        setCatches(prev => prev.map(c => c.id === optimisticCatch.id ? savedCatch : c));
        
        base44.analytics.track({
          eventName: "fishing_catch_logged",
          properties: {
            species: species.trim(),
            has_photo: !!photoUrl,
            has_spot: !!spotId,
            length_cm: lengthCm ? parseFloat(lengthCm) : null
          }
        });

        setSavedCatchData(savedCatch);
        if (shareInCommunity) {
          const catchText = `Mein Fang: ${catchData.species}${catchData.length_cm ? ` (${catchData.length_cm}cm)` : ''}${catchData.weight_kg ? `, ${catchData.weight_kg}kg` : ''}${catchData.bait_used ? `\nKöder: ${catchData.bait_used}` : ''}${catchData.notes ? `\n\n${catchData.notes}` : ''}`;
          await base44.entities.Post.create({ text: catchText, photo_url: catchData.photo_url || null, likes: 0, reported: false });
          toast.success("Fang gespeichert und in Community geteilt!");
          setShareInCommunity(false);
        } else {
          setShowShareDialog(true);
        }
      }
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      toast.error("Fehler beim Speichern des Fangs");
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = useCallback((catchItem) => {
    setEditingCatch(catchItem);
    setPhotoUrl(catchItem.photo_url || "");
    setSpecies(catchItem.species || "");
    setSpotId(catchItem.spot_id || "");
    setLengthCm(catchItem.length_cm?.toString() || "");
    setWeightKg(catchItem.weight_kg?.toString() || "");
    setBaitUsed(catchItem.bait_used || "");
    setNotes(catchItem.notes || "");
    setCatchTime(catchItem.catch_time ? new Date(catchItem.catch_time).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!confirm("Fang wirklich löschen?")) return;

    try {
      await base44.entities.Catch.delete(id);
      toast.success("Fang gelöscht");
      await loadData();
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
      toast.error("Fehler beim Löschen des Fangs");
    }
  }, [loadData]);

  const handleShareToCommunity = async () => {
    if (!savedCatchData) return;

    setIsSharing(true);
    try {
      const catchText = `Mein Fang: ${savedCatchData.species}${savedCatchData.length_cm ? ` (${savedCatchData.length_cm}cm)` : ''}${savedCatchData.weight_kg ? `, ${savedCatchData.weight_kg}kg` : ''}${savedCatchData.bait_used ? `\nKöder: ${savedCatchData.bait_used}` : ''}${savedCatchData.notes ? `\n\n${savedCatchData.notes}` : ''}`;

      await base44.entities.Post.create({
        text: catchText,
        photo_url: savedCatchData.photo_url || null,
        likes: 0,
        reported: false
      });

      toast.success("Fang in der Community geteilt!");
      setShowShareDialog(false);
      setSavedCatchData(null);
    } catch (error) {
      console.error("Fehler beim Teilen:", error);
      toast.error("Fehler beim Teilen des Fangs");
    } finally {
      setIsSharing(false);
    }
  };

  if (loading && catches.length === 0 && spots.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-400" />
          <p className="text-gray-400">Lade Fangbuch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 pb-32">
      {pullDistance > 0 && (
        <div 
          className="fixed top-0 left-0 right-0 flex items-center justify-center z-50 transition-opacity"
          style={{ 
            height: `${pullDistance}px`,
            opacity: Math.min(pullDistance / 80, 1)
          }}
        >
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {isRefreshing && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-cyan-600 text-white px-4 py-2 rounded-full shadow-lg">
          Aktualisiere...
        </div>
      )}
      
      <Card className="glass-morphism border-gray-800 rounded-2xl">
        <CardHeader>
          {!editingCatch && (
            <div className="flex flex-wrap gap-2 mb-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShareInCommunity(prev => !prev)}
                className={`text-sm border ${shareInCommunity ? "border-cyan-500 text-cyan-400 bg-cyan-950/40" : "border-gray-700 text-gray-300 hover:bg-gray-700"}`}
              >
                {shareInCommunity ? "In Community posten: An" : "In Community posten"}
              </Button>
              <div className="inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <input
                  type="file"
                  id="ai-analyze-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsAnalyzing(true);
                    try {
                      const { file_url } = await UploadFile({ file });
                      setPhotoUrl(file_url);
                      toast.info("KI analysiert das Bild...");
                      const extractionSchema = {
                        type: "object",
                        properties: {
                          species: { type: "string" },
                          length_cm: { type: "number" },
                          weight_kg: { type: "number" },
                          bait_used: { type: "string" },
                          notes: { type: "string" },
                          catch_time: { type: "string", format: "date-time" }
                        },
                        required: ["species"]
                      };
                      const { output } = await ExtractDataFromUploadedFile({ file_url, json_schema: extractionSchema });
                      if (output) {
                        if (output.species) setSpecies(output.species);
                        if (output.length_cm) setLengthCm(String(output.length_cm));
                        if (output.weight_kg) setWeightKg(String(output.weight_kg));
                        if (output.bait_used) setBaitUsed(output.bait_used);
                        if (output.notes) setNotes(output.notes);
                        if (output.catch_time) setCatchTime(new Date(output.catch_time).toISOString().slice(0, 16));
                        toast.success("Felder automatisch ausgefüllt!");
                      } else {
                        toast.warning("KI konnte keine Daten erkennen");
                      }
                    } catch (err) {
                      toast.error("KI-Analyse fehlgeschlagen");
                    } finally {
                      setIsAnalyzing(false);
                    }
                  }}
                  disabled={isAnalyzing}
                />
                <Button
                  as="span"
                  type="button"
                  variant="outline"
                  className="text-sm border-gray-700 text-gray-300 hover:bg-gray-700 cursor-pointer"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? "KI analysiert..." : "KI Fang-Analyse und automatisch ausfüllen"}
                </Button>
              </label>
            </div>
          )}
          <CardTitle className="text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]">
            {editingCatch ? "Fang bearbeiten" : "Neuen Fang erfassen"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="catch-photo" className="text-white">Foto hochladen</Label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  id="catch-photo"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <label
                  htmlFor="catch-photo"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      Wird hochgeladen...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Bild auswählen
                    </>
                  )}
                </label>
                {photoUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setPhotoUrl("")}
                    className="border-gray-700 hover:bg-gray-700 text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {photoUrl && (
                <div className="mt-4 relative w-full h-48 rounded-lg overflow-hidden bg-gray-800">
                  <img
                    src={photoUrl}
                    alt="Vorschau"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="species" className="text-white">Fischart *</Label>
              <Input
                id="species"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                placeholder="z.B. Hecht, Zander, Karpfen..."
                className="bg-gray-800/50 border-gray-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="spot-select" className="text-white">Angelspot</Label>
              <div className="md:hidden">
                <MobileSelect
                  value={spotId}
                  onValueChange={setSpotId}
                  placeholder="Spot auswählen (optional)"
                  label="Angelspot"
                  options={[
                    { value: "", label: "Kein Spot" },
                    ...spots.map(spot => ({ value: spot.id, label: spot.name }))
                  ]}
                  className="bg-gray-800/50 border-gray-700 text-white"
                />
              </div>
              <div className="hidden md:block">
                <Select value={spotId} onValueChange={setSpotId}>
                  <SelectTrigger id="spot-select" className="bg-gray-800/50 border-gray-700 text-white">
                    <SelectValue placeholder="Spot auswählen (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value={null}>Kein Spot</SelectItem>
                    {spots.map((spot) => (
                      <SelectItem key={spot.id} value={spot.id}>
                        {spot.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="length-cm" className="text-white">Länge (cm)</Label>
                <Input
                  id="length-cm"
                  type="number"
                  step="0.1"
                  value={lengthCm}
                  onChange={(e) => setLengthCm(e.target.value)}
                  placeholder="z.B. 65"
                  className="bg-gray-800/50 border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight-kg" className="text-white">Gewicht (kg)</Label>
                <Input
                  id="weight-kg"
                  type="number"
                  step="0.01"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="z.B. 3.5"
                  className="bg-gray-800/50 border-gray-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bait-used" className="text-white">Verwendeter Köder</Label>
              <Input
                id="bait-used"
                value={baitUsed}
                onChange={(e) => setBaitUsed(e.target.value)}
                placeholder="z.B. Gummifisch, Wobbler..."
                className="bg-gray-800/50 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="catch-time" className="text-white">Fangzeitpunkt</Label>
              <Input
                id="catch-time"
                type="datetime-local"
                value={catchTime}
                onChange={(e) => setCatchTime(e.target.value)}
                className="bg-gray-800/50 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-white">Notizen</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Wetter, Bedingungen, Besonderheiten..."
                className="bg-gray-800/50 border-gray-700 text-white min-h-[100px]"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={saving || uploading}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Wird gespeichert...
                  </>
                ) : (editingCatch ? "Änderungen speichern" : "Fang speichern")}
              </Button>
              {editingCatch && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-gray-700 text-gray-300 hover:bg-gray-700"
                >
                  Abbrechen
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Pending Photos Section */}
      {pendingPhotos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-amber-500 rounded-full" />
            <h2 className="text-xl font-semibold text-amber-400">
              Fotos zur Analyse ({pendingPhotos.length})
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AnimatePresence>
              {pendingPhotos.map(photo => (
                <PendingPhotoCard
                  key={photo.id}
                  photo={photo}
                  spots={spots}
                  findNearestSpot={findNearestSpot}
                  onAnalyzed={handlePhotoAnalyzed}
                  onDeleted={handlePhotoDeleted}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      <CatchHistory
        catches={catches}
        isLoading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-cyan-400">In Community teilen?</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-300 mb-4">
              Möchtest du diesen Fang mit der Community teilen?
            </p>
            
            {savedCatchData?.photo_url && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                <img
                  src={savedCatchData.photo_url}
                  alt={savedCatchData.species}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {savedCatchData && (
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                <p className="text-white font-semibold">{savedCatchData.species}</p>
                {savedCatchData.length_cm && (
                  <p className="text-gray-300 text-sm">Länge: {savedCatchData.length_cm}cm</p>
                )}
                {savedCatchData.weight_kg && (
                  <p className="text-gray-300 text-sm">Gewicht: {savedCatchData.weight_kg}kg</p>
                )}
                {savedCatchData.bait_used && (
                  <p className="text-gray-300 text-sm">Köder: {savedCatchData.bait_used}</p>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowShareDialog(false);
                setSavedCatchData(null);
              }}
              disabled={isSharing}
              className="border-gray-700 text-gray-300 hover:bg-gray-700"
            >
              Nein, danke
            </Button>
            <Button
              onClick={handleShareToCommunity}
              disabled={isSharing}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {isSharing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Wird geteilt...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Jetzt teilen
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}