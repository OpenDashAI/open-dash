import alchemy from "alchemy";
import {
  D1Database,
  DurableObjectNamespace,
  Worker,
} from "alchemy/cloudflare";

const app = await alchemy("open-dash");

// ── D1 Database ──────────────────────────────────────────────────────
const db = await D1Database("open-dash-db", {
  name: "open-dash-db",
  adopt: true,
});

// ── Durable Objects ──────────────────────────────────────────────────
const hudSocket = DurableObjectNamespace("hud-socket", {
  className: "HudSocket",
  scriptName: "open-dash",
});

const competitiveIntel = DurableObjectNamespace("competitive-intel", {
  className: "CompetitiveIntelligenceCoordinator",
  scriptName: "open-dash",
});

// ── Workers ──────────────────────────────────────────────────────────

// Main open-dash worker (Hono + Vite SSR)
const mainWorker = await Worker("open-dash", {
  name: "open-dash",
  entrypoint: "./src/worker.ts",
  adopt: true,
  compatibilityDate: "2026-03-24",
  compatibilityFlags: ["nodejs_compat"],
  bindings: {
    DB: db,
    HUD_SOCKET: hudSocket,
    COMPETITIVE_INTEL: competitiveIntel,
  },
});

// Metrics collector worker (Scram Jet RPC target)
const metricsCollector = await Worker("metrics-collector", {
  name: "metrics-collector",
  entrypoint: "./workers/metrics-collector/src/index.ts",
  adopt: true,
  compatibilityDate: "2026-03-24",
  bindings: {
    DB: db,
  },
});

// Sample Scram Jet pipeline worker
await Worker("sample-scram-jet-pipeline", {
  name: "sample-scram-jet-pipeline",
  entrypoint: "./workers/sample-scram-jet-pipeline/src/index.ts",
  adopt: true,
  compatibilityDate: "2026-03-24",
  bindings: {
    METRICS_COLLECTOR: metricsCollector,
  },
});

await app.finalize();
