import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Headset, X } from "lucide-react";
import { useHaptic } from "@/components/utils/HapticFeedback";
import { useSound } from "@/components/utils/SoundManager";

export default function SupportAgentButton() {
  const { triggerHaptic } = useHaptic();
  const { playSound } = useSound();
  const [isActive, setIsActive] = useState(false);
  const widgetRef = useRef(null);

  useEffect(() => {
    // Lade ElevenLabs Widget Script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);

    // Warte bis Script geladen ist, dann initialisiere Widget
    script.onload = () => {
      console.log('ElevenLabs widget script loaded');
      
      // Suche nach dem Widget-Element
      setTimeout(() => {
        const widget = document.querySelector('elevenlabs-convai');
        if (widget) {
          widgetRef.current = widget;
          
          // Verstecke Widget initial
          widget.style.display = 'none';
          
          // Lausche auf Widget-Events
          widget.addEventListener('close', () => {
            setIsActive(false);
            widget.style.display = 'none';
          });
        }
      }, 1000);
    };

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleClick = () => {
    triggerHaptic('medium');
    playSound('click');
    
    const widget = widgetRef.current || document.querySelector('elevenlabs-convai');
    
    if (widget) {
      if (isActive) {
        // Widget schließen
        widget.style.display = 'none';
        setIsActive(false);
      } else {
        // Widget öffnen
        widget.style.display = 'block';
        setIsActive(true);
        
        // Trigger das Widget zu öffnen
        setTimeout(() => {
          widget.click();
        }, 100);
      }
    } else {
      console.warn('ElevenLabs widget not found');
    }
  };

  return (
    <>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
        className="fixed bottom-24 left-4 z-50"
        onClick={handleClick}
      >
        <div className="relative">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transform transition-all hover:scale-110 active:scale-95 shadow-2xl cursor-pointer ${
            isActive 
              ? 'bg-gradient-to-br from-red-500 to-red-600' 
              : 'bg-gradient-to-br from-emerald-500 to-teal-600'
          }`}>
            {isActive ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Headset className="w-6 h-6 text-white" />
            )}
            
            {!isActive && (
              <div className="absolute -top-1 -right-1">
                <div className="w-4 h-4 rounded-full bg-green-400 animate-pulse border-2 border-gray-900" />
              </div>
            )}
          </div>
          
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-200 border border-emerald-700 whitespace-nowrap">
              {isActive ? 'AKTIV' : 'SUPPORT'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ElevenLabs Convai Widget */}
      <elevenlabs-convai 
        agent-id="agent_6801kjdd28qfe2paw3mhrfah95g7"
        style={{ display: 'none' }}
      />
    </>
  );
}