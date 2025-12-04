import React, { useState, useEffect, useRef } from "react";
import { User } from "@/entities/User";
import { useLocation } from "@/components/location/LocationManager";
import { Lightbulb, MapPin, Fish, Cloud } from "lucide-react";
// The import for isPremiumActive is removed as per the change request.
import { getPersonalizedGreeting } from "@/components/utils/greetings";

const marketingTips = [
  "Dein KI-Buddy liefert dir maßgeschneiderte Fangtipps, damit du genau weißt, wo und wann die Fische beißen.",
  "Der intelligente Angel-Assistent analysiert Wetterdaten und empfiehlt dir, welche Köder du einsetzen solltest.",
  "Mit dem KI-Buddy hast du einen digitalen Ratgeber, der dir bei der Wahl des optimalen Angelplatzes hilft.",
  "Die App zeigt dir GPS-Karten von Seen und Flüssen, sodass du Hotspots einfach findest.",
  "Dank der GPS-Funktion speichert dein KI-Buddy deine Lieblingsplätze für die nächste Tour.",
  "Der integrierte Wetterdienst liefert minutengenaue Vorhersagen, um deinen Trip perfekt zu planen.",
  "Mit dem digitalen Fangbuch kannst du jeden Fang mit Foto, Gewicht und Ort festhalten.",
  "Dein KI-Buddy analysiert deine Fänge und erkennt Muster für bessere Erfolgschancen.",
  "Die App gibt dir Hinweise, wie sich Mondphasen auf das Beißverhalten auswirken.",
  "Erhalte Empfehlungen zur Angelausrüstung basierend auf Gewässertyp und Zielfisch.",
  "Der KI-Assistent warnt dich bei Wetterumschwüngen und Sturmgefahr rechtzeitig.",
  "Lass dir Schonzeiten, Mindestmaße und Fangquoten direkt in der App anzeigen.",
  "Mit dem Buddy dokumentierst du deine Erfolge und siehst deine persönliche Statistik.",
  "Die App erinnert dich an anstehende Angelscheine oder Lizenzverlängerungen.",
  "Durch das Teilen deiner Fänge kannst du in der Community Tipps austauschen.",
  "Die KI schlägt dir neue Spots vor, die andere Angler noch nicht entdeckt haben.",
  "Dank intelligenter Datenanalyse verrät dir die App die besten Tageszeiten zum Angeln.",
  "Das Logbuch sorgt dafür, dass du deine Fänge nie wieder vergisst.",
  "Dein KI-Buddy unterstützt dich beim Anlegen von Touren und erstellt eine Packliste.",
  "Du erhältst sofortige Benachrichtigungen, wenn sich die Bedingungen ändern.",
  "Die App hilft dir, Köderwahl und Technik an Jahreszeiten anzupassen.",
  "Verbinde dich mit anderen Anglern, um gemeinsam neue Hotspots zu erkunden.",
  "Die integrierte GPS-Navigation führt dich sicher zu abgelegenen Gewässern.",
  "Dein Assistent speichert die Wassertemperatur bei jedem Fang für späteren Vergleich.",
  "Mit Wetter-Widgets hast du den aktuellen Wind und Luftdruck immer im Blick.",
  "Der KI-Buddy gibt dir Feedback zu deiner Fangstrategie und schlägt Verbesserungen vor.",
  "Plane deine Ausflüge mit automatisierten Wetter- und Mondkalendern.",
  "Überprüfe Wasserstände und Flusspegel in Echtzeit direkt in der App.",
  "Die App lernt aus deinen Vorlieben und personalisiert die Tipps.",
  "Die Fangstatistik zeigt dir, welche Köder am erfolgreichsten waren.",
  "Der KI-Assistent empfiehlt dir, wann es sich lohnt, den Angelplatz zu wechseln.",
  "Nutze Offline-Karten, um auch ohne Netz die besten Stellen zu finden.",
  "Mit nur einem Klick kannst du deine Fangdaten exportieren und sichern.",
  "Die App informiert dich über lokale Wettbewerbe und Events.",
  "Dein KI-Buddy erinnert dich, ausreichend Verpflegung und Ausrüstung mitzunehmen.",
  "Erhalte Tipps zur Pflege deines Equipments und zur richtigen Lagerung.",
  "Die Chat-Funktion ermöglicht es dir, dem Assistenten Fragen zu stellen.",
  "Die App liefert dir Hintergrundwissen über Fischarten und deren Verhalten.",
  "Mit dem Buddy kannst du Notizen und Fotos direkt an Fangbuch-Einträge anhängen.",
  "Die GPS-Funktion markiert gefangene Arten auf der Karte für spätere Auswertungen.",
  "Dein Assistent berechnet die Wahrscheinlichkeit eines Fangerfolgs für verschiedene Zeiten.",
  "Die App ist mehrsprachig, sodass du sie auf Deutsch und anderen Sprachen nutzen kannst.",
  "Über Push-Mitteilungen hält dich der KI-Buddy über alle wichtigen Änderungen auf dem Laufenden.",
  "Sieh dir historische Wetterdaten an, um deine zukünftigen Touren zu optimieren.",
  "Die App zeigt dir Angelshops in der Nähe für spontane Einkäufe.",
  "Dein KI-Buddy warnt dich vor gefährlichen Strömungen oder Eisflächen.",
  "Nutze Filter, um deine Fangstatistiken nach Zeitraum oder Gewässer zu analysieren.",
  "Die interaktive Karte ermöglicht es dir, Routen zu speichern und zu teilen.",
  "Die App integriert Informationen zu Fischereiregionen und Lizenzen.",
  "Der KI-Assistent gibt dir Tipps, wie du deine Carbonruten richtig pflegst.",
  "Mit personalisierten Herausforderungen bleibst du motiviert und lernst dazu.",
  "Dein Buddy schlägt dir Übungen vor, um deine Wurftechnik zu verbessern.",
  "Die App informiert dich über invasive Arten und Schutzmaßnahmen.",
  "Durch die Wetterintegration siehst du die UV-Strahlung für Sonnenschutzplanung.",
  "Die Fangübersicht zeigt dir, welche Fische zu welcher Jahreszeit aktiv sind.",
  "Dein Assistent sendet dir Erinnerungen, wenn der Beißindex besonders hoch ist.",
  "Die App berücksichtigt Gezeiten und Strömungszyklen bei ihren Vorschlägen.",
  "Du kannst in der App deine Ausrüstung katalogisieren und verwalten.",
  "Der KI-Buddy hilft dir, deine Köderbox zu organisieren nach Bedarf.",
  "Dank personalisierter Tipps wirst du zum echten Profi am Wasser.",
  "Die App informiert dich über Angelmessen und Workshops in deiner Nähe.",
  "Dein Assistent lernt aus deinen Misserfolgen und zeigt dir Alternativen auf.",
  "Erhalte saisonale Newsletter mit Updates und neuen Funktionen.",
  "Die App zeigt dir, welche Köderfarbe bei bestimmten Wasserbedingungen wirkt.",
  "Dein KI-Buddy arbeitet auch offline, damit du in der Wildnis nicht auf ihn verzichten musst.",
  "Die Wettervorhersage umfasst detaillierte Windrichtung und -stärke.",
  "Die App bietet Tutorials zu Knotentechniken und Montageanleitungen.",
  "Plane deine Touren nach Sonnenauf- und -untergang mit dem integrierten Kalender.",
  "Dein Assistent erinnert dich, wenn du neues Equipment warten musst.",
  "Erhalte Tipps zur Anpassung deiner Taktik bei wechselndem Luftdruck.",
  "Die App zeigt dir die besten Plätze für unterschiedliche Fischarten.",
  "Dein KI-Buddy bewertet deine Fangdaten und erstellt Prognosen für deine nächste Tour.",
  "Die Community-Funktion ermöglicht dir, Erfolgsrezepte mit anderen zu teilen.",
  "Die App informiert dich über aktuelle Schonzeiten und Verbote.",
  "Der Assistent berät dich bei der Auswahl der richtigen Schnur für jede Situation.",
  "Nutze die App, um Beißzeiten und Fressphasen zu dokumentieren.",
  "Dein KI-Buddy gibt dir Tipps zur Tarnung und Geräuschreduzierung.",
  "Die App kombiniert Satellitenbilder mit Angelkarten für präzise Navigation.",
  "Mit dem Buddy entdeckst du verborgene Hotspots, die auf herkömmlichen Karten fehlen.",
  "Der Assistent berechnet den optimalen Zeitpunkt, um den Köder zu wechseln.",
  "Die App informiert dich über Angelvereine und Mitgliedschaften.",
  "Dein KI-Buddy weist dich auf nachhaltige Angelmethoden hin.",
  "Speichere deine Lieblingsrezepte für die Zubereitung frisch gefangener Fische.",
  "Die App kann deine Fangfotos analysieren und Fischarten erkennen.",
  "Dein Assistent nutzt KI, um Muster in deinem Angelverhalten zu erkennen.",
  "Die App bietet Tipps, wie du deine Batterien im Freien effizient nutzt.",
  "Dein KI-Buddy erinnert dich, die Umwelt sauber zu halten und Müll mitzunehmen.",
  "Die App informiert dich über die Wasserqualität und mögliche Algenblüten.",
  "Dank cloudbasierter Speicherung sind deine Daten immer gesichert.",
  "Der Assistent synchronisiert sich über Geräte hinweg, damit du überall Zugriff hast.",
  "Die App ermöglicht es dir, deine Fänge in sozialen Netzwerken zu teilen.",
  "Dein KI-Buddy hilft dir, deine Angelschnur richtig zu wechseln und zu pflegen.",
  "Erhalte Hinweise auf Fischtiefen und Strömungsverläufe in Seen.",
  "Die App erinnert dich, Ersatzköder und Haken einzupacken.",
  "Dein Assistent motiviert dich mit Erfolgsbadges und Ranglisten.",
  "Die App erlaubt es dir, private Notizen zu jedem Fang hinzuzufügen.",
  "Dein KI-Buddy berücksichtigt luftdruckbedingte Veränderungen im Beißverhalten.",
  "Erhalte Tipps zur sicheren Lagerung deiner Fische bis zur Rückkehr.",
  "Die App überwacht deine Schritte und zählt zurückgelegte Kilometer.",
  "Dein Assistent empfiehlt dir passende Kleidungswahl je nach Wetter.",
  "Die App bietet Tutorial-Videos zu verschiedenen Angeltechniken.",
  "Dein KI-Buddy liefert dir Tipps, wie du deine Köderauswahl saisonal anpasst.",
  "Erhalte einen Überblick über deine persönliche Entwicklung als Angler.",
  "Die App warnt dich vor gefährlichen Tierarten in bestimmten Gebieten.",
  "Dein Assistent unterstützt dich bei der Planung langer Angelreisen.",
  "Die App hilft dir, im Dunkeln sicher zu navigieren mit Karten und Kompass.",
  "Dein KI-Buddy zeigt dir, wie du deine Ausrüstung energiesparend nutzt.",
  "Die App weist dich auf Fischereimessen und neue Trends hin.",
  "Dein Assistent erinnert dich, Pausen einzulegen und ausreichend zu trinken.",
  "Die App ermöglicht eine detaillierte Filterung deiner Statistiken.",
  "Dein KI-Buddy motiviert dich mit personalisierten Zielen und Milestones.",
  "Die App bietet Offline-Lehrmaterialien für vernetztes Lernen.",
  "Dein Assistent zeigt dir, wie du Angelknoten richtig bindest.",
  "Die App passt ihre Empfehlungen an dein Erfahrungslevel an.",
  "Dein KI-Buddy begleitet dich als zuverlässiger Partner auf jedem Angelausflug.",
];

