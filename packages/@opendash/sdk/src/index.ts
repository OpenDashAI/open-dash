/**
 * @opendash/sdk
 *
 * Core component interface and registry for OpenDash + Virtual-Media components.
 * This is the single source of truth for how components work.
 */

// Component interface and types
export type {
  AbstractComponent,
  Component,
  ComponentConfig,
  ComponentInput,
  ComponentMetadata,
  ComponentOutput,
  BriefingItem,
  FullComponent,
} from "./component";

// Component registry
export {
  ComponentRegistry,
  getAllComponents,
  getComponent,
  globalComponentRegistry,
  registerComponent,
} from "./ComponentRegistry";

// Re-export React for component rendering
export { default as React } from "react";
