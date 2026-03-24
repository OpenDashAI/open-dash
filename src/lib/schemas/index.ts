/**
 * Central export of all Zod schemas.
 */

// Input validation
export {
  FetchAllSourcesInputSchema,
  type FetchAllSourcesInput,
  FetchBrandDashboardInputSchema,
  type FetchBrandDashboardInput,
  GetBrandsInputSchema,
  type GetBrandsInput,
  validateInput,
  withValidation,
} from "./input";

// Time
export {
  TimestampSchema,
  type Timestamp,
  toISOString,
  fromISOString,
  now,
} from "./time";

// Briefing
export {
  BriefingPriorityEnum,
  type BriefingPriority,
  BriefingCategoryEnum,
  type BriefingCategory,
  BriefingItemSchema,
  type BriefingItem,
  BriefingItemArraySchema,
  type BriefingItemArray,
} from "./briefing";

// Metrics
export {
  HealthStatusEnum,
  type HealthStatus,
  DatasourceMetricSchema,
  type DatasourceMetric,
  DatasourceMetricArraySchema,
  type DatasourceMetricArray,
  computeHealthStatus,
} from "./metrics";

// Datasource
export {
  DataSourceStatusSchema,
  type DataSourceStatus,
  DataSourceConfigSchema,
  type DataSourceConfig,
  defineEnvSchema,
  defineBrandConfigSchema,
  StripeEnvSchema,
  GitHubEnvSchema,
  TailscaleEnvSchema,
  StripeBrandConfigSchema,
  GitHubBrandConfigSchema,
} from "./datasource";

// Datasource validation
export {
  validateDatasourceEnv,
  validateDatasourceBrandConfig,
  validateGitHubConfig,
  validateStripeConfig,
  validateTailscaleConfig,
  validateDatasourceConfig,
} from "./datasource-validation";
