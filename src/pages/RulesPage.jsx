import React from "react";
import RulesDisplay from "@/components/rules/RulesDisplay";
import { Info } from "lucide-react";

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 pb-32">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Schonzeiten & Mindestmaße
          </h1>
          <p className="text-gray-400 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Übersicht aller Angelbestimmungen nach Region und Fischart
          </p>
        </div>

        {/* Wichtiger Hinweis */}
        <div className="mb-6 p-4 bg-amber-900/20 border border-amber-800/50 rounded-xl">
          <p className="text-amber-400 text-sm leading-relaxed">
            <strong>Hinweis:</strong> Diese Angaben dienen nur zur Orientierung. 
            Bitte informiere dich zusätzlich bei deinem lokalen Angelverein oder der zuständigen Behörde über aktuelle Bestimmungen. 
            Verstöße können zu Strafen führen.
          </p>
        </div>

        {/* Rules Display Component */}
        <RulesDisplay />
      </div>
    </div>
  );
}