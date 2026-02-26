import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHaptic } from "@/components/utils/HapticFeedback";
import { useSound } from "@/components/utils/SoundManager";
import { User } from "@/entities/User";
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

    return () => {
      window.removeEventListener('weather-alerts-updated', handleAlertsUpdate);
      window.removeEventListener('active-trips-updated', handleTripsUpdate);
      window.removeEventListener('user-refresh-request', handleUserRefresh);
    };
  }, []);

  const loadUserAndPlan = async () => {
    setPlanLoading(true);
    try {
      const currentUser = await User.me();
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
      const user = await User.me();
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
    <header 
      className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-xl border-b border-gray-800 shadow-lg relative"
      style={{ 
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
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

        {/* Left Side - Menu Button */}
        <div className="flex items-center gap-3 relative z-20">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeftSidebarToggle}
            className="text-gray-400 hover:text-white transition-colors text-base font-semibold"
          >
            Menü
          </Button>
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