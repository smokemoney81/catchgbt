import React, { useState, useEffect } from "react";
import { Bot, Sparkles } from "lucide-react";

const BUDDY_MESSAGES = [
  "KI-Buddy ist bereit! 🎣",
  "Stelle mir eine Angel-Frage!",
  "Heute schon geangelt? 🌊",
  "Ich helfe dir beim Planen! ✨",
  "Frag mich nach Tipps! 💡"
];

export default function MiniKiBuddy() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % BUDDY_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-cyan-400 font-medium text-sm drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">KI-Buddy</h3>
        <Bot className="w-5 h-5 text-purple-400" />
      </div>
      
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center animate-pulse">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold text-white">
            {BUDDY_MESSAGES[messageIndex]}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Klicke den Buddy unten an!
          </div>
        </div>
      </div>
    </div>
  );
}