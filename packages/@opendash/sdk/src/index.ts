/**
 * @opendash/sdk
 *
 * OpenDash Component SDK - Interface and registry for building
 * interoperable components that work together in the dashboard.
 *
 * Usage:
 * ```typescript
 * import { createComponentRegistry } from '@opendash/sdk';
 * import { myComponent } from '@my-team/my-component';
 *
 * const registry = createComponentRegistry();
 * registry.register(myComponent);
 *
 * const items = await registry.fetchAll({
 *   env: process.env,
 *   lastVisited: user.lastVisited,
 * });
 * ```
 */

export type {
  BriefingItem,
  Component,
  ComponentConfig,
  ComponentStatus,
  ComponentMarketplaceMetadata,
} from "./component.js";

export {
  ComponentRegistry,
  createComponentRegistry,
  type RegistryError,
} from "./registry.js";
