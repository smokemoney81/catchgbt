import React, { useState, useEffect } from "react";
import { Bell, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHaptic } from "@/components/utils/HapticFeedback";
import { useSound } from "@/components/utils/SoundManager";
import { FishingPlan } from "@/entities/FishingPlan";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import WakeWordIndicator from "@/components/header/WakeWordIndicator";
import { base44 } from "@/api/base44Client";

export default function Header({
  isSidebarOpen,
  setIsSidebarOpen,
  isDemo
}) {
  const { triggerHaptic } = useHaptic();
  const { playSound } = useSound();
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);
  const [activeTripsCount, setActiveTripsCount] = useState(0);
  const [user, setUser] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [showMenuText, setShowMenuText] = useState(true); // Initialize to true to show "Menü" first

  useEffect(() => {
    loadAlertStatus();
    loadActiveTrips();
    loadUserAndPlan();
    
    const handleAlertsUpdate = () => {
      loadAlertStatus();
    };
    
    const handleTripsUpdate = () => {
      loadActiveTrips();
    };
    
    window.addEventListener('weather-alerts-updated', handleAlertsUpdate);
    window.addEventListener('active-trips-updated', handleTripsUpdate);
    
    const handleUserRefresh = () => {
      loadUserAndPlan();
    };
    window.addEventListener('user-refresh-request', handleUserRefresh);

    // Alternierende Animation zwischen Pfeil und "Menü"-Text
    const interval = setInterval(() => {
      setShowMenuText(prev => !prev);
    }, 3000); // Toggle every 3 seconds

    return () => {
      window.removeEventListener('weather-alerts-updated', handleAlertsUpdate);
      window.removeEventListener('active-trips-updated', handleTripsUpdate);
      window.removeEventListener('user-refresh-request', handleUserRefresh);
      clearInterval(interval);
    };
  }, []);

  const loadUserAndPlan = async () => {
    setPlanLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const planStatusResponse = await base44.functions.invoke('getPlanStatus');
      if (planStatusResponse.data && planStatusResponse.data.plan) {
        setCurrentPlan(planStatusResponse.data.plan);
      }
    } catch (error) {
      console.error("Fehler beim Laden von Benutzerdaten oder Plan:", error);
      setUser(null);
      setCurrentPlan(null);
    }
    setPlanLoading(false);
  };

  const loadAlertStatus = async () => {
    try {
      const user = await base44.auth.me();
      const alerts = user?.settings?.weather_alerts || {};
      
      let count = 0;
      if (alerts.rain_alert_enabled) count++;
      if (alerts.wind_alert_enabled) count++;
      if (alerts.temp_alert_enabled) count++;
      if (alerts.storm_alert_enabled) count++;
      if (alerts.uv_alert_enabled) count++;
      if (alerts.visibility_alert_enabled) count++;
      if (alerts.dewpoint_alert_enabled) count++;
      
      setActiveAlertsCount(count);
    } catch (error) {
      console.error("Fehler beim Laden des Alarm-Status:", error);
    }
  };

  const loadActiveTrips = async () => {
    try {
      const plans = await FishingPlan.filter({ is_active: true });
      setActiveTripsCount(plans.length);
    } catch (error) {
      console.error("Fehler beim Laden der aktiven Trips:", error);
    }
  };

  const handleLeftSidebarToggle = () => {
    triggerHaptic('selection');
    playSound('click');
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-xl border-b border-gray-800 shadow-lg relative">
      <div className="px-4 h-16 flex items-center justify-between">
        
        {/* Animierter Plan-Name im Hintergrund */}
        {!planLoading && currentPlan && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ 
              x: ['100%', '-100%'],
              opacity: [0.4, 0.8, 0.5, 0.8, 0.4]
            }}
            transition={{
              x: { duration: 20, ease: "linear", repeat: Infinity, repeatDelay: 0 },
              opacity: { 
                duration: 20, 
                times: [0, 0.25, 0.5, 0.75, 1],
                ease: "easeInOut", 
                repeat: Infinity, 
                repeatDelay: 0 
              }
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-0 pointer-events-none whitespace-nowrap"
            style={{ width: 'max-content' }}
          >
            <span className={`text-5xl font-bold tracking-wider ${
              currentPlan.id === 'free' ? 'text-gray-300/40 drop-shadow-[0_0_20px_rgba(209,213,219,0.3)]' : 
              currentPlan.id === 'basic' ? 'text-blue-400/50 drop-shadow-[0_0_20px_rgba(96,165,250,0.4)]' :
              currentPlan.id === 'pro' ? 'text-purple-400/50 drop-shadow-[0_0_20px_rgba(192,132,252,0.4)]' :
              'text-amber-400/50 drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]'
            }`}>
              {currentPlan.name} Plan
            </span>
          </motion.div>
        )}

        {/* Left Side - Menu Button mit alternierenden Hinweisen */}
        <div className="flex items-center gap-3 relative z-20">
          <button
            onClick={handleLeftSidebarToggle}
            className="relative w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
          >
            <AnimatePresence mode="wait">
              {!isSidebarOpen ? (
                <motion.div
                  key="logo"
                  initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                  animate={{ 
                    opacity: 1, 
                    scale: [0.8, 1.1, 0.8], 
                    rotate: 0 
                  }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                  transition={{
                    opacity: { duration: 0.3 },
                    scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 0.3 }
                  }}
                  className="absolute"
                >
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bb3d3b9f83dc1f55ef532b/dcd615030_Screenshot_20250919_164159_Gallery.jpg" 
                    alt="Menu" 
                    className="w-5 h-5 rounded-lg object-cover"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="x"
                  initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                  transition={{ duration: 0.3 }}
                  className="absolute"
                >
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Alternierender Hinweis - nur wenn Sidebar geschlossen */}
          <AnimatePresence mode="wait">
            {!isSidebarOpen && (
              <motion.div
                key={showMenuText ? 'text' : 'arrow'} // Unique key for each alternating element
                initial={{ opacity: 0, x: showMenuText ? -10 : -5, scale: 0.8 }} // Slightly different initial for arrow vs text
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: showMenuText ? 10 : 5, scale: 0.8 }} // Opposite exit for smooth transition
                transition={{ duration: 0.4 }}
                className="flex items-center" // No gap here, elements alternate in the same space
              >
                {showMenuText ? (
                  <motion.span
                    animate={{
                      color: [
                        '#22d3ee', // cyan
                        '#10b981', // emerald
                        '#fbbf24', // amber
                        '#f59e0b', // orange
                        '#22d3ee', // back to cyan
                      ],
                      scale: [1, 1.08, 1], // Added scale animation for text
                    }}
                    transition={{
                      color: { duration: 4, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="text-xs font-bold whitespace-nowrap drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  >
                    Menü
                  </motion.span>
                ) : (
                  <motion.div
                    animate={{
                      x: [0, -5, 0], // Changed arrow direction
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <motion.div // Apply color animation to the container of ArrowLeft
                      animate={{
                        color: [
                          '#22d3ee',
                          '#10b981',
                          '#fbbf24',
                          '#f59e0b',
                          '#22d3ee',
                        ]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      <ArrowLeft 
                        className="w-6 h-6" // Increased size slightly for better visibility
                        style={{
                          filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.8))'
                        }}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Center - Logo/Title */}
        <div className="flex items-center gap-2 relative z-20">
          <div className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 text-transparent bg-clip-text drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
            CatchGbt
          </div>
          
          {isDemo && (
            <Badge className="bg-amber-500 text-black text-xs font-bold">
              DEMO
            </Badge>
          )}
        </div>

        {/* Right Side - Wetter-Alarm, Trip-Alarm, Wake Word */}
        <div className="flex items-center gap-2 relative z-20">
          {activeAlertsCount > 0 && (
            <Link to={createPageUrl('WeatherAlerts')}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 relative"
                  onClick={() => {
                    triggerHaptic('light');
                    playSound('click');
                  }}
                >
                  <Bell className="w-5 h-5" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 bg-amber-500 text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-gray-950"
                  >
                    {activeAlertsCount}
                  </motion.div>
                </Button>
              </motion.div>
            </Link>
          )}

          {activeTripsCount > 0 && (
            <Link to={createPageUrl('TripPlanner')}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 relative"
                  onClick={() => {
                    triggerHaptic('light');
                    playSound('click');
                  }}
                >
                  <Bell className="w-5 h-5" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 bg-emerald-500 text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-gray-950"
                  >
                    {activeTripsCount}
                  </motion.div>
                </Button>
              </motion.div>
            </Link>
          )}

          <WakeWordIndicator />
        </div>
      </div>
    </header>
  );
}