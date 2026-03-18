import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const PAGE_PREFETCH_MAP = {
  'Home': ['Dashboard', 'Map'],
  'Dashboard': ['Log', 'Rank', 'Map'],
  'Logbook': ['Community', 'Rank', 'Analysis'],
  'Log': ['Logbook', 'Community'],
  'Rank': ['Community', 'Logbook'],
  'Community': ['Rank', 'Logbook'],
  'Map': ['Dashboard', 'WaterAnalysis'],
  'WaterAnalysis': ['Map', 'Weather'],
  'Weather': ['WaterAnalysis', 'Analysis'],
  'Analysis': ['AI', 'Logbook'],
  'AI': ['Analysis', 'BiteDetector'],
  'Shop': ['Premium', 'Dashboard'],
  'Premium': ['Shop', 'Dashboard'],
  'Gear': ['Logbook', 'Community'],
};

const PREFETCH_DELAY = 5000; // 5 seconds

export function usePredictivePrefetch(currentPageName) {
  const queryClient = useQueryClient();
  const timerRef = useRef(null);
  const prefetchedRef = useRef(new Set());

  const prefetchPage = useCallback(async (pageName) => {
    // Avoid duplicate prefetches
    if (prefetchedRef.current.has(pageName)) {
      return;
    }

    try {
      // Prefetch common query keys for that page
      const queryKeyMap = {
        'Logbook': ['catches', 'spots'],
        'Log': ['catches'],
        'Rank': ['leaderboard', 'rankings'],
        'Community': ['posts', 'competitions', 'recent-activity'],
        'Map': ['mapSpots', 'mapClubs'],
        'WaterAnalysis': ['waterData'],
        'Gear': ['userGear'],
        'Analysis': ['catches', 'ai-analysis'],
        'Weather': ['weatherData'],
      };

      const keysToFetch = queryKeyMap[pageName] || [];
      
      for (const key of keysToFetch) {
        try {
          await queryClient.prefetchQuery({
            queryKey: [key],
            staleTime: 30000, // 30 seconds
          });
          prefetchedRef.current.add(pageName);
        } catch (e) {
          // Silently fail - prefetch is best-effort
          console.debug(`Prefetch for ${pageName} key ${key} failed:`, e.message);
        }
      }
    } catch (e) {
      console.debug(`Prefetch for ${pageName} failed:`, e.message);
    }
  }, [queryClient]);

  useEffect(() => {
    const nextPages = PAGE_PREFETCH_MAP[currentPageName] || [];
    
    if (nextPages.length === 0) {
      return;
    }

    // Set timer to prefetch after 5 seconds of inactivity
    timerRef.current = setTimeout(() => {
      nextPages.forEach(pageName => {
        prefetchPage(pageName);
      });
    }, PREFETCH_DELAY);

    // Cleanup on page change or unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      prefetchedRef.current.clear();
    };
  }, [currentPageName, prefetchPage]);
}