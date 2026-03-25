/**
 * Video Production Dashboard Components
 *
 * Pure status displays for the video production workflow.
 * All editing happens via CLI in chat. Dashboard is observation-only.
 *
 * EPIC #493: OpenDash Video Production Dashboard
 * - #494: Script Management Component
 * - #495: Storyboard Management Component
 * - #496: Asset Tracker Component
 * - #497: Composition Tracker Component
 * - #498: Quality Checklist Component
 * - #499: Export & Publishing Component
 */

export {
  ScriptManagement,
  type ScriptData,
  type ScriptSection,
  type ScriptManagementProps,
} from "./ScriptManagement";

export {
  StoryboardManagement,
  type StoryboardData,
  type StoryboardScene,
  type StoryboardManagementProps,
} from "./StoryboardManagement";

export {
  AssetTracker,
  type AssetTrackerData,
  type Asset,
  type AssetCounts,
  type AssetTrackerProps,
} from "./AssetTracker";

export {
  CompositionTracker,
  type CompositionTrackerData,
  type CompositionTask,
  type CompositionTrackerProps,
} from "./CompositionTracker";

export {
  QualityChecker,
  type QualityCheckerData,
  type QualityCheckItem,
  type QualityCheckerProps,
} from "./QualityChecker";

export {
  ExportManager,
  type ExportManagerData,
  type ExportFile,
  type ExportManagerProps,
} from "./ExportManager";
