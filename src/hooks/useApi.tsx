"use client";

import { useEffect, useState } from "react";
import { api, ApiRequestError } from "@/lib/api";

export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ListResponse<T> {
  data: T[];
  meta: Meta;
}

export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (path === null) {
      setLoading(false);
      return;
    }

    const currentPath = path;
    let cancelled = false;

    async function load() {
      try {
        const result = await api.get<T>(currentPath);

        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiRequestError
              ? err.message
              : "Failed to load data",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [path, refreshKey]);

  const refetch = () => {
    setLoading(true);
    setRefreshKey((value) => value + 1);
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
}

export function useApiList<T>(path: string | null) {
  const [data, setData] = useState<T[]>([]);
  const [meta, setMeta] = useState<Meta | undefined>();
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (path === null) {
      setLoading(false);
      return;
    }

    const currentPath = path;
    let cancelled = false;

    async function load() {
      try {
        const result = await api.get<ListResponse<T>>(currentPath);

        if (!cancelled) {
          setData(result.data);
          setMeta(result.meta);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiRequestError
              ? err.message
              : "Failed to load data",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [path, refreshKey]);

  const refetch = () => {
    setLoading(true);
    setRefreshKey((value) => value + 1);
  };

  return {
    data,
    meta,
    loading,
    error,
    refetch,
  };
}
