import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getCountdown(endDate) {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end - now;
  if (diff <= 0) return "Event beendet";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${days} Tage, ${hours} Std., ${minutes} Min.`;
}

export default function Events() {
  const [event, setEvent] = useState(null);
  const [mySeconds, setMySeconds] = useState(0);
  const [countdown, setCountdown] = useState("");
  const [loading, setLoading] = useState(true);
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!event) return;
    const interval = setInterval(() => {
      setCountdown(getCountdown(event.end_date));
      setMySeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [event]);

  const loadData = async () => {
    try {
      const events = await base44.entities.AppEvent.filter({ is_active: true });
      if (!events || events.length === 0) { setLoading(false); return; }

      const activeEvent = events[0];
      setEvent(activeEvent);
      setCountdown(getCountdown(activeEvent.end_date));

      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) { setLoading(false); return; }

      const user = await base44.auth.me();
      const sessions = await base44.entities.UsageSession.filter({ user_id: user.email });
      const eventStart = new Date(activeEvent.start_date);
      const eventEnd = new Date(activeEvent.end_date);

      let seconds = 0;
      for (const session of sessions) {
        const start = new Date(session.started_at);
        if (start < eventStart || start > eventEnd) continue;
        if (session.status === 'stopped' && session.stopped_at) {
          seconds += Math.floor((new Date(session.stopped_at) - start) / 1000);
        } else if (session.status === 'active') {
          seconds += Math.floor((new Date() - start) / 1000);
        }
      }
      setMySeconds(seconds);

      // Top 3 berechnen
      const allSessions = await base44.asServiceRole.entities.UsageSession.list();
      const userMap = {};
      for (const session of allSessions) {
        const start = new Date(session.started_at);
        if (start < eventStart || start > eventEnd) continue;
        if (!userMap[session.user_id]) userMap[session.user_id] = 0;
        if (session.status === 'stopped' && session.stopped_at) {
          userMap[session.user_id] += Math.floor((new Date(session.stopped_at) - start) / 1000);
        } else if (session.status === 'active') {
          userMap[session.user_id] += Math.floor((new Date() - start) / 1000);
        }
      }
      const sorted = Object.entries(userMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([userId, secs]) => ({ userId, seconds: secs }));
      setTopUsers(sorted);
    } catch (error) {
      console.error("Fehler beim Laden des Events:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Lade Event...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white">Kein aktives Event</h2>
          <p className="text-gray-400 text-sm">Aktuell laueft kein Event. Schau spaeter wieder vorbei.</p>
        </div>
      </div>
    );
  }

  const isEnded = new Date() > new Date(event.end_date);

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8 max-w-lg mx-auto space-y-6">

      {/* Header */}
      <div className="text-center space-y-1">
        <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Beta-Tester</div>
        <h1 className="text-3xl font-bold text-white">{event.name}</h1>
        {event.description && (
          <p className="text-gray-400 text-sm leading-relaxed">{event.description}</p>
        )}
      </div>

      {/* Countdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center space-y-1">
        <div className="text-xs text-gray-500 uppercase tracking-widest">
          {isEnded ? "Event beendet am" : "Endet in"}
        </div>
        <div className="text-2xl font-bold text-cyan-400">
          {isEnded ? new Date(event.end_date).toLocaleDateString('de-DE') : countdown}
        </div>
        <div className="text-xs text-gray-600">
          {new Date(event.start_date).toLocaleDateString('de-DE')} - {new Date(event.end_date).toLocaleDateString('de-DE')}
        </div>
      </div>

      {/* Meine Zeit */}
      <div className="bg-gray-900 border border-cyan-500/20 rounded-2xl p-5 text-center space-y-1">
        <div className="text-xs text-gray-500 uppercase tracking-widest">Meine Online-Zeit im Event</div>
        <div className="font-mono text-4xl font-bold text-cyan-400 tracking-widest">
          {formatTime(mySeconds)}
        </div>
        <div className="text-xs text-gray-600">Stunden : Minuten : Sekunden</div>
      </div>

      {/* Preis */}
      {event.prize && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 space-y-2">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">Preis</div>
          <div className="text-xl font-bold text-white">{event.prize}</div>
          <p className="text-gray-400 text-sm">
            Der Tester mit der laengsten kumulierten Online-Zeit gewinnt.
          </p>
        </div>
      )}

      {/* Regeln */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Regeln</div>
        <div className="space-y-2 text-sm text-gray-300">
          {event.rules ? (
            <p>{event.rules}</p>
          ) : (
            <>
              <p>1. Jede aktive Session in der App wird gezaehlt.</p>
              <p>2. Der Event laeuft vom {new Date(event.start_date).toLocaleDateString('de-DE')} bis {new Date(event.end_date).toLocaleDateString('de-DE')}.</p>
              <p>3. Der Gewinner wird nach Eventende per E-Mail benachrichtigt.</p>
              <p>4. Pro Benutzer ist nur ein Gewinn moeglich.</p>
            </>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-gray-600 pb-4">
        Deine Zeit wird automatisch getrackt, solange du die App verwendest.
      </div>
    </div>
  );
}