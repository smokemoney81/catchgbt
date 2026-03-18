import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { base44 } from '@/api/base44Client';
import { pagesConfig } from '@/pages.config';
import { useNavigationContext } from './NavigationContext';

const ROOT_SEGMENTS = new Set(['', 'Dashboard', 'Map', 'Logbook', 'Profile', 'Home', 'Start']);

export default function NavigationTracker() {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { Pages, mainPage } = pagesConfig;
    const mainPageKey = mainPage ?? Object.keys(Pages)[0];
    const { pushRoute } = useNavigationContext();

    // Notify parent frame of URL changes (Base44 platform requirement)
    useEffect(() => {
        window.parent?.postMessage({ type: 'app_changed_url', url: window.location.href }, '*');
    }, [location]);

    // Push each pathname into the centralized navigation stack
    useEffect(() => {
        pushRoute(location.pathname);
    }, [location.pathname, pushRoute]);

    // Prevent OS-level app close when user is on a root tab:
    // keep one synthetic history entry ahead so the back gesture
    // pops within the browser session rather than exiting the app.
    useEffect(() => {
        const segment = location.pathname.replace(/^\//, '').split('/')[0];
        const isRoot = ROOT_SEGMENTS.has(segment) || location.pathname === '/';

        if (isRoot) {
            window.history.pushState(null, '', window.location.href);
        }

        const handlePopState = () => {
            if (isRoot) {
                window.history.pushState(null, '', window.location.href);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [location.pathname]);

    // Log user activity (analytics)
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