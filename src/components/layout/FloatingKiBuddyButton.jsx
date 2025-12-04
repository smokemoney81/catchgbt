import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Waves, Loader2, Sparkles } from "lucide-react";
import { useHaptic } from "@/components/utils/HapticFeedback";

export default function FloatingKiBuddyButton({ isChatbotOpen, onToggle }) {
  const { triggerHaptic } = useHaptic();
  const [isThinking, setIsThinking] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  useEffect(() => {
    // Event Listener für "KI denkt" Status
    const handleAIThinking = (event) => {
      setIsThinking(event.detail?.thinking || false);
    };

    // Event Listener für "Neue Nachricht"
    const handleNewMessage = () => {
      if (!isChatbotOpen) {
        setHasNewMessage(true);
      }
    };

    window.addEventListener('ai-thinking', handleAIThinking);
    window.addEventListener('ai-new-message', handleNewMessage);

    return () => {
      window.removeEventListener('ai-thinking', handleAIThinking);
      window.removeEventListener('ai-new-message', handleNewMessage);
    };
  }, [isChatbotOpen]);

  // Neue Nachricht Badge zurücksetzen beim Öffnen
  useEffect(() => {
    if (isChatbotOpen) {
      setHasNewMessage(false);
    }
  }, [isChatbotOpen]);

  const handleClick = () => {
    triggerHaptic('medium');
    onToggle();
  };

  // Dynamische Farben basierend auf Zustand
  const getButtonColors = () => {
    if (isThinking) {
      return "from-amber-500 to-orange-600";
    }
    if (isChatbotOpen) {
      return "from-emerald-500 to-cyan-600";
    }
    return "from-purple-600 to-blue-600";
  };

  // Dynamische Glow-Farben
  const getGlowColor = () => {
    if (isThinking) {
      return "rgba(245,158,11,0.6)";
    }
    if (isChatbotOpen) {
      return "rgba(16,185,129,0.6)";
    }
    return "rgba(147,51,234,0.6)";
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-center gap-2">
      {/* BETA Badge - integriert */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-xs font-bold text-purple-400 bg-purple-900/50 px-2 py-0.5 rounded-full border border-purple-500/30"
      >
        BETA
      </motion.div>

      {/* Hauptbutton - Sprechblasen-Form */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        onClick={handleClick}
        className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${getButtonColors()} text-white transition-all transform active:scale-95 flex items-center justify-center overflow-hidden`}
        style={{
          boxShadow: `0 0 30px ${getGlowColor()}`,
        }}
      >
        {/* Pulsierender Hintergrund bei "Denken" */}
        {isThinking && (
          <motion.div
            className="absolute inset-0 bg-white"
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        {/* Wellen-Animation im Hintergrund */}
        <motion.div
          className="absolute inset-0"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Waves className="w-full h-full text-white/10" />
        </motion.div>

        {/* Haupticon - wechselt basierend auf Zustand */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {isThinking ? (
              <motion.div
                key="thinking"
                initial={{ rotate: 0, scale: 0.8 }}
                animate={{ rotate: 360, scale: 1 }}
                exit={{ rotate: 0, scale: 0.8 }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 0.3 }
                }}
              >
                <Loader2 className="w-7 h-7" />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [0.9, 1.1, 0.9],
                  opacity: 1
                }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  },
                  opacity: { duration: 0.3 }
                }}
              >
                {/* Fisch-Symbol mit Sparkles */}
                <div className="relative">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C10.5 2 9 2.5 8 3.5L2 8L8 12.5C9 13.5 10.5 14 12 14C13.5 14 15 13.5 16 12.5L22 8L16 3.5C15 2.5 13.5 2 12 2M12 5C12.6 5 13 5.4 13 6C13 6.6 12.6 7 12 7C11.4 7 11 6.6 11 6C11 5.4 11.4 5 12 5M12 16L8 18L12 22L16 18L12 16Z" />
                  </svg>
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{
                      scale: [1, 1.3, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Neue Nachricht Badge */}
        {hasNewMessage && !isChatbotOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-gray-950"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-2 h-2 bg-white rounded-full"
            />
          </motion.div>
        )}

        {/* Mikrofon-Indikator für Wake Word (optional) */}
        {/* Dieser Teil könnte aktiviert werden, wenn Wake Word aktiv ist */}
        {/* 
        <motion.div
          className="absolute bottom-1 right-1"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Volume2 className="w-3 h-3" />
        </motion.div>
        */}
      </motion.button>

      {/* Tooltip - zeigt Zustand an */}
      <AnimatePresence>
        {!isChatbotOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-12 right-0 bg-gray-900/95 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg border border-gray-700 whitespace-nowrap"
          >
            {isThinking ? "Denke nach..." : "KI-Buddy"}
            <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 border-r border-b border-gray-700" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}