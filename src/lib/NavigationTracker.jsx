import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { base44 } from '@/api/base44Client';
import { pagesConfig } from '@/pages.config';
import { useNavigationContext, ROOT_SEGMENTS } from './NavigationContext';

export default function NavigationTracker() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { Pages, mainPage } = pagesConfig;
  const mainPageKey = mainPage ?? Object.keys(Pages)[0];
  const { pushRoute, popRoute, canGoBack } = useNavigationContext();

  // Stable ref so the popstate handler always sees the latest canGoBack value
  // without needing to be re-registered on every change.
  const canGoBackRef = useRef(canGoBack);
  useEffect(() => {
    canGoBackRef.current = canGoBack;
  }, [canGoBack]);

  // Notify parent frame of URL changes (Base44 platform requirement).
  useEffect(() => {
    window.parent?.postMessage({ type: 'app_changed_url', url: window.location.href }, '*');
  }, [location]);

  // Keep the centralized NavigationContext stack in sync with React Router location.
  useEffect(() => {
    pushRoute(location.pathname);
  }, [location.pathname, pushRoute]);

  // Hardware back-button guard.
  //
  // We maintain exactly ONE extra browser history entry per route so the first
  // back gesture fires our handler instead of letting the browser navigate away.
  // This is necessary because React Router does not expose a hook that intercepts
  // the physical back button before the browser acts on it.
  //
  // Strategy:
  //   1. On every route change push one guard entry.
  //   2. On popstate:
  //      - If we have in-app history, call navigate(-1).
  //        React Router will update location, which re-triggers this effect
  //        and pushes a fresh guard for the destination route.
  //      - Otherwise (root tab / no history) re-push the guard to block exit.
  useEffect(() => {
    window.history.pushState(null, '');

    const segment = location.pathname.replace(/^\//, '').split('/')[0];
    const isRoot = ROOT_SEGMENTS.has(segment) || location.pathname === '/';

    const handlePopState = () => {
      if (canGoBackRef.current) {
        // Navigate back inside the app.
        // The destination route's effect will push a fresh guard automatically.
        popRoute();
        navigate(-1);
      } else {
        // Root tab or no in-app history: prevent the browser from exiting.
        window.history.pushState(null, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.pathname, navigate, popRoute]);

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