import React, { useEffect, useRef, useState, useCallback } from "react";
import { User } from "@/entities/User";
import { catchgbtChat } from "@/functions/catchgbtChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useHaptic } from "@/components/utils/HapticFeedback";
import { triggerFeatureUsed } from "@/components/feedback/FeedbackManager";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble from "./MessageBubble";
import { useSound } from "@/components/utils/SoundManager";
import { useLanguage } from "@/components/i18n/LanguageContext";
import { Loader2, Mic, MicOff, Send, X, Volume2, VolumeX, Sparkles, Settings, AlertTriangle } from "lucide-react";
import { WakeWordDetector } from '@/components/utils/WakeWordDetector';
import { base44 } from "@/api/base44Client";

const playAudio = async (audioData) => {
  try {
    if (!audioData || !(audioData instanceof ArrayBuffer)) {
      console.error("Invalid audio data");
      return false;
    }
    
    const blob = new Blob([audioData], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve(true);
      };
      audio.onerror = (e) => {
        URL.revokeObjectURL(url);
        console.error("Audio playback error:", e);
        reject(e);
      };
      audio.play().catch(reject);
    });
  } catch (error) {
    console.error("Failed to play audio:", error);
    return false;
  }
};

const playTextWithBrowserTTS = (text, speechRate = 1.0) => {
  return new Promise((resolve) => {
    try {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        console.log("Browser TTS not available");
        return resolve(false);
      }

      window.speechSynthesis.cancel();

      const speak = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'de-DE';
        utterance.rate = Math.min(2.0, Math.max(0.1, speechRate));
        utterance.pitch = 1;
        utterance.volume = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const germanVoice = voices.find(voice => voice.lang.startsWith('de'));
        if (germanVoice) utterance.voice = germanVoice;

        utterance.onend = () => {
          console.log("Browser TTS completed");
          resolve(true);
        };
        utterance.onerror = (e) => {
          console.error("Browser TTS error:", e);
          resolve(false);
        };

        setTimeout(() => {
          console.log("Starting browser TTS");
          window.speechSynthesis.speak(utterance);
        }, 100);
      };

      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = speak;
        setTimeout(speak, 500);
      } else {
        speak();
      }
    } catch (error) {
      console.error("Browser TTS setup error:", error);
      resolve(false);
    }
  });
};