const getDefaultTips = (user, location) => {
  const tips = [];
  
  // Free for All Hinweis
  tips.push({
    icon: <Lightbulb className="w-4 h-4 text-green-400" />,
    text: "FREE FOR ALL - Alle Premium-Funktionen sind jetzt kostenlos verfügbar!",
  });

  // Persönliche Begrüßung mit Tageszeit
  if (user) {
    tips.push({
      icon: <Lightbulb className="w-4 h-4 text-yellow-400" />,
      text: getPersonalizedGreeting(user) + "!",
    });
  } else {
    tips.push({
      icon: <Lightbulb className="w-4 h-4 text-yellow-400" />,
      text: "Willkommen bei CatchGbt!",
    });
  }

  // Standort
  if (location && location.name) {
    const locationName = String(location.name).slice(0, 20);
    tips.push({
      icon: <MapPin className="w-4 h-4 text-emerald-400" />,
      text: `Standort: ${locationName}`,
    });
  }

  // Add all marketing tips
  const tipColors = ['text-blue-300', 'text-green-300', 'text-purple-300', 'text-orange-300', 'text-cyan-300', 'text-red-300', 'text-emerald-300', 'text-pink-300'];
  marketingTips.forEach((text, index) => {
    tips.push({
      icon: <Lightbulb className={`w-4 h-4 ${tipColors[index % tipColors.length]}`} />,
      text: text,
    });
  });

  // KI-Buddy Tipps (für alle)
  tips.push({
    icon: <Lightbulb className="w-4 h-4 text-green-400" />,
    text: "Dein KI-Buddy hilft bei der Fangplanung und beantwortet alle Angel-Fragen!",
  });
  tips.push({
    icon: <Fish className="w-4 h-4 text-emerald-400" />,
    text: "Schnelle Köder-Empfehlungen? Frag einfach den KI-Buddy nach den besten Tipps!",
  });
  tips.push({
    icon: <MapPin className="w-4 h-4 text-teal-400" />,
    text: "KI-Buddy kennt die besten Gewässer-Strategien für jeden Zielfisch!",
  });
  tips.push({
    icon: <Cloud className="w-4 h-4 text-slate-400" />,
    text: "Wetter-Analyse unklar? Der KI-Buddy erklärt dir die besten Angel-Bedingungen!",
  });

  return tips;
};

