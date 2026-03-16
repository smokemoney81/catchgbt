import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Headset, X } from "lucide-react";
import { useHaptic } from "@/components/utils/HapticFeedback";
import { useSound } from "@/components/utils/SoundManager";

export default function SupportAgentButton() {
  const { triggerHaptic } = useHaptic();
  const { playSound } = useSound();
  const [isSupportActive, setIsSupportActive] = useState(false);
  const supportWidgetRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);

    script.onload = () => {
      setTimeout(() => {
        const widget = document.querySelector('elevenlabs-convai[agent-id="agent_9101k6ndnwr2e4ebxef5bztprf82"]');
        if (widget) {
          supportWidgetRef.current = widget;
          widget.style.display = 'none';
          widget.addEventListener('close', () => {
            setIsSupportActive(false);
            widget.style.display = 'none';
          });
        }
      }, 1000);
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleSupportClick = () => {
    triggerHaptic('medium');
    playSound('click');
    const widget = supportWidgetRef.current || document.querySelector('elevenlabs-convai[agent-id="agent_9101k6ndnwr2e4ebxef5bztprf82"]');
    if (widget) {
      if (isSupportActive) {
        widget.style.display = 'none';
        setIsSupportActive(false);
      } else {
        widget.style.display = 'block';
        setIsSupportActive(true);
        setTimeout(() => widget.click(), 100);
      }
    }
  };

  return (
    <>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
        className="fixed bottom-24 left-4 z-50"
        onClick={handleSupportClick}
      >
        <div className="relative">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transform transition-all hover:scale-110 active:scale-95 shadow-2xl cursor-pointer ${
            isSupportActive
              ? 'bg-gradient-to-br from-red-500 to-red-600'
              : 'bg-gradient-to-br from-emerald-500 to-teal-600'
          }`}>
            {isSupportActive ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Headset className="w-6 h-6 text-white" />
            )}
            {!isSupportActive && (
              <div className="absolute -top-1 -right-1">
                <div className="w-4 h-4 rounded-full bg-green-400 animate-pulse border-2 border-gray-900" />
              </div>
            )}
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-200 border border-emerald-700 whitespace-nowrap">
              {isSupportActive ? 'AKTIV' : 'SUPPORT'}
            </span>
          </div>
        </div>
      </motion.div>

      <elevenlabs-convai
        agent-id="agent_9101k6ndnwr2e4ebxef5bztprf82"
        style={{ display: 'none' }}
      />
    </>
  );
}