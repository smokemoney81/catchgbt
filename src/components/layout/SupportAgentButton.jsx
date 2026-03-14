import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Headset, X, Bot } from "lucide-react";
import { useHaptic } from "@/components/utils/HapticFeedback";
import { useSound } from "@/components/utils/SoundManager";

export default function SupportAgentButton() {
  const { triggerHaptic } = useHaptic();
  const { playSound } = useSound();
  const [isSupportActive, setIsSupportActive] = useState(false);
  const [isBuddyActive, setIsBuddyActive] = useState(false);
  const supportWidgetRef = useRef(null);
  const buddyWidgetRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);

    script.onload = () => {
      setTimeout(() => {
        const widgets = document.querySelectorAll('elevenlabs-convai');
        widgets.forEach(widget => {
          const agentId = widget.getAttribute('agent-id');
          if (agentId === 'agent_9101k6ndnwr2e4ebxef5bztprf82') {
            supportWidgetRef.current = widget;
            widget.style.display = 'none';
            widget.addEventListener('close', () => {
              setIsSupportActive(false);
              widget.style.display = 'none';
            });
          }
          if (agentId === 'agent_6801kjdd28qfe2paw3mhrfah95g7') {
            buddyWidgetRef.current = widget;
            widget.style.display = 'none';
            widget.addEventListener('close', () => {
              setIsBuddyActive(false);
              widget.style.display = 'none';
            });
          }
        });
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

  const handleBuddyClick = () => {
    triggerHaptic('medium');
    playSound('click');
    const widget = buddyWidgetRef.current || document.querySelector('elevenlabs-convai[agent-id="agent_6801kjdd28qfe2paw3mhrfah95g7"]');
    if (widget) {
      if (isBuddyActive) {
        widget.style.display = 'none';
        setIsBuddyActive(false);
      } else {
        widget.style.display = 'block';
        setIsBuddyActive(true);
        setTimeout(() => widget.click(), 100);
      }
    }
  };

  return (
    <>
      {/* Support Button */}
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

      {/* KI-Buddy Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
        className="fixed bottom-40 left-4 z-50"
        onClick={handleBuddyClick}
      >
        <div className="relative">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transform transition-all hover:scale-110 active:scale-95 shadow-2xl cursor-pointer ${
            isBuddyActive
              ? 'bg-gradient-to-br from-red-500 to-red-600'
              : 'bg-gradient-to-br from-cyan-500 to-blue-600'
          }`}>
            {isBuddyActive ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Bot className="w-6 h-6 text-white" />
            )}
            {!isBuddyActive && (
              <div className="absolute -top-1 -right-1">
                <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse border-2 border-gray-900" />
              </div>
            )}
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-900 text-cyan-200 border border-cyan-700 whitespace-nowrap">
              {isBuddyActive ? 'AKTIV' : 'KI-BUDDY'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Support Widget */}
      <elevenlabs-convai
        agent-id="agent_9101k6ndnwr2e4ebxef5bztprf82"
        style={{ display: 'none' }}
      />

      {/* KI-Buddy Widget */}
      <elevenlabs-convai
        agent-id="agent_6801kjdd28qfe2paw3mhrfah95g7"
        style={{ display: 'none' }}
      />
    </>
  );
}