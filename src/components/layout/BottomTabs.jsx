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
  const { currentTab, switchTab, getTabStack } = useNavigationContext();

  const currentSegment = location.pathname.replace(/^\//, '').split('/')[0] || 'Dashboard';
  const isActive = (path) => currentSegment === path;

  const handleTabClick = (e, tab) => {
    e.preventDefault();
    
    // Switch to the new tab in the context
    switchTab(tab.path);
    
    // Get the saved stack for this tab
    const tabStack = getTabStack(tab.path);
    
    // Navigate to the last known route in that tab, or to the tab root if the stack is empty
    if (tabStack.length > 0) {
      const lastRoute = tabStack[tabStack.length - 1];
      navigate(lastRoute);
    } else {
      navigate(createPageUrl(tab.path));
    }
  };

  return (
    <nav
      aria-label="Hauptnavigation"
      className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-xl border-t border-gray-800 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      role="tablist"
    >
      <div className="flex items-center justify-around min-h-[60px]">
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
              aria-selected={active}
              role="tab"
              className={`flex flex-col items-center justify-center flex-1 h-full touch-target transition-colors`}
            >
              <Icon
                aria-hidden="true"
                className={`w-6 h-6 mb-1 transition-colors ${active ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'text-gray-400'}`}
              />
              <span className={`text-xs font-medium transition-colors ${active ? 'text-cyan-400' : 'text-gray-400'}`} aria-hidden="true">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}