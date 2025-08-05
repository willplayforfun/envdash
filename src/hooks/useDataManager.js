import { useState, useCallback } from 'react';
import { API_ENDPOINTS } from '../ApiConfig';

// Cache structure for boundary data
const createEmptyCache = () => ({
  boundaries: {}, // keyed by level-parentCode: { 0: { data, version }, '1-US': { data, version }, ... }
  serverVersion: null // track server data version for cache invalidation
});

function useDataManager() {
  const [cache, setCache] = useState(createEmptyCache());
  const [isConnected, setIsConnected] = useState(true);
  const [connectionError, setConnectionError] = useState(null);

  // Helper to check if cached data is still valid based on server version
  const isCacheValid = useCallback((cacheEntry, serverVersion) => {
    if (!cacheEntry || !cacheEntry.version || !serverVersion) return false;
    return cacheEntry.version === serverVersion;
  }, []);

  // Generic fetch function with error handling
  const fetchData = useCallback(async (url) => {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Restore connection state on successful request
      if (!isConnected) {
        setIsConnected(true);
        setConnectionError(null);
      }

      return data;
    } catch (error) {
      // Handle network errors and connection state
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        console.error('Network error:', error);
        setIsConnected(false);
        setConnectionError(error.message);
      }
      throw error;
    }
  }, [isConnected]);

  // Get boundaries for a specific level and optional parent
  const getBoundaries = useCallback(async (level, parentCode = null) => {
    const cacheKey = parentCode ? `${level}-${parentCode}` : `${level}`;

    // Check if we have valid cached data
    const cachedEntry = cache.boundaries[cacheKey];
    if (cachedEntry && isCacheValid(cachedEntry, cache.serverVersion)) {
      return cachedEntry.data;
    }

    // Fetch from server
    const url = API_ENDPOINTS.boundaries(level, parentCode);
    const response = await fetchData(url);

    // Extract data and version from response
    const { data, version } = response;

    // Update cache with new data and version
    setCache(prev => ({
      ...prev,
      boundaries: {
        ...prev.boundaries,
        [cacheKey]: { data, version }
      },
      serverVersion: version
    }));

    return data;
  }, [cache.boundaries, cache.serverVersion, isCacheValid, fetchData]);

  // Clear all cached data
  const clearCache = useCallback(() => {
    setCache(createEmptyCache());
  }, []);

  // Get cache status for debugging
  const getCacheStatus = useCallback(() => {
    const boundaryKeys = Object.keys(cache.boundaries);
    const status = {
      boundariesCached: boundaryKeys.length,
      boundaryLevels: boundaryKeys.map(key => {
        const [level, parentCode] = key.split('-');
        return { level: parseInt(level), parentCode: parentCode || null };
      }),
      serverVersion: cache.serverVersion,
      totalSize: JSON.stringify(cache).length // rough size estimate
    };
    return status;
  }, [cache]);

  return {
    // Data fetching
    getBoundaries,

    // Connection state
    isConnected,
    connectionError,

    // Cache management
    clearCache,
    getCacheStatus
  };
}

export default useDataManager;