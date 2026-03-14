import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const SYSTEM_PROMPT = `Du bist CatchGBT, ein erfahrener Angel-Assistent. Du hilfst Anglern mit Tipps zu Fischarten, Koeder, Spots, Wetter, Ausruestung und Technik. Antworte auf Deutsch, freundlich und direkt. Halte Antworten kurz und praxisnah.`;

export default function MiniKiBuddy() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hallo! Ich bin dein KI-Buddy. Stelle mir eine Angel-Frage!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    const conversationHistory = newMessages
      .map(m => `${m.role === "user" ? "Angler" : "KI-Buddy"}: ${m.content}`)
      .join("\n");

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_PROMPT}\n\nGespraechsverlauf:\n${conversationHistory}\n\nKI-Buddy:`
    });

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
    <div className="flex flex-col bg-gray-800/30 rounded-xl border border-gray-700/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700/50 flex items-center justify-between">
        <span className="text-cyan-400 font-medium text-sm">KI-Buddy</span>
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
      </div>

      <div className="h-64 overflow-y-auto p-4 space-y-3 flex flex-col">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
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