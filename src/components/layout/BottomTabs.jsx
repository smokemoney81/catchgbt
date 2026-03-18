import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Map, BookOpen, User } from "lucide-react";

const TAB_NAVIGATION_STACKS_KEY = 'tab_navigation_stacks';

function getTabNavigationStacks() {
  try {
    const stored = sessionStorage.getItem(TAB_NAVIGATION_STACKS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function setTabNavigationStacks(stacks) {
  try {
    sessionStorage.setItem(TAB_NAVIGATION_STACKS_KEY, JSON.stringify(stacks));
  } catch (e) {
    console.warn('Failed to save tab navigation stacks:', e);
  }
}

export default function BottomTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const [lastActivePath, setLastActivePath] = useState(location.pathname);

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

  const currentTab = tabs.find(tab => isActive(tab.path));

  useEffect(() => {
    if (!currentTab) return;
    
    const stacks = getTabNavigationStacks();
    
    if (!stacks[currentTab.path]) {
      stacks[currentTab.path] = [];
    }
    
    if (location.pathname !== lastActivePath) {
      const currentStack = stacks[currentTab.path];
      const lastInStack = currentStack[currentStack.length - 1];
      
      if (lastInStack !== location.pathname) {
        currentStack.push(location.pathname);
        setTabNavigationStacks(stacks);
      }
    }
    
    setLastActivePath(location.pathname);
  }, [location.pathname, currentTab, lastActivePath]);

  const handleTabClick = (e, tab) => {
    e.preventDefault();
    
    const stacks = getTabNavigationStacks();
    const tabStack = stacks[tab.path] || [];
    
    if (tabStack.length > 0) {
      const lastPath = tabStack[tabStack.length - 1];
      navigate(lastPath);
    } else {
      navigate(createPageUrl(tab.path));
    }
  };

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-xl border-t border-gray-800 z-50"
      style={{ paddingBottom: 'var(--safe-area-bottom)' }}
    >
      <div className="flex items-center justify-around h-16 min-h-[44px]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          return (
            <Link
              key={tab.path}
              to={createPageUrl(tab.path)}
              onClick={(e) => handleTabClick(e, tab)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors min-h-[44px] ${
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