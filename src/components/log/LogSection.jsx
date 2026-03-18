import React, { useEffect, useMemo, useState } from "react";
import { Catch, Spot, User } from "@/entities/all";
import { UploadFile, ExtractDataFromUploadedFile } from "@/integrations/Core";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileSelect } from "@/components/ui/mobile-select";
import SwipeToRefresh from "@/components/utils/SwipeToRefresh";
import { Badge } from "@/components/ui/badge";
import { Calendar, Camera, Edit2, Filter, MapPin, Ruler, Trash2, Upload, Weight, X, Loader2 } from "lucide-react";
import { getGuestCatches, addGuestCatch, updateGuestCatch, deleteGuestCatch } from "@/components/utils/guestMode";
import { base44 } from "@/api/base44Client";
import { fetchCatchesWithFallback, fetchSpotsWithFallback } from "@/components/utils/offlineDataCache";

const PAGE_SIZE = 20;

export default function LogSection() {
  const [catches, setCatches] = useState([]);
  const [spots, setSpots] = useState([]);
  const [filters, setFilters] = useState({ species: "all", spot: "all", from: "", to: "" });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    species: "", length_cm: "", weight_kg: "", spot_id: "", bait_used: "", notes: "", catch_time: new Date().toISOString().slice(0,16), photo_url: "", is_released: false
  });
  const [uploading, setUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('kiBuddyFunctionCall', {
      detail: { functionName: 'logbook', context: { timestamp: Date.now() } }
    }));
    
    (async () => {
      try {
        await base44.auth.me();
        setIsGuest(false);
        const { data: catchData, fromCache: catchFromCache } = await fetchCatchesWithFallback(
          () => Catch.list("-catch_time", PAGE_SIZE)
        );
        setCatches(catchData);
        setIsFromCache(catchFromCache);
        setHasMore(catchData.length === PAGE_SIZE);
        const { data: spotData } = await fetchSpotsWithFallback(() => Spot.list());
        setSpots(spotData);
      } catch {
        setIsGuest(true);
        setCatches(getGuestCatches());
      }
    })();
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const { data: more } = await fetchCatchesWithFallback(
        () => Catch.list("-catch_time", PAGE_SIZE, page * PAGE_SIZE)
      );
      setCatches(prev => [...prev, ...more]);
      setPage(p => p + 1);
      setHasMore(more.length === PAGE_SIZE);
    } catch (e) {
      console.error(e);
    }
    setLoadingMore(false);
  };

  const speciesList = useMemo(()=> Array.from(new Set(catches.map(c=>c.species).filter(Boolean))), [catches]);

  const filtered = useMemo(() => {
    const fromDate = filters.from ? new Date(filters.from) : null;
    const toDate = filters.to ? new Date(filters.to) : null;
    return catches.filter(c => {
      const date = new Date(c.catch_time);
      return (filters.species === "all" || c.species === filters.species) &&
             (filters.spot === "all" || c.spot_id === filters.spot) &&
             (!fromDate || date >= fromDate) &&
             (!toDate || date <= toDate);
    });
  }, [catches, filters]);

  const refreshData = async () => {
    try {
      const { data: catchData } = await fetchCatchesWithFallback(() => Catch.list("-catch_time", PAGE_SIZE));
      setCatches(catchData);
      setHasMore(catchData.length === PAGE_SIZE);
    } catch (e) { /* silent */ }
  };

  const openNew = () => { setEditing("new"); setForm({ species: "", length_cm: "", weight_kg: "", spot_id: "", bait_used: "", notes: "", catch_time: new Date().toISOString().slice(0,16), photo_url: "" }); };
  const startEdit = (c) => { setEditing(c.id); setForm({ ...c, catch_time: new Date(c.catch_time).toISOString().slice(0,16) }); };
  const cancelEdit = () => { setEditing(null); };

  // Neue Funktion zur Berechnung der Credits basierend auf Fischgröße und Seltenheit
  const calculateCatchCredits = (species, lengthCm) => {
    const baseCredits = 100; // Minimum Credits
    const maxCredits = 1000; // Maximum Credits
    
    // Seltenheitswerte für verschiedene Fischarten
    const rarityMultiplier = {
      'Hecht': 1.5,
      'Zander': 1.4, 
      'Wels': 2.0,
      'Forelle': 1.2,
      'Karpfen': 1.3,
      'Barsch': 1.0,
      'Brassen': 0.8,
      'Rotauge': 0.7
    };
    
    const speciesMultiplier = rarityMultiplier[species] || 1.0;
    
    // Größenfaktor: Je größer der Fisch, desto mehr Credits
    const sizeBonus = lengthCm ? Math.min(lengthCm / 10, 10) : 1; // Max 10x Bonus für sehr große Fische
    
    const calculatedCredits = Math.round(baseCredits * speciesMultiplier * sizeBonus);
    return Math.min(Math.max(calculatedCredits, baseCredits), maxCredits);
  };

  const save = async () => {
    const payload = {
      ...form,
      length_cm: form.length_cm ? parseFloat(form.length_cm) : null,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      catch_time: new Date(form.catch_time).toISOString(),
      points_earned: form.length_cm ? (1 + Math.floor(parseFloat(form.length_cm)/10)) : 1
    };
    
    try {
      if (isGuest) {
        if (editing === "new") {
          addGuestCatch(payload);
          setEditing(null);
          setCatches(getGuestCatches());
          toast.success("Fang gespeichert (Gastmodus - 24 Stunden gespeichert).");
        } else {
          updateGuestCatch(editing, payload);
          setEditing(null);
          setCatches(getGuestCatches());
          toast.success("Fang aktualisiert.");
        }
        return;
      }

      if (editing === "new") {
        const newCatch = await Catch.create(payload);
        setCatches(prev => [newCatch, ...prev]);
        setEditing(null);
        
        try {
          const user = await User.me();
          const credits = calculateCatchCredits(form.species, parseFloat(form.length_cm));
          await User.updateMyUserData({
            credits: (user.credits || 0) + credits,
            total_earned: (user.total_earned || 0) + credits
          });
          toast.success(`Fang gespeichert! ${form.species} (${form.length_cm || 'unbekannt'} cm) – +${credits} Credits erhalten.`);
        } catch (error) {
          toast.success("Fang gespeichert, aber Credits konnten nicht gutgeschrieben werden.");
        }
      } else {
        await Catch.update(editing, payload);
        setCatches(prev => prev.map(c => c.id === editing ? { ...c, ...payload } : c));
        setEditing(null);
        toast.success("Fang erfolgreich aktualisiert.");
      }
    } catch (error) {
      const q = JSON.parse(localStorage.getItem("fishmaster_catch_queue") || "[]");
      q.push(payload);
      localStorage.setItem("fishmaster_catch_queue", JSON.stringify(q));
      toast.info("Offline gespeichert - wird synchronisiert, sobald Internet verfuegbar ist.");
      setEditing(null);
    }
  };

  const remove = async (c) => {
    if (isGuest) {
      deleteGuestCatch(c.id);
      setCatches(getGuestCatches());
      return;
    }
    setCatches(prev => prev.filter(x => x.id !== c.id));
    await Catch.delete(c.id);
  };

  const uploadPhoto = async (file) => {
    setUploading(true);
    const { file_url } = await UploadFile({ file });
    setForm(prev => ({ ...prev, photo_url: file_url }));
    setUploading(false);
  };

  const importImageAndExtract = async (imageFile) => {
    setIsExtracting(true);
    setUploading(true);

    try {
      const { file_url } = await UploadFile({ file: imageFile });
      
      const extractionSchema = {
        type: "object",
        properties: {
          species: { type: "string", description: "Fischart, z.B. Hecht, Zander, Karpfen. Falls nicht eindeutig, den häufigsten Fisch in Deutschland oder 'Unbekannt' verwenden." },
          length_cm: { type: "number", description: "Länge des Fisches in Zentimetern. Nur Zahlen." },
          weight_kg: { type: "number", description: "Gewicht des Fisches in Kilogramm. Nur Zahlen." },
          catch_time: { type: "string", format: "date-time", description: "Datum und Uhrzeit des Fangs im ISO 8601 Format (z.B. 2024-01-15T10:30:00). Falls nur Datum vorhanden, Uhrzeit auf 12:00:00 setzen. Falls nur Uhrzeit vorhanden, heutiges Datum verwenden." },
          bait_used: { type: "string", description: "Verwendeter Köder, z.B. Gummifisch, Wurm, Blinker." },
          notes: { type: "string", description: "Zusätzliche Notizen zum Fang." }
        },
        required: ["species"]
      };

      const { output } = await ExtractDataFromUploadedFile({ file_url, json_schema: extractionSchema });

      if (output) {
        const catchTime = output.catch_time ? new Date(output.catch_time).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16);
        setForm({
          species: output.species || "",
          length_cm: output.length_cm || "",
          weight_kg: output.weight_kg || "",
          bait_used: output.bait_used || "",
          notes: output.notes || "",
          catch_time: catchTime,
          photo_url: file_url,
          spot_id: "",
          is_released: false
        });
        setEditing("new");
      } else {
        toast.error("Daten konnten nicht extrahiert werden. Bitte manuell eintragen.");
        openNew();
        setForm(prev => ({ ...prev, photo_url: file_url }));
      }
    } catch (error) {
      console.error("Fehler beim Import:", error);
      toast.error("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
    } finally {
      setIsExtracting(false);
      setUploading(false);
    }
  };


  return (
    <Card className="glass-morphism border-gray-800 rounded-2xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-white">Fangbuch</CardTitle>
            {isGuest && (
              <p className="text-xs text-amber-400 mt-1">
                Gastmodus - Fänge werden 24 Stunden lokal gespeichert.{' '}
                <button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="underline font-semibold hover:text-amber-300"
                >
                  Anmelden
                </button>{' '}
                um Fänge dauerhaft zu speichern.
              </p>
            )}
            {isFromCache && !isGuest && (
              <p className="text-xs text-orange-400 mt-1">
                Offline-Modus - Zeige zuletzt gespeicherte Faenge. Neue Eintraege werden automatisch synchronisiert.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {!isGuest && (
              <label className="inline-flex items-center">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => e.target.files[0] && importImageAndExtract(e.target.files[0])} 
                  disabled={isExtracting || uploading}
                />
                <Button 
                  as="span" 
                  variant="outline" 
                  size="sm" 
                  className="cursor-pointer flex items-center"
                  disabled={isExtracting || uploading}
                >
                  {isExtracting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Bild importieren
                </Button>
              </label>
            )}
            <Button className="bg-emerald-600 hover:bg-emerald-700" size="sm" onClick={openNew}>Neuer Fang</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filter */}
        <div className="flex flex-wrap gap-3 items-end mb-4">
          <div className="flex items-center gap-2"><Filter className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-300">Filter</span></div>
          <MobileSelect
            value={filters.species}
            onValueChange={(v) => setFilters(prev => ({ ...prev, species: v }))}
            placeholder="Art"
            label="Fischart filtern"
            options={[
              { value: 'all', label: 'Alle Arten' },
              ...speciesList.map(s => ({ value: s, label: s }))
            ]}
            className="w-40 bg-gray-800/50 border-gray-700 text-white"
          />
          <MobileSelect
            value={filters.spot}
            onValueChange={(v) => setFilters(prev => ({ ...prev, spot: v }))}
            placeholder="Spot"
            label="Spot filtern"
            options={[
              { value: 'all', label: 'Alle Spots' },
              ...spots.map(s => ({ value: s.id, label: s.name }))
            ]}
            className="w-40 bg-gray-800/50 border-gray-700 text-white"
          />
          <Input type="datetime-local" value={filters.from} onChange={(e)=>setFilters(prev=>({...prev, from: e.target.value}))} className="bg-gray-800/50 border-gray-700 text-white" />
          <Input type="datetime-local" value={filters.to} onChange={(e)=>setFilters(prev=>({...prev, to: e.target.value}))} className="bg-gray-800/50 border-gray-700 text-white" />
          <Badge variant="outline" className="ml-auto">{filtered.length} von {catches.length}</Badge>
        </div>

        {/* Editor */}
        {editing && (
          <div className="p-4 rounded-xl bg-gray-800/40 mb-4">
            <div className="grid md:grid-cols-2 gap-3">
              <Input placeholder="Art*" value={form.species} onChange={(e)=>setForm({...form, species: e.target.value})} className="bg-gray-800/50 border-gray-700 text-white" />
              <MobileSelect
                value={form.spot_id}
                onValueChange={(v) => setForm({ ...form, spot_id: v })}
                placeholder="Spot"
                label="Spot auswählen"
                options={spots.map(s => ({ value: s.id, label: s.name }))}
                className="bg-gray-800/50 border-gray-700 text-white"
              />
              <Input type="number" placeholder="Länge (cm)" value={form.length_cm} onChange={(e)=>setForm({...form, length_cm: e.target.value})} className="bg-gray-800/50 border-gray-700 text-white" />
              <Input type="number" step="0.1" placeholder="Gewicht (kg)" value={form.weight_kg} onChange={(e)=>setForm({...form, weight_kg: e.target.value})} className="bg-gray-800/50 border-gray-700 text-white" />
              <Input placeholder="Köder" value={form.bait_used} onChange={(e)=>setForm({...form, bait_used: e.target.value})} className="bg-gray-800/50 border-gray-700 text-white" />
              <Input type="datetime-local" value={form.catch_time} onChange={(e)=>setForm({...form, catch_time: e.target.value})} className="bg-gray-800/50 border-gray-700 text-white" />
              <Input placeholder="Notizen" value={form.notes} onChange={(e)=>setForm({...form, notes: e.target.value})} className="bg-gray-800/50 border-gray-700 text-white md:col-span-2" />
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="inline-flex items-center">
                  <input type="file" accept="image/*" className="hidden" onChange={(e)=> e.target.files[0] && uploadPhoto(e.target.files[0])} disabled={uploading} />
                  <Button as="span" variant="outline" size="sm" className="cursor-pointer" disabled={uploading}>
                    {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
                    Foto {form.photo_url ? 'ändern' : 'hochladen'}
                  </Button>
                </label>
                {form.photo_url && <img src={form.photo_url} alt="Fang" className="mt-2 h-24 rounded-xl object-cover" />}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <Button variant="outline" onClick={cancelEdit}><X className="w-4 h-4 mr-1" />Abbrechen</Button>
              <Button onClick={save} className="bg-emerald-600 hover:bg-emerald-700">Speichern</Button>
            </div>
          </div>
        )}

        {/* Liste */}
        <SwipeToRefresh onRefresh={refreshData}>
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} className="p-4 rounded-xl bg-gray-800/40 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="font-semibold text-white">{c.species}</div>
                <div className="flex flex-wrap gap-3 text-sm text-gray-300 mt-1">
                  <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(c.catch_time).toLocaleString('de-DE')}</div>
                  {c.length_cm && <div className="flex items-center gap-1"><Ruler className="w-4 h-4" />{c.length_cm} cm</div>}
                  {c.weight_kg && <div className="flex items-center gap-1"><Weight className="w-4 h-4" />{c.weight_kg} kg</div>}
                  {c.spot_id && <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{spots.find(s => s.id === c.spot_id)?.name}</div>}
                </div>
                {c.bait_used && <div className="text-gray-400 text-sm mt-1">Köder: {c.bait_used}</div>}
                {c.notes && <div className="text-gray-300 text-sm mt-1">{c.notes}</div>}
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" onClick={()=>startEdit(c)}><Edit2 className="w-4 h-4" /></Button>
                <Button size="icon" variant="destructive" onClick={()=>remove(c)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-gray-400">Keine Fänge gefunden.</div>}
          {hasMore && !filters.species && !filters.from && !filters.to && filters.spot === "all" && (
            <Button
              onClick={loadMore}
              variant="outline"
              className="w-full border-gray-700 text-gray-300 hover:text-white"
              disabled={loadingMore}
            >
              {loadingMore ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Mehr laden
            </Button>
          )}
        </div>
        </SwipeToRefresh>
      </CardContent>
    </Card>
  );
}