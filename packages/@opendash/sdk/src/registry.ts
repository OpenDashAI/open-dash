/**
 * Component Registry
 *
 * Manages component registration and execution with error isolation.
 * One component failure doesn't block others.
 */

import type { Component, ComponentConfig, BriefingItem } from "./component.js";

export interface RegistryError {
  componentId: string;
  error: unknown;
  timestamp: string;
}

/**
 * Registry for managing and executing components
 */
export class ComponentRegistry {
  private components = new Map<string, Component>();
  private errors: RegistryError[] = [];

  /**
   * Register a component
   */
  register(component: Component): void {
    if (this.components.has(component.id)) {
      throw new Error(`Component "${component.id}" already registered`);
    }
    this.components.set(component.id, component);
  }

  /**
   * Unregister a component
   */
  unregister(id: string): boolean {
    return this.components.delete(id);
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
   * Get number of registered components
   */
  size(): number {
    return this.components.size;
  }

  /**
   * Fetch from all components in parallel with error isolation
   *
   * One component failure doesn't block others.
   * Errors are collected in this.errors for logging/monitoring.
   *
   * @param config Configuration passed to all components
   * @returns All briefing items from all components
   */
  async fetchAll(config: ComponentConfig): Promise<BriefingItem[]> {
    this.errors = []; // Clear previous errors

    // Fetch from all components in parallel
    const results = await Promise.allSettled(
      Array.from(this.components.values()).map((component) =>
        this.executeComponent(component, config),
      ),
    );

    // Aggregate results, filtering out failures
    const items: BriefingItem[] = [];

    for (const result of results) {
      if (result.status === "fulfilled") {
        items.push(...result.value);
      }
      // If rejected, error already recorded in executeComponent
    }

    return items;
  }

  /**
   * Execute a single component with error handling
   */
  private async executeComponent(
    component: Component,
    config: ComponentConfig,
  ): Promise<BriefingItem[]> {
    try {
      const items = await component.fetch(config);

      // Validate returned items
      if (!Array.isArray(items)) {
        throw new Error(
          `Component "${component.id}" returned non-array from fetch()`,
        );
      }

      return items;
    } catch (error) {
      // Record error
      this.errors.push({
        componentId: component.id,
        error,
        timestamp: new Date().toISOString(),
      });

      // Return empty array so other components continue
      // Component should have returned error item instead of throwing
      console.error(
        `Component "${component.id}" threw error:`,
        error,
      );

      return [];
    }
  }

  /**
   * Get last recorded errors
   */
  getErrors(): RegistryError[] {
    return [...this.errors];
  }

  /**
   * Clear error history
   */
  clearErrors(): void {
    this.errors = [];
  }
}

/**
 * Factory function to create a new registry
 */
export function createComponentRegistry(): ComponentRegistry {
  return new ComponentRegistry();
}
