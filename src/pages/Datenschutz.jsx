import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Datenschutz() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="glass-morphism border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]">
            DATENSCHUTZERKLÄRUNG - Catchly
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 prose prose-invert max-w-none">
          
          <div className="mb-6 text-sm text-gray-400">
            <p><strong>Stand:</strong> 25.02.2026</p>
          </div>

          <h2 className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">1. Verantwortlicher</h2>
          <p>
            Sebastian Schorn<br />
            Brucknerstr. 12<br />
            50181 Bedburg<br />
            Deutschland<br />
            E-Mail: kaisaschnitt99@gmail.com
          </p>

          <h2 className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">2. Allgemeine Hinweise</h2>
          <p>
            Der Schutz personenbezogener Daten hat höchste Priorität. Die Verarbeitung erfolgt gemäß der Datenschutz-Grundverordnung (DSGVO) sowie dem Bundesdatenschutzgesetz (BDSG).
          </p>

          <h2 className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">3. Verarbeitete Daten</h2>
          <p>
            Die App „Catchly" verarbeitet - abhängig von der Nutzung - folgende Daten:
          </p>
          <ul>
            <li>Geräte- und Nutzungsdaten (z. B. Betriebssystem, App-Version, technische Logdaten)</li>
            <li>Standortdaten (GPS) nur nach aktiver Einwilligung des Nutzers</li>
            <li>Inhaltsdaten aus dem Fangbuch (z. B. Fischart, Ort, Datum/Uhrzeit, Notizen, Fotos)</li>
            <li>Texteingaben im KI-Chat</li>
            <li>Sprachdaten ausschließlich zur unmittelbaren Verarbeitung; keine dauerhafte Speicherung</li>
          </ul>

          <h2 className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">4. Zweck der Datenverarbeitung</h2>
          <ul>
            <li>Bereitstellung der App-Funktionen</li>
            <li>KI-gestützte Fang- und Ausrüstungsempfehlungen</li>
            <li>Speicherung und Anzeige persönlicher Fangdaten</li>
            <li>Sicherheit und Stabilität der App</li>
          </ul>

          <h2 className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">5. KI- und API-Nutzung</h2>
          <p>
            Für KI-Funktionen werden Nutzereingaben an externe KI-APIs übermittelt.
            Die Verarbeitung erfolgt ausschließlich zur Beantwortung der Anfrage.
            Eine Nutzung zu Trainingszwecken findet nicht statt.
          </p>

          <h2 className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">6. Speicherung und Löschung</h2>
          <ul>
            <li>Speicherung lokal auf dem Endgerät oder in der vom Nutzer genutzten Datenbank</li>
            <li>Daten können jederzeit gelöscht werden</li>
            <li>Bei Deinstallation werden lokale Daten entfernt</li>
          </ul>

          <h2 className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">7. Weitergabe von Daten</h2>
          <p>
            Eine Weitergabe personenbezogener Daten an Dritte erfolgt nicht, außer bei gesetzlicher Verpflichtung oder technisch notwendigen Diensten (z. B. Karten, Wetter).
          </p>

          <h2 className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">8. Rechte der Nutzer</h2>
          <p>
            Nutzer haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerruf erteilter Einwilligungen gemäß DSGVO.
          </p>

          <h2 className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">9. Datensicherheit</h2>
          <p>
            Es werden technische und organisatorische Maßnahmen zum Schutz der Daten eingesetzt.
          </p>

          <h2 className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">10. Änderungen</h2>
          <p>
            Diese Datenschutzerklärung kann angepasst werden.
          </p>

          <h2 className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">11. Kontakt</h2>
          <p>
            E-Mail: kaisaschnitt99@gmail.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
}