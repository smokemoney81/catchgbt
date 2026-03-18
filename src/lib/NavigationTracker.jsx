import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { base44 } from '@/api/base44Client';
import { pagesConfig } from '@/pages.config';
import { useNavigationContext } from './NavigationContext';
import { ROOT_SEGMENTS } from './NavigationContext';

export default function NavigationTracker() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { Pages, mainPage } = pagesConfig;
  const mainPageKey = mainPage ?? Object.keys(Pages)[0];
  const { pushRoute, popRoute, canGoBack } = useNavigationContext();

  // Keep a ref so the popstate handler always sees the latest value
  // without needing to be recreated on every canGoBack change.
  const canGoBackRef = useRef(canGoBack);
  useEffect(() => {
    canGoBackRef.current = canGoBack;
  }, [canGoBack]);

  // Notify parent frame of URL changes (Base44 platform requirement)
  useEffect(() => {
    window.parent?.postMessage({ type: 'app_changed_url', url: window.location.href }, '*');
  }, [location]);

  // Push each pathname into the centralized navigation stack
  useEffect(() => {
    pushRoute(location.pathname);
  }, [location.pathname, pushRoute]);

  // Hardware back-button guard.
  // Strategy: always keep one synthetic guard entry ahead so that the first
  // back gesture hits our handler. The handler then either navigates within
  // the app or re-pushes the guard to stay put (on root tabs).
  useEffect(() => {
    const segment = location.pathname.replace(/^\//, '').split('/')[0];
    const isRoot = ROOT_SEGMENTS.has(segment) || location.pathname === '/';

    // Push one guard entry so the popstate fires before the browser acts
    window.history.pushState({ catchgbt_guard: true }, '', window.location.href);

    const handlePopState = () => {
      if (canGoBackRef.current) {
        // Navigate back inside the app and restore the guard
        popRoute();
        navigate(-1);
        window.history.pushState({ catchgbt_guard: true }, '', window.location.href);
      } else if (isRoot) {
        // On a root tab: block the app from exiting
        window.history.pushState({ catchgbt_guard: true }, '', window.location.href);
      }
      // Non-root with no history left: let the OS/browser close the app naturally
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
    // Re-run only when the actual route changes, NOT on every canGoBack toggle
    // (canGoBackRef keeps it fresh without triggering re-registration)
  }, [location.pathname, navigate, popRoute]);

  // Analytics: log page view
  useEffect(() => {
    const pathname = location.pathname;
    let pageName;

    if (pathname === '/' || pathname === '') {
      pageName = mainPageKey;
    } else {
      const pathSegment = pathname.replace(/^\//, '').split('/')[0];
      const pageKeys = Object.keys(Pages);
      const matchedKey = pageKeys.find(
        key => key.toLowerCase() === pathSegment.toLowerCase()
      );
      pageName = matchedKey || null;
    }

    if (isAuthenticated && pageName) {
      base44.appLogs.logUserInApp(pageName).catch(() => {});
    }
  }, [location, isAuthenticated, Pages, mainPageKey]);

  return null;
}