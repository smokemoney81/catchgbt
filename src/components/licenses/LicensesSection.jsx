import React, { useEffect, useState } from "react";
import { License } from "@/entities/License";
import { UploadFile } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, X } from "lucide-react";

export default function LicensesSection() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ type: "", number: "", valid_until: "", photo_url: "", notes: "" });

  const load = async () => setItems(await License.list("-valid_until"));
  useEffect(()=> { load(); }, []);

  const save = async () => {
    if (editing === "new") await License.create(form);
    else await License.update(editing, form);
    setEditing(null);
    setForm({ type: "", number: "", valid_until: "", photo_url: "", notes: "" });
    load();
  };

  const remove = async (l) => { await License.delete(l.id); load(); };

  const upload = async (file) => {
    const { file_url } = await UploadFile({ file });
    setForm(prev => ({ ...prev, photo_url: file_url }));
  };

  const soon = (d) => {
    if (!d) return false;
    const diff = new Date(d).getTime() - Date.now();
    return diff > 0 && diff < 14*24*3600*1000;
  };

  return (
    <Card className="glass-morphism border-gray-800 rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Lizenzen</CardTitle>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={()=>{ setEditing("new"); setForm({ type:"", number:"", valid_until:"", photo_url:"", notes:"" }); }}>Neue Lizenz</Button>
        </div>
      </CardHeader>
      <CardContent>
        {editing && (
          <div className="p-4 rounded-xl bg-gray-800/40 mb-4">
            <div className="grid md:grid-cols-2 gap-3">
              <Input placeholder="Typ*" value={form.type} onChange={(e)=>setForm({...form, type: e.target.value})} className="bg-gray-800/50 border-gray-700 text-white" />
              <Input placeholder="Nummer*" value={form.number} onChange={(e)=>setForm({...form, number: e.target.value})} className="bg-gray-800/50 border-gray-700 text-white" />
              <Input type="date" value={form.valid_until} onChange={(e)=>setForm({...form, valid_until: e.target.value})} className="bg-gray-800/50 border-gray-700 text-white" />
              <Input placeholder="Notizen" value={form.notes} onChange={(e)=>setForm({...form, notes: e.target.value})} className="bg-gray-800/50 border-gray-700 text-white" />
              <div className="md:col-span-2">
                <input type="file" accept="image/*" onChange={(e)=> e.target.files[0] && upload(e.target.files[0])} />
                {form.photo_url && <img src={form.photo_url} alt="lizenz" className="mt-2 h-24 rounded-xl object-cover" />}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <Button variant="outline" onClick={()=>setEditing(null)}><X className="w-4 h-4 mr-1" />Abbrechen</Button>
              <Button onClick={save} className="bg-emerald-600 hover:bg-emerald-700">Speichern</Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {items.map(l => (
            <div key={l.id} className="p-3 rounded-xl bg-gray-800/40 flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">{l.type} • {l.number}</div>
                <div className="text-gray-300 text-sm flex items-center gap-2"><Calendar className="w-4 h-4" />Gültig bis: {l.valid_until}</div>
                {soon(l.valid_until) && <div className="text-amber-400 text-xs mt-1">Erinnerung: läuft bald ab.</div>}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={()=>{ setEditing(l.id); setForm({ type: l.type||"", number: l.number||"", valid_until: l.valid_until||"", photo_url: l.photo_url||"", notes: l.notes||"" }); }}>Bearbeiten</Button>
                <Button variant="destructive" onClick={()=>remove(l)}>Löschen</Button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="text-gray-400">Noch keine Lizenzen.</div>}
        </div>
      </CardContent>
    </Card>
  );
}