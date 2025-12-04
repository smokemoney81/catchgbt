
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import RulesSection from "@/components/rules/RulesSection";

export default function Rules() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setUser(await User.me());
      } catch (e) {
        console.log("User not logged in:", e);
      }
    };
    loadUser();
  }, []);

  // Premium-Check temporär deaktiviert - alle Features frei
  return (
    <div className="min-h-screen bg-gray-950 p-6 pb-32">
      <RulesSection />
    </div>
  );
}
