/**
 * useAnalytics Hook — Fetch and manage analytics data
 */

import { useTransition, useState, useEffect } from "react";
import {
  getTrendingData,
  getAnomalyData,
  evaluateAlerts,
} from "../server/analytics";
import type { TrendingData, AnomalyData } from "../server/analytics";

export interface UseAnalyticsOptions {
  datasourceId: string;
  hours?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useAnalyticsTrending({
  datasourceId,
  hours = 24,
  autoRefresh = false,
  refreshInterval = 60000,
}: UseAnalyticsOptions) {
  const [trending, setTrending] = useState<TrendingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetch = async () => {
    startTransition(async () => {
      try {
        const result = await getTrendingData({
          datasourceId,
          hours,
        });
        if (result.error) {
          setError(result.error);
        } else {
          setTrending(result.trending);
          setError(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    });
  };

  useEffect(() => {
    fetch();

    if (autoRefresh) {
      const interval = setInterval(fetch, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [datasourceId, hours, autoRefresh, refreshInterval]);

  return { trending, error, loading: isPending, refetch: fetch };
}

export function useAnalyticsAnomalies({
  datasourceId,
  hours = 24,
  autoRefresh = false,
  refreshInterval = 60000,
}: UseAnalyticsOptions) {
  const [anomalies, setAnomalies] = useState<AnomalyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetch = async () => {
    startTransition(async () => {
      try {
        const result = await getAnomalyData({
          datasourceId,
          hours,
        });
        if (result.error) {
          setError(result.error);
        } else {
          setAnomalies(result.anomalies);
          setError(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    });
  };

  useEffect(() => {
    fetch();

    if (autoRefresh) {
      const interval = setInterval(fetch, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [datasourceId, hours, autoRefresh, refreshInterval]);

  return { anomalies, error, loading: isPending, refetch: fetch };
}

export function useAnalyticsAlerts({
  datasourceId,
  autoRefresh = false,
  refreshInterval = 60000,
}: UseAnalyticsOptions) {
  const [alerts, setAlerts] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetch = async () => {
    startTransition(async () => {
      try {
        const result = await evaluateAlerts({
          datasourceId,
        });
        if (result.error) {
          setError(result.error);
        } else {
          setAlerts(result.alerts);
          setError(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    });
  };

  useEffect(() => {
    fetch();

    if (autoRefresh) {
      const interval = setInterval(fetch, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [datasourceId, autoRefresh, refreshInterval]);

  return { alerts, error, loading: isPending, refetch: fetch };
}
