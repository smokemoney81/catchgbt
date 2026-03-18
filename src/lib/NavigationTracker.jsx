import { useEffect } from 'react';
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

  // Notify parent frame of URL changes (Base44 platform requirement)
  useEffect(() => {
    window.parent?.postMessage({ type: 'app_changed_url', url: window.location.href }, '*');
  }, [location]);

  // Push each pathname into the centralized navigation stack
  useEffect(() => {
    pushRoute(location.pathname);
  }, [location.pathname, pushRoute]);

  // Android hardware back-button via popstate.
  // We always keep one synthetic history entry ahead so that the back gesture
  // hits our handler first rather than leaving the app.
  useEffect(() => {
    const segment = location.pathname.replace(/^\//, '').split('/')[0];
    const isRoot = ROOT_SEGMENTS.has(segment) || location.pathname === '/';

    if (isRoot) {
      // Keep a guard entry so the hardware back is interceptable
      window.history.pushState({ catchgbt_guard: true }, '', window.location.href);
    }

    const handlePopState = (event) => {
      if (canGoBack) {
        // Intercept: pop our internal stack and navigate back in React Router
        event.preventDefault?.();
        popRoute();
        navigate(-1);
        // Re-push guard so subsequent backs are also intercepted
        window.history.pushState({ catchgbt_guard: true }, '', window.location.href);
      } else if (isRoot) {
        // On a root tab: re-push guard to prevent app exit
        window.history.pushState({ catchgbt_guard: true }, '', window.location.href);
      }
      // If canGoBack is false and not root, let the browser/OS handle it (app closes naturally)
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.pathname, canGoBack, navigate, popRoute]);

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