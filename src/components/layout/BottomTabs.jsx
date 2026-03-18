import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Map, BookOpen, User } from "lucide-react";
import { useNavigationContext } from "@/lib/NavigationContext";

const tabs = [
  { name: "Dashboard", path: "Dashboard", icon: Home },
  { name: "Map",       path: "Map",       icon: Map },
  { name: "Logbook",   path: "Logbook",   icon: BookOpen },
  { name: "Profile",   path: "Profile",   icon: User },
];

export default function BottomTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetStack } = useNavigationContext();

  const currentSegment = location.pathname.replace(/^\//, '').split('/')[0] || 'Dashboard';
  const isActive = (path) => currentSegment === path;

  const handleTabClick = (e, tab) => {
    e.preventDefault();
    // Always navigate to root of the tab and reset the navigation stack.
    // This matches native mobile tab bar behavior: tapping a tab you are already
    // on scrolls to top; tapping a different tab always goes to its root.
    resetStack();
    navigate(createPageUrl(tab.path));
  };

  return (
    <nav
      aria-label="Hauptnavigation"
      className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-xl border-t border-gray-800 z-50"
      style={{ paddingBottom: 'var(--safe-area-bottom)' }}
    >
      <div className="flex items-center justify-around" style={{ height: '60px' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);

          return (
            <Link
              key={tab.path}
              to={createPageUrl(tab.path)}
              onClick={(e) => handleTabClick(e, tab)}
              aria-label={tab.name}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors`}
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <Icon
                aria-hidden="true"
                className={`w-6 h-6 mb-1 ${active ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'text-gray-400'}`}
              />
              <span className={`text-xs font-medium ${active ? 'text-cyan-400' : 'text-gray-400'}`} aria-hidden="true">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}