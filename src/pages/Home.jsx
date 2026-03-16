import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Camera, Fish, Map, Cloud, Brain, Award, Compass } from 'lucide-react';
import { toast } from 'sonner';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { LanguageProvider, useLanguage } from '@/components/i18n/LanguageContext';
import TutorialModal from '@/components/tutorial/TutorialModal';

const features = [
  { icon: Fish, text: 'KI-Fischidentifikation aus Fotos' },
  { icon: Map, text: 'Interaktive Gewasserkarte mit Binnengewassern' },
  { icon: Cloud, text: 'Echtzeit-Wetteranalyse fur Angelspots' },
  { icon: Brain, text: 'KI-Fangberatung mit personlichen Tipps' },
  { icon: Award, text: 'Ranglisten und Community-Wettbewerbe' },
  { icon: Compass, text: 'GPS-Navigation zu deinen Lieblingsplatzen' },
];

function FeatureHints() {
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const Feature = features[currentFeature];

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={currentFeature}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-start gap-4"
      >
        <Feature.icon className="w-8 h-8 text-cyan-400" />
        <p className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          {Feature.text}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}

function LandingPageContent() {
    const [tutorialOpen, setTutorialOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [isLoadingPlan, setIsLoadingPlan] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        loadUserPlan();
    }, []);

    const loadUserPlan = async () => {
        setIsLoadingPlan(true);
        try {
            const isAuth = await base44.auth.isAuthenticated();

            if (!isAuth) {
                setCurrentPlan({ id: 'free', name: 'Kostenlos' });
                setIsLoadingPlan(false);
                return;
            }

            const user = await base44.auth.me();

            if (!user) {
                setCurrentPlan({ id: 'free', name: 'Kostenlos' });
                setIsLoadingPlan(false);
                return;
            }

            if (user.premium_plan_id && user.premium_plan_id !== 'free') {
                const planNames = {
                    basic: 'Basic',
                    pro: 'Pro',
                    ultimate: 'Ultimate'
                };

                let isActive = true;
                if (user.premium_expires_at) {
                    const now = new Date();
                    const expires = new Date(user.premium_expires_at);
                    isActive = expires > now;
                }

                if (isActive) {
                    setCurrentPlan({
                        id: user.premium_plan_id,
                        name: planNames[user.premium_plan_id] || user.premium_plan_id
                    });
                    setIsLoadingPlan(false);
                    return;
                }
            }

            if (user.trial_end_date) {
                const now = new Date();
                const trialEnd = new Date(user.trial_end_date);

                if (now < trialEnd) {
                    const diff = trialEnd - now;
                    const remainingHours = Math.ceil(diff / (1000 * 60 * 60));

                    setCurrentPlan({
                        id: 'trial',
                        name: 'Testphase',
                        remaining_hours: remainingHours
                    });
                    setIsLoadingPlan(false);
                    return;
                }
            }

            if (!user.has_had_trial) {
                const now = new Date();
                const trialEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);

                await base44.auth.updateMe({
                    trial_start_date: now.toISOString(),
                    trial_end_date: trialEnd.toISOString(),
                    has_had_trial: true
                });

                setCurrentPlan({
                    id: 'trial',
                    name: 'Testphase',
                    remaining_hours: 24
                });
                setIsLoadingPlan(false);
                return;
            }

            setCurrentPlan({ id: 'free', name: 'Kostenlos' });

        } catch (error) {
            console.error('Fehler beim Laden des Plans:', error);
            setCurrentPlan({ id: 'free', name: 'Kostenlos' });
        }
        setIsLoadingPlan(false);
    };

    const handleLogin = async () => {
        try {
            const isAuth = await base44.auth.isAuthenticated();
            if (isAuth) {
                window.location.href = createPageUrl('Dashboard');
            } else {
                base44.auth.redirectToLogin(createPageUrl('Dashboard'));
            }
        } catch (error) {
            console.error('Login error:', error);
            base44.auth.redirectToLogin(createPageUrl('Dashboard'));
        }
    };

    const compressImage = (file, maxDim = 1600, maxKB = 500) => new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
            const w = Math.round(img.width * scale);
            const h = Math.round(img.height * scale);

            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject(new Error("Could not get 2D context"));
            ctx.drawImage(img, 0, 0, w, h);

            const tryQuality = (q, cb) => canvas.toBlob(cb, "image/jpeg", q);

            const attempt = (q) => {
                tryQuality(q, (blob) => {
                    if (!blob) return reject(new Error("Blob creation failed"));
                    if (blob.size / 1024 <= maxKB || q <= 0.5) {
                        return resolve(blob);
                    }
                    attempt(q - 0.1);
                });
            };
            attempt(0.92);
        };
        img.onerror = reject;
        const url = URL.createObjectURL(file);
        img.src = url;
    });

    const parseEXIF = async (file) => {
        try {
            if (!file) return { gpsLat: null, gpsLon: null, dateTimeOriginal: null };

            const buf = await file.arrayBuffer();
            const dv = new DataView(buf);
            let offset = 2;
            if (dv.getUint16(0, false) !== 0xFFD8) return { gpsLat: null, gpsLon: null, dateTimeOriginal: null };

            while (offset < dv.byteLength) {
                const marker = dv.getUint16(offset, false);
                offset += 2;
                const size = dv.getUint16(offset, false);
                offset += 2;

                if (marker === 0xFFE1) {
                    const exifHeader = new TextDecoder().decode(new DataView(buf, offset, 6));
                    if (!exifHeader.startsWith("Exif")) break;

                    const tiffOffset = offset + 6;
                    const endianMark = dv.getUint16(tiffOffset, false);
                    const isLE = (endianMark === 0x4949);

                    if (dv.getUint16(tiffOffset + 2, isLE) !== 0x002A) break;

                    const firstIFDOffset = dv.getUint32(tiffOffset + 4, isLE);

                    const getTag = (base, i) => {
                        const entry = base + 2 + i * 12;
                        const tag = dv.getUint16(entry, isLE);
                        const type = dv.getUint16(entry + 2, isLE);
                        const count = dv.getUint32(entry + 4, isLE);
                        const valueOffset = dv.getUint32(entry + 8, isLE);
                        return { tag, type, count, valueOffset, entry };
                    };

                    const readAscii = (off, count) => {
                        const bytes = new Uint8Array(buf, off, count);
                        return new TextDecoder().decode(bytes).replace(/\0+$/, "");
                    };

                    const readRational = (off) => {
                        const num = dv.getUint32(off, isLE);
                        const den = dv.getUint32(off + 4, isLE);
                        return den ? num / den : 0;
                    };

                    const IFD0 = tiffOffset + firstIFDOffset;
                    const entries0 = dv.getUint16(IFD0, isLE);
                    let exifIFDPointer = 0, gpsIFDPointer = 0;

                    for (let i = 0; i < entries0; i++) {
                        const { tag, valueOffset } = getTag(IFD0, i);
                        if (tag === 0x8769) exifIFDPointer = valueOffset;
                        if (tag === 0x8825) gpsIFDPointer = valueOffset;
                    }

                    let dateTimeOriginal = null;
                    if (exifIFDPointer) {
                        const exifIFD = tiffOffset + exifIFDPointer;
                        const count = dv.getUint16(exifIFD, isLE);
                        for (let i = 0; i < count; i++) {
                            const { tag, type, count: c, valueOffset } = getTag(exifIFD, i);
                            if (tag === 0x9003 && type === 2) {
                                const off = c > 4 ? tiffOffset + valueOffset : exifIFD + 8;
                                const str = readAscii(off, c);
                                const safeStr = String(str || "");
                                if (safeStr.match(/^\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}/)) {
                                    const iso = safeStr.replace(/^(\d{4}):(\d{2}):(\d{2}) /, "$1-$2-$3T") + "Z";
                                    dateTimeOriginal = iso;
                                }
                            }
                        }
                    }

                    let gpsLat = null, gpsLon = null;
                    if (gpsIFDPointer) {
                        const gpsIFD = tiffOffset + gpsIFDPointer;
                        const count = dv.getUint16(gpsIFD, isLE);
                        let latRef = "N", lonRef = "E", latArr = null, lonArr = null;

                        for (let i = 0; i < count; i++) {
                            const { tag, type, count: c, valueOffset } = getTag(gpsIFD, i);
                            if (tag === 0x0001) {
                                const off = c > 4 ? tiffOffset + valueOffset : gpsIFD + 8;
                                latRef = String(readAscii(off, c) || "N").trim();
                            }
                            if (tag === 0x0003) {
                                const off = c > 4 ? tiffOffset + valueOffset : gpsIFD + 8;
                                lonRef = String(readAscii(off, c) || "E").trim();
                            }
                            if (tag === 0x0002 && type === 5) {
                                const off = tiffOffset + valueOffset;
                                latArr = [readRational(off), readRational(off + 8), readRational(off + 16)];
                            }
                            if (tag === 0x0004 && type === 5) {
                                const off = tiffOffset + valueOffset;
                                lonArr = [readRational(off), readRational(off + 8), readRational(off + 16)];
                            }
                        }

                        const dmsToDec = (dms) => dms ? (dms[0] + dms[1] / 60 + dms[2] / 3600) : null;
                        if (latArr && lonArr) {
                            gpsLat = dmsToDec(latArr) * (latRef === "S" ? -1 : 1);
                            gpsLon = dmsToDec(lonArr) * (lonRef === "W" ? -1 : 1);
                        }
                    }
                    return { dateTimeOriginal, gpsLat, gpsLon };
                } else {
                    offset += size - 2;
                }
            }
        } catch (error) {
            console.warn("EXIF parsing error:", error);
        }
        return { gpsLat: null, gpsLon: null, dateTimeOriginal: null };
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file || isUploading) return;

        setIsUploading(true);

        try {
            const isAuth = await base44.auth.isAuthenticated();
            
            if (!isAuth) {
                toast.info("Bitte melde dich an, um Fotos zu speichern", {
                    duration: 3000
                });
                setIsUploading(false);
                try {
                    base44.auth.redirectToLogin(createPageUrl('Logbook'));
                } catch (error) {
                    console.error('Redirect error:', error);
                    window.location.href = createPageUrl('Dashboard');
                }
                return;
            }

            let exifData = { gpsLat: null, gpsLon: null, dateTimeOriginal: null };
            try {
                exifData = await parseEXIF(file);
                console.log('EXIF-Daten extrahiert:', exifData);

                if (exifData && exifData.gpsLat != null && exifData.gpsLon != null) {
                    toast.info('GPS-Position gefunden', {
                        description: 'Spot wird automatisch zugewiesen',
                        duration: 3000
                    });
                }
            } catch (e) {
                console.warn('Konnte EXIF-Daten nicht lesen:', e);
                exifData = { gpsLat: null, gpsLon: null, dateTimeOriginal: null };
            }

            let blob = file;
            try {
                blob = await compressImage(file, 1600, 500);
                console.log(`Bild komprimiert: ${(blob.size / 1024).toFixed(2)} KB`);
            } catch (e) {
                console.warn("Image compression failed, using original:", e);
            }

            toast.info("Lade Foto hoch...");
            const { UploadFile } = await import('@/integrations/Core');
            const fileName = `catch_${Date.now()}.jpg`;
            const uploadFile = new File([blob], fileName, { type: "image/jpeg" });
            const { file_url } = await UploadFile({ file: uploadFile });
            
            const pendingPhotos = JSON.parse(localStorage.getItem('catchgbt_pending_photos') || '[]');
            pendingPhotos.push({
                id: `pending_${Date.now()}`,
                photo_url: file_url,
                captured_at: (exifData && exifData.dateTimeOriginal) ? exifData.dateTimeOriginal : new Date().toISOString(),
                gps_lat: (exifData && exifData.gpsLat != null) ? exifData.gpsLat : null,
                gps_lon: (exifData && exifData.gpsLon != null) ? exifData.gpsLon : null,
                status: 'pending'
            });
            localStorage.setItem('catchgbt_pending_photos', JSON.stringify(pendingPhotos));
            
            toast.success("Foto gespeichert", {
                description: "Oeffne das Fangbuch, um es zu analysieren",
                duration: 5000,
                action: {
                    label: "Zum Fangbuch",
                    onClick: () => window.location.href = createPageUrl('Logbook')
                }
            });
            
        } catch (error) {
            console.error("Fehler beim Upload:", error);
            toast.error("Fehler beim Speichern des Fotos", {
                duration: 3000
            });
        } finally {
            setIsUploading(false);
        }
    };

    const getPlanColor = (planId) => {
        const colors = {
            free: 'text-gray-300',
            basic: 'text-blue-400',
            pro: 'text-purple-400',
            ultimate: 'text-amber-400',
            trial: 'text-green-400'
        };
        return colors[planId] || 'text-gray-300';
    };

    return (
        <div className="bg-black text-white h-screen overflow-hidden relative">


            <div className="fixed top-16 left-8 z-50 flex flex-col items-center gap-2">
                <motion.button
                    onClick={() => setTutorialOpen(true)}
                    animate={{
                        scale: [1, 1.08, 1],
                        opacity: [0.9, 1, 0.9],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="cursor-pointer bg-transparent border-none outline-none"
                >
                    <motion.span
                        animate={{
                            color: [
                                '#22d3ee',
                                '#10b981',
                                '#fbbf24',
                                '#f59e0b',
                                '#22d3ee',
                            ]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="text-xl font-bold drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] hover:drop-shadow-[0_0_20px_rgba(255,255,255,1)] transition-all"
                    >
                        Tutorial
                    </motion.span>
                </motion.button>
            </div>

            <div className="fixed top-16 right-8 z-50">
                <LanguageSwitcher />
            </div>

            <div className="relative isolate overflow-hidden h-full flex flex-col justify-center">
                <img
                    src="https://images.unsplash.com/photo-1593352222543-c24119688536?q=80&w=2070&auto=format&fit=crop"
                    alt=""
                    className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20"
                />
                
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 animate-glow-pulse" aria-hidden="true">
                    <div
                        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#f59e0b] via-[#f97316] to-[#ea580c] opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-gradient-shift"
                        style={{
                            clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                            '--rotation': '30deg', '--opacity-start': '0.4', '--opacity-mid': '0.5', '--opacity-end': '0.35'
                        }}
                    />
                </div>

                <div className="absolute right-0 top-1/4 -z-10 transform-gpu overflow-hidden blur-3xl animate-glow-pulse-delayed" aria-hidden="true">
                    <div
                        className="relative aspect-[1155/678] w-[36.125rem] translate-x-1/2 rotate-[60deg] bg-gradient-to-tr from-[#22d3ee] via-[#06b6d4] to-[#0891b2] opacity-35 sm:w-[72.1875rem] animate-gradient-shift-reverse"
                        style={{
                            clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                            '--rotation': '60deg', '--opacity-start': '0.35', '--opacity-mid': '0.45', '--opacity-end': '0.3'
                        }}
                    />
                </div>

                <div className="absolute inset-x-0 -bottom-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-bottom-80 animate-glow-pulse-slow" aria-hidden="true">
                    <div
                        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[-30deg] bg-gradient-to-tr from-[#16a34a] via-[#10b981] to-[#059669] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-gradient-shift"
                        style={{
                            clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                            '--rotation': '-30deg', '--opacity-start': '0.3', '--opacity-mid': '0.4', '--opacity-end': '0.25'
                        }}
                    />
                </div>

                <div className="absolute left-0 top-1/2 -z-10 transform-gpu overflow-hidden blur-3xl animate-glow-pulse-delayed" aria-hidden="true">
                    <div
                        className="relative aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[-60deg] bg-gradient-to-tr from-[#a855f7] via-[#9333ea] to-[#7c3aed] opacity-25 sm:w-[72.1875rem] animate-gradient-shift-reverse"
                        style={{
                            clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                            '--rotation': '-60deg', '--opacity-start': '0.25', '--opacity-mid': '0.35', '--opacity-end': '0.2'
                        }}
                    />
                </div>
                

            </div>

            <motion.div 
                className="fixed top-[30%] left-[30%] -translate-x-1/2 -translate-y-1/2 z-40 px-4 flex flex-col items-start gap-4 max-w-md"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
            >
                <motion.div
                    animate={{
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <p className="text-lg sm:text-xl md:text-2xl font-semibold text-cyan-300">
                        {(() => {
                            const hour = new Date().getHours();
                            if (hour >= 5 && hour < 12) return 'Guten Morgen, Angler';
                            if (hour >= 12 && hour < 17) return 'Guten Tag, Angler';
                            if (hour >= 17 && hour < 21) return 'Guten Abend, Angler';
                            return 'Gute Nacht, Angler';
                        })()}
                    </p>
                </motion.div>
            </motion.div>

            <motion.div 
                className="fixed top-[42%] left-[30%] -translate-x-1/2 -translate-y-1/2 z-40 px-4 flex flex-col items-start gap-8 max-w-md"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <FeatureHints />
            </motion.div>

            <motion.div 
                className="fixed bottom-[35%] left-[30%] -translate-x-1/2 z-40 px-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                <a
                    href="https://catchgbt-q7scna.manus.space"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-left"
                >
                    <motion.div
                        animate={{
                            scale: [1, 1.08, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <motion.span
                            animate={{
                                textShadow: [
                                    '0 0 30px rgba(34, 211, 238, 0.9), 0 0 60px rgba(34, 211, 238, 0.6)',
                                    '0 0 50px rgba(16, 185, 129, 0.9), 0 0 80px rgba(16, 185, 129, 0.6)',
                                    '0 0 30px rgba(34, 211, 238, 0.9), 0 0 60px rgba(34, 211, 238, 0.6)'
                                ]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl break-words"
                            style={{ 
                                backgroundSize: '200% auto',
                                animation: 'gradient-wave 3s ease infinite'
                            }}
                        >
                            Catchgbt-q7scna.manus.space
                        </motion.span>
                    </motion.div>
                </a>
            </motion.div>

            <div className="fixed bottom-8 left-8 z-50 flex gap-3">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <button
                        onClick={handleLogin}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white text-lg font-bold shadow-[0_0_30px_rgba(34,211,238,0.6)] hover:shadow-[0_0_40px_rgba(34,211,238,0.8)] transform transition-all hover:scale-110 flex items-center justify-center"
                        title={t('landing.cta.start')}
                    >
                        Go
                    </button>
                </motion.div>
            </div>

            <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <motion.p
                        animate={{
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="text-xs sm:text-sm font-light tracking-widest text-gray-400 uppercase"
                    >
                        Beta-Testphase
                    </motion.p>
                </motion.div>

                <motion.button
                    onClick={() => {
                        if (confirm('Notruf 112 waehlen?')) {
                            window.location.href = 'tel:112';
                        }
                    }}
                    animate={{
                        scale: [1, 1.12, 1],
                        boxShadow: [
                            '0 0 25px rgba(239, 68, 68, 0.7)',
                            '0 0 50px rgba(239, 68, 68, 0.9)',
                            '0 0 25px rgba(239, 68, 68, 0.7)'
                        ]
                    }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold text-2xl transform transition-all hover:scale-110 flex items-center justify-center"
                    title="Notruf 112"
                >
                    SOS
                </motion.button>
            </div>

            <TutorialModal isOpen={tutorialOpen} onClose={() => setTutorialOpen(false)} />

            <style>{`
                @keyframes gradient-wave {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }

                @keyframes gradient-shift {
                    0%, 100% {
                        transform: translate(0, 0) rotate(var(--rotation, 0deg)) scale(1);
                        opacity: var(--opacity-start, 0.4);
                    }
                    25% {
                        transform: translate(10%, -5%) rotate(calc(var(--rotation, 0deg) + 15deg)) scale(1.1);
                        opacity: var(--opacity-mid, 0.5);
                    }
                    50% {
                        transform: translate(-5%, 10%) rotate(calc(var(--rotation, 0deg) - 10deg)) scale(0.95);
                        opacity: var(--opacity-end, 0.35);
                    }
                    75% {
                        transform: translate(-10%, -10%) rotate(calc(var(--rotation, 0deg) + 20deg)) scale(1.05);
                        opacity: var(--opacity-mid, 0.5);
                    }
                }

                @keyframes gradient-shift-reverse {
                    0%, 100% {
                        transform: translate(0, 0) rotate(var(--rotation, 0deg)) scale(1);
                        opacity: var(--opacity-start, 0.35);
                    }
                    25% {
                        transform: translate(-10%, 5%) rotate(calc(var(--rotation, 0deg) - 15deg)) scale(1.1);
                        opacity: var(--opacity-mid, 0.45);
                    }
                    50% {
                        transform: translate(5%, -10%) rotate(calc(var(--rotation, 0deg) + 10deg)) scale(0.95);
                        opacity: var(--opacity-end, 0.3);
                    }
                    75% {
                        transform: translate(10%, 10%) rotate(calc(var(--rotation, 0deg) - 20deg)) scale(1.05);
                        opacity: var(--opacity-mid, 0.45);
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
            `}</style>
        </div>
    );
}

export default function LandingPage() {
    return (
        <LanguageProvider>
            <LandingPageContent />
        </LanguageProvider>
    );
}