/**
 * OpenDash Component Interface
 *
 * A component is a self-contained unit that:
 * - Fetches data from an external system
 * - Transforms data into BriefingItems
 * - Registers with the ComponentRegistry
 * - Works alongside other components
 */

/**
 * A single item of information displayed in the briefing
 */
export interface BriefingItem {
  /** Unique identifier within the component */
  id: string;

  /** Priority for display ordering */
  priority: "low" | "normal" | "high";

  /** Category for grouping (e.g., "revenue", "alert", "deployment") */
  category: string;

  /** One-liner headline */
  title: string;

  /** Additional context/detail */
  detail: string;

  /** ISO 8601 timestamp */
  time: string;

  /** Highlight if new since last visit */
  isNew?: boolean;

  /** Optional button label for action */
  actionLabel?: string;

  /** Handler identifier for action (e.g., "open-dashboard") */
  actionHandler?: string;

  /** Optional metadata for frontend rendering */
  metadata?: Record<string, unknown>;
}

/**
 * Configuration passed to component.fetch()
 */
export interface ComponentConfig {
  /** Environment variables (secrets) */
  env: Record<string, string | undefined>;

  /** Last time user visited dashboard (for isNew detection) */
  lastVisited: string | null;

  /** Brand/org-specific configuration */
  brandConfig?: Record<string, unknown>;
}

/**
 * Current status of a component
 */
export interface ComponentStatus {
  /** Successfully connected and fetched last time */
  connected: boolean;

  /** ISO 8601 timestamp of last successful fetch */
  lastFetch?: string;

  /** Error message if last fetch failed */
  error?: string;

  /** Number of briefing items returned */
  itemCount?: number;
}

/**
 * Component interface - all components must implement this
 */
export interface Component {
  // Identity
  /** Globally unique identifier (kebab-case) */
  id: string;

  /** Display name */
  name: string;

  /** Single character emoji or icon */
  icon: string;

  /** One-line description */
  description: string;

  // Capabilities
  /** Semantic version (e.g., "1.0.0") */
  version: string;

  /** Component author/team */
  author: string;

  /** Whether this component requires configuration (env vars or settings) */
  requiresConfig: boolean;

  // Behavior
  /**
   * Fetch data from external source and return briefing items
   *
   * IMPORTANT: This function should NEVER throw an error.
   * Instead, return a briefing item describing the problem.
   * This ensures one component's failure doesn't block others.
   *
   * @param config Configuration including env vars and brand settings
   * @returns Array of briefing items (empty array if unconfigured or no data)
   */
  fetch(config: ComponentConfig): Promise<BriefingItem[]>;
}

/**
 * Metadata for component marketplace registration
 */
export interface ComponentMarketplaceMetadata {
  /** Repository URL (GitHub, etc.) */
  repository?: string;

  /** Component license (MIT, Apache 2.0, etc.) */
  license?: string;

  /** Component category for discovery */
  category?: string;

  /** Tags for searching */
  tags?: string[];

  /** Number of downloads/installs */
  downloads?: number;

  /** Average rating (1-5) */
  rating?: number;

  /** Whether this is a premium/paid component */
  isPremium?: boolean;

  /** Maintainer contact */
  maintainer?: {
    name: string;
    email?: string;
    url?: string;
  };
}
