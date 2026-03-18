import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { base44 } from '@/api/base44Client';
import { pagesConfig } from '@/pages.config';
import { useNavigationContext, ROOT_SEGMENTS } from './NavigationContext';

/**
 * NavigationTracker
 *
 * Bridges React Router with the centralized NavigationContext stack.
 *
 * Back-button strategy (Android PWA / WebView compatible):
 *   - On mount, we push ONE sentinel entry into browser history so the first
 *     hardware back-press fires popstate instead of exiting the app.
 *   - Every time popstate fires we IMMEDIATELY re-arm the sentinel so the next
 *     back-press is also caught. This means we never lose control regardless of
 *     how many times the user presses back.
 *   - canGoBack is read via a stable ref to avoid the handler being
 *     re-registered on every navigation, which was the source of duplicate
 *     guards in the previous implementation.
 *
 * This removes all per-route pushState calls and decouples the guard from
 * React Router's location lifecycle entirely.
 */
export default function NavigationTracker() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { Pages, mainPage } = pagesConfig;
  const mainPageKey = mainPage ?? Object.keys(Pages)[0];
  const { pushRoute, popRoute, canGoBack, switchTab } = useNavigationContext();

  // Stable ref so the popstate handler never becomes stale.
  const canGoBackRef = useRef(canGoBack);
  useEffect(() => {
    canGoBackRef.current = canGoBack;
  }, [canGoBack]);

  // Notify parent frame of URL changes (Base44 platform requirement).
  useEffect(() => {
    window.parent?.postMessage({ type: 'app_changed_url', url: window.location.href }, '*');
  }, [location]);

  // Keep the centralized stack in sync with React Router.
  useEffect(() => {
    pushRoute(location.pathname);
  }, [location.pathname, pushRoute]);

  // Single-sentinel back-button guard — registered ONCE on mount.
  //
  // We push one history sentinel entry at startup and re-push it on every
  // popstate event. This keeps the browser from ever being able to navigate
  // backwards on its own while still allowing us to call navigate(-1) through
  // React Router when the user intentionally goes back.
  useEffect(() => {
    // Arm the sentinel for the first time.
    window.history.pushState({ _navGuard: true }, '');

    const handlePopState = () => {
      // Immediately re-arm so the next back press is also intercepted.
      window.history.pushState({ _navGuard: true }, '');

      if (canGoBackRef.current) {
        // Update our internal stack direction then let React Router handle
        // the actual URL change.
        popRoute();
        navigate(-1);
      }
      // If we are on a root tab there is nothing to do — the re-arm above
      // already prevents the browser from exiting the app.
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps: register once. canGoBack is read via ref.

  // Analytics: log page view.
  useEffect(() => {
    const pathname = location.pathname;
    let pageName;

    if (pathname === '/' || pathname === '') {
      pageName = mainPageKey;
    } else {
      const pathSegment = pathname.replace(/^\//, '').split('/')[0];
      const pageKeys = Object.keys(Pages);
      const matchedKey = pageKeys.find(
        (key) => key.toLowerCase() === pathSegment.toLowerCase()
      );
      pageName = matchedKey || null;
    }

    if (isAuthenticated && pageName) {
      base44.appLogs.logUserInApp(pageName).catch(() => {});
    }
  }, [location, isAuthenticated, Pages, mainPageKey]);

  return null;
}