const cleanTextForSpeech = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  let cleaned = text.replace(/[\u{1F600}-\u{1F64F}]/gu, '');
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F5FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{1F680}-\u{1F6FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{1F700}-\u{1F77F}]/gu, '');
  cleaned = cleaned.replace(/[\u{1F780}-\u{1F7FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{1F800}-\u{1F8FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{1F900}-\u{1F9FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{1FA00}-\u{1FA6F}]/gu, '');
  cleaned = cleaned.replace(/[\u{1FA70}-\u{1FAFF}]/gu, '');
  cleaned = cleaned.replace(/[\u{2600}-\u{26FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{2700}-\u{27BF}]/gu, '');
  cleaned = cleaned.replace(/[\*#_~`]/g, '');
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  return cleaned.trim();
};

export default function ChatbotPopover({ isOpen, onToggle, currentPageName }) {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [conversation, setConversation] = useState({ messages: [] });
  const [conversationId, setConversationId] = useState(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showWakeWordSettings, setShowWakeWordSettings] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const limiterRef = useRef([]);
  const [wakeWordListener, setWakeWordListener] = useState(null);

  const { triggerHaptic } = useHaptic();
  const { playSound } = useSound();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const loadUserAndConversation = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        
        const newConvId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setConversationId(newConvId);
        setConversation({ messages: [] });
      } catch (e) {
        console.error("User not logged in:", e);
        setUser(null);
      }
    };
    loadUserAndConversation();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, isLoading, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      playSound('open');
      triggerHaptic('light');
    } else {
      playSound('close');
      triggerHaptic('light');
      stopRecognition();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      
      const newConvId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setConversationId(newConvId);
      setConversation({ messages: [] });
      setHasGreeted(false);
    }
  }, [isOpen, playSound, triggerHaptic]);

  useEffect(() => {
    if (isMuted && isSpeaking) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    }
  }, [isMuted, isSpeaking]);

  const saveMessageToDb = async (convId, role, content, context) => {
    try {
      await base44.entities.ChatMessage.create({
        conversation_id: convId,
        role,
        content,
        context: context || 'general',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const handleSpeak = useCallback(async (text) => {
    if (isMuted) {
      console.log('[TTS] Muted - skipping speech');
      return;
    }
    
    try {
      if (!text || typeof text !== 'string') {
        console.log('[TTS] Invalid text input');
        return;
      }

      setIsSpeaking(true);
      console.log('[TTS] Starting speech for text:', text.substring(0, 50));
      
      const cleanText = cleanTextForSpeech(text);
      
      if (!cleanText) {
        console.log('[TTS] Empty text after cleaning');
        setIsSpeaking(false);
        return;
      }

      const currentUser = await User.me();
      if (currentUser?.settings?.audio_enabled === false) {
        console.log('[TTS] Audio disabled in user settings');
        setIsSpeaking(false);
        return;
      }

      const speechRate = currentUser?.settings?.speech_speed || 1.0;
      const voiceId = currentUser?.settings?.voice_id || "alloy";
      const planId = currentUser?.premium_plan_id || 'free';
      const quality = (planId === 'pro' || planId === 'ultimate') ? 'hd' : 'standard';

      console.log('[TTS] Using browser TTS');
      await playTextWithBrowserTTS(cleanText, speechRate);
    } catch (e) {
      console.error('[TTS] General error:', e.message);
      const cleanText = cleanTextForSpeech(text);
      await playTextWithBrowserTTS(cleanText, 1.0);
    } finally {
      setIsSpeaking(false);
      console.log('[TTS] Speech completed');
    }
  }, [isMuted]);

  useEffect(() => {
    if (isOpen && user && conversation.messages.length === 0 && !hasGreeted) {
      setHasGreeted(true);
      
      const hour = new Date().getHours();
      let greeting = "";
      const userName = user.nickname || user.full_name?.split(' ')[0] || "Angler";
      
      if (hour >= 5 && hour < 12) {
        greeting = `Guten Morgen, ${userName}!`;
      } else if (hour >= 12 && hour < 18) {
        greeting = `Hallo ${userName}!`;
      } else if (hour >= 18 && hour < 22) {
        greeting = `Guten Abend, ${userName}!`;
      } else {
        greeting = `Hey ${userName}!`;
      }
      
      greeting += " Was kann ich fuer dich tun?";

      setConversation(prev => ({ ...prev, messages: [{ role: "assistant", content: greeting }] }));
      
      if (conversationId) {
        saveMessageToDb(conversationId, "assistant", greeting, currentPageName).catch(err => {
          console.error("Failed to save greeting:", err);
        });
      }
    }
  }, [isOpen, user, conversation.messages.length, currentPageName, conversationId, hasGreeted]);

  const handleSendMessage = useCallback(async (messageText) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;
    
    setInput("");
    setIsLoading(true);
    setError(null);
    playSound('send');
    triggerHaptic('medium');

    const now = Date.now();
    limiterRef.current = limiterRef.current.filter((ts) => now - ts < 60000);
    if (limiterRef.current.length >= 10) {
      toast.error("Limit erreicht. Bitte warte 10 Sekunden.");
      setIsLoading(false);
      return;
    }
    limiterRef.current.push(now);

    const userMessage = { role: "user", content: text };
    setConversation(prev => ({ ...prev, messages: [...prev.messages, userMessage] }));
    
    if (conversationId) {
      await saveMessageToDb(conversationId, "user", text, currentPageName);
    }

    try {
      const contextInfo = currentPageName ? `${currentPageName}` : 'general';
      
      const currentUser = await User.me();
      const planId = currentUser?.premium_plan_id || 'free';
      const detailLevel = (planId === 'pro' || planId === 'ultimate') ? 'detailed' : 'standard';
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 12000)
      );
      
      const chatPromise = catchgbtChat({
        messages: [{
          role: "user",
          content: text
        }],
        context: contextInfo,
        detailLevel
      });

      const response = await Promise.race([chatPromise, timeoutPromise]);

      const aiReply = response?.data?.reply || "Entschuldigung, ich konnte keine Antwort generieren.";

      const assistantMessage = { role: "assistant", content: String(aiReply) };
      setConversation(prev => ({ ...prev, messages: [...prev.messages, assistantMessage] }));
      
      if (conversationId) {
        await saveMessageToDb(conversationId, "assistant", String(aiReply), currentPageName);
      }
      
      await triggerFeatureUsed('ai_chat');
      await handleSpeak(String(aiReply));
    } catch (e) {
      console.error("AI request failed:", e);

      let errorMsg = "Entschuldigung, das hat zu lange gedauert. Versuchs nochmal!";
      
      if (e.message === 'Timeout') {
        errorMsg = "Timeout - bitte nochmal versuchen!";
      }

      setConversation(prev => ({ ...prev, messages: [...prev.messages, { role: "assistant", content: errorMsg }] }));
      
      if (conversationId) {
        await saveMessageToDb(conversationId, "assistant", errorMsg, currentPageName);
      }
      
      await handleSpeak(errorMsg);
      setError("Nachricht konnte nicht gesendet werden.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, playSound, triggerHaptic, currentPageName, handleSpeak, conversationId]);

  useEffect(() => {
    if (typeof window === "undefined" || !("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
        setError("Spracherkennung nicht unterstuetzt.");
        return;
    }

    if (!recognitionRef.current) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        try {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = "de-DE";
            recognitionRef.current.maxAlternatives = 1;
            recognitionRef.current.interimResults = false;
        } catch (recognitionError) {
            setError("Spracherkennung konnte nicht initialisiert werden.");
            return;
        }
    }

    recognitionRef.current.onresult = (event) => {
        try {
            const transcript = event?.results?.[0]?.[0]?.transcript || "";
            if (transcript && transcript.trim()) {
                setInput(transcript);
                setError(null);
                setTimeout(() => handleSendMessage(transcript), 100);
            }
        } catch (err) {
            console.error("Error processing speech recognition result:", err);
        } finally {
            setIsRecording(false);
        }
    };

    recognitionRef.current.onerror = (event) => {
        setIsRecording(false);

        const errorType = event?.error || 'unknown';

        if (['no-speech', 'aborted', 'canceled'].includes(errorType)) {
            setError(null);
            return;
        }

        const errorMessage = {
            'network': `Netzwerkfehler. Internet-Verbindung pruefen.`,
            'not-allowed': 'Mikrofon-Zugriff verweigert. Berechtigungen pruefen.',
            'audio-capture': 'Mikrofon nicht verfuegbar oder verwendet.',
            'service-not-allowed': 'Spracherkennung vom Browser blockiert.'
        }[errorType] || `Sprachfehler. Erneut versuchen.`;

        if (errorMessage) {
            setError(errorMessage);
            setTimeout(() => setError(null), 4000);
        }
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
        } catch (err) {
          console.warn("Error cleaning up speech recognition:", err);
        }
      }
    };
  }, [handleSendMessage]);

  const startRecognition = () => {
    triggerHaptic('light');
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setError("Offline. Spracherkennung benoetigt Internet.");
      setTimeout(() => setError(null), 4000);
      return;
    }

    if (!recognitionRef.current) {
      setError("Spracherkennung nicht verfuegbar.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setError(null);
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      setError("Spracherkennung konnte nicht gestartet werden");
      setIsRecording(false);
    }
  };
  
  const stopRecognition = () => {
    if (isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn("Error stopping speech recognition:", err);
      }
      setIsRecording(false);
    }
  };

  const handleWakeWord = useCallback(() => {
    if (!isOpen) {
        onToggle();
    }
    User.me().then(currentUser => {
      if (currentUser?.settings?.audio_enabled !== false && !isRecording && recognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current.start();
            setIsRecording(true);
            setError(null);
          } catch (err) {
            if (!err.message.includes("recognition has already started")) {
                setError("Mikrofon konnte nicht automatisch gestartet werden");
                setTimeout(() => setError(null), 3000);
            }
          }
        }, 500);
      }
    }).catch(e => console.error("Error checking user settings for wake word:", e));
  }, [isOpen, onToggle, isRecording]);

  useEffect(() => {
    const initializeWakeWord = async () => {
        try {
            const currentUser = await User.me();
            const voiceSettings = currentUser?.settings || {};

            if (voiceSettings.wake_word_enabled && !wakeWordListener) {
                const detector = new WakeWordDetector(
                    voiceSettings.wake_word_phrase || 'Hey Buddy',
                    handleWakeWord,
                    (status, error) => {
                        console.log(`Wake Word Detector Status: ${status}`, error || '');
                    },
                    voiceSettings.wake_word_mode || 'auto'
                );
                await detector.start();
                setWakeWordListener(detector);

            } else if (!voiceSettings.wake_word_enabled && wakeWordListener) {
                wakeWordListener.stop();
                setWakeWordListener(null);
            }
        } catch (error) {
            console.error("Error initializing wake word detector:", error);
        }
    };

    initializeWakeWord();

    const handleSettingsUpdate = () => {
        if (wakeWordListener) {
            wakeWordListener.stop();
            setWakeWordListener(null);
        }
        setTimeout(initializeWakeWord, 100);
    };

    window.addEventListener('voiceSettingsUpdated', handleSettingsUpdate);

    return () => {
        window.removeEventListener('voiceSettingsUpdated', handleSettingsUpdate);
        if (wakeWordListener) {
            wakeWordListener.stop();
        }
    };
  }, [handleWakeWord, wakeWordListener]);

  const handleManualClose = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    onToggle();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-x-0 top-24 bottom-[80px] z-[60] overflow-hidden rounded-t-3xl bg-gray-900 shadow-2xl sm:inset-auto sm:bottom-[120px] sm:right-6 sm:h-[60vh] sm:w-80 sm:rounded-b-2xl sm:rounded-t-2xl sm:border sm:border-gray-800"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src="https://qtrypzzcjebvfciynt.supabase.co/storage/v1/object/public/base44-prod/public/68bb3d3b9f83dc1f55ef532b/dcd615030_Screenshot_20250919_164159_Gallery.jpg" 
                    alt="KI Buddy" 
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{t('ai.title')}</h3>
                  <p className="text-xs text-gray-400">{t('ai.subtitle')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        triggerHaptic('light');
                        setIsMuted(!isMuted);
                    }}
                    className="text-gray-400 hover:text-white"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowWakeWordSettings(!showWakeWordSettings)}>
                  <Settings className="w-5 h-5 text-gray-400" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleManualClose}>
                  <X className="w-5 h-5 text-gray-400" />
                </Button>
              </div>
            </div>

            {showWakeWordSettings && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden p-4 border-b border-gray-700 text-sm text-gray-300"
                >
                    <p className="mb-2 text-white">Wake Word Einstellungen</p>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400">Wake Word aktiviert</span>
                        {user?.settings?.wake_word_enabled ? (
                            <span className="text-emerald-400">An</span>
                        ) : (
                            <span className="text-gray-500">Aus</span>
                        )}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Du kannst dein Wake Word in den Einstellungen anpassen.</p>
                </motion.div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-lg p-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {error}
                </div>
              )}

              {conversation.messages.length === 0 && !isLoading && (
                <div className="text-center py-10">
                  <Sparkles className="w-10 h-10 mx-auto text-purple-400 mb-4 animate-pulse" />
                  <h4 className="font-bold text-xl text-white">{t('ai.greeting')}</h4>
                  <p className="text-gray-400 text-sm mt-2">
                    z.B. "Welcher Koeder fuer Zander im Winter?"
                  </p>
                </div>
              )}
              
              {conversation.messages.map((msg, index) => (
                <MessageBubble key={index} message={msg} />
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="w-16 h-10 bg-gray-700 rounded-2xl flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  </div>
                </div>
              )}

              {isSpeaking && !isLoading && conversation.messages.length > 0 && (
                <div className="flex justify-start">
                    <div className="w-16 h-10 bg-blue-700/50 rounded-2xl flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                    </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-700 bg-gray-800/50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={isRecording ? stopRecognition : startRecognition} 
                  className={`flex-shrink-0 ${isRecording ? "text-red-500 animate-pulse" : "text-gray-400 hover:text-white"}`}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder={t('ai.placeholder')}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="bg-gray-900 border-gray-700 text-white rounded-full pl-4 pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-cyan-600 hover:bg-cyan-700"
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !input.trim()}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}