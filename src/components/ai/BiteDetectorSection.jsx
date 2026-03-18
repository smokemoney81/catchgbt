import React, { useRef, useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/entities/User";
// import PremiumGuard from "@/components/premium/PremiumGuard"; // Premium-System temporär deaktiviert
import { Activity } from "lucide-react";
// import { startPremiumMeter } from "@/functions/startPremiumMeter"; // Premium-System temporär deaktiviert
// import { heartbeatPremiumMeter } from "@/functions/heartbeatPremiumMeter"; // Premium-System temporär deaktiviert
// import { stopPremiumMeter } from "@/functions/stopPremiumMeter"; // Premium-System temporär deaktiviert
// import { createPageUrl } from "@/utils"; // Nur in der deaktivierten Premium-Logik verwendet
// import { Coins } from "lucide-react"; // Nur in der deaktivierten Premium-Guthabenanzeige verwendet
import { useSound } from "@/components/utils/SoundManager";
import { useHaptic } from "@/components/utils/HapticFeedback"; // Updated import path

export default function BiteDetectorSection() {
  const [user, setUser] = useState(null);
  const [running, setRunning] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);
  const [lineScore, setLineScore] = useState(0);
  const [tipScore, setTipScore] = useState(0);
  const [debugInfo, setDebugInfo] = useState("");
  const [error, setError] = useState(null); // New state for error messages

  // Premium Metering (Temporarily disabled)
  const [sessionId, setSessionId] = useState(null);
  const [remainingCredits, setRemainingCredits] = useState(0);
  const heartbeatIntervalRef = useRef(null);

  // Refs für DOM-Elemente
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const procCanvasRef = useRef(null);

  // Einstellungen
  const [kLine, setKLine] = useState(3.0);
  const [kTip, setKTip] = useState(3.0);
  const [lockTime, setLockTime] = useState(3.0);

  const runningRef = useRef(false);
  const workerRef = useRef(null);
  const rafIdRef = useRef(null);

  // Internal state für die Bite Detection
  const stateRef = useRef({
    roiLine: null,
    roiTip: null,
    drawing: false,
    mode: null,
    startPt: null,
    timer: null,
    lastAlarm: 0,
    stLine: { prev: null, n: 0, mean: 0, M2: 0, above: 0 },
    stTip: { prev: null, n: 0, mean: 0, M2: 0, above: 0 }
  });

  // Low-CPU params
  const PROC_W = 160;
  const TARGET_FPS = 10;
  const STRIDE = 4;

  const { playSound } = useSound();
  const { triggerHaptic } = useHaptic();

  useEffect(() => {
    const loadUser = async () => {
      try {
        setUser(await User.me());
      } catch (e) {
        console.log("User not logged in for BiteDetectorSection:", e);
      }
    };
    loadUser();
  }, []);

  // Initialize optimized Web Worker for data processing with robust fallback
  useEffect(() => {
    const initWorker = async () => {
      try {
        // Feature detection: Check if Worker is available and not blocked
        if (typeof Worker === 'undefined') {
          console.warn('[BiteDetector] Worker API not available, using main thread');
          return;
        }

        // Attempt Worker creation with timeout fallback
        const workerInitPromise = new Promise((resolve, reject) => {
          try {
            const worker = new Worker('/workers/biteDetectorOptimized.js');
            
            // Set up handlers before any message passing
            worker.onmessage = (event) => {
              const { type, result } = event.data;
              if (type === 'frameProcessed' && result) {
                setLineScore(Math.abs(result.z || 0));
                setDebugInfo(
                  `proc=${PROC_W}x${result.procHeight || 'auto'} stride=${STRIDE} ` +
                  `zL=${result.z.toFixed(2)} fps=${result.fps} frames=${result.frameCount} worker=active`
                );
              } else if (type === 'error') {
                console.error('[BiteDetector] Worker error:', result.error);
              }
            };
            
            worker.onerror = (error) => {
              console.error('[BiteDetector] Worker initialization error:', error);
              reject(error);
            };
            
            // Send init with timeout
            worker.postMessage({ command: 'init', payload: { reset: true } });
            
            // Confirm worker is responsive within 2 seconds
            const timeoutId = setTimeout(() => {
              worker.terminate();
              reject(new Error('Worker initialization timeout'));
            }, 2000);
            
            // Intercept first message to confirm responsiveness
            const originalOnMessage = worker.onmessage;
            worker.onmessage = (event) => {
              clearTimeout(timeoutId);
              worker.onmessage = originalOnMessage;
              resolve(worker);
              originalOnMessage.call(worker, event);
            };
            
          } catch (e) {
            reject(e);
          }
        });

        // Wait for worker with 3-second timeout total
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Worker creation timeout')), 3000)
        );

        workerRef.current = await Promise.race([workerInitPromise, timeoutPromise]);
        
      } catch (e) {
        // Graceful fallback when Worker is blocked, unavailable, or fails
        console.warn('[BiteDetector] Worker fallback activated:', e.message);
        console.warn('[BiteDetector] Running frame processing on main thread (performance degraded)');
        workerRef.current = null;
        setDebugInfo('worker=fallback (main thread)');
      }
    };

    initWorker();

    return () => {
      if (workerRef.current) {
        try {
          workerRef.current.terminate();
        } catch (e) {
          console.warn('[BiteDetector] Error terminating worker:', e);
        }
        workerRef.current = null;
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (workerRef.current) workerRef.current.terminate();
    };
  }, []);

  const beep = useCallback(() => {
    try {
      // Use new sound system
      playSound('biteAlert');
      
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
      triggerHaptic('heavy'); // Updated triggerHaptic call

    } catch (e) {
      console.warn("Audio/vibration error:", e);
    }
  }, [playSound, triggerHaptic]);

  const welfordPush = (st, x) => {
    st.n++;
    const d = x - st.mean;
    st.mean += d / st.n;
    const d2 = x - st.mean;
    st.M2 += d * d2;
  };

  const welfordStd = (st) => {
    return st.n > 1 ? Math.sqrt(Math.max(0, st.M2 / (st.n - 1))) : 0;
  };

  const drawOverlay = useCallback(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const state = stateRef.current;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (state.roiLine) {
      ctx.strokeStyle = '#14b8a6';
      ctx.lineWidth = 2;
      ctx.strokeRect(state.roiLine.x, state.roiLine.y, state.roiLine.w, state.roiLine.h);
    }
    
    if (state.roiTip) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(state.roiTip.x, state.roiTip.y, state.roiTip.w, state.roiTip.h);
    }
  }, []);

  const mapToProc = (rect, canvas, procCanvas) => {
    const sx = procCanvas.width / canvas.width;
    const sy = procCanvas.height / canvas.height;
    return {
      x: Math.max(0, Math.floor(rect.x * sx)),
      y: Math.max(0, Math.floor(rect.y * sy)),
      w: Math.max(1, Math.floor(rect.w * sx)),
      h: Math.max(1, Math.floor(rect.y * sy))
    };
  };

  const energyFor = useCallback((rect, state) => {
    if (!rect) return { e: 0, z: 0 };
    
    const procCanvas = procCanvasRef.current;
    const overlay = overlayRef.current;
    if (!procCanvas || !overlay) return { e: 0, z: 0 };
    
    const pctx = procCanvas.getContext('2d');
    const r = mapToProc(rect, overlay, procCanvas);
    
    const id = pctx.getImageData(r.x, r.y, r.w, r.h);
    const d = id.data;
    
    let sum = 0, count = 0;
    
    if (!state.prev || state.prev.length !== d.length) {
      state.prev = new Uint8ClampedArray(d.length);
    }
    
    for (let i = 0; i < d.length; i += 4 * STRIDE) {
      const y = d[i]; // use red channel only
      const py = state.prev[i];
      sum += Math.abs(y - py);
      state.prev[i] = y;
      count++;
    }
    
    const e = sum / Math.max(1, count);
    const s = welfordStd(state);
    const z = s > 1e-6 ? (e - state.mean) / s : 0;
    
    // update baseline slowly when not alarming
    welfordPush(state, e * 0.05 + state.mean * 0.95);
    
    return { e, z };
  }, []);

  const tick = useCallback(() => {
    const video = videoRef.current;
    const procCanvas = procCanvasRef.current;
    const state = stateRef.current;
    const overlay = overlayRef.current;
    
    if (!running || !video || !procCanvas || !overlay) return;
    
    const pctx = procCanvas.getContext('2d');
    pctx.drawImage(video, 0, 0, procCanvas.width, procCanvas.height);
    
    const id = pctx.getImageData(0, 0, procCanvas.width, procCanvas.height);
    
    if (workerRef.current && state.roiLine) {
      // Transfer buffer ownership to worker (zero-copy)
      workerRef.current.postMessage({
        command: 'processFrame',
        payload: {
          imageData: id.data.buffer,
          rect: { ...state.roiLine, overlayWidth: overlay.width, overlayHeight: overlay.height },
          procWidth: procCanvas.width,
          procHeight: procCanvas.height
        }
      }, [id.data.buffer]); // Transferable object
    }
    
    const { e: eL, z: zL } = energyFor(state.roiLine, state.stLine);
    const { e: eT, z: zT } = energyFor(state.roiTip, state.stTip);
    
    setTipScore(Math.abs(zT));
    
    const armed = (performance.now() - state.lastAlarm) > lockTime * 1000;
    const trig = (state.roiLine && Math.abs(zL) > kLine) || (state.roiTip && Math.abs(zT) > kTip);
    
    if (armed && trig) {
      state.lastAlarm = performance.now();
      setAlarmActive(true);
      beep();
      setTimeout(() => setAlarmActive(false), 600);
    }
    
    const workerStatus = workerRef.current ? 'active' : 'fallback';
    setDebugInfo(`proc=${procCanvas.width}x${procCanvas.height} stride=${STRIDE} zL=${zL.toFixed(2)} zT=${zT.toFixed(2)} worker=${workerStatus}`);
  }, [running, kLine, kTip, lockTime, energyFor, beep]);

  // Optimized frame scheduling for 60fps on low-end hardware
  const scheduleNextTick = useCallback(() => {
    if (!runningRef.current) return;
    
    const FRAME_TIME = 1000 / 60; // Always target 60fps for main thread
    
    const processFrameOptimized = () => {
      if (!runningRef.current) return;
      
      const startTime = performance.now();
      tick();
      const elapsed = performance.now() - startTime;
      
      // Calculate next frame delay to maintain 60fps
      const nextDelay = Math.max(0, FRAME_TIME - elapsed);
      rafIdRef.current = setTimeout(
        () => {
          rafIdRef.current = requestAnimationFrame(processFrameOptimized);
        },
        nextDelay
      );
    };
    
    rafIdRef.current = requestAnimationFrame(processFrameOptimized);
  }, [tick]);

  const startDetection = async () => {
    setError(null); // Clear any previous errors

    // Premium Session starten - TEMPORÄR DEAKTIVIERT
    /*
    if (user && !user.is_demo_user) {
      try {
        const response = await startPremiumMeter({ feature_id: 'bite_detector' });
        
        if (response.data?.error_type === 'insufficient_credits') {
          toast.error("Nicht genug Credits für Bissanzeiger!", {
            description: `Mindestens 200 Credits benötigt.`,
            action: {
              label: "Credits kaufen",
              onClick: () => window.location.href = createPageUrl("Shop")
            }
          });
          // Do not proceed with detection if credits are insufficient
          return;
        }
        
        if (response.data?.ok) {
          setSessionId(response.data.session_id);
          setRemainingCredits(response.data.remaining_credits);
          
          heartbeatIntervalRef.current = setInterval(async () => {
            try {
              const hbResponse = await heartbeatPremiumMeter({ session_id: response.data.session_id });
              
              if (hbResponse.data?.error_type === 'insufficient_credits') {
                toast.error("Credits aufgebraucht! Bissanzeiger wird gestoppt.");
                stopDetection();
                return;
              }
              
              if (hbResponse.data?.ok) {
                setRemainingCredits(hbResponse.data.remaining_credits);
              }
            } catch (error) {
              console.error("Heartbeat error:", error);
            }
          }, 30000); // 30 seconds
        } else {
          toast.error("Fehler beim Starten der Session", {
            description: response.data?.message || "Unbekannter Fehler."
          });
          setError(response.data?.message || "Fehler beim Starten der Session.");
          return;
        }
      } catch (error) {
        console.error("Failed to start bite detector session:", error);
        toast.error("Fehler beim Starten der Session");
        setError("Fehler beim Starten der Premium-Sitzung.");
        return;
      }
    }
    */ // END Premium Session starten - TEMPORÄR DEAKTIVIERT

    try {
      const video = videoRef.current;
      const overlay = overlayRef.current;
      const procCanvas = procCanvasRef.current;
      
      if (!video || !overlay || !procCanvas) {
        // If DOM elements are not ready, stop premium session if it was initiated - TEMPORÄR DEAKTIVIERT
        /*
        if (sessionId) {
          await stopPremiumMeter({ session_id: sessionId }); // Ensure this is awaited
          if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
          }
          setSessionId(null);
        }
        */ // END If DOM elements are not ready, stop premium session if it was initiated - TEMPORÄR DEAKTIVIERT
        return;
      }

      // Stop any existing stream
      await stopDetection();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      video.srcObject = stream;
      await video.play();

      // Setup canvas sizes
      overlay.width = video.videoWidth;
      overlay.height = video.videoHeight;
      
      const ratio = video.videoHeight / video.videoWidth;
      procCanvas.width = PROC_W;
      procCanvas.height = Math.round(PROC_W * ratio);

      drawOverlay();
      runningRef.current = true;
      setRunning(true);

      // Start processing loop with requestAnimationFrame throttling
      scheduleNextTick();

    } catch (error) {
      console.error("Failed to start bite detection:", error);
      alert("Kamera konnte nicht gestartet werden. Bitte Berechtigungen prüfen.");
      setError("Kamera konnte nicht gestartet werden. Bitte Berechtigungen prüfen.");
      
      // Session stoppen bei Fehler - TEMPORÄR DEAKTIVIERT
      /*
      if (sessionId) {
        await stopPremiumMeter({ session_id: sessionId }); // Ensure this is awaited
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }
        setSessionId(null);
      }
      */ // END Session stoppen bei Fehler - TEMPORÄR DEAKTIVIERT
    }
  };

  const stopDetection = async (triggeredByUser = false) => {
    const video = videoRef.current;
    const state = stateRef.current;

    const wasRunning = runningRef.current;
    runningRef.current = false;
    setRunning(false);
    setError(null); // Clear error when stopping

    // Frage nur wenn Session wirklich aktiv war und Nutzer manuell gestoppt hat
    if (wasRunning && triggeredByUser) {
      window.dispatchEvent(new CustomEvent('bite-detector-session-ended'));
    }

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      if (typeof rafIdRef.current === 'number') {
        clearTimeout(rafIdRef.current);
      }
      rafIdRef.current = null;
    }

    if (video && video.srcObject) {
      const stream = video.srcObject;
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }

    // Premium Session stoppen - TEMPORÄR DEAKTIVIERT
    /*
    if (sessionId) {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      
      try {
        await stopPremiumMeter({ session_id: sessionId });
      } catch (error) {
        // Alle Fehler beim Stoppen ignorieren
        console.log("Session stop (ignoriert):", error.response?.status || error.message);
      } finally {
        // State immer zurücksetzen
        setSessionId(null);
      }
    }
    */ // END Premium Session stoppen - TEMPORÄR DEAKTIVIERT
  };

  const enableRoiDraw = (mode) => {
    const overlay = overlayRef.current;
    const state = stateRef.current;
    
    if (!overlay) return;

    state.mode = mode;
    overlay.style.cursor = 'crosshair';

    // Remove previous event listeners to avoid duplicates
    overlay.removeEventListener('mousedown', state.handleMouseDown);
    overlay.removeEventListener('mousemove', state.handleMouseMove);
    overlay.removeEventListener('mouseup', state.handleMouseUp);
    overlay.removeEventListener('mouseleave', state.handleMouseLeave);

    const handleMouseDown = (e) => {
      state.drawing = true;
      const rect = overlay.getBoundingClientRect();
      state.startPt = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseMove = (e) => {
      if (!state.drawing || !state.mode) return;
      
      const rect = overlay.getBoundingClientRect();
      const cur = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      const roiRect = {
        x: Math.min(state.startPt.x, cur.x),
        y: Math.min(state.startPt.y, cur.y),
        w: Math.abs(cur.x - state.startPt.x),
        h: Math.abs(cur.y - state.startPt.y)
      };

      if (state.mode === 'line') {
        state.roiLine = roiRect;
      } else if (state.mode === 'tip') {
        state.roiTip = roiRect;
      }
      
      drawOverlay();
    };

    const handleEnd = () => {
      state.drawing = false;
      state.mode = null;
      overlay.style.cursor = 'default';
      
      overlay.removeEventListener('mousedown', state.handleMouseDown);
      overlay.removeEventListener('mousemove', state.handleMouseMove);
      overlay.removeEventListener('mouseup', state.handleMouseUp);
      overlay.removeEventListener('mouseleave', state.handleMouseLeave);
    };

    // Store handlers on stateRef to easily remove them later
    state.handleMouseDown = handleMouseDown;
    state.handleMouseMove = handleMouseMove;
    state.handleMouseUp = handleEnd; // Mouseup and mouseleave should both stop drawing
    state.handleMouseLeave = handleEnd;

    overlay.addEventListener('mousedown', handleMouseDown);
    overlay.addEventListener('mousemove', handleMouseMove);
    overlay.addEventListener('mouseup', handleEnd);
    overlay.addEventListener('mouseleave', handleEnd);
  };

  // Premium-Check temporär deaktiviert - alle Features frei
  return (
    <Card className="glass-morphism border-gray-800 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]">
          KI-Bisserkennung
        </CardTitle>
        {error && (
          <p className="text-sm text-red-400 mt-2">{error}</p>
        )}
        {/* Premium-Guthabenanzeige temporär deaktiviert
          {sessionId && user && !user.is_demo_user && (
              <div className="flex items-center gap-1 mt-2 px-2 py-1 bg-gray-800/50 rounded-lg max-w-fit">
                <Coins className="w-3 h-3 text-emerald-400" />
                <span className="text-xs font-mono text-emerald-400">
                  {remainingCredits >= 1000 ? `${(remainingCredits / 1000).toFixed(1)}K` : remainingCredits}
                </span>
              </div>
            )}
        */}
      </CardHeader>
      <CardContent>
        {/* Premium-Check temporär deaktiviert - alle Features frei. PremiumGuard Wrapper entfernt. */}
          <div className="space-y-6">
            {/* Video Display */}
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                playsInline
                autoPlay
                muted
              />
              <canvas
                ref={overlayRef}
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: 'auto' }}
                role="img"
                aria-label="Interaktive Ruten-Erkennungsflaeche. Tuerkis: Angelschnur ROI, Gelb: Rutenspitze ROI. Klicken und ziehen zum Zeichnen."
              />
              <canvas
                ref={procCanvasRef}
                className="hidden"
                role="presentation"
                aria-hidden="true"
              />
              
              {!running && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Kamera ist aus</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Camera & ROI Controls */}
              <div className="space-y-4">
                <Button
                   onClick={running ? () => stopDetection(true) : startDetection}
                   className={`w-full min-h-[44px] ${
                     running 
                       ? 'bg-red-600 active:scale-95 active:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2' 
                       : 'bg-emerald-600 active:scale-95 active:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2'
                   }`}
                   aria-label={running ? 'Bissanzeiger stoppen und Kamera-Stream beenden' : 'Kamera starten und Bissanzeiger aktivieren'}
                 >
                  {running ? 'Bissanzeiger stoppen' : 'Bissanzeiger starten'}
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                     variant="outline"
                     onClick={() => enableRoiDraw('line')}
                     disabled={!running}
                     className="text-cyan-400 border-cyan-400/50 active:scale-95 active:bg-cyan-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:opacity-50 min-h-[44px]"
                     aria-label="Klicken und ziehen zum Markieren der Angelschnur-Region fuer Bissanzeige"
                   >
                     ROI Schnur
                   </Button>
                   <Button
                     variant="outline"
                     onClick={() => enableRoiDraw('tip')}
                     disabled={!running}
                     className="text-yellow-400 border-yellow-400/50 active:scale-95 active:bg-yellow-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 disabled:opacity-50 min-h-[44px]"
                     aria-label="Klicken und ziehen zum Markieren der Rutenspitze-Region fuer Bissanzeige"
                   >
                    ROI Spitze
                  </Button>
                </div>
              </div>

              {/* Sensitivity Settings */}
              <div className="space-y-4">
                <div>
                   <label className="block text-sm text-gray-300 mb-2" htmlFor="line-sensitivity">
                     Schnur-Empfindlichkeit: {kLine.toFixed(1)}
                   </label>
                   <Input
                     id="line-sensitivity"
                     type="range"
                     min="1.5"
                     max="5"
                     step="0.1"
                     value={kLine}
                     onChange={(e) => setKLine(parseFloat(e.target.value))}
                     className="bg-gray-800/50 border-gray-700 min-h-[44px]"
                     aria-valuemin={1.5}
                     aria-valuemax={5}
                     aria-valuenow={kLine}
                     aria-label="Schnur-Empfindlichkeit anpassen (1.5 bis 5)"
                   />
                 </div>
                
                <div>
                   <label className="block text-sm text-gray-300 mb-2" htmlFor="tip-sensitivity">
                     Spitzen-Empfindlichkeit: {kTip.toFixed(1)}
                   </label>
                   <Input
                     id="tip-sensitivity"
                     type="range"
                     min="1.5"
                     max="5"
                     step="0.1"
                     value={kTip}
                     onChange={(e) => setKTip(parseFloat(e.target.value))}
                     className="bg-gray-800/50 border-gray-700 min-h-[44px]"
                     aria-valuemin={1.5}
                     aria-valuemax={5}
                     aria-valuenow={kTip}
                     aria-label="Rutenspitze-Empfindlichkeit anpassen (1.5 bis 5)"
                   />
                 </div>
                
                <div>
                   <label className="block text-sm text-gray-300 mb-2" htmlFor="alarm-locktime">
                     Alarm-Sperrzeit: {lockTime.toFixed(1)}s
                   </label>
                   <Input
                     id="alarm-locktime"
                     type="range"
                     min="1"
                     max="8"
                     step="0.5"
                     value={lockTime}
                     onChange={(e) => setLockTime(parseFloat(e.target.value))}
                     className="bg-gray-800/50 border-gray-700 min-h-[44px]"
                     aria-valuemin={1}
                     aria-valuemax={8}
                     aria-valuenow={lockTime}
                     aria-label="Alarm-Sperrzeit in Sekunden anpassen (1 bis 8 Sekunden)"
                   />
                 </div>
              </div>
            </div>

            {/* Live Metrics */}
            {running && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>Schnur-Aktivität</span>
                    <span>{lineScore.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-400 transition-all duration-100"
                      style={{ width: `${Math.min(100, lineScore * 20)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>Spitzen-Aktivität</span>
                    <span>{tipScore.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 transition-all duration-100"
                      style={{ width: `${Math.min(100, tipScore * 20)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="p-4 bg-gray-800/30 rounded-lg text-sm text-gray-400">
              <p className="mb-2">
                <strong className="text-gray-300">Verwendung:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Kamera starten und Rute ins Bild bringen</li>
                <li>ROI-Bereiche für Schnur (türkis) und Rutenspitze (gelb) markieren</li>
                <li>Empfindlichkeit nach Bedarf anpassen</li>
                <li>Bei Biss: Visueller + Audio-Alarm + Vibration</li>
              </ol>
              <p className="mt-2 text-xs text-gray-500">
                Low-CPU Optimierung: {debugInfo}
              </p>
            </div>
            
            {/* New Sensitivity Explanation */}
            <div className="text-xs text-gray-400 space-y-1">
              <p><span className="font-semibold">Niedrige Sensitivität:</span> Reagiert nur auf starke Bewegungen</p>
              <p><span className="font-semibold">Mittlere Sensitivität:</span> Gutes Gleichgewicht zwischen Genauigkeit und Fehlalarmen</p>
              <p><span className="font-semibold">Hohe Sensitivität:</span> Erkennt auch kleinste Bewegungen, kann zu Fehlalarmen führen</p>
            </div>
          </div>
      </CardContent>
    </Card>
  );
}