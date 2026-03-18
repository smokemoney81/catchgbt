import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { base44 } from '@/api/base44Client';
import { pagesConfig } from '@/pages.config';

export default function NavigationTracker() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { Pages, mainPage } = pagesConfig;
    const mainPageKey = mainPage ?? Object.keys(Pages)[0];
    // Track history depth to distinguish "can go back" from "would close app"
    const historyDepth = useRef(0);

    // Post navigation changes to parent window
    useEffect(() => {
        window.parent?.postMessage({
            type: "app_changed_url",
            url: window.location.href
        }, '*');
    }, [location]);

    // Push a history entry on every navigation so the back gesture
    // pops within the app instead of closing it.
    useEffect(() => {
        historyDepth.current += 1;
        // Push a synthetic entry so the browser always has somewhere to go back to.
        if (historyDepth.current > 1) {
            window.history.pushState(null, '', window.location.href);
        }
    }, [location.pathname]);

    // Intercept the browser/OS back gesture: if we are at the root page,
    // prevent app close by pushing state again; otherwise let React Router handle it.
    useEffect(() => {
        const handlePopState = () => {
            const isRoot = location.pathname === '/' || location.pathname === `/${mainPageKey}`;
            if (isRoot) {
                // Re-push so swiping back again does the same thing (prevents close)
                window.history.pushState(null, '', window.location.href);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [location.pathname, mainPageKey]);

    // Log user activity when navigating to a page
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