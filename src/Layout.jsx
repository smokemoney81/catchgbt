import React, { useState, useEffect } from "react";
import SEO from "@/components/pwa/SEO";
import { LocationProvider } from "@/components/location/LocationManager";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import EnhancedTicker from "@/components/layout/TipTicker";
import QuickCatchDialog from "@/components/log/QuickCatchDialog";
import SupportAgentButton from "@/components/layout/SupportAgentButton";
import KIBuddyAR from "@/components/kibuddy/KIBuddyAR";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import UpdateNotification from "@/components/pwa/UpdateNotification";
import OfflineIndicator from "@/components/pwa/OfflineIndicator";
import { base44 } from "@/api/base44Client";
import { HapticProvider } from "@/components/utils/HapticFeedback";
import { SoundProvider } from "@/components/utils/SoundManager";
import { Toaster } from "sonner";
import FeedbackManager from "@/components/feedback/FeedbackManager";
import { LanguageProvider } from "@/components/i18n/LanguageContext";

export default function Layout({ children, currentPageName }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  const refreshUser = async () => {
    try {
      let currentUser = await base44.auth.me();

      if (currentUser && !currentUser.first_open_at) {
        await base44.auth.updateMe({ first_open_at: new Date().toISOString() });
        currentUser = await base44.auth.me();
      }

      setUser(currentUser);
      window.dispatchEvent(new CustomEvent('user-refresh-request'));
    } catch (error) {
      console.warn("User not logged in or error fetching user data:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    if (currentPageName !== 'Home') {
      refreshUser();
    }
  }, [currentPageName]);

  // Service Worker Registrierung - angepasst für Backend-Funktion
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/api/functions/serviceWorker', {
            scope: '/'
          })
          .then((registration) => {
            console.log('[CatchGBT] Service Worker registriert:', registration.scope);
            
            // Prüfe auf Updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              console.log('[CatchGBT] Neuer Service Worker gefunden');
              
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[CatchGBT] Neuer Service Worker verfügbar - Update bereit');
                  window.dispatchEvent(new CustomEvent('sw-update-available'));
                }
              });
            });
          })
          .catch((error) => {
            console.error('[CatchGBT] Service Worker Registrierung fehlgeschlagen:', error);
          });
      });
    }
  }, []);

  // Landing Page - nur SEO
  if (currentPageName === 'Home') {
    return (
      <>
        <SEO />
        {children}
      </>
    );
  }

  const isDemo = user?.is_demo_user === true;

  return (
    <LanguageProvider>
      <HapticProvider>
        <SoundProvider>
          <LocationProvider>
            <div className="min-h-screen bg-gray-950 text-slate-50 relative overflow-hidden">
              <SEO />
              
              {/* PWA Components */}
              <InstallPrompt />
              <UpdateNotification />
              <OfflineIndicator />
              
              {/* Animierte Farbverläufe - KLEINER UND SUBTILER */}
              <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                <div className="absolute inset-x-0 -top-40 transform-gpu overflow-hidden blur-3xl sm:-top-80 opacity-20 animate-glow-pulse" aria-hidden="true">
                  <div
                    className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#f59e0b] via-[#f97316] to-[#ea580c] animate-gradient-shift"
                    style={{
                      clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                  />
                </div>

                <div className="absolute right-0 top-1/4 transform-gpu overflow-hidden blur-3xl opacity-15 animate-glow-pulse-delayed" aria-hidden="true">
                  <div
                    className="relative aspect-[1155/678] w-[36.125rem] translate-x-1/2 rotate-[60deg] bg-gradient-to-tr from-[#22d3ee] via-[#06b6d4] to-[#0891b2] animate-gradient-shift-reverse"
                    style={{
                      clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                  />
                </div>
              </div>

              {/* Content Layer */}
              <div className="relative" style={{ zIndex: 1 }}>
                {isDemo && (
                  <div className="bg-amber-500 text-black text-center text-xs font-bold py-1 z-50 relative">
                    DEMO-MODUS AKTIV
                  </div>
                )}
                
                <QuickCatchDialog />

                <FeedbackManager />

                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} currentPageName={currentPageName} />
                
                <div className="bg-gray-950 flex-shrink-0">
                  <Header 
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen} 
                    isDemo={isDemo}
                  />
                  <EnhancedTicker />
                </div>

                <main className="bg-gray-950" style={{ minHeight: 'calc(100vh - 200px)' }}>
                  {children}
                </main>

                <KIBuddyAR />
                <SupportAgentButton />

                <Toaster 
                  position="bottom-center"
                  offset="80px"
                  expand={true}
                  richColors={true}
                  className="toaster-custom"
                  toastOptions={{
                    duration: 4000,
                    className: 'toast-animated',
                  }}
                />
              </div>

              <style>{`
                :root {
                  --radius: 1rem;
                  --background: 3 7 18;
                  --foreground: 248 250 252;
                  --catchgbt: #165DFF;
                }
                body { 
                  background: rgb(var(--background)); 
                  color: rgb(var(--foreground)); 
                }
                .glass-morphism { 
                  background: rgba(15,23,42,0.7); 
                  backdrop-filter: blur(16px); 
                  border: 1px solid rgba(51,65,85,0.3); 
                }
                html { 
                  scroll-behavior: smooth; 
                }
                
                @keyframes gradient-shift {
                    0%, 100% {
                        transform: translate(0, 0) rotate(var(--rotation, 0deg)) scale(1);
                        opacity: var(--opacity-start, 0.2);
                    }
                    25% {
                        transform: translate(10%, -5%) rotate(calc(var(--rotation, 0deg) + 15deg)) scale(1.1);
                        opacity: var(--opacity-mid, 0.3);
                    }
                    50% {
                        transform: translate(-5%, 10%) rotate(calc(var(--rotation, 0deg) - 10deg)) scale(0.95);
                        opacity: var(--opacity-end, 0.15);
                    }
                    75% {
                        transform: translate(-10%, -10%) rotate(calc(var(--rotation, 0deg) + 20deg)) scale(1.05);
                        opacity: var(--opacity-mid, 0.3);
                    }
                }

                @keyframes gradient-shift-reverse {
                    0%, 100% {
                        transform: translate(0, 0) rotate(var(--rotation, 0deg)) scale(1);
                        opacity: var(--opacity-start, 0.25);
                    }
                    25% {
                        transform: translate(-10%, 5%) rotate(calc(var(--rotation, 0deg) - 15deg)) scale(1.1);
                        opacity: var(--opacity-mid, 0.35);
                    }
                    50% {
                        transform: translate(5%, -10%) rotate(calc(var(--rotation, 0deg) + 10deg)) scale(0.95);
                        opacity: var(--opacity-end, 0.2);
                    }
                    75% {
                        transform: translate(10%, 10%) rotate(calc(var(--rotation, 0deg) - 20deg)) scale(1.05);
                        opacity: var(--opacity-mid, 0.35);
                    }
                }

                @keyframes glow-pulse {
                    0%, 100% {
                        filter: blur(80px);
                    }
                    50% {
                        filter: blur(120px);
                    }
                }

                .animate-gradient-shift {
                    animation: gradient-shift 20s ease-in-out infinite;
                }

                .animate-gradient-shift-reverse {
                    animation: gradient-shift-reverse 25s ease-in-out infinite;
                }

                .animate-glow-pulse {
                    animation: glow-pulse 8s ease-in-out infinite;
                }

                .animate-glow-pulse-delayed {
                    animation: glow-pulse 8s ease-in-out infinite;
                    animation-delay: 2s;
                }

                .animate-glow-pulse-slow {
                    animation: glow-pulse 12s ease-in-out infinite;
                    animation-delay: 4s;
                }

                [data-sonner-toast] {
                  background: rgba(15, 23, 42, 0.9) !important;
                  backdrop-filter: blur(16px);
                  border: 1px solid rgba(51, 65, 85, 0.5) !important;
                  color: rgb(248, 250, 252) !important;
                  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5) !important;
                }

                [data-sonner-toast][data-type="success"] {
                  border-color: rgba(16, 185, 129, 0.5) !important;
                  background: rgba(15, 23, 42, 0.95) !important;
                }

                [data-sonner-toast][data-type="success"]::before {
                  content: '';
                  position: absolute;
                  left: 0;
                  top: 0;
                  bottom: 0;
                  width: 4px;
                  background: linear-gradient(to bottom, #10b981, #059669);
                  border-radius: 1rem 0 0 1rem;
                }

                [data-sonner-toast][data-type="error"] {
                  border-color: rgba(239, 68, 68, 0.5) !important;
                  background: rgba(15, 23, 42, 0.95) !important;
                }

                [data-sonner-toast][data-type="error"]::before {
                  content: '';
                  position: absolute;
                  left: 0;
                  top: 0;
                  bottom: 0;
                  width: 4px;
                  background: linear-gradient(to bottom, #ef4444, #dc2626);
                  border-radius: 1rem 0 0 1rem;
                }

                [data-sonner-toast][data-type="warning"] {
                  border-color: rgba(245, 158, 11, 0.5) !important;
                  background: rgba(15, 23, 42, 0.95) !important;
                }

                [data-sonner-toast][data-type="warning"]::before {
                  content: '';
                  position: absolute;
                  left: 0;
                  top: 0;
                  bottom: 0;
                  width: 4px;
                  background: linear-gradient(to bottom, #f59e0b, #d97706);
                  border-radius: 1rem 0 0 1rem;
                }

                [data-sonner-toast][data-type="info"] {
                  border-color: rgba(34, 211, 238, 0.5) !important;
                  background: rgba(15, 23, 42, 0.95) !important;
                }

                [data-sonner-toast][data-type="info"]::before {
                  content: '';
                  position: absolute;
                  left: 0;
                  top: 0;
                  bottom: 0;
                  width: 4px;
                  background: linear-gradient(to bottom, #22d3ee, #06b6d4);
                  border-radius: 1rem 0 0 1rem;
                }

                [data-sonner-toast] [data-title] {
                  color: rgb(248, 250, 252) !important;
                  font-weight: 600;
                }

                [data-sonner-toast] [data-description] {
                  color: rgba(203, 213, 225, 0.9) !important;
                }

                [data-sonner-toast] [data-button] {
                  background: rgba(34, 211, 238, 0.2) !important;
                  color: rgb(34, 211, 238) !important;
                  border: 1px solid rgba(34, 211, 238, 0.3) !important;
                }

                [data-sonner-toast] [data-button]:hover {
                  background: rgba(34, 211, 238, 0.3) !important;
                }

                [data-sonner-toast] [data-close-button] {
                  color: rgba(203, 213, 225, 0.7) !important;
                }

                [data-sonner-toast] [data-close-button]:hover {
                  color: rgb(248, 250, 252) !important;
                  background: rgba(51, 65, 85, 0.5) !important;
                }

                @keyframes toastSlideInBounce {
                  0% {
                    transform: translateY(100%) scale(0.8);
                    opacity: 0;
                  }
                  50% {
                    transform: translateY(-10px) scale(1.05);
                    opacity: 1;
                  }
                  70% {
                    transform: translateY(5px) scale(0.98);
                  }
                  100% {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                  }
                }

                @keyframes toastSuccessPop {
                  0% {
                    transform: translateY(100%) scale(0.5) rotate(-5deg);
                    opacity: 0;
                  }
                  50% {
                    transform: translateY(-15px) scale(1.1) rotate(2deg);
                    opacity: 1;
                  }
                  70% {
                    transform: translateY(5px) scale(0.95) rotate(-1deg);
                  }
                  100% {
                    transform: translateY(0) scale(1) rotate(0deg);
                    opacity: 1;
                  }
                }

                @keyframes toastErrorShake {
                  0% {
                    transform: translateY(100%) translateX(0);
                    opacity: 0;
                  }
                  40% {
                    transform: translateY(0) translateX(0);
                    opacity: 1;
                  }
                  45% {
                    transform: translateY(0) translateX(-10px);
                  }
                  55% {
                    transform: translateY(0) translateX(10px);
                  }
                  65% {
                    transform: translateY(0) translateX(-8px);
                  }
                  75% {
                    transform: translateY(0) translateX(6px);
                  }
                  85% {
                    transform: translateY(0) translateX(-3px);
                  }
                  100% {
                    transform: translateY(0) translateX(0);
                    opacity: 1;
                  }
                }

                @keyframes toastWarningPulse {
                  0% {
                    transform: translateY(100%) scale(0.7);
                    opacity: 0;
                    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
                  }
                  50% {
                    transform: translateY(-5px) scale(1.08);
                    opacity: 1;
                    box-shadow: 0 0 20px 10px rgba(245, 158, 11, 0.3);
                  }
                  100% {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
                  }
                }

                @keyframes toastInfoSlide {
                  0% {
                    transform: translateX(100%) scale(0.9);
                    opacity: 0;
                  }
                  60% {
                    transform: translateX(-10px) scale(1.02);
                    opacity: 1;
                  }
                  100% {
                    transform: translateX(0) scale(1);
                    opacity: 1;
                  }
                }

                .toast-animated {
                  animation: toastSlideInBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }

                [data-sonner-toast][data-type="success"] {
                  animation: toastSuccessPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
                }

                [data-sonner-toast][data-type="error"] {
                  animation: toastErrorShake 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
                }

                [data-sonner-toast][data-type="warning"] {
                  animation: toastWarningPulse 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
                }

                [data-sonner-toast][data-type="info"] {
                  animation: toastInfoSlide 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
                }

                [data-sonner-toast][data-type="success"]::after {
                  content: '';
                  position: absolute;
                  inset: -2px;
                  border-radius: inherit;
                  background: linear-gradient(45deg, transparent, rgba(16, 185, 129, 0.3), transparent);
                  animation: successGlow 0.6s ease-out;
                  pointer-events: none;
                  z-index: -1;
                }

                @keyframes successGlow {
                  0%, 100% {
                    opacity: 0;
                  }
                  50% {
                    opacity: 1;
                  }
                }

                [data-sonner-toast][data-type="error"] {
                  box-shadow: 0 10px 40px -10px rgba(239, 68, 68, 0.5) !important;
                }

                [data-sonner-toast][data-type="warning"] {
                  border: 2px solid rgba(245, 158, 11, 0.5) !important;
                }
              `}</style>
            </div>
          </LocationProvider>
        </SoundProvider>
      </HapticProvider>
    </LanguageProvider>
  );
}