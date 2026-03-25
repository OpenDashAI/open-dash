/**
 * Component Interface — The contract all OpenDash + Virtual-Media components implement
 *
 * Both OpenDash datasources and Virtual-Media production tools implement this interface.
 * This enables them to be discoverable, composable, and loadable by the dashboard.
 */

import React from "react";

/**
 * Configuration for a component instance
 */
export interface ComponentConfig {
  [key: string]: unknown;
}

/**
 * Execution input for a component
 */
export interface ComponentInput {
  [key: string]: unknown;
}

/**
 * Execution output from a component
 */
export interface ComponentOutput {
  [key: string]: unknown;
}

/**
 * Component metadata
 */
export interface ComponentMetadata {
  /** Unique identifier (e.g., "stripe", "grok", "composition") */
  id: string;

  /** Display name (e.g., "Stripe", "Grok Video", "Video Composition") */
  name: string;

  /** Description of what this component does */
  description: string;

  /** Which team built this component */
  team: "opendash" | "virtual-media";

  /** Component version */
  version: string;

  /** Expected input schema (optional) */
  inputSchema?: unknown;

  /** Expected output schema (optional) */
  outputSchema?: unknown;
}

/**
 * Component Interface
 *
 * Every component (datasource, video tool, etc.) implements this interface.
 * This enables:
 * - Discovery: registry can find all components
 * - Composition: components can call other components
 * - Orchestration: dashboard can coordinate workflows
 */
export interface Component {
  /**
   * Component metadata (static info)
   */
  readonly metadata: ComponentMetadata;

  /**
   * Validate configuration for this component
   * Checks if config is valid before initialization
   */
  validate(config: ComponentConfig): boolean;

  /**
   * Initialize the component with configuration
   * Called once before any execute() calls
   * Sets up API clients, databases, etc.
   */
  initialize(config: ComponentConfig): Promise<void>;

  /**
   * Execute the component with given input
   * The main work happens here
   * Returns output that can be consumed by other components
   */
  execute(input: ComponentInput): Promise<ComponentOutput>;

  /**
   * Render component UI for the dashboard
   * Shows status, progress, results, errors
   * Can be null for headless components
   */
  render(data: unknown): React.ReactNode | null;

  /**
   * Cleanup resources
   * Called when component is unloaded
   */
  teardown?(): Promise<void>;
}

/**
 * Abstract base class for implementing components
 * Provides default implementations, components extend this
 */
export abstract class AbstractComponent implements Component {
  abstract readonly metadata: ComponentMetadata;

  validate(config: ComponentConfig): boolean {
    // Override in subclass
    return true;
  }

  abstract initialize(config: ComponentConfig): Promise<void>;

  abstract execute(input: ComponentInput): Promise<ComponentOutput>;

  abstract render(data: unknown): React.ReactNode | null;

  async teardown(): Promise<void> {
    // Override in subclass if cleanup needed
  }
}
