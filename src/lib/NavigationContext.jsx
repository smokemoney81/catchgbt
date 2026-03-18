import { createContext, useContext, useState, useCallback, useRef } from 'react';

/**
 * Centralized navigation stack.
 *
 * Owns the route history list and the slide direction used by PageTransition.
 * NavigationTracker (inside Router) bridges React Router location changes into
 * this context so the context itself never imports Router APIs.
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
  resetStack: () => {},
});

export function NavigationProvider({ children }) {
  const [stack, setStack] = useState([]);
  const [direction, setDirection] = useState(1);

  // Stable ref so event handlers always see latest values without re-registering.
  const stackRef = useRef(stack);
  const directionRef = useRef(direction);

  const pushRoute = useCallback((pathname) => {
    setStack(prev => {
      if (prev[prev.length - 1] === pathname) return prev;
      const next = [...prev, pathname];
      stackRef.current = next;
      directionRef.current = 1;
      setDirection(1);
      return next;
    });
  }, []);

  const popRoute = useCallback(() => {
    setStack(prev => {
      if (prev.length <= 1) return prev;
      const next = prev.slice(0, -1);
      stackRef.current = next;
      directionRef.current = -1;
      setDirection(-1);
      return next;
    });
  }, []);

  // Hard-reset the stack (e.g. when logging out or switching root tabs).
  const resetStack = useCallback(() => {
    setStack([]);
    stackRef.current = [];
    setDirection(1);
  }, []);

  const currentPathname = stack[stack.length - 1] ?? '/';
  const currentSegment = currentPathname.replace(/^\//, '').split('/')[0];
  const isRootTab = ROOT_SEGMENTS.has(currentSegment);
  const canGoBack = stack.length > 1 && !isRootTab;

  return (
    <NavigationContext.Provider
      value={{ stack, direction, canGoBack, isRootTab, pushRoute, popRoute, resetStack }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationContext() {
  return useContext(NavigationContext);
}