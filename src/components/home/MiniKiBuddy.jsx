import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { backendTextToSpeech } from "@/functions/backendTextToSpeech";
import { geminiTextToSpeech } from "@/functions/geminiTextToSpeech";
import { catchgbtChat } from "@/functions/catchgbtChat";

const SYSTEM_PROMPT = `Du bist CatchGBT, ein erfahrener Angel-Assistent. Du hilfst Anglern mit Tipps zu Fischarten, Koeder, Spots, Wetter, Ausruestung und Technik. Antworte auf Deutsch, freundlich und direkt. Halte Antworten kurz und praxisnah.`;

async function speakText(text) {
  if (!text || !window.speechSynthesis) return;
  
  try {
    // Try Gemini TTS first
    const geminiResponse = await geminiTextToSpeech({ text });
    if (geminiResponse?.data?.fallback_to_browser) {
      // Fallback to OpenAI TTS
      const openaiResponse = await backendTextToSpeech({ text, voiceId: "alloy" });
      if (openaiResponse?.data?.fallback_to_browser) {
        // Final fallback to browser TTS
        useBrowserTTS(text);
        return;
      }
      const audioBlob = new Blob([openaiResponse.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => URL.revokeObjectURL(audioUrl);
      return;
    }
    const audioBlob = new Blob([geminiResponse.data], { type: "audio/mpeg" });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
    audio.onended = () => URL.revokeObjectURL(audioUrl);
  } catch {
    // Browser fallback on error
    useBrowserTTS(text);
  }
}

function useBrowserTTS(text) {
  if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') return;
  
  const utterance = new window.SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  window.speechSynthesis.speak(utterance);
}

export default function MiniKiBuddy() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hallo! Ich bin dein KI-Buddy. Stelle mir eine Angel-Frage!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const messagesEndRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const stored = localStorage.getItem('userLocation');
    if (stored) {
      try { setUserLocation(JSON.parse(stored)); } catch {}
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setUserLocation(loc);
        localStorage.setItem('userLocation', JSON.stringify(loc));
      }, () => {});
    }
  }, []);

  // Disable auto-scroll on dashboard to prevent page scroll
  // useEffect(() => {
  //   if (isFirstRender.current) {
  //     isFirstRender.current = false;
  //     return;
  //   }
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    const res = await catchgbtChat({
      messages: newMessages,
      context: 'dashboard',
      userLocation: userLocation || null
    });

    const response = res?.data?.reply || "Ich konnte keine Antwort generieren.";
    setMessages(prev => [...prev, { role: "assistant", content: response }]);
    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col bg-gray-800/30 rounded-xl border border-gray-700/50 overflow-hidden h-96">
      <div className="px-4 py-3 border-b border-gray-700/50 flex items-center justify-between">
        <span className="text-cyan-400 font-medium text-sm">KI-Buddy</span>
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col min-h-64">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === "user"
                ? "self-end bg-cyan-600/30 text-white border border-cyan-500/30"
                : "self-start bg-gray-700/50 text-gray-100 border border-gray-600/30"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="self-start bg-gray-700/50 text-gray-400 border border-gray-600/30 rounded-xl px-3 py-2 text-sm">
            ...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-700/50 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Frage stellen..."
          disabled={isLoading}
          className="flex-1 bg-gray-900/60 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          Senden
        </button>
      </div>
    </div>
  );
}