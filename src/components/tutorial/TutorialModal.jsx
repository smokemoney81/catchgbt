import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/components/i18n/LanguageContext';

const playAudio = async (audioData) => {
  try {
    if (!audioData || !(audioData instanceof ArrayBuffer)) {
      console.error("Invalid audio data");
      return;
    }
    
    const blob = new Blob([audioData], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    audio.onended = () => URL.revokeObjectURL(url);
    audio.onerror = () => URL.revokeObjectURL(url);

    await audio.play();
  } catch (error) {
    console.error("Audio playback failed:", error);
  }
};

const playTextWithBrowserTTS = (text) => {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return resolve();
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 1.0;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    const voices = window.speechSynthesis.getVoices();
    const germanVoice = voices.find(voice => voice.lang.startsWith('de'));
    if (germanVoice) {
      utterance.voice = germanVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  });
};

const tutorialSteps = {
  de: [
    {
      title: "Willkommen bei CatchGbt",
      content: "CatchGbt ist deine ultimative Angel-App mit modernster KI-Technologie. Erfasse Fänge, plane Trips, analysiere Gewässer, nutze Satellitendaten und lass dich vom KI-Buddy in Echtzeit beraten. Lass uns gemeinsam alle Funktionen erkunden!",
      image: "https://images.unsplash.com/photo-1593352222543-c24119688536?q=80&w=800"
    },
    {
      title: "Dashboard - Deine Zentrale",
      content: "Das Dashboard ist dein Ausgangspunkt. Hier siehst du auf einen Blick: Aktuelle Wetter-Daten, dein nächster Spot, verbundene Geräte-Status, letzte Fänge und Quick-Actions. Alle wichtigen Infos an einem Ort - perfekt für schnelle Entscheidungen!",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800"
    },
    {
      title: "Fangbuch mit KI-Analyse",
      content: "Logge deine Fänge mit Fotos, GPS-Position, Größe und Gewicht. Die KI analysiert automatisch Fischart, Gesundheit und gibt Tipps. EXIF-Daten werden ausgelesen und der nächste Spot wird vorgeschlagen. Alle Fänge in deiner persönlichen Historie!",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800"
    },
    {
      title: "Interaktive Karte & Spots",
      content: "Entdecke Angelspots auf der interaktiven Karte! Füge eigene Spots hinzu, markiere Favoriten, teile sie mit Freunden. Nutze Wasser-Analyse-Layer, Tiefenkarten und Community-Spots. Filtere nach Gewässertyp und plane deine Route direkt in der App!",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=800"
    },
    {
      title: "AR-Gewässer Ansicht",
      content: "Erlebe deine Angelgewässer in 3D mit Augmented Reality! Sieh Unterwasser-Topografie, Tiefenstrukturen und Hotspots in Echtzeit. Nutze deine Kamera und erkunde virtuelle Gewässer-Modelle. Perfekt für die Spot-Planung!",
      image: "https://images.unsplash.com/photo-1617802690658-1173a812650d?q=80&w=800"
    },
    {
      title: "Wetter & Intelligente Alarme",
      content: "Erhalte präzise Wetter-Vorhersagen für jeden Spot: Temperatur, Wind, Niederschlag, Luftdruck, UV-Index. Stelle individuelle Wetter-Alarme ein (Regen, Sturm, Temperatur) und werde benachrichtigt, wenn perfekte Angel-Bedingungen herrschen!",
      image: "https://images.unsplash.com/photo-1561553590-267fc716698b?q=80&w=800"
    },
    {
      title: "KI Chat-Buddy",
      content: "Dein persönlicher Angel-Assistent! Stelle Fragen zu Ködern, Techniken, Fischarten oder Spots. Der KI-Buddy kennt den Kontext deiner aktuellen Seite und gibt maßgeschneiderte Antworten. Verfügbar auf jeder Seite als Floating-Button!",
      image: "https://images.unsplash.com/photo-1535378620166-273708d44e4c?q=80&w=800"
    },
    {
      title: "KI-Kamera & Bissanzeiger",
      content: "Nutze deine Smartphone-Kamera zur Live-Analyse! Die KI erkennt Fischarten in Echtzeit, gibt Größen-Schätzungen und Gesundheits-Status. Der intelligente Bissanzeiger nutzt deine Kamera für visuelle Biss-Erkennung - nie wieder einen Biss verpassen!",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800"
    },
    {
      title: "Voice Control mit KI",
      content: "Steuere die App per Sprache! Sage 'Hey Buddy' und stelle Fragen, logge Fänge oder frage nach dem Wetter - komplett freihändig. Perfekt beim Angeln, wenn die Hände nass oder beschäftigt sind. Die KI versteht natürliche Sprache!",
      image: "https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=800"
    },
    {
      title: "Satelliten-Gewässeranalyse",
      content: "Nutze echte Satellitendaten zur Gewässer-Analyse! Sieh Wassertemperatur, Chlorophyll-Konzentration, Trübung und Algen-Risiko. Die KI berechnet Hotspots, vergleicht Spots und erstellt Fang-Prognosen basierend auf Satelliten- und Wetterdaten!",
      image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?q=80&w=800"
    },
    {
      title: "KI-Köder-Mischer",
      content: "Erstelle perfekte Boilie- und Futter-Rezepte mit KI-Unterstützung! Wähle Zutaten, sieh die Attraktivität pro Fischart und lass die KI optimierte Rezepte vorschlagen. Speichere Favoriten, bewerte Erfolge und teile Rezepte mit der Community!",
      image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=800"
    },
    {
      title: "Ausrüstung & Setup",
      content: "Verwalte deine Angel-Ausrüstung: Ruten, Rollen, Schnüre, Haken und mehr. Erstelle verschiedene Setups für unterschiedliche Zielfische und Bedingungen. Erhalte KI-basierte Empfehlungen für optimale Kombinationen!",
      image: "https://images.unsplash.com/photo-1473116763249-2faaef8e28d4?q=80&w=800"
    },
    {
      title: "Trip-Planer mit KI",
      content: "Plane deine Angel-Trips intelligent! Wähle Zielfisch und Spot, die KI analysiert Wetter, Gewässer-Bedingungen und gibt Schritt-für-Schritt-Anleitung. Premium-Nutzer erhalten detaillierte Erfolgs-Prognosen und erweiterte Analysen!",
      image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=800"
    },
    {
      title: "Community & Social",
      content: "Tausche dich mit anderen Anglern aus! Teile Fänge, Spots und Tipps. Like und kommentiere Posts, folge anderen Anglern. Nimm an Challenges teil und verdiene Community-Punkte. Zusammen macht Angeln noch mehr Spaß!",
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800"
    },
    {
      title: "Ranking & Achievements",
      content: "Messe dich mit anderen Anglern! Sammle Punkte durch Fänge, Quiz-Teilnahmen und Community-Aktivitäten. Sieh deine Position im täglichen, wöchentlichen, monatlichen und Gesamt-Ranking. Schalte Achievements und Badges frei!",
      image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=800"
    },
    {
      title: "Regeln & Schonzeiten",
      content: "Prüfe schnell Mindestmaße und Schonzeiten für jede Fischart nach Bundesland. Die App warnt dich bei untermäßigen Fischen und zeigt dir, welche Arten gerade geschont sind. So bleibst du immer legal und schützt die Bestände!",
      image: "https://images.unsplash.com/photo-1473445730015-841f29a9490b?q=80&w=800"
    },
    {
      title: "Angelschein-Prüfung",
      content: "Bereite dich optimal auf die Angelschein-Prüfung vor! Über 500 Originalfragen aus allen Kategorien (Allgemein, Gerätekunde, Gewässerkunde, Gesetzeskunde) nach Bundesland. Quiz-Modus mit Erklärungen, Statistiken und Lernfortschritt!",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800"
    },
    {
      title: "Lizenzen & Dokumente",
      content: "Verwalte alle Angelscheine und Gewässer-Karten digital! Lade Fotos hoch, setze Ablaufdaten und erhalte Erinnerungen vor Ablauf. Hab alle wichtigen Dokumente immer dabei - auch offline verfügbar!",
      image: "https://images.unsplash.com/photo-1554224311-beee1c7c0b46?q=80&w=800"
    },
    {
      title: "Geräte-Integration",
      content: "Verbinde externe Geräte wie Bissanzeiger, Echolote oder Smartwatches! Erhalte Push-Benachrichtigungen bei Bissen, sieh Echolot-Daten in der App und synchronisiere Aktivitäten. IoT für Angler!",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800"
    },
    {
      title: "Arcade & Minispiele",
      content: "Hab Spaß zwischen den Sessions! Spiele Angel-Minispiele wie 'Precision Cast' (Zielwerfen), 'Fishing Match-3' oder 'Bite Timing'. Sammle Highscores, schalte Achievements frei und entspanne dich spielerisch!",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800"
    },
    {
      title: "Premium-Pläne",
      content: "Wähle den Plan, der zu dir passt: Free (Basis-Features), Basic (erweiterte Spots & Karte), Pro (KI-Features & Analyse), Ultimate (alle Features inkl. Satelliten-Daten). 3 Tage kostenlos testen nach Registrierung!",
      image: "https://images.unsplash.com/photo-1607863680198-23d4b2565df0?q=80&w=800"
    },
    {
      title: "Einstellungen & Anpassung",
      content: "Personalisiere die App: Wähle deine Sprache (17 Sprachen verfügbar), Theme (Hell/Dunkel), Einheiten (Metrisch/Imperial). Passe Ticker-Geschwindigkeit, KI-Stimme, Sound-Effekte und Wetter-Alarme an. Deine App, deine Regeln!",
      image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=800"
    },
    {
      title: "PWA & Offline-Modus",
      content: "Installiere CatchGbt als Progressive Web App auf deinem Smartphone! Nutze viele Features auch offline: Fangbuch-Einträge, gespeicherte Spots, Lizenzen und Regeln. Automatische Synchronisation bei Netzwerk-Verfügbarkeit!",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800"
    },
    {
      title: "Viel Erfolg beim Angeln!",
      content: "Du kennst jetzt alle Features von CatchGbt! Starte mit dem Dashboard, logge deinen ersten Fang und erkunde die KI-Tools. Bei Fragen steht dir der KI-Buddy jederzeit zur Seite. Tight Lines und Petri Heil! 🎣",
      image: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?q=80&w=800"
    }
  ],
  en: [
    {
      title: "Welcome to CatchGbt",
      content: "CatchGbt is your ultimate fishing app with cutting-edge AI technology. Log catches, plan trips, analyze waters, use satellite data, and get real-time advice from the AI buddy. Let's explore all features together!",
      image: "https://images.unsplash.com/photo-1593352222543-c24119688536?q=80&w=800"
    },
    {
      title: "Dashboard - Your Command Center",
      content: "The dashboard is your starting point. See at a glance: Current weather data, your nearest spot, connected device status, recent catches, and quick actions. All important information in one place - perfect for quick decisions!",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800"
    },
    {
      title: "Logbook with AI Analysis",
      content: "Log your catches with photos, GPS position, size, and weight. AI automatically analyzes species, health, and gives tips. EXIF data is read out and the nearest spot is suggested. All catches in your personal history!",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800"
    },
    {
      title: "Interactive Map & Spots",
      content: "Discover fishing spots on the interactive map! Add your own spots, mark favorites, share with friends. Use water analysis layers, depth maps, and community spots. Filter by water type and plan your route directly in the app!",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=800"
    },
    {
      title: "AR Water View",
      content: "Experience your fishing waters in 3D with augmented reality! See underwater topography, depth structures, and hotspots in real-time. Use your camera and explore virtual water models. Perfect for spot planning!",
      image: "https://images.unsplash.com/photo-1617802690658-1173a812650d?q=80&w=800"
    },
    {
      title: "Weather & Smart Alerts",
      content: "Get precise weather forecasts for every spot: temperature, wind, precipitation, air pressure, UV index. Set individual weather alerts (rain, storm, temperature) and get notified when perfect fishing conditions occur!",
      image: "https://images.unsplash.com/photo-1561553590-267fc716698b?q=80&w=800"
    },
    {
      title: "AI Chat Buddy",
      content: "Your personal fishing assistant! Ask questions about baits, techniques, fish species, or spots. The AI buddy knows the context of your current page and gives tailored answers. Available on every page as a floating button!",
      image: "https://images.unsplash.com/photo-1535378620166-273708d44e4c?q=80&w=800"
    },
    {
      title: "AI Camera & Bite Detector",
      content: "Use your smartphone camera for live analysis! AI recognizes fish species in real-time, gives size estimates and health status. The intelligent bite detector uses your camera for visual bite detection - never miss a bite again!",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800"
    },
    {
      title: "Voice Control with AI",
      content: "Control the app by voice! Say 'Hey Buddy' and ask questions, log catches, or ask about the weather - completely hands-free. Perfect when fishing and your hands are wet or busy. The AI understands natural language!",
      image: "https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=800"
    },
    {
      title: "Satellite Water Analysis",
      content: "Use real satellite data for water analysis! See water temperature, chlorophyll concentration, turbidity, and algae risk. AI calculates hotspots, compares spots, and creates catch forecasts based on satellite and weather data!",
      image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?q=80&w=800"
    },
    {
      title: "AI Bait Mixer",
      content: "Create perfect boilie and groundbait recipes with AI support! Choose ingredients, see attractiveness per fish species, and let the AI suggest optimized recipes. Save favorites, rate success, and share recipes with the community!",
      image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=800"
    },
    {
      title: "Gear & Setup",
      content: "Manage your fishing gear: rods, reels, lines, hooks, and more. Create different setups for different target fish and conditions. Get AI-based recommendations for optimal combinations!",
      image: "https://images.unsplash.com/photo-1473116763249-2faaef8e28d4?q=80&w=800"
    },
    {
      title: "Trip Planner with AI",
      content: "Plan your fishing trips intelligently! Choose target fish and spot, AI analyzes weather, water conditions, and gives step-by-step guidance. Premium users get detailed success forecasts and advanced analysis!",
      image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=800"
    },
    {
      title: "Community & Social",
      content: "Exchange with other anglers! Share catches, spots, and tips. Like and comment on posts, follow other anglers. Participate in challenges and earn community points. Fishing is even more fun together!",
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800"
    },
    {
      title: "Ranking & Achievements",
      content: "Compete with other anglers! Collect points through catches, quiz participation, and community activities. See your position in daily, weekly, monthly, and overall rankings. Unlock achievements and badges!",
      image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=800"
    },
    {
      title: "Rules & Closed Seasons",
      content: "Quickly check minimum sizes and closed seasons for each fish species by region. The app warns you about undersized fish and shows which species are currently protected. Stay legal and protect stocks!",
      image: "https://images.unsplash.com/photo-1473445730015-841f29a9490b?q=80&w=800"
    },
    {
      title: "Fishing License Exam",
      content: "Prepare optimally for the fishing license exam! Over 500 original questions from all categories (General, Tackle Knowledge, Water Knowledge, Legal Knowledge) by region. Quiz mode with explanations, statistics, and learning progress!",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800"
    },
    {
      title: "Licenses & Documents",
      content: "Manage all fishing licenses and permits digitally! Upload photos, set expiration dates, and receive reminders before expiration. Have all important documents always with you - also available offline!",
      image: "https://images.unsplash.com/photo-1554224311-beee1c7c0b46?q=80&w=800"
    },
    {
      title: "Device Integration",
      content: "Connect external devices like bite alarms, fish finders, or smartwatches! Receive push notifications on bites, see fish finder data in the app, and synchronize activities. IoT for anglers!",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800"
    },
    {
      title: "Arcade & Mini Games",
      content: "Have fun between sessions! Play fishing mini games like 'Precision Cast' (target casting), 'Fishing Match-3', or 'Bite Timing'. Collect high scores, unlock achievements, and relax playfully!",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800"
    },
    {
      title: "Premium Plans",
      content: "Choose the plan that suits you: Free (basic features), Basic (extended spots & map), Pro (AI features & analysis), Ultimate (all features incl. satellite data). Test for 3 days free after registration!",
      image: "https://images.unsplash.com/photo-1607863680198-23d4b2565df0?q=80&w=800"
    },
    {
      title: "Settings & Customization",
      content: "Personalize the app: Choose your language (17 languages available), theme (light/dark), units (metric/imperial). Adjust ticker speed, AI voice, sound effects, and weather alerts. Your app, your rules!",
      image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=800"
    },
    {
      title: "PWA & Offline Mode",
      content: "Install CatchGbt as a Progressive Web App on your smartphone! Use many features offline: logbook entries, saved spots, licenses, and rules. Automatic synchronization when network is available!",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800"
    },
    {
      title: "Good luck fishing!",
      content: "You now know all features of CatchGbt! Start with the dashboard, log your first catch, and explore the AI tools. The AI buddy is always there to help with questions. Tight lines! 🎣",
      image: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?q=80&w=800"
    }
  ]
};

