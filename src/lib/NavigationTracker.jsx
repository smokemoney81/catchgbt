import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { base44 } from '@/api/base44Client';
import { pagesConfig } from '@/pages.config';
import { mobileStack } from './MobileStackManager';

/**
 * NavigationTracker - MobileStackManager Exclusive Integration
 *
 * Enforces WebView-native navigation standards by eliminating direct
 * React Router browser history manipulation. MobileStackManager is the
 * SINGLE SOURCE OF TRUTH for all navigation state.
 *
 * Core principles:
 *   1. MobileStackManager maintains the navigation stack exclusively
 *   2. No window.history.pushState/replaceState calls
 *   3. All back-button events flow through mobileStack.handleAndroidBack()
 *   4. React Router is UI binding only, not state owner
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

  // CRITICAL: React Router location MUST sync to mobileStack (one-way only)
  // This ensures mobileStack remains the single source of truth
  useEffect(() => {
    const pathname = location.pathname;
    
    // Update mobileStack when React Router location changes
    // This is safe because mobileStack is our state authority
    mobileStack.push(pathname);
    
    if (isAuthenticated && pathname) {
      base44.appLogs.logUserInApp(pathname).catch(() => {});
    }
  }, [location.pathname, isAuthenticated]);

  // EXCLUSIVE back-button handling via MobileStackManager
  // No React Router history manipulation - mobileStack controls all navigation
  useEffect(() => {
    const handlePopState = (event) => {
      // Prevent ALL browser history API interference
      event.preventDefault();
      
      // MobileStackManager handles all back logic
      const canGoBack = mobileStack.handleAndroidBack();

      if (canGoBack) {
        // Navigate using React Router only for UI binding
        // mobileStack state is already updated by handleAndroidBack()
        const nextPath = mobileStack.getCurrentPathname();
        navigate(nextPath, { replace: true });
      }
      // If !canGoBack, mobileStack prevents exit (mobile-native behavior)
    };

    // Listen ONLY for hardware/browser back events
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  return null;
}