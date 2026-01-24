import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import WakeWordIndicator from "@/components/header/WakeWordIndicator";
import MiniWaterAnalysis from "@/components/home/MiniWaterAnalysis";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ catches: 0, spots: 0, weekCatches: 0, points: 0 });
  const [weather, setWeather] = useState(null);
  const [nearestSpot, setNearestSpot] = useState(null);
  const [activeTrips, setActiveTrips] = useState(0);
  const [lastCatch, setLastCatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voiceStatus, setVoiceStatus] = useState({
    isActive: false,
    mode: null,
    isListening: false,
    error: null
  });

  useEffect(() => {
    const cleanupSessions = async () => {
      try {
        await base44.functions.invoke('cleanupOldSessions');
      } catch (error) {
        console.log('Session cleanup (ignoriert):', error.message);
      }
    };
    
    cleanupSessions();
    loadData();

    const handleVoiceStatusUpdate = (event) => {
      if (event.detail) {
        setVoiceStatus(event.detail);
      }
    };

    window.addEventListener('wake-word-status-change', handleVoiceStatusUpdate);

    return () => {
      window.removeEventListener('wake-word-status-change', handleVoiceStatusUpdate);
    };
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const [catches, spots, plans] = await Promise.all([
        base44.entities.Catch.list('-catch_time', 10).catch(() => []),
        base44.entities.Spot.list('', 20).catch(() => []),
        base44.entities.FishingPlan.filter({ is_active: true }).catch(() => [])
      ]);

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weekCatches = catches.filter(c => new Date(c.catch_time) > oneWeekAgo).length;

      setStats({
        catches: catches.length,
        spots: spots.length,
        weekCatches,
        points: currentUser?.total_points || 0
      });

      setActiveTrips(plans.length);
      if (catches.length > 0) {
        setLastCatch(catches[0]);
      }

      const savedLocation = localStorage.getItem("fm_current_location");
      if (savedLocation) {
        try {
          const location = JSON.parse(savedLocation);
          
          // Null-safe location check
          if (location && location.lat != null && location.lon != null) {
            const weatherPromise = fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,wind_speed_10m,weather_code&timezone=auto`
            ).then(res => res.json());

            const [weatherData] = await Promise.all([weatherPromise]);
            
            if (weatherData && weatherData.current) {
              setWeather(weatherData.current);
            }

            if (spots.length > 0) {
              let nearest = spots[0];
              let minDist = 999999;
              
              spots.forEach(spot => {
                if (spot.latitude != null && spot.longitude != null && location.lat != null && location.lon != null) {
                  const dist = Math.sqrt(
                    Math.pow(spot.latitude - location.lat, 2) + 
                    Math.pow(spot.longitude - location.lon, 2)
                  );
                  if (dist < minDist) {
                    minDist = dist;
                    nearest = spot;
                  }
                }
              });
              
              if (nearest) {
                setNearestSpot(nearest);
              }
            }
          }
        } catch (parseError) {
          console.warn('Location parse error:', parseError);
        }
      }
    } catch (error) {
      console.error("Fehler beim Laden:", error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherDesc = (code) => {
    if ([0, 1].includes(code)) return "Sonnig";
    if ([2, 3].includes(code)) return "Bewoelkt";
    if ([45, 48].includes(code)) return "Nebel";
    if ([51, 53, 55, 61, 63, 65].includes(code)) return "Regen";
    return "Wechselhaft";
  };

  const allFeatures = [
    { name: "Karte", path: "Map" },
    { name: "Wetter", path: "Weather" },
    { name: "Fangbuch", path: "Logbook" },
    { name: "KI-Chat", path: "AIAssistant" },
    { name: "KI-Cam", path: "AI" },
    { name: "Gewaesser", path: "WaterAnalysis" },
    { name: "Gear", path: "Gear" },
    { name: "Trips", path: "TripPlanner" },
    { name: "Community", path: "Community" },
    { name: "Ranking", path: "Ranking" },
    { name: "Regeln", path: "Rules" },
    { name: "Pruefung", path: "ExamPrep" },
    { name: "Lizenzen", path: "Licenses" },
    { name: "Geraete", path: "Devices" },
    { name: "Arcade", path: "Arcade" },
    { name: "Premium", path: "PremiumPlans" },
    { name: "Settings", path: "Settings" }
  ];

  if (loading) {
    return (
      <div className="h-screen bg-gray-950 flex items-center justify-center overflow-hidden">
        <div className="text-cyan-400 text-sm">Laden...</div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.nickname || user?.full_name?.split(' ')[0] || "Angler";
    if (hour >= 5 && hour < 12) return `Guten Morgen, ${name}`;
    if (hour >= 12 && hour < 18) return `Guten Tag, ${name}`;
    if (hour >= 18 && hour < 22) return `Guten Abend, ${name}`;
    return `Hallo, ${name}`;
  };

  return (
    <div className="h-screen bg-gray-950 overflow-hidden">
      <div className="h-full max-w-[1600px] mx-auto px-2 py-2 flex flex-col gap-2">
        
        <div className="flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              {getGreeting()}
            </h1>
            {user && user.premium_plan_id && user.premium_plan_id !== 'free' && (
              <span className="text-sm font-semibold text-amber-400">
                {user.premium_plan_id === 'basic' ? 'Basic' : user.premium_plan_id === 'pro' ? 'Pro' : user.premium_plan_id === 'ultimate' ? 'Ultimate' : ''}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500">KI-Voice:</div>
            <WakeWordIndicator 
              isActive={voiceStatus.isActive}
              mode={voiceStatus.mode}
              isListening={voiceStatus.isListening}
              error={voiceStatus.error}
            />
          </div>
        </div>

        <div className="flex-shrink-0 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-gray-900/50 border-gray-800 p-3">
            <CardContent className="p-0 space-y-1">
              <div className="text-xs text-gray-400">Fänge</div>
              <div className="text-3xl font-bold text-cyan-400">{stats.catches}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800 p-3">
            <CardContent className="p-0 space-y-1">
              <div className="text-xs text-gray-400">Spots</div>
              <div className="text-3xl font-bold text-emerald-400">{stats.spots}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800 p-3">
            <CardContent className="p-0 space-y-1">
              <div className="text-xs text-gray-400">Diese Woche</div>
              <div className="text-3xl font-bold text-amber-400">{stats.weekCatches}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800 p-3">
            <CardContent className="p-0 space-y-1">
              <div className="text-xs text-gray-400">Punkte</div>
              <div className="text-3xl font-bold text-purple-400">{stats.points}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-2 min-h-0">
          
          <div className="col-span-8 flex flex-col gap-2 min-h-0">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="bg-gray-900/50 border-gray-800 p-4">
                <CardContent className="p-0 space-y-2">
                  <CardTitle className="text-sm text-cyan-400">Aktuelles Wetter</CardTitle>
                  {weather ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white">{Math.round(weather.temperature_2m)}°</span>
                        <span className="text-sm text-gray-400">{getWeatherDesc(weather.weather_code)}</span>
                      </div>
                      <div className="text-xs text-gray-500">Wind: {Math.round(weather.wind_speed_10m)} m/s</div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">Keine Wetterdaten verfügbar</div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800 p-4">
                <CardContent className="p-0 space-y-2">
                  <CardTitle className="text-sm text-emerald-400">Nächster Spot</CardTitle>
                  {nearestSpot ? (
                    <>
                      <div className="text-base font-semibold text-white truncate">{nearestSpot.name}</div>
                      <div className="text-xs text-gray-400">{nearestSpot.water_type}</div>
                      <Link to={createPageUrl('Map')} className="text-xs text-cyan-400 hover:underline block">
                        Auf Karte anzeigen
                      </Link>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">Kein Spot in der Nähe</div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="bg-gray-900/50 border-gray-800 p-4">
                <CardContent className="p-0 space-y-2">
                  <CardTitle className="text-sm text-purple-400">Aktive Trips</CardTitle>
                  <div className="text-3xl font-bold text-white">{activeTrips}</div>
                  <Link to={createPageUrl('TripPlanner')} className="text-xs text-cyan-400 hover:underline block">
                    Planer öffnen
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800 p-4">
                <CardContent className="p-0 space-y-2">
                  <CardTitle className="text-sm text-amber-400">Letzter Fang</CardTitle>
                  {lastCatch ? (
                    <>
                      <div className="text-base font-semibold text-white truncate">{lastCatch.species}</div>
                      <div className="text-xs text-gray-400">{lastCatch.length_cm ? `${lastCatch.length_cm} cm` : 'Keine Länge'}</div>
                      <Link to={createPageUrl('Logbook')} className="text-xs text-cyan-400 hover:underline block">
                        Zum Fangbuch
                      </Link>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">Noch kein Fang registriert</div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="mb-2">
              <MiniWaterAnalysis />
            </div>

            <Card className="bg-gray-900/50 border-gray-800 flex-1 min-h-0 flex flex-col">
              <CardHeader className="p-3 flex-shrink-0">
                <CardTitle className="text-sm text-white">Alle Funktionen</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 flex-1 overflow-auto">
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {allFeatures.map((feature) => (
                    <Link
                      key={feature.path}
                      to={createPageUrl(feature.path)}
                      className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg p-3 text-center transition-all"
                    >
                      <div className="text-xs font-semibold text-cyan-400">{feature.name}</div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-4">
            <Card className="bg-gray-900/50 border-gray-800 h-full flex flex-col">
              <CardHeader className="p-3 flex-shrink-0">
                <CardTitle className="text-sm text-cyan-400">KI-Assistent</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 flex-1 flex flex-col gap-3">
                <Link
                  to={createPageUrl('AIAssistant')}
                  className="flex-1 bg-gradient-to-br from-cyan-600/20 to-emerald-600/20 border border-cyan-500/30 rounded-xl p-4 hover:from-cyan-600/30 hover:to-emerald-600/30 transition-all flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="text-base font-semibold text-white mb-1">Chat starten</div>
                    <div className="text-xs text-gray-400">Frag mich etwas!</div>
                  </div>
                </Link>
                
                <div className="text-xs text-gray-500 text-center">Schnellfragen:</div>
                
                <Link to={createPageUrl('Weather')} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 hover:bg-gray-700/50 transition-all">
                  <div className="text-xs text-white text-center">Wie ist das Wetter?</div>
                </Link>
                
                <Link to={createPageUrl('Map')} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 hover:bg-gray-700/50 transition-all">
                  <div className="text-xs text-white text-center">Zeig mir Spots</div>
                </Link>
                
                <Link to={createPageUrl('WaterAnalysis')} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 hover:bg-gray-700/50 transition-all">
                  <div className="text-xs text-white text-center">Gewässer analysieren</div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}