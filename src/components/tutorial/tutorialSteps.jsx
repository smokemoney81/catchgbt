// App-spezifische Tutorial-Schritte mit echten Screenshots der CatchGbt App
// Jeder Schritt referenziert eine konkrete Seite (route) und nennt UI-Elemente,
// die der Nutzer dort wirklich sieht.

export const tutorialSteps = {
  de: [
    {
      title: "Willkommen bei CatchGbt",
      route: "Home",
      content: "CatchGbt ist deine Angel-App mit KI-Buddy, Karten, Wetter, Fangbuch und Satellitendaten. Im Tutorial gehen wir Schritt fuer Schritt jede Seite der App durch und zeigen dir, was du dort genau machen kannst.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/8351cc81b_generated_image.png"
    },
    {
      title: "Dashboard",
      route: "Dashboard",
      content: "Auf dem Dashboard siehst du oben das aktuelle Wetter und den naechsten Spot, den blauen Hinweis-Link zur Karte, den Wetterradar und die KI-Angelempfehlung. Tippe auf 'Analysieren', um Empfehlungen aus Wetter und deinem Fangbuch zu erhalten.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/e1bb8a71b_generated_image.png"
    },
    {
      title: "Fangbuch",
      route: "Logbook",
      content: "Im Fangbuch siehst du alle deine Faenge mit Foto, Art, Laenge, Gewicht und Datum. Mit dem orangen Kamera-Button vom Homescreen machst du ein Foto und die KI traegt Fischart, Groesse und Spot automatisch ein.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/cd74ae3ba_generated_image.png"
    },
    {
      title: "Karte und Spots",
      route: "Map",
      content: "Auf der Karte siehst du deine Spots, Community-Spots und Gewaesser mit Filter (Fluss, See, Teich). Tippe auf einen Pin, um Details zu sehen, oder lege per langem Druck einen neuen Spot an. Route-Planung oeffnet Google Maps.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/de8ae04af_generated_image.png"
    },
    {
      title: "Wetter und Alarme",
      route: "Weather",
      content: "Auf der Wetter-Seite findest du Temperatur, Wind, Luftdruck, Niederschlag und das Radar. In den Einstellungen aktivierst du Wetter-Alarme, sodass du benachrichtigt wirst, wenn die Bedingungen passen.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/0eaa7bb70_generated_image.png"
    },
    {
      title: "KI Chat-Buddy",
      route: "AIAssistant",
      content: "Der KI Chat-Buddy beantwortet Fragen zu Koedern, Techniken und Fischarten. Tippe deine Frage ein oder nutze das Mikrofon. Antworten koennen automatisch vorgelesen werden, wenn die Vorlesefunktion aktiv ist.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/77dbe4a84_generated_image.png"
    },
    {
      title: "KI-Kamera und Bissanzeiger",
      route: "AI",
      content: "Die KI-Kamera erkennt Fischarten live im Bild und schaetzt Groesse und Zustand. Der Bissanzeiger nutzt die Kamera, um Bewegung an Pose oder Spitze zu erkennen und gibt einen Alarm.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/34479e913_generated_image.png"
    },
    {
      title: "AR Gewaesser-Ansicht",
      route: "ARView",
      content: "In der AR-Ansicht legst du eine 3D-Tiefenkarte deines Gewaessers ueber das Kamerabild. Bewegungssensoren zeigen dir Strukturen und Hotspots in deiner Umgebung.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/ca6f51067_generated_image.png"
    },
    {
      title: "Voice Control",
      route: "VoiceControl",
      content: "Sage 'Hey Buddy', um die Sprachsteuerung zu starten. Du kannst Faenge loggen, Wetter abfragen oder zu Seiten navigieren - alles haendefrei. Das Mikrofon-Symbol oben zeigt dir den Status.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/ed44d9ca5_generated_image.png"
    },
    {
      title: "Gewaesser-Analyse",
      route: "WaterAnalysis",
      content: "Die Gewaesser-Analyse nutzt Satellitendaten und zeigt dir Wassertemperatur, Chlorophyll, Truebung und Algenrisiko. Vergleiche Spots, lass Hotspots berechnen und exportiere die Auswertung.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/96c6ff128_generated_image.png"
    },
    {
      title: "Koeder-Mischer",
      route: "BaitMixer",
      content: "Im Koeder-Mischer kombinierst du Zutaten und siehst die Attraktivitaet je Fischart in Prozent. Speichere deine Rezepte, bewerte sie nach dem Einsatz und teile sie mit der Community.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/356d1c82e_generated_image.png"
    },
    {
      title: "Ausruestung",
      route: "Gear",
      content: "Verwalte Ruten, Rollen, Schnuere und Haken in eigenen Setups. Lege Setups fuer Hecht, Karpfen oder Spinnfischen an und ruf sie beim Trip-Planen direkt auf.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/d22e686a3_generated_image.png"
    },
    {
      title: "Trip-Planer",
      route: "TripPlanner",
      content: "Im Trip-Planer waehlst du Zielfisch und Spot. Die KI generiert eine Schritt-fuer-Schritt-Anleitung mit Wetter, Ausruestung und besten Zeiten. Aktive Trips bleiben oben sichtbar.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/40a4e4c9a_generated_image.png"
    },
    {
      title: "Community",
      route: "Community",
      content: "In der Community teilst du Posts und Faenge, kommentierst, gibst Likes und nimmst an Wettbewerben teil. Ueber den Chat-Bereich tauschst du dich live mit anderen Anglern aus.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/66aa4ae02_generated_image.png"
    },
    {
      title: "Ranking",
      route: "Rank",
      content: "Im Ranking siehst du dich im Vergleich zu anderen Anglern - taeglich, woechentlich, monatlich und gesamt. Punkte bekommst du fuer Faenge, Quiz-Antworten und Community-Aktivitaet.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/db56b7b94_generated_image.png"
    },
    {
      title: "Regeln und Schonzeiten",
      route: "AngelscheinPruefungSchonzeiten",
      content: "Hier pruefst du Mindestmasse und Schonzeiten je Bundesland. Ein roter Warner auf dem Dashboard zeigt aktive Schonzeiten in deiner Region direkt an.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/6bd8b5826_Screenshot_20260506_075851_Comet.jpg"
    },
    {
      title: "Angelschein-Pruefung",
      route: "Quiz",
      content: "Lerne mit ueber 500 Original-Pruefungsfragen aus den Kategorien Allgemein, Geraetekunde, Gewaesserkunde und Gesetzeskunde. Jede Frage hat eine Erklaerung, dein Fortschritt wird gespeichert.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/c9b3ac324_generated_image.png"
    },
    {
      title: "Lizenzen",
      route: "Licenses",
      content: "Lade Fotos deiner Angelscheine und Gewaesserkarten hoch, hinterlege das Ablaufdatum und du wirst rechtzeitig erinnert. Alles ist auch offline verfuegbar.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/67a6193dc_generated_image.png"
    },
    {
      title: "Geraete-Integration",
      route: "Devices",
      content: "Verbinde Bissanzeiger, Echolote oder Smartwatches. Du siehst Akkustand und Signal, bekommst Push-Benachrichtigungen bei Bissen und kannst Echolot-Daten in der App auswerten.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/eb1eb77d9_generated_image.png"
    },
    {
      title: "Arcade-Spiele",
      route: "Match3Game",
      content: "Zwischen den Sessions kannst du in der Arcade kleine Spiele wie Precision Cast, Match-3 oder Bite Timing spielen, Highscores sammeln und Achievements freischalten.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/03091aa2f_generated_image.png"
    },
    {
      title: "Premium-Plaene",
      route: "PremiumPlans",
      content: "Auf der Premium-Seite siehst du Free, Basic, Pro und Ultimate. Premium schaltet KI-Funktionen, Satellitendaten und erweiterte Karten frei. Drei Tage kostenlos testen.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/507add5b7_Screenshot_20260506_075927_Comet.jpg"
    },
    {
      title: "Einstellungen",
      route: "Settings",
      content: "In den Einstellungen waehlst du Sprache, Einheiten, Theme, Stimme, Sound und Wetter-Alarme. Hier aktivierst du auch die Vorlesefunktion fuer den KI-Buddy.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/dd5da882a_generated_image.png"
    },
    {
      title: "PWA und Offline",
      route: "Dashboard",
      content: "Installiere CatchGbt als App ueber den Install-Button. Spots, Wetter, Lizenzen und Regeln sind dann auch ohne Internet verfuegbar und werden automatisch synchronisiert.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/a653338da_generated_image.png"
    },
    {
      title: "Profil",
      route: "Profile",
      content: "Auf deinem Profil siehst du deinen Avatar, Mitglied seit Datum, Gesamtfaenge, groessten Fisch, Anzahl Arten und Punkte. Achievement-Badges zeigen freigeschaltete Erfolge an.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/6ad01210e_generated_image.png"
    },
    {
      title: "Fang-Statistiken",
      route: "CatchStats",
      content: "Detaillierte Statistiken zu deinen Faengen: Faenge pro Monat, Fischart-Verteilung, groesste Faenge im Zeitverlauf und Durchschnittsgroessen. Hilft dir, Muster zu erkennen.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/592541dd9_generated_image.png"
    },
    {
      title: "Events",
      route: "Events",
      content: "Auf der Events-Seite findest du aktuelle Turniere und Aktionen mit Preisen und Countdown. Mit einem Tipp meldest du dich an und siehst die Teilnehmerzahl.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/aab6a50d1_generated_image.png"
    },
    {
      title: "Foto-Voting",
      route: "Community",
      content: "Beim Community-Voting bewertest du Fang-Fotos anderer Angler per Like-Button. Die Top-Fotos kommen ins Leaderboard und gewinnen am Ende des Zeitraums.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/fa4683e94_generated_image.png"
    },
    {
      title: "Clans",
      route: "Community",
      content: "Erstelle einen Clan oder tritt einem bei. Mitglieder sammeln gemeinsam Punkte fuer das Clan-Leaderboard. Im Clan-Bereich siehst du Mitglieder, Beitraege und kannst neue einladen.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/95dd9dcf5_generated_image.png"
    },
    {
      title: "Tiefenkarten-Crowdsourcing",
      route: "BathymetricCrowdsourcing",
      content: "Lade deine Echolot-Daten hoch und hilf, eine genaue Tiefenkarte deines Gewaessers zu bauen. Die App rechnet alle Beitraege zu einer Heatmap zusammen.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/2dc12a292_generated_image.png"
    },
    {
      title: "AR Knoten-Assistent",
      route: "ARKnotenAssistent",
      content: "Lerne Anglerknoten Schritt fuer Schritt mit 3D-Animation. Waehle einen Knoten wie Palomar oder Clinch, folge den Schritten und uebe direkt mit deiner Schnur.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/06b2cde71_generated_image.png"
    },
    {
      title: "Gebrauchte Ausruestung",
      route: "UsedGear",
      content: "Im Marktplatz kaufst und verkaufst du gebrauchte Angel-Ausruestung. Filter nach Kategorie, Zustand und Standort. Kontakt zum Verkaeufer direkt aus der App.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/1d9524c00_generated_image.png"
    },
    {
      title: "Shop",
      route: "Shop",
      content: "Im Shop findest du empfohlene Angel-Produkte mit Bewertungen und Direkt-Links zu Partnern. Filtere nach Kategorie wie Ruten, Rollen, Koeder oder Zubehoer.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/79580f951_generated_image.png"
    },
    {
      title: "Funktion-Bewertungen",
      route: "FunctionRatings",
      content: "Bewerte einzelne Features der App mit Sternen und einem Kommentar. Dein Feedback hilft uns, CatchGbt gezielt zu verbessern.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/2a663230d_generated_image.png"
    },
    {
      title: "Profil",
      route: "Profile",
      content: "Im Profil siehst du deinen Avatar, Mitglied seit, Gesamt-Faenge, groessten Fisch, Anzahl Arten und Punkte. Darunter erscheinen freigeschaltete Achievements und Badges.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/6ad01210e_generated_image.png"
    },
    {
      title: "Events",
      route: "Events",
      content: "Auf der Events-Seite findest du laufende und kommende Turniere mit Preisen, Countdown und Teilnehmerzahl. Tippe auf 'Anmelden', um teilzunehmen, das Hauptevent ist mit cyanfarbenem Rand hervorgehoben.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/aab6a50d1_generated_image.png"
    },
    {
      title: "Foto-Voting",
      route: "Community",
      content: "Im Community-Voting bewertest du Fang-Fotos anderer Angler per Wisch oder Herz-Button. Die Top 3 erscheinen unten als Leaderboard, dein Like zaehlt fuer das Wochen-Voting.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/fa4683e94_generated_image.png"
    },
    {
      title: "Clans",
      route: "Community",
      content: "Gruende oder tritt einem Clan bei und sammelt gemeinsam Punkte. Im Clan-Tab siehst du Banner, Mitglieder mit Avatar, Punkte je Mitglied und kannst Mitglieder einladen oder den Clan verlassen.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/95dd9dcf5_generated_image.png"
    },
    {
      title: "Tiefenkarten teilen",
      route: "BathymetricCrowdsourcing",
      content: "Lade deine Echolot-Daten hoch und hilf der Community, Tiefenkarten zu erstellen. Du siehst die Heatmap des Gewaessers, deine Beitraege und die letzten Uploader.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/2dc12a292_generated_image.png"
    },
    {
      title: "AR Knoten-Assistent",
      route: "ARKnotenAssistent",
      content: "Lerne Angelknoten Schritt fuer Schritt mit 3D-Animation. Waehle einen Knoten wie Palomar, sieh den Schwierigkeitsgrad und folge den Anweisungen Step 1 bis 7.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/06b2cde71_generated_image.png"
    },
    {
      title: "Gebrauchte Ausruestung",
      route: "UsedGear",
      content: "Im Used-Gear-Marktplatz kaufst und verkaufst du gebrauchte Ruten, Rollen, Koeder und Boxen. Jedes Inserat zeigt Preis, Zustand, Standort und Verkaeufer. Filter helfen beim Suchen.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/1d9524c00_generated_image.png"
    },
    {
      title: "Shop",
      route: "Shop",
      content: "Im Shop findest du Angelausruestung sortiert nach Kategorien mit Sterne-Bewertungen und Preisen. Der 'Kaufen'-Button leitet dich zu unseren Partnern.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/79580f951_generated_image.png"
    },
    {
      title: "Funktionen bewerten",
      route: "FunctionRatings",
      content: "Hilf uns, die App zu verbessern. Bewerte einzelne Features wie KI-Buddy, Karte oder Kamera mit Sternen und schreibe Kommentare. Deine Stimme zaehlt.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/2a663230d_generated_image.png"
    },
    {
      title: "Fang-Statistiken",
      route: "CatchStats",
      content: "Sieh deine Faenge als Diagramme: Faenge pro Monat, Verteilung der Fischarten, groesste Faenge im Zeitverlauf, Durchschnittsgroesse und Lieblingsart auf einen Blick.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/592541dd9_generated_image.png"
    },
    {
      title: "Viel Erfolg",
      route: "Dashboard",
      content: "Du kennst jetzt jede wichtige Seite der App. Starte am besten mit dem Dashboard, logge deinen ersten Fang und probier den KI-Buddy aus. Petri Heil und tight lines.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/8df626539_generated_image.png"
    }
  ],
  en: [
    {
      title: "Welcome to CatchGbt",
      route: "Home",
      content: "CatchGbt is your fishing app with AI buddy, maps, weather, logbook and satellite data. This tutorial walks you through every page step by step and shows what you can do there.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/8351cc81b_generated_image.png"
    },
    {
      title: "Dashboard",
      route: "Dashboard",
      content: "On the dashboard you see current weather and the nearest spot, the blue map link, the weather radar and the AI fishing recommendation. Tap 'Analyze' to get advice based on weather and your logbook.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/e1bb8a71b_generated_image.png"
    },
    {
      title: "Logbook",
      route: "Logbook",
      content: "In the logbook you see all your catches with photo, species, length, weight and date. With the orange camera button on the home screen you take a photo and the AI fills species, size and spot automatically.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/cd74ae3ba_generated_image.png"
    },
    {
      title: "Map and Spots",
      route: "Map",
      content: "On the map you see your spots, community spots and waters with filters (river, lake, pond). Tap a pin for details or long-press to add a new spot. Route planning opens Google Maps.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/de8ae04af_generated_image.png"
    },
    {
      title: "Weather and Alerts",
      route: "Weather",
      content: "The weather page shows temperature, wind, pressure, precipitation and the radar. In settings you enable weather alerts to be notified when conditions are right.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/0eaa7bb70_generated_image.png"
    },
    {
      title: "AI Chat Buddy",
      route: "AIAssistant",
      content: "The AI chat buddy answers questions about baits, techniques and species. Type or use the microphone. Answers can be read aloud automatically when text-to-speech is active.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/77dbe4a84_generated_image.png"
    },
    {
      title: "AI Camera and Bite Detector",
      route: "AI",
      content: "The AI camera recognizes species live and estimates size and condition. The bite detector uses the camera to detect motion of float or rod tip and alerts you.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/34479e913_generated_image.png"
    },
    {
      title: "AR Water View",
      route: "ARView",
      content: "In the AR view a 3D depth map of your water is overlaid on the camera image. Motion sensors reveal structures and hotspots in your surroundings.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/ca6f51067_generated_image.png"
    },
    {
      title: "Voice Control",
      route: "VoiceControl",
      content: "Say 'Hey Buddy' to start voice control. Log catches, ask for weather or navigate to pages - hands free. The microphone icon at the top shows the status.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/ed44d9ca5_generated_image.png"
    },
    {
      title: "Water Analysis",
      route: "WaterAnalysis",
      content: "Water analysis uses satellite data and shows water temperature, chlorophyll, turbidity and algae risk. Compare spots, calculate hotspots and export results.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/96c6ff128_generated_image.png"
    },
    {
      title: "Bait Mixer",
      route: "BaitMixer",
      content: "In the bait mixer you combine ingredients and see attractiveness per species in percent. Save recipes, rate them after use and share them with the community.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/356d1c82e_generated_image.png"
    },
    {
      title: "Gear",
      route: "Gear",
      content: "Manage rods, reels, lines and hooks in setups. Create setups for pike, carp or spinning and load them when planning a trip.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/d22e686a3_generated_image.png"
    },
    {
      title: "Trip Planner",
      route: "TripPlanner",
      content: "In the trip planner you choose target fish and spot. The AI generates a step-by-step plan with weather, gear and best times. Active trips stay on top.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/40a4e4c9a_generated_image.png"
    },
    {
      title: "Community",
      route: "Community",
      content: "In the community you share posts and catches, comment, like and join contests. The chat area lets you talk live with other anglers.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/66aa4ae02_generated_image.png"
    },
    {
      title: "Ranking",
      route: "Rank",
      content: "Ranking compares you to other anglers - daily, weekly, monthly and total. You earn points for catches, quiz answers and community activity.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/db56b7b94_generated_image.png"
    },
    {
      title: "Rules and Closed Seasons",
      route: "AngelscheinPruefungSchonzeiten",
      content: "Check minimum sizes and closed seasons by region. A red warner on the dashboard shows active closed seasons in your region.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/6bd8b5826_Screenshot_20260506_075851_Comet.jpg"
    },
    {
      title: "License Exam",
      route: "Quiz",
      content: "Practice with 500+ original exam questions across general, tackle, water and law topics. Every question has an explanation and your progress is saved.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/c9b3ac324_generated_image.png"
    },
    {
      title: "Licenses",
      route: "Licenses",
      content: "Upload photos of fishing licenses and permits, set the expiration date and get reminders. Everything stays available offline.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/67a6193dc_generated_image.png"
    },
    {
      title: "Devices",
      route: "Devices",
      content: "Connect bite alarms, fish finders or smartwatches. See battery and signal, get push alerts on bites and analyze fish finder data in the app.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/eb1eb77d9_generated_image.png"
    },
    {
      title: "Arcade Games",
      route: "Match3Game",
      content: "Between sessions play small games like Precision Cast, Match-3 or Bite Timing in the arcade, collect high scores and unlock achievements.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/03091aa2f_generated_image.png"
    },
    {
      title: "Premium Plans",
      route: "PremiumPlans",
      content: "On the premium page you see Free, Basic, Pro and Ultimate. Premium unlocks AI features, satellite data and extended maps. Three day free trial.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/507add5b7_Screenshot_20260506_075927_Comet.jpg"
    },
    {
      title: "Settings",
      route: "Settings",
      content: "In settings you choose language, units, theme, voice, sound and weather alerts. This is also where you enable text-to-speech for the AI buddy.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/dd5da882a_generated_image.png"
    },
    {
      title: "PWA and Offline",
      route: "Dashboard",
      content: "Install CatchGbt as an app via the install button. Spots, weather, licenses and rules then work without internet and sync automatically.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/a653338da_generated_image.png"
    },
    {
      title: "Profile",
      route: "Profile",
      content: "On your profile you see your avatar, member-since date, total catches, biggest fish, species count and points. Achievement badges show your unlocked milestones.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/6ad01210e_generated_image.png"
    },
    {
      title: "Catch Statistics",
      route: "CatchStats",
      content: "Detailed statistics about your catches: catches per month, species distribution, biggest catches over time and average sizes. Helps you spot patterns.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/592541dd9_generated_image.png"
    },
    {
      title: "Events",
      route: "Events",
      content: "On the events page you find current tournaments and actions with prizes and countdown. Tap to register and see how many anglers joined.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/aab6a50d1_generated_image.png"
    },
    {
      title: "Photo Voting",
      route: "Community",
      content: "In community voting you rate other anglers' catch photos with the like button. Top photos enter the leaderboard and win at the end of the period.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/fa4683e94_generated_image.png"
    },
    {
      title: "Clans",
      route: "Community",
      content: "Create a clan or join one. Members collect points together for the clan leaderboard. Inside the clan area you see members, contributions and can invite new ones.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/95dd9dcf5_generated_image.png"
    },
    {
      title: "Bathymetric Crowdsourcing",
      route: "BathymetricCrowdsourcing",
      content: "Upload your fish finder data and help build an accurate depth map of your water. The app combines all contributions into a heatmap.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/2dc12a292_generated_image.png"
    },
    {
      title: "AR Knot Assistant",
      route: "ARKnotenAssistent",
      content: "Learn fishing knots step by step with 3D animation. Choose a knot like Palomar or Clinch, follow the steps and practice directly with your line.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/06b2cde71_generated_image.png"
    },
    {
      title: "Used Gear",
      route: "UsedGear",
      content: "In the marketplace you buy and sell used fishing gear. Filter by category, condition and location. Contact the seller directly from the app.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/1d9524c00_generated_image.png"
    },
    {
      title: "Shop",
      route: "Shop",
      content: "The shop lists recommended fishing products with ratings and direct links to partners. Filter by category like rods, reels, baits or accessories.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/79580f951_generated_image.png"
    },
    {
      title: "Feature Ratings",
      route: "FunctionRatings",
      content: "Rate individual app features with stars and a comment. Your feedback helps us improve CatchGbt where it matters most.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/2a663230d_generated_image.png"
    },
    {
      title: "Profile",
      route: "Profile",
      content: "Your profile shows avatar, member since, total catches, biggest fish, species count and points. Below you see unlocked achievements and badges.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/6ad01210e_generated_image.png"
    },
    {
      title: "Events",
      route: "Events",
      content: "Events lists running and upcoming tournaments with prizes, countdown and participants. Tap 'Register' to join. The featured event has a cyan glowing border.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/aab6a50d1_generated_image.png"
    },
    {
      title: "Photo Voting",
      route: "Community",
      content: "In community voting you rate other anglers' catch photos by swipe or heart button. The top 3 appear as a leaderboard below, your like counts for the weekly vote.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/fa4683e94_generated_image.png"
    },
    {
      title: "Clans",
      route: "Community",
      content: "Found or join a clan and collect points together. The clan tab shows the banner, members with avatars, points per member and lets you invite or leave.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/95dd9dcf5_generated_image.png"
    },
    {
      title: "Share Depth Maps",
      route: "BathymetricCrowdsourcing",
      content: "Upload fish finder data to help the community build depth maps. You see the lake heatmap, your contributions and the latest uploaders.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/2dc12a292_generated_image.png"
    },
    {
      title: "AR Knot Assistant",
      route: "ARKnotenAssistent",
      content: "Learn fishing knots step by step with 3D animation. Choose a knot like Palomar, see the difficulty and follow steps 1 to 7.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/06b2cde71_generated_image.png"
    },
    {
      title: "Used Gear",
      route: "UsedGear",
      content: "On the used gear marketplace you buy and sell second-hand rods, reels, lures and boxes. Each listing shows price, condition, location and seller. Filters help you find what you need.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/1d9524c00_generated_image.png"
    },
    {
      title: "Shop",
      route: "Shop",
      content: "The shop offers fishing gear sorted by category with star ratings and prices. The 'Buy' button takes you to our partners.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/79580f951_generated_image.png"
    },
    {
      title: "Rate Features",
      route: "FunctionRatings",
      content: "Help us improve. Rate features like AI buddy, map or camera with stars and leave comments. Your voice matters.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/2a663230d_generated_image.png"
    },
    {
      title: "Catch Stats",
      route: "CatchStats",
      content: "See your catches as charts: catches per month, species distribution, biggest catches over time, average size and favorite species at a glance.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/592541dd9_generated_image.png"
    },
    {
      title: "Good Luck",
      route: "Dashboard",
      content: "You now know every key page of the app. Start on the dashboard, log your first catch and try the AI buddy. Tight lines.",
      image: "https://media.base44.com/images/public/68bb3d3b9f83dc1f55ef532b/8df626539_generated_image.png"
    }
  ]
};

export default tutorialSteps;