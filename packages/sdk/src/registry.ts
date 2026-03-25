import type {
  Component,
  ComponentConfig,
  ComponentRegistry,
  ComponentStatus,
  BriefingItem,
} from './component';

/**
 * Default component registry implementation.
 * Manages registration and fetching of all components.
 */
export class DefaultComponentRegistry implements ComponentRegistry {
  private components = new Map<string, Component>();

  /**
   * Register a component.
   * Will throw if component.id is already registered.
   */
  register(component: Component): void {
    if (this.components.has(component.id)) {
      throw new Error(
        `Component "${component.id}" already registered. Use a unique ID.`,
      );
    }
    this.components.set(component.id, component);
  }

  /**
   * Get a component by ID.
   * Returns undefined if not found.
   */
  get(id: string): Component | undefined {
    return this.components.get(id);
  }

  /**
   * List all registered components.
   */
  list(): Component[] {
    return Array.from(this.components.values());
  }

  /**
   * Fetch from all components in parallel.
   * Returns briefing items and status of each component.
   * Handles errors gracefully — a single component failure doesn't block others.
   */
  async fetchAll(
    config: ComponentConfig,
  ): Promise<{ items: BriefingItem[]; statuses: Map<string, ComponentStatus> }> {
    const statuses = new Map<string, ComponentStatus>();
    const allItems: BriefingItem[] = [];

    // Fetch all components in parallel
    const results = await Promise.allSettled(
      Array.from(this.components.values()).map(async (component) => {
        try {
          const startTime = Date.now();
          const items = await component.fetch(config);
          const duration = Date.now() - startTime;

          // Update status
          statuses.set(component.id, {
            connected: true,
            lastFetch: new Date().toISOString(),
            itemCount: items.length,
          });

          return items;
        } catch (err) {
          // Record error but don't fail
          const errorMsg =
            err instanceof Error ? err.message : 'Unknown error';

          statuses.set(component.id, {
            connected: false,
            lastFetch: new Date().toISOString(),
            error: errorMsg,
            itemCount: 0,
          });

          // Return empty array (graceful degradation)
          return [];
        }
      }),
    );

    // Collect all items from successful fetches
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allItems.push(...result.value);
      }
    }

    return { items: allItems, statuses };
  }
}

/**
 * Create a new component registry.
 *
 * @example
 * ```typescript
 * import { createComponentRegistry } from '@opendash/sdk';
 * import { stripeRevenue } from '@opendash-components/stripe-revenue';
 *
 * const registry = createComponentRegistry();
 * registry.register(stripeRevenue);
 *
 * const { items } = await registry.fetchAll({
 *   env: process.env,
 *   lastVisited: null,
 * });
 * ```
 */
export function createComponentRegistry(): ComponentRegistry {
  return new DefaultComponentRegistry();
}
