import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw } from "lucide-react";

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
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [allRankings, setAllRankings] = useState([]);
  const [lastCalcTime, setLastCalcTime] = useState(null);
  const [nextCalcTime, setNextCalcTime] = useState(null);

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

  useEffect(() => {
    const refreshInterval = setInterval(() => {
      loadData();
    }, 3600000);
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  const calculateDailyRanking = async (forceRefresh = false) => {
    try {
      const eventStart = event ? new Date(event.start_date) : null;
      const eventEnd = event ? new Date(event.end_date) : null;

      if (!eventStart || !eventEnd) return;

      if (forceRefresh) {
        localStorage.removeItem('eventRanking_lastCalc');
        localStorage.removeItem('eventRanking_cached');
        
        try {
          const allOldRankings = await base44.asServiceRole.entities.EventRanking.list();
          for (const ranking of allOldRankings) {
            await base44.asServiceRole.entities.EventRanking.delete(ranking.id);
          }
        } catch (e) {
          console.log('Keine alten EventRanking-Einträge zum Löschen');
        }
      }

      const storedLastCalc = localStorage.getItem('eventRanking_lastCalc');
      const today = new Date().toDateString();

      if (!forceRefresh && storedLastCalc === today) {
        const cached = localStorage.getItem('eventRanking_cached');
        if (cached) {
          const data = JSON.parse(cached);
          setAllRankings(data.rankings);
          setLastCalcTime(new Date(data.calcTime));
          setNextCalcTime(getNextMidnight());
          return;
        }
      }

      const allSessions = await base44.asServiceRole.entities.UsageSession.list();
      const allUsers = await base44.asServiceRole.entities.User.list();
      const userMap = {};

      const calcSeconds = (session) => {
        const start = new Date(session.started_at);
        if (start < eventStart || start > eventEnd) return 0;
        if (session.status === 'stopped' && session.stopped_at) {
          return Math.floor((new Date(session.stopped_at) - start) / 1000);
        } else if (session.status === 'active') {
          return Math.floor((new Date() - start) / 1000);
        }
        return 0;
      };

      for (const session of allSessions) {
        if (session.feature_id !== 'app_general') continue;
        if (!userMap[session.user_id]) userMap[session.user_id] = 0;
        userMap[session.user_id] += calcSeconds(session);
      }

      const sorted = Object.entries(userMap)
        .sort((a, b) => b[1] - a[1])
        .map(([userId, seconds], idx) => {
          const userData = allUsers.find(u => u.email === userId);
          return {
            userId,
            userName: userData?.full_name || userData?.email?.split('@')[0] || userId.split('@')[0],
            seconds,
            platzierung: idx + 1
          };
        });

      const calcTime = new Date();
      const rankings = sorted.map(r => ({
        userId: r.userId,
        userName: r.userName,
        eventTime: r.seconds,
        platzierung: r.platzierung,
        datum: calcTime.toISOString()
      }));

      if (rankings.length > 0) {
        await base44.asServiceRole.entities.EventRanking.bulkCreate(rankings);
      }

      localStorage.setItem('eventRanking_lastCalc', today);
      localStorage.setItem('eventRanking_cached', JSON.stringify({ rankings: sorted, calcTime: calcTime.toISOString() }));

      setAllRankings(sorted);
      setLastCalcTime(calcTime);
      setNextCalcTime(getNextMidnight());
    } catch (error) {
      console.error("Fehler bei Ranking-Berechnung:", error);
    }
  };

  const getNextMidnight = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  };

  const loadData = async () => {
    try {
      setRefreshing(true);
      const events = await base44.entities.AppEvent.filter({ is_active: true });
      if (!events || events.length === 0) { setLoading(false); setRefreshing(false); return; }

      const activeEvent = events[0];
      setEvent(activeEvent);
      setCountdown(getCountdown(activeEvent.end_date));

      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) { setLoading(false); setRefreshing(false); return; }

      const user = await base44.auth.me();
      const sessions = await base44.entities.UsageSession.filter({ user_id: user.email });
      const eventStart = new Date(activeEvent.start_date);
      const eventEnd = new Date(activeEvent.end_date);

      const calcSeconds = (session) => {
        const start = new Date(session.started_at);
        if (start < eventStart || start > eventEnd) return 0;
        if (session.status === 'stopped' && session.stopped_at) {
          return Math.floor((new Date(session.stopped_at) - start) / 1000);
        } else if (session.status === 'active') {
          return Math.floor((new Date() - start) / 1000);
        }
        return 0;
      };

      const generalSessions = sessions.filter(s => s.feature_id === 'app_general');
      const seconds = generalSessions.reduce((sum, s) => sum + calcSeconds(s), 0);
      setMySeconds(seconds);

      const allSessions = await base44.asServiceRole.entities.UsageSession.list();
      const userMap = {};
      for (const session of allSessions) {
        if (session.feature_id !== 'app_general') continue;
        if (!userMap[session.user_id]) userMap[session.user_id] = 0;
        userMap[session.user_id] += calcSeconds(session);
      }
      const sorted = Object.entries(userMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([userId, secs]) => ({ userId, seconds: secs }));
      setTopUsers(sorted);
      setLastRefresh(new Date());
      
      await calculateDailyRanking();
    } catch (error) {
      console.error("Fehler beim Laden des Events:", error);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const handleManualRefresh = () => {
    loadData();
  };

  const handleHardRefresh = async () => {
    setRefreshing(true);
    await calculateDailyRanking(true);
    setRefreshing(false);
  };

  const getMedalEmoji = (position) => {
    const medals = ["", "", ""];
    return medals[position] || "";
  };

  const getLocalTimeInBerlin = () => {
    const formatter = new Intl.DateTimeFormat('de-DE', {
      timeZone: 'Europe/Berlin',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const timeString = formatter.format(currentTime);
    
    const options = { timeZone: 'Europe/Berlin', timeZoneName: 'short' };
    const fullFormatter = new Intl.DateTimeFormat('de-DE', options);
    const parts = fullFormatter.formatToParts(currentTime);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    const tz = tzPart ? tzPart.value : 'CET';
    
    return { time: timeString, timezone: tz };
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

  const displayUsers = topUsers.length > 0 ? topUsers : [
    { userId: 'Max M.', seconds: 14400 },
    { userId: 'Anna K.', seconds: 12600 },
    { userId: 'Tim P.', seconds: 10800 }
  ];

  const displayAllRankings = allRankings.length > 0 ? allRankings : [
    { userId: 'max@example.com', platzierung: 1, seconds: 14400 },
    { userId: 'anna@example.com', platzierung: 2, seconds: 12600 },
    { userId: 'tim@example.com', platzierung: 3, seconds: 10800 },
    { userId: 'lisa@example.com', platzierung: 4, seconds: 9000 },
    { userId: 'john@example.com', platzierung: 5, seconds: 7200 }
  ];

  const formatLastCalc = (date) => {
    if (!date) return '';
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const timeStr = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    return isToday ? `heute ${timeStr} Uhr` : date.toLocaleDateString('de-DE') + ` ${timeStr} Uhr`;
  };

  const formatNextCalc = (date) => {
    if (!date) return '';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const timeStr = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    return isTomorrow ? `morgen ${timeStr} Uhr` : date.toLocaleDateString('de-DE') + ` ${timeStr} Uhr`;
  };

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

      {/* Top 3 - GANZ OBEN */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Top 3 Plaetze</h3>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg transition text-xs text-gray-300"
              title="Top 3 aktualisieren"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Aktualisieren
            </button>
            <button
              onClick={handleHardRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/50 hover:bg-red-900 disabled:opacity-50 rounded-lg transition text-xs text-red-300 border border-red-800"
              title="Hard Refresh - neu aus Datenbank laden"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Hard Refresh
            </button>
          </div>
        </div>

        <div className="grid gap-3">
          {displayUsers.map((u, i) => {
            const medals = ["", "", ""];
            const borderColors = ["border-amber-500/40", "border-gray-400/40", "border-amber-700/40"];
            const bgColors = ["bg-gradient-to-b from-amber-500/20 to-amber-500/5", "bg-gradient-to-b from-gray-400/15 to-gray-400/5", "bg-gradient-to-b from-amber-700/15 to-amber-700/5"];
            const { time: berlinTime, timezone: berlinTz } = getLocalTimeInBerlin();
            
            return (
              <div
                key={u.userId}
                className={`${bgColors[i]} border ${borderColors[i]} rounded-xl p-4 space-y-3 transform transition`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-3xl font-bold leading-none">{medals[i]}</span>
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-bold ${i === 0 ? 'text-amber-300' : i === 1 ? 'text-gray-200' : 'text-amber-800'}`}>
                        Platz {i + 1}
                      </div>
                      <div className="text-xs text-gray-400 truncate">{u.userId}</div>
                      <div className="text-xs text-gray-500 mt-1 font-mono">
                        {berlinTime} {berlinTz}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-700/50">
                  <div className="text-2xl font-mono font-bold text-cyan-400 tracking-tight">
                    {formatTime(u.seconds)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Online-Zeit</div>
                </div>
              </div>
            );
          })}
        </div>

        {lastCalcTime && (
          <div className="text-center text-xs text-gray-600 pt-2">
            Letzte Aktualisierung: {lastCalcTime.toLocaleDateString('de-DE')} {lastCalcTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
          </div>
        )}
      </div>

      {/* Vollstaendige Rangliste */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Vollstaendige Rangliste</h3>
        
        {lastCalcTime && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 space-y-1 text-xs text-gray-400">
            <div>Zuletzt aktualisiert: {formatLastCalc(lastCalcTime)}</div>
            <div>Naechstes Update: {formatNextCalc(nextCalcTime)}</div>
          </div>
        )}

        <div className="space-y-2">
          {displayAllRankings.map((ranking) => {
            const medals = { 1: '', 2: '', 3: '' };
            const medal = medals[ranking.platzierung] || '';
            const userDisplay = ranking.userId.includes('@') ? ranking.userId.split('@')[0] : ranking.userId;
            
            return (
              <div key={ranking.userId} className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg font-bold w-6">{medal || ranking.platzierung}</span>
                  <div className="min-w-0">
                    <div className="text-gray-200 truncate">{userDisplay}</div>
                    <div className="text-xs text-gray-500">{ranking.platzierung}. Platz</div>
                  </div>
                </div>
                <span className="font-mono text-cyan-400 font-semibold text-sm">{formatTime(ranking.seconds || ranking.eventTime)}</span>
              </div>
            );
          })}
        </div>
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