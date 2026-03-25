/**
 * Component Registry — Discovers, loads, and manages all components
 *
 * Central registry for both OpenDash datasource components and Virtual-Media components.
 * Enables dynamic loading, composition, and orchestration.
 */

import type { Component, ComponentMetadata } from "./Component";

/**
 * Component Registry
 *
 * Manages all components in the system:
 * - Discovery: find all available components
 * - Loading: dynamically load components from packages
 * - Lookup: get a component by ID
 * - Metadata: access component information
 */
export class ComponentRegistry {
  private components: Map<string, Component> = new Map();
  private metadata: Map<string, ComponentMetadata> = new Map();

  /**
   * Register a component
   */
  register(component: Component): void {
    const id = component.metadata.id;

    if (this.components.has(id)) {
      throw new Error(`Component with id "${id}" is already registered`);
    }

    this.components.set(id, component);
    this.metadata.set(id, component.metadata);
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
   * Get all component metadata
   */
  getAllMetadata(): ComponentMetadata[] {
    return Array.from(this.metadata.values());
  }

  /**
   * Get metadata for a specific component
   */
  getMetadata(id: string): ComponentMetadata | undefined {
    return this.metadata.get(id);
  }

  /**
   * Check if a component is registered
   */
  has(id: string): boolean {
    return this.components.has(id);
  }

  /**
   * Get all components from a specific team
   */
  getByTeam(team: "opendash" | "virtual-media"): Component[] {
    return Array.from(this.components.values()).filter(
      (c) => c.metadata.team === team
    );
  }

  /**
   * Unregister a component
   */
  unregister(id: string): void {
    this.components.delete(id);
    this.metadata.delete(id);
  }

  /**
   * Clear all registered components
   */
  clear(): void {
    this.components.clear();
    this.metadata.clear();
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
