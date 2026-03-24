/**
 * Analytics Dashboard — Composite component for all analytics
 */

import { useEffect, useState, useTransition, useRef } from "react";
import { getTrendingData, getAnomalyData, evaluateAlerts, getHealthSummary } from "../../server/analytics";
import { TrendingCard } from "./TrendingCard";
import { AnomalyBadge } from "./AnomalyBadge";
import { AlertPanel } from "./AlertPanel";
import { HealthSummary } from "./HealthSummary";

export interface AnalyticsDashboardProps {
  datasources: Array<{ id: string; name: string }>;
  autoRefreshSeconds?: number;
}

export function AnalyticsDashboard({
  datasources,
  autoRefreshSeconds = 60,
}: AnalyticsDashboardProps) {
  const [_isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--hud-text-bright)]">
          Analytics
        </h2>
        <p className="text-xs text-[var(--hud-text-muted)] mt-1">
          Trending, anomalies, and alerts for {datasources.length} datasource
          {datasources.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trending Analysis */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-[var(--hud-text-muted)] uppercase tracking-wider">
            Trending
          </h3>
          <div className="space-y-3">
            {datasources.map((ds) => (
              <TrendingCardLoader
                key={`trending-${ds.id}`}
                datasourceId={ds.id}
                datasourceName={ds.name}
              />
            ))}
          </div>
        </div>

        {/* Alerts & Anomalies */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-[var(--hud-text-muted)] uppercase tracking-wider">
            Issues
          </h3>
          <div className="space-y-3">
            {datasources.map((ds) => (
              <div key={`issues-${ds.id}`} className="space-y-2">
                <AnomalyCardLoader
                  datasourceId={ds.id}
                  datasourceName={ds.name}
                />
                <AlertCardLoader
                  datasourceId={ds.id}
                  datasourceName={ds.name}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Health Summary */}
      {datasources.length > 0 && (
        <div className="mt-6 pt-4 border-t border-[var(--hud-border)]">
          <HealthSummaryLoader />
        </div>
      )}

      {/* Info */}
      <div className="text-[10px] text-[var(--hud-text-muted)] mt-8 pt-4 border-t border-[var(--hud-border)]">
        Auto-refresh every {autoRefreshSeconds}s • Based on D1 metrics
      </div>
    </div>
  );
}

/**
 * Trending card loader — fetches and displays trending data
 */
interface CardLoaderProps {
  datasourceId: string;
  datasourceName: string;
}

function TrendingCardLoader({ datasourceId, datasourceName }: CardLoaderProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const requestRef = useRef<Promise<any> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getTrendingData({ data: { datasourceId } });
        // Only update state if component is still mounted
        if (!isMountedRef.current) return;
        if (result.error) {
          setError(result.error);
          setData(null);
        } else {
          setData(result.trending);
          setError(null);
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        setError(err instanceof Error ? err.message : "Failed to load trending data");
        setData(null);
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };

    // Deduplicate in-flight requests
    if (!requestRef.current) {
      requestRef.current = fetchData().finally(() => {
        requestRef.current = null;
      });
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [datasourceId]);

  return (
    <TrendingCard
      datasourceId={datasourceId}
      trending={data}
      loading={loading}
      error={error}
    />
  );
}

function AnomalyCardLoader({ datasourceId, datasourceName }: CardLoaderProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const requestRef = useRef<Promise<any> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getAnomalyData({ data: { datasourceId } });
        // Only update state if component is still mounted
        if (!isMountedRef.current) return;
        if (result.error) {
          setError(result.error);
          setData(null);
        } else {
          setData(result.anomalies);
          setError(null);
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        setError(err instanceof Error ? err.message : "Failed to load anomalies");
        setData(null);
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };

    // Deduplicate in-flight requests
    if (!requestRef.current) {
      requestRef.current = fetchData().finally(() => {
        requestRef.current = null;
      });
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [datasourceId]);

  return (
    <AnomalyBadge
      datasourceId={datasourceId}
      anomalies={data}
      loading={loading}
      error={error}
    />
  );
}

function AlertCardLoader({ datasourceId, datasourceName }: CardLoaderProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const requestRef = useRef<Promise<any> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await evaluateAlerts({ data: { datasourceId } });
        // Only update state if component is still mounted
        if (!isMountedRef.current) return;
        if (result.error) {
          setError(result.error);
          setData(null);
        } else {
          setData(result.alerts);
          setError(null);
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        setError(err instanceof Error ? err.message : "Failed to load alerts");
        setData(null);
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };

    // Deduplicate in-flight requests
    if (!requestRef.current) {
      requestRef.current = fetchData().finally(() => {
        requestRef.current = null;
      });
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [datasourceId]);

  return (
    <AlertPanel
      alerts={data || []}
      datasourceId={datasourceId}
      loading={loading}
      error={error}
    />
  );
}

function HealthSummaryLoader() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const requestRef = useRef<Promise<any> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getHealthSummary();
        // Only update state if component is still mounted
        if (!isMountedRef.current) return;
        if (result.error) {
          setError(result.error);
          setData(null);
        } else {
          setData(result.summary);
          setError(null);
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        setError(err instanceof Error ? err.message : "Failed to load health summary");
        setData(null);
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };

    // Deduplicate in-flight requests
    if (!requestRef.current) {
      requestRef.current = fetchData().finally(() => {
        requestRef.current = null;
      });
    }

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return (
    <HealthSummary
      health={data}
      loading={loading}
      error={error}
    />
  );
}
