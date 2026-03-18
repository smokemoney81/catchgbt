import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { base44 } from '@/api/base44Client';
import { mobileStack } from './MobileStackManager';

/**
 * NavigationTracker - MobileStackManager Exclusive Integration
 *
 * Eliminates all window.history API usage. MobileStackManager is the SINGLE
 * SOURCE OF TRUTH for navigation state. React Router is UI binding only.
 *
 * Core responsibilities:
 *   1. Sync React Router location to MobileStackManager (one-way binding)
 *   2. Handle hardware back-button via mobileStack.handleAndroidBack()
 *   3. Navigate UI when mobileStack state changes
 *   4. Post navigation events to Base44 platform parent
 *   5. NO direct history.pushState/replaceState calls
 *
 * Navigation Flow:
 *   User Action -> MobileLink.onClick -> mobileStack.push/replace -> 
 *   MobileStackManager notifies -> NavigationTracker navigates React Router ->
 *   React Router updates location -> back-end services log navigation
 */
export default function NavigationTracker() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Notify Base44 platform parent of URL changes
  useEffect(() => {
    window.parent?.postMessage({ 
      type: 'app_changed_url', 
      url: window.location.href 
    }, '*');
  }, [location]);

  /**
   * Sync React Router location changes to MobileStackManager.
   * This ensures mobileStack state matches the UI.
   */
  useEffect(() => {
    const pathname = location.pathname;
    
    // Update mobileStack to match current location
    // Only push if not already at this path
    if (mobileStack.getCurrentPathname() !== pathname) {
      mobileStack.push(pathname);
    }
    
    if (isAuthenticated && pathname) {
      base44.appLogs.logUserInApp(pathname).catch(() => {});
    }
  }, [location.pathname, isAuthenticated]);

  /**
   * Listen for mobileStack changes and update React Router UI.
   * This is the primary mechanism for navigation.
   */
  useEffect(() => {
    const unsubscribe = mobileStack.subscribe((state) => {
      // Navigate React Router to match mobileStack state
      const currentPath = location.pathname;
      if (currentPath !== state.pathname) {
        // Use replace to prevent browser history pollution
        navigate(state.pathname, { replace: true });
      }
    });

    return unsubscribe;
  }, [navigate, location.pathname]);

  /**
   * Handle Android/hardware back button.
   * No browser history API involvement - pure stack-based navigation.
   */
  useEffect(() => {
    const handlePopState = (event) => {
      // Prevent browser default behavior completely
      event.preventDefault();
      
      // Let MobileStackManager handle back logic
      const canGoBack = mobileStack.handleAndroidBack();

      if (canGoBack) {
        // Navigate React Router to new stack top
        const nextPath = mobileStack.getCurrentPathname();
        navigate(nextPath, { replace: true });
      } else {
        // At root - app should exit (handled by platform/webview)
        console.log('[NavigationTracker] At root, back button returns to app exit');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  /**
   * Handle Escape key as back-button equivalent
   */
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        const canGoBack = mobileStack.handleAndroidBack();
        if (canGoBack) {
          const nextPath = mobileStack.getCurrentPathname();
          navigate(nextPath, { replace: true });
        }
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [navigate]);

  return null;
}