export default function EnhancedTicker() {
  const [tips, setTips] = useState([]);
  const [user, setUser] = useState(null);
  const { currentLocation } = useLocation();
  const tickerRef = useRef(null);
  const [speed, setSpeed] = useState(100);

  useEffect(() => {
    (async () => {
      try {
        const u = await User.me();
        setUser(u);
        setSpeed(u?.settings?.ticker_speed || 100);
      } catch (error) {
        setUser(null);
      }
    })();
  }, []);

  useEffect(() => {
    setTips(getDefaultTips(user, currentLocation));

    const handleNewTip = (e) => {
      const detail = e?.detail || {};
      const newTip = {
        icon: detail.icon || <Lightbulb className="w-4 h-4 text-yellow-400" />,
        text: String(detail.text || "").slice(0, 200),
      };
      if (newTip.text) {
        setTips(prev => [...prev, newTip].slice(-10));
      }
    };

    window.addEventListener("tickerAddTip", handleNewTip);
    return () => window.removeEventListener("tickerAddTip", handleNewTip);
  }, [user, currentLocation]);

  const duration = tips.reduce((acc, tip) => {
    const textLength = String(tip?.text || "").length;
    return acc + textLength;
  }, 0) * (0.1 / (speed/100));

  return (
    <div className="w-full h-8 bg-gray-900 overflow-hidden flex items-center border-b border-gray-800">
      <div className="flex items-center h-full">
        <div 
          ref={tickerRef}
          className="whitespace-nowrap flex items-center h-full text-gray-300 text-sm pl-4" 
          style={{
            animation: `scroll ${Math.max(20, duration)}s linear infinite`,
          }}
        >
          {tips.concat(tips).map((tip, index) => {
            const tipText = String(tip?.text || "");
            if (!tipText) return null;
            return (
              <div key={index} className="flex items-center mr-6">
                {tip.icon}
                <span className="ml-2">{tipText}</span>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}