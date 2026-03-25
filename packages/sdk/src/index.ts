/**
 * @opendash/sdk
 *
 * Component SDK for OpenDash briefing system.
 * Use this to build custom data sources (components).
 */

export type {
  BriefingItem,
  Component,
  ComponentConfig,
  ComponentStatus,
  RegisteredComponent,
  ComponentRegistry,
} from './component';

export { createComponentRegistry } from './registry';
