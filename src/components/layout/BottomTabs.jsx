import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Map, BookOpen, User } from "lucide-react";

export default function BottomTabs() {
  const location = useLocation();

  const tabs = [
    { name: "Dashboard", path: "Dashboard", icon: Home },
    { name: "Map", path: "Map", icon: Map },
    { name: "Logbook", path: "Logbook", icon: BookOpen },
    { name: "Profile", path: "Profile", icon: User },
  ];

  const isActive = (path) => {
    const currentPath = location.pathname.split('/').pop() || 'Dashboard';
    return currentPath === path;
  };

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-xl border-t border-gray-800 z-50"
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          return (
            <Link
              key={tab.path}
              to={createPageUrl(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active 
                  ? 'text-cyan-400' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${active ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' : ''}`} />
              <span className="text-xs font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}