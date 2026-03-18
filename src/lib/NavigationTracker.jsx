import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { base44 } from '@/api/base44Client';
import { pagesConfig } from '@/pages.config';
import { mobileStack } from './MobileStackManager';

/**
 * NavigationTracker - MobileStackManager Exclusive Integration
 *
 * Pure state-based navigation that decouples from React Router's history API.
 * MobileStackManager handles ALL navigation state independently, preventing
 * conflicts between browser history API and React Router location changes.
 *
 * Back-button strategy:
 *   - MobileStackManager maintains its own stack, independent of browser history
 *   - popstate events trigger mobileStack.handleAndroidBack() for pure state navigation
 *   - React Router location changes sync TO mobileStack (not the reverse)
 *   - No window.history.pushState() calls - mobileStack is the single source of truth
 */
export default function NavigationTracker() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { Pages, mainPage } = pagesConfig;
  const mainPageKey = mainPage ?? Object.keys(Pages)[0];

  // Notify parent frame of URL changes (Base44 platform requirement).
  useEffect(() => {
    window.parent?.postMessage({ type: 'app_changed_url', url: window.location.href }, '*');
  }, [location]);

  // Keep mobileStack in sync when React Router location changes
  // This is ONE-WAY: React Router location -> mobileStack (never reverse)
  useEffect(() => {
    mobileStack.push(location.pathname);
  }, [location.pathname]);

  // MobileStackManager-exclusive back-button handling
  // Pure state-based navigation, independent of browser history API
  useEffect(() => {
    const handlePopState = (event) => {
      // Prevent browser default back behavior - let mobileStack handle it
      event.preventDefault();
      
      // Check if we can go back in the mobileStack
      const canGoBack = mobileStack.handleAndroidBack();

      if (canGoBack) {
        // Get the new pathname from mobileStack and navigate
        const nextPath = mobileStack.getCurrentPathname();
        navigate(nextPath, { replace: true });
      }
      // If at root, mobileStack prevents app exit
    };

    // Listen only for popstate (browser/hardware back button)
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, location.pathname]);

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