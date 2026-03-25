/**
 * Component Registry — Discovers, loads, and manages all components
 *
 * Central registry for OpenDash datasource components.
 * Enables dynamic loading and orchestration.
 */

import type { Component, ComponentConfig, BriefingItem } from "./component";

/**
 * Component Registry
 *
 * Manages all components in the system:
 * - Discovery: find all available components
 * - Loading: dynamically load components from packages
 * - Lookup: get a component by ID
 * - Fetching: execute fetch on all components in parallel
 */
export class ComponentRegistry {
  private components: Map<string, Component> = new Map();

  /**
   * Register a component
   */
  register(component: Component): void {
    const id = component.id;

    if (this.components.has(id)) {
      throw new Error(`Component with id "${id}" is already registered`);
    }

    this.components.set(id, component);
  }

  /**
   * Get a component by ID
   */
  get(id: string): Component | undefined {
    return this.components.get(id);
  }

  /**
   * Get all registered components
   */
  getAll(): Component[] {
    return Array.from(this.components.values());
  }

  /**
   * Check if a component is registered
   */
  has(id: string): boolean {
    return this.components.has(id);
  }

  /**
   * Fetch briefing items from all registered components in parallel
   */
  async fetchAll(config: ComponentConfig): Promise<BriefingItem[]> {
    const promises = Array.from(this.components.values()).map((component) =>
      component.fetch(config).catch((err) => {
        console.error(`[${component.id}] Fetch error:`, err);
        return [];
      })
    );

    const results = await Promise.all(promises);
    return results.flat();
  }

  /**
   * Unregister a component
   */
  unregister(id: string): void {
    this.components.delete(id);
  }

  /**
   * Clear all registered components
   */
  clear(): void {
    this.components.clear();
  }

  /**
   * Get count of registered components
   */
  count(): number {
    return this.components.size;
  }

  /**
   * List all component IDs
   */
  list(): string[] {
    return Array.from(this.components.keys());
  }
}

/**
 * Global singleton instance
 * Use this to access the registry from anywhere
 */
export const globalComponentRegistry = new ComponentRegistry();

/**
 * Helper to register a component globally
 */
export function registerComponent(component: Component): void {
  globalComponentRegistry.register(component);
}

/**
 * Helper to get a component from global registry
 */
export function getComponent(id: string): Component | undefined {
  return globalComponentRegistry.get(id);
}

/**
 * Helper to get all registered components
 */
export function getAllComponents(): Component[] {
  return globalComponentRegistry.getAll();
}
