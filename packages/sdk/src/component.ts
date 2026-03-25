/**
 * @opendash/sdk - OpenDash Component SDK
 *
 * Core types for building OpenDash components (datasources).
 * Defines the interface that all components must implement.
 */

/**
 * A briefing item represents a single piece of information
 * shown to the user in the dashboard.
 */
export interface BriefingItem {
  /** Unique identifier (should be unique within the component) */
  id: string;

  /** Priority level affects visual prominence */
  priority: 'low' | 'normal' | 'high';

  /** Category for grouping (e.g., "revenue", "deploy", "issue") */
  category: string;

  /** One-liner headline */
  title: string;

  /** Additional context or details */
  detail: string;

  /** ISO 8601 timestamp */
  time: string;

  /** Highlight as new since last dashboard visit */
  isNew?: boolean;

  /** Optional action button label */
  actionLabel?: string;

  /** Handler identifier for the action */
  actionHandler?: string;
}

/**
 * Configuration passed to component.fetch()
 */
export interface ComponentConfig {
  /** Environment variables (secrets, API keys, etc.) */
  env: Record<string, string | undefined>;

  /** Last dashboard visit timestamp (for isNew detection) */
  lastVisited: string | null;

  /** Brand/dashboard-specific configuration */
  brandConfig?: Record<string, unknown>;
}

/**
 * Status of a component after fetch attempt
 */
export interface ComponentStatus {
  /** Did the fetch succeed? */
  connected: boolean;

  /** When was it last attempted? */
  lastFetch?: string;

  /** Error message if failed */
  error?: string;

  /** How many items returned? */
  itemCount?: number;
}

/**
 * A component is a pluggable data source that contributes briefing items.
 * Each component has an identity (id, name, icon) and a fetch method.
 */
export interface Component {
  /** Kebab-case, globally unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Single character or emoji */
  icon: string;

  /** One-liner description */
  description: string;

  /** SemVer version (e.g., "1.0.0") */
  version: string;

  /** Author/maintainer name */
  author: string;

  /** Does this require configuration (API key, etc.)? */
  requiresConfig: boolean;

  /**
   * Fetch briefing items from the external system.
   * Should return empty array on error (graceful degradation).
   */
  fetch(config: ComponentConfig): Promise<BriefingItem[]>;
}

/**
 * Registered component with its current status
 */
export interface RegisteredComponent {
  component: Component;
  status: ComponentStatus;
}

/**
 * Component registry — manages lifecycle of all components
 */
export interface ComponentRegistry {
  register(component: Component): void;
  get(id: string): Component | undefined;
  list(): Component[];
  fetchAll(
    config: ComponentConfig,
  ): Promise<{ items: BriefingItem[]; statuses: Map<string, ComponentStatus> }>;
}
