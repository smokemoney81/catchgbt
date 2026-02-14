import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import WakeWordIndicator from "@/components/header/WakeWordIndicator";
import MiniKarte from "@/components/home/MiniKarte";
import MiniKiBuddy from "@/components/home/MiniKiBuddy";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [weather, setWeather] = useState(null);
  const [nearestSpot, setNearestSpot] = useState(null);
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

      const spots = await base44.entities.Spot.list('', 100).catch(() => []);

      let userLocation = null;
      const savedLocation = localStorage.getItem("fm_current_location");
      
      if (savedLocation) {
        try {
          const location = JSON.parse(savedLocation);
          if (location && location.lat != null && location.lon != null) {
            userLocation = { lat: location.lat, lon: location.lon };
          }
        } catch (parseError) {
          console.warn('Location parse error:', parseError);
        }
      }

      if (!userLocation && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            userLocation = {
              lat: position.coords.latitude,
              lon: position.coords.longitude
            };
            localStorage.setItem("fm_current_location", JSON.stringify(userLocation));
          },
          (error) => console.warn('Geolocation error:', error),
          { timeout: 5000 }
        );
      }

      if (userLocation) {
        const weatherPromise = fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${userLocation.lat}&longitude=${userLocation.lon}&current=temperature_2m,wind_speed_10m,weather_code&timezone=auto`
        ).then(res => res.json());

        const [weatherData] = await Promise.all([weatherPromise]);
        
        if (weatherData && weatherData.current) {
          setWeather(weatherData.current);
        }

        if (spots.length > 0) {
          let nearest = null;
          let minDist = 999999;
          
          spots.forEach(spot => {
            if (spot.latitude != null && spot.longitude != null) {
              const R = 6371;
              const dLat = (spot.latitude - userLocation.lat) * Math.PI / 180;
              const dLon = (spot.longitude - userLocation.lon) * Math.PI / 180;
              const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(spot.latitude * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              const dist = R * c;
              
              if (dist < minDist) {
                minDist = dist;
                nearest = { ...spot, distance: dist };
              }
            }
          });
          
          if (nearest) {
            setNearestSpot(nearest);
          }
        }
      } else if (spots.length > 0) {
        setNearestSpot(spots[0]);
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.nickname || user?.full_name?.split(' ')[0] || "Angler";
    
    const morningGreetings = [
      `Guten Morgen, ${name}`,
      `Moin ${name}`,
      `Einen schoenen Morgen, ${name}`,
      `Frueh auf den Beinen, ${name}`,
      `Der fruehe Angler faengt den Fisch, ${name}`
    ];
    
    const afternoonGreetings = [
      `Guten Tag, ${name}`,
      `Hallo ${name}`,
      `Willkommen zurueck, ${name}`,
      `Schoen dich zu sehen, ${name}`,
      `Perfekt fuer eine Angelsession, ${name}`
    ];
    
    const eveningGreetings = [
      `Guten Abend, ${name}`,
      `Nabend ${name}`,
      `Zeit fuer die Abendaemmerung, ${name}`,
      `Die besten Bisse kommen jetzt, ${name}`,
      `Bereit fuer die Nachtangelei, ${name}`
    ];
    
    let greetings;
    if (hour >= 5 && hour < 12) greetings = morningGreetings;
    else if (hour >= 12 && hour < 18) greetings = afternoonGreetings;
    else if (hour >= 18 && hour < 22) greetings = eveningGreetings;
    else greetings = [`Hallo, ${name}`];
    
    const randomIndex = Math.floor(Math.random() * greetings.length);
    return greetings[randomIndex];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-cyan-400 text-sm">Laden...</div>
      </div>
    );
    }

    return (
    <div className="min-h-screen bg-gray-950 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">

        <div className="flex items-end justify-between border-b border-gray-800/50 pb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-500 mb-2">
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

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50">
          <MiniKiBuddy />
        </div>

        <div className="text-center py-3 px-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-blue-400">
            Entdecke auf der Karte neue Angelplaetze und plane deine Route direkt mit Google Maps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm p-8 border border-gray-800/50">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
            <div className="relative">
              <h3 className="text-sm font-semibold text-cyan-400/70 uppercase tracking-wider mb-6">Aktuelles Wetter</h3>
              {weather ? (
                <div className="space-y-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-bold text-white tracking-tight">{Math.round(weather.temperature_2m)}</span>
                    <span className="text-3xl text-gray-400">C</span>
                  </div>
                  <div className="text-lg text-gray-300">{getWeatherDesc(weather.weather_code)}</div>
                  <div className="text-sm text-gray-500 pt-2 border-t border-gray-800/50">Wind: {Math.round(weather.wind_speed_10m)} m/s</div>
                </div>
              ) : (
                <div className="text-gray-500">Keine Wetterdaten verfuegbar</div>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm p-8 border border-gray-800/50">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="relative">
              <h3 className="text-sm font-semibold text-emerald-400/70 uppercase tracking-wider mb-6">Naechster Spot</h3>
              {nearestSpot ? (
                <div className="space-y-4">
                  <div className="text-2xl font-bold text-white">{nearestSpot.name}</div>
                  <div className="text-sm text-gray-400 capitalize">{nearestSpot.water_type}</div>
                  {nearestSpot.distance && (
                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-800/50">
                      {nearestSpot.distance < 1 
                        ? `${Math.round(nearestSpot.distance * 1000)}m entfernt`
                        : `${nearestSpot.distance.toFixed(1)}km entfernt`
                      }
                    </div>
                  )}
                  <Link to={createPageUrl('Map')} className="inline-block text-sm text-cyan-400 hover:text-cyan-300 transition-colors pt-2">
                    Auf Karte anzeigen
                  </Link>
                </div>
              ) : (
                <div className="text-gray-500">Spots auf Karte verfuegbar</div>
              )}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50">
          <MiniKarte />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Schnellzugriff</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
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
              { name: "Pruefung", path: "ExamPrep" }
            ].map((feature) => (
              <Link
                key={feature.path}
                to={createPageUrl(feature.path)}
                className="group relative overflow-hidden rounded-xl bg-gray-900/50 hover:bg-gray-800/60 border border-gray-800/50 hover:border-gray-700/60 p-5 text-center transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative text-sm font-medium text-gray-300 group-hover:text-cyan-400 transition-colors">{feature.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
    );
    }