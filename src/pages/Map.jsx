import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PremiumGuard from "@/components/premium/PremiumGuard";
import MapController from "@/components/map/v2/MapController";

export default function MapPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setUser(await base44.auth.me());
      } catch (e) {
        console.log("User not logged in:", e);
      }
    };
    loadUser();
  }, []);

  return (
    <PremiumGuard 
      user={user} 
      requiredPlan="basic"
      feature="Die erweiterte Karten-Ansicht ist ein Basic-Feature"
    >
      <div className="min-h-screen bg-gray-950 p-4">
        <MapController />
      </div>
    </PremiumGuard>
  );
}