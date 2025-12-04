import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save, Settings2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function GeneralSettings() {
    const [settings, setSettings] = useState({ language: 'de', theme: 'dark', units: 'metric' });
    const [isSaving, setIsSaving] = useState(false);
    const [initialSettings, setInitialSettings] = useState({});

    useEffect(() => {
        (async () => {
            try {
                const user = await User.me();
                if (user && user.settings) {
                    const currentSettings = {
                        language: user.settings.language || 'de',
                        theme: user.settings.theme || 'dark',
                        units: user.settings.units || 'metric'
                    };
                    setSettings(currentSettings);
                    setInitialSettings(currentSettings);
                }
            } catch (error) {
                toast.error("Fehler beim Laden der Einstellungen.");
            }
        })();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await User.updateMyUserData({ settings });
            toast.success("Allgemeine Einstellungen gespeichert!");
            setInitialSettings(settings);
        } catch (error) {
            toast.error("Fehler beim Speichern der Einstellungen.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings);

    return (
        <div className="border-t border-gray-800 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-gray-400" />
                Allgemein
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm text-gray-400 block mb-2">Sprache</label>
                    <Select value={settings.language} onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}>
                        <SelectTrigger className="w-full bg-gray-800/50 border-gray-700 text-white rounded-lg">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="de">Deutsch</SelectItem>
                            <SelectItem value="en">Englisch</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-sm text-gray-400 block mb-2">Einheiten</label>
                    <Select value={settings.units} onValueChange={(value) => setSettings(prev => ({ ...prev, units: value }))}>
                        <SelectTrigger className="w-full bg-gray-800/50 border-gray-700 text-white rounded-lg">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="metric">Metrisch (cm, kg)</SelectItem>
                            <SelectItem value="imperial">Imperial (in, lbs)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div className="mt-4 flex justify-end">
                <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Speichert...' : 'Änderungen speichern'}
                </Button>
            </div>
        </div>
    );
}