export default function TutorialModal({ isOpen, onClose }) {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingStep, setPlayingStep] = useState(null);

  const steps = tutorialSteps[language] || tutorialSteps.de;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlayAudio = async (stepIndex) => {
    if (isPlaying) return;

    setIsPlaying(true);
    setPlayingStep(stepIndex);

    try {
      const step = steps[stepIndex];
      const text = `${step.title}. ${step.content}`;

      try {
        const response = await base44.functions.invoke('backendTextToSpeech', { 
          text: text.trim(),
          speechRate: 1.0,
          voiceId: "alloy",
          quality: "standard"
        }, {
          responseType: 'arraybuffer'
        });

        const contentType = response.headers?.['content-type'] || '';
        
        if (contentType.includes('application/json')) {
          const decoder = new TextDecoder();
          const jsonText = decoder.decode(response.data);
          const jsonData = JSON.parse(jsonText);
          
          if (jsonData.fallback_to_browser) {
            await playTextWithBrowserTTS(text);
            return;
          }
        }

        if (response.data && response.data instanceof ArrayBuffer && response.data.byteLength > 0) {
          await playAudio(response.data);
        } else {
          await playTextWithBrowserTTS(text);
        }
      } catch (networkError) {
        console.error('Backend TTS error:', networkError);
        await playTextWithBrowserTTS(text);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    } finally {
      setIsPlaying(false);
      setPlayingStep(null);
    }
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-3xl bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700/80 transition-colors"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>

          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-8 pt-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6 rounded-xl overflow-hidden">
                  <img
                    src={currentStepData.image}
                    alt={currentStepData.title}
                    className="w-full h-48 object-cover"
                  />
                </div>

                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-bold text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]">
                    {currentStepData.title}
                  </h2>
                  <button
                    onClick={() => handlePlayAudio(currentStep)}
                    disabled={isPlaying}
                    className="ml-4 p-2 rounded-full bg-emerald-600/20 hover:bg-emerald-600/30 transition-colors disabled:opacity-50"
                    title="Text vorlesen"
                  >
                    {isPlaying && playingStep === currentStep ? (
                      <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-emerald-400" />
                    )}
                  </button>
                </div>

                <p className="text-gray-300 leading-relaxed mb-6">
                  {currentStepData.content}
                </p>

                <div className="text-center text-sm text-gray-500 mb-4">
                  Schritt {currentStep + 1} von {steps.length}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between pt-6 border-t border-gray-800">
              <Button
                onClick={handlePrev}
                disabled={currentStep === 0}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Zurück
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={onClose}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Tutorial beenden
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="bg-cyan-600 hover:bg-cyan-700 flex items-center gap-2"
                >
                  Weiter
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}