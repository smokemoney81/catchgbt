import { createContext, useContext, useState, useCallback } from 'react';

/**
 * Centralized navigation stack context.
 * NavigationTracker populates this; SubPageHeader and BottomTabs consume it.
 */

const ROOT_SEGMENTS = new Set(['', 'Dashboard', 'Map', 'Logbook', 'Profile', 'Home', 'Start']);

const NavigationContext = createContext({
  stack: [],
  canGoBack: false,
  isRootTab: true,
  pushRoute: () => {},
});

export function NavigationProvider({ children }) {
  const [stack, setStack] = useState([]);

  const pushRoute = useCallback((pathname) => {
    setStack(prev => {
      if (prev[prev.length - 1] === pathname) return prev;
      return [...prev, pathname];
    });
  }, []);

  const currentPathname = stack[stack.length - 1] ?? '/';
  const currentSegment = currentPathname.replace(/^\//, '').split('/')[0];
  const isRootTab = ROOT_SEGMENTS.has(currentSegment);
  const canGoBack = stack.length > 1 && !isRootTab;

  return (
    <NavigationContext.Provider value={{ stack, canGoBack, isRootTab, pushRoute }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationContext() {
  return useContext(NavigationContext);
}