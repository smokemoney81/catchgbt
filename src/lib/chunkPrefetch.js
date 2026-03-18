/**
 * Dynamic chunk prefetching utility
 * Prefetches code-split chunks based on user navigation patterns
 * Reduces initial page load and improves perceived performance
 */

const PREFETCH_TIMEOUT = 5000; // 5 second delay before prefetch
const PREFETCH_IDLE_DEADLINE = 2000; // Max wait for requestIdleCallback
const PREFETCH_THROTTLE = 100; // Minimum time between prefetch requests

let lastPrefetchTime = 0;
const prefetchedChunks = new Set();

/**
 * Get all chunk imports for components
 * Used for prefetching on route changes
 */
export const CHUNK_ROUTES = {
  // Map page
  Map: () => import('@/pages/Map'),
  MapPage: () => import('@/pages/MapPage'),
  
  // Analysis pages
  Analysis: () => import('@/pages/Analysis'),
  WaterAnalysis: () => import('@/pages/WaterAnalysis'),
  
  // Depth analysis
  Devices: () => import('@/pages/Devices'),
  BathymetricCrowdsourcing: () => import('@/pages/BathymetricCrowdsourcing'),
  
  // AI features
  AI: () => import('@/pages/AI'),
  AIAssistant: () => import('@/pages/AIAssistant'),
  ARView: () => import('@/pages/ARView'),
  
  // Heavy components
  WaterCharts: () => import('@/components/water/WaterCharts'),
  ARWater3D: () => import('@/components/ar/ARWater3D'),
  BiteDetectorSection: () => import('@/components/ai/BiteDetectorSection'),
  MapController: () => import('@/components/map/v2/MapController'),
  DepthSection: () => import('@/components/depth/DepthSection'),
};

/**
 * Routes that typically follow from current page
 * Used to predict next navigation
 */
export const NAVIGATION_GRAPH = {
  Home: ['Dashboard', 'Map', 'Weather'],
  Dashboard: ['Map', 'Logbook', 'AIAssistant'],
  Map: ['WaterAnalysis', 'ARView', 'Analysis'],
  Logbook: ['Analysis', 'AIAssistant', 'Map'],
  Weather: ['Map', 'Dashboard', 'WaterAnalysis'],
  AIAssistant: ['Map', 'Logbook', 'Dashboard'],
  Profile: ['Settings', 'Licenses', 'Premium'],
};

/**
 * Prefetch a route's chunks
 */
export async function prefetchRoute(routeName) {
  if (!routeName || prefetchedChunks.has(routeName)) {
    return;
  }

  const now = Date.now();
  if (now - lastPrefetchTime < PREFETCH_THROTTLE) {
    return;
  }
  lastPrefetchTime = now;

  const chunkImporter = CHUNK_ROUTES[routeName];
  if (!chunkImporter) {
    return;
  }

  try {
    await chunkImporter();
    prefetchedChunks.add(routeName);
  } catch (error) {
    console.debug(`Chunk prefetch failed for ${routeName}:`, error.message);
  }
}

/**
 * Prefetch multiple routes
 */
export async function prefetchRoutes(routeNames) {
  const promises = routeNames.map(name => prefetchRoute(name));
  await Promise.allSettled(promises);
}

/**
 * Smart prefetch based on navigation graph
 * Prefetches likely next pages after current page
 */
export function prefetchNavigationGraph(currentRoute) {
  const nextRoutes = NAVIGATION_GRAPH[currentRoute] || [];
  
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(
      () => prefetchRoutes(nextRoutes),
      { timeout: PREFETCH_IDLE_DEADLINE }
    );
  } else {
    setTimeout(() => prefetchRoutes(nextRoutes), PREFETCH_TIMEOUT);
  }
}

/**
 * Prefetch critical heavy components on app load
 */
export function prefetchCriticalChunks() {
  const criticalChunks = [
    'MapController',
    'WaterCharts',
    'BiteDetectorSection',
  ];

  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(
      () => prefetchRoutes(criticalChunks),
      { timeout: PREFETCH_IDLE_DEADLINE }
    );
  } else {
    setTimeout(() => prefetchRoutes(criticalChunks), PREFETCH_TIMEOUT);
  }
}

/**
 * Reset prefetch cache (useful for testing or memory management)
 */
export function clearPrefetchCache() {
  prefetchedChunks.clear();
  lastPrefetchTime = 0;
}

/**
 * Get prefetch stats
 */
export function getPrefetchStats() {
  return {
    prefetched: Array.from(prefetchedChunks),
    count: prefetchedChunks.size,
  };
}