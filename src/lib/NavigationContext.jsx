import { createContext, useContext, useState, useCallback } from 'react';

/**
 * Centralized navigation stack context.
 * Tracks route history, direction (for slide transitions), and whether the
 * current screen is a root tab (controls back-button behavior).
 */

export const ROOT_SEGMENTS = new Set([
  '', 'Dashboard', 'Map', 'Logbook', 'Profile', 'Home', 'Start',
]);

const NavigationContext = createContext({
  stack: [],
  direction: 1,
  canGoBack: false,
  isRootTab: true,
  pushRoute: () => {},
  popRoute: () => {},
});

export function NavigationProvider({ children }) {
  const [stack, setStack] = useState([]);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  const pushRoute = useCallback((pathname) => {
    setStack(prev => {
      if (prev[prev.length - 1] === pathname) return prev;
      setDirection(1);
      return [...prev, pathname];
    });
  }, []);

  // Called when the user navigates back (hardware back or browser popstate).
  const popRoute = useCallback(() => {
    setStack(prev => {
      if (prev.length <= 1) return prev;
      setDirection(-1);
      return prev.slice(0, -1);
    });
  }, []);

  const currentPathname = stack[stack.length - 1] ?? '/';
  const currentSegment = currentPathname.replace(/^\//, '').split('/')[0];
  const isRootTab = ROOT_SEGMENTS.has(currentSegment);
  const canGoBack = stack.length > 1 && !isRootTab;

  return (
    <NavigationContext.Provider
      value={{ stack, direction, canGoBack, isRootTab, pushRoute, popRoute }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationContext() {
  return useContext(NavigationContext);
}