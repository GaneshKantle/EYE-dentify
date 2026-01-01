import { apiClient } from './api';

const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

type AssetsCache = {
  data: any[];
  expiresAt: number;
  categoryCounts: Record<string, number>;
};

let assetsCache: AssetsCache | null = null;
let assetsPromise: Promise<any[]> | null = null;

/**
 * Get cached assets if available and not expired
 */
export const getCachedAssets = (): AssetsCache | null => {
  if (assetsCache && assetsCache.expiresAt > Date.now()) {
    return assetsCache;
  }
  return null;
};

/**
 * Set assets cache with precomputed category counts
 */
export const setAssetsCache = (data: any[]): void => {
  // Calculate category counts immediately for fast access
  const categoryCounts: Record<string, number> = {};
  data.forEach(asset => {
    if (asset.type) {
      categoryCounts[asset.type] = (categoryCounts[asset.type] || 0) + 1;
    }
  });
  
  assetsCache = {
    data,
    expiresAt: Date.now() + CACHE_DURATION_MS,
    categoryCounts
  };
};

/**
 * Invalidate the assets cache
 */
export const invalidateAssetsCache = (): void => {
  assetsCache = null;
  assetsPromise = null;
};

/**
 * Load assets from API with caching
 */
export const loadAssets = async (force = false): Promise<any[]> => {
  const cache = getCachedAssets();
  const cacheValid = !force && cache;

  if (cacheValid) {
    return cache.data;
  }

  // If there's already a pending request, return it
  if (!force && assetsPromise) {
    return assetsPromise;
  }

  // Make API request
  const request = apiClient
    .directGet<any[]>('/assets')
    .then((data) => {
      setAssetsCache(data || []);
      return data || [];
    })
    .catch((error) => {
      assetsPromise = null;
      throw error;
    })
    .finally(() => {
      assetsPromise = null;
    });

  assetsPromise = request;
  return assetsPromise;
};

/**
 * Get category counts from cache (instant, no API call)
 */
export const getCategoryCounts = (): Record<string, number> => {
  const cache = getCachedAssets();
  return cache?.categoryCounts || {};
};

