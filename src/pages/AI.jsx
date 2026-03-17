import React, { useState, useEffect, Suspense, lazy } from "react";
import PremiumGuard from "@/components/premium/PremiumGuard";
import { base44 } from "@/api/base44Client";

const CameraAnalysisSection = lazy(() => import("@/components/ai/CameraAnalysisSection"));
const BiteDetectorSection = lazy(() => import("@/components/ai/BiteDetectorSection"));

const SectionSkeleton = () => (
  <div className="w-full h-48 rounded-2xl bg-gray-800/50 animate-pulse flex items-center justify-center">
    <div className="text-gray-500 text-sm">Wird geladen...</div>
  </div>
);

export default function AI() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        console.log("User not logged in:", e);
      }
    };
    loadUser();
  }, []);

  return (
    <PremiumGuard 
      user={user} 
      requiredPlan="elite"
      feature="KI-Kamera & Bissanzeiger"
    >
      <div className="min-h-screen bg-gray-950 p-6 pb-32">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)] mb-2">
              KI-Assistent
            </h1>
            <p className="text-gray-400">
              Fischarten erkennen & Bisserkennung
            </p>
          </div>

          <Suspense fallback={<SectionSkeleton />}>
            <CameraAnalysisSection />
          </Suspense>
          <Suspense fallback={<SectionSkeleton />}>
            <BiteDetectorSection />
          </Suspense>
        </div>
      </div>
    </PremiumGuard>
  );
}