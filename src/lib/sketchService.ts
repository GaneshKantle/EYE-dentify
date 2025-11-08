import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from './api';
import {
  SketchDetail,
  SketchListResponse,
  SketchSummary,
} from '../types/sketch';

const CACHE_TTL = 60_000; // 60 seconds

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

let sketchesCache: CacheEntry<SketchSummary[]> | null = null;
let sketchesPromise: Promise<SketchSummary[]> | null = null;

const sketchDetailCache = new Map<string, CacheEntry<SketchDetail>>();
const sketchDetailPromises = new Map<string, Promise<SketchDetail>>();

type SketchListListener = () => void;

const sketchListListeners = new Set<SketchListListener>();

const notifySketchListListeners = () => {
  sketchListListeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Sketch list listener failed', error);
      }
    }
  });
};

export const subscribeToSketchList = (listener: SketchListListener) => {
  sketchListListeners.add(listener);
  return () => {
    sketchListListeners.delete(listener);
  };
};

const resolveList = (sketches: SketchSummary[]) => {
  sketchesCache = {
    data: sketches,
    expiresAt: Date.now() + CACHE_TTL,
  };
  return sketches;
};

const resolveDetail = (id: string, detail: SketchDetail) => {
  sketchDetailCache.set(id, {
    data: detail,
    expiresAt: Date.now() + CACHE_TTL,
  });
  return detail;
};

const handleListError = (error: unknown) => {
  sketchesPromise = null;
  throw error;
};

const handleDetailError = (id: string, error: unknown) => {
  sketchDetailPromises.delete(id);
  throw error;
};

export const listSketches = async (force = false): Promise<SketchSummary[]> => {
  const cacheValid =
    !force && sketchesCache && sketchesCache.expiresAt > Date.now();

  if (cacheValid && sketchesCache) {
    return sketchesCache.data;
  }

  if (!force && sketchesPromise) {
    return sketchesPromise;
  }

  const request = apiClient
    .directGet<SketchListResponse>('/sketches')
    .then(({ sketches }) => resolveList(sketches || []))
    .finally(() => {
      sketchesPromise = null;
    });

  sketchesPromise = request.catch(handleListError);
  return sketchesPromise;
};

export const getSketchById = async (
  id: string,
  force = false
): Promise<SketchDetail> => {
  const cache = sketchDetailCache.get(id);
  const cacheValid = !force && cache && cache.expiresAt > Date.now();

  if (cacheValid && cache) {
    return cache.data;
  }

  if (!force) {
    const pending = sketchDetailPromises.get(id);
    if (pending) {
      return pending;
    }
  }

  const request = apiClient
    .directGet<SketchDetail>(`/sketches/${id}`)
    .then((detail) => resolveDetail(id, detail))
    .finally(() => {
      sketchDetailPromises.delete(id);
    });

  sketchDetailPromises.set(id, request.catch((error) => handleDetailError(id, error)));
  return sketchDetailPromises.get(id)!;
};

export const invalidateSketchList = () => {
  sketchesCache = null;
  notifySketchListListeners();
};

export const invalidateSketchDetail = (id?: string) => {
  if (id) {
    sketchDetailCache.delete(id);
    sketchDetailPromises.delete(id);
  } else {
    sketchDetailCache.clear();
    sketchDetailPromises.clear();
  }
};

export const useSketches = (options?: {
  refreshIntervalMs?: number;
  autoRefresh?: boolean;
}) => {
  const { refreshIntervalMs = 60_000, autoRefresh = false } = options || {};

  const [data, setData] = useState<SketchSummary[]>(
    sketchesCache?.data ?? []
  );
  const [loading, setLoading] = useState<boolean>(
    !sketchesCache?.data
  );
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  const refreshPendingRef = useRef(false);

  const load = useCallback(
    async (force = false) => {
      try {
        if (force) {
          invalidateSketchList();
        }
        setLoading(true);
        const sketches = await listSketches(force);
        if (mountedRef.current) {
          setData(sketches);
          setError(null);
        }
        return sketches;
      } catch (err: unknown) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err : new Error('Failed to load sketches'));
        }
        throw err;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    mountedRef.current = true;
    if (!sketchesCache) {
      load(false);
    } else if (Date.now() > (sketchesCache.expiresAt || 0)) {
      load(false);
    }
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = window.setInterval(() => {
      load(true).catch(() => undefined);
    }, refreshIntervalMs);
    return () => window.clearInterval(interval);
  }, [autoRefresh, load, refreshIntervalMs]);

  const scheduleNotifierRefresh = useCallback(() => {
    if (refreshPendingRef.current || !mountedRef.current) {
      return;
    }
    refreshPendingRef.current = true;
    Promise.resolve()
      .then(() => load(true))
      .catch(() => undefined)
      .finally(() => {
        refreshPendingRef.current = false;
      });
  }, [load]);

  useEffect(() => {
    const unsubscribe = subscribeToSketchList(scheduleNotifierRefresh);
    return () => {
      refreshPendingRef.current = false;
      unsubscribe();
    };
  }, [scheduleNotifierRefresh]);

  return {
    sketches: data,
    loading,
    error,
    refresh: () => load(true),
  };
};

export const useSketch = (id: string | null | undefined) => {
  const [data, setData] = useState<SketchDetail | null>(
    id && sketchDetailCache.get(id)?.data ? sketchDetailCache.get(id)!.data : null
  );
  const [loading, setLoading] = useState<boolean>(!!id && !data);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const load = useCallback(
    async (force = false) => {
      if (!id) return null;
      try {
        const detail = await getSketchById(id, force);
        if (mountedRef.current) {
          setData(detail);
          setError(null);
        }
        return detail;
      } catch (err: unknown) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err : new Error('Failed to load sketch'));
        }
        throw err;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [id]
  );

  useEffect(() => {
    mountedRef.current = true;
    if (id) {
      const cache = sketchDetailCache.get(id);
      if (!cache || cache.expiresAt < Date.now()) {
        load(!cache);
      } else {
        setData(cache.data);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
    return () => {
      mountedRef.current = false;
    };
  }, [id, load]);

  return {
    sketch: data,
    loading,
    error,
    refresh: () => load(true),
  };
};


