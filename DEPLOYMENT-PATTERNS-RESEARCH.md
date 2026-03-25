# Advanced Deployment Patterns Research

**Date**: 2026-03-25
**Status**: Research & Reference Document
**Purpose**: Document blue-green deployment and feature flags strategies for OpenDash

---

## Table of Contents

1. [Blue-Green Deployment](#blue-green-deployment)
2. [Feature Flags / Feature Toggles](#feature-flags--feature-toggles)
3. [Comparison Matrix](#comparison-matrix)
4. [Integration Strategies for OpenDash](#integration-strategies-for-opendash)
5. [Implementation Roadmap](#implementation-roadmap)
6. [References](#references)

---

## Blue-Green Deployment

### Definition

Blue-green deployment is an application release model that gradually transfers user traffic from a previous version of an app or microservice to a nearly identical new release—both of which are running in production. The old version is called the **blue environment** and the new version is called the **green environment**.

**Key Principle**: Two identical production environments run in parallel. Traffic switches instantaneously from one to the other.

### How It Works

```
┌─────────────────────────────────────────────────────────┐
│              DEPLOYMENT WORKFLOW                        │
└─────────────────────────────────────────────────────────┘

STEP 1: Current State
┌──────────────────────┐          ┌──────────────────────┐
│  BLUE (ACTIVE)       │          │  GREEN (IDLE)        │
│  ├─ v1.2.3           │          │  ├─ Empty            │
│  ├─ Traffic: 100%    │          │  ├─ Traffic: 0%      │
│  └─ Status: Live     │          │  └─ Status: Standby  │
└──────────────────────┘          └──────────────────────┘

STEP 2: Deploy to Green
┌──────────────────────┐          ┌──────────────────────┐
│  BLUE (ACTIVE)       │          │  GREEN (DEPLOY)      │
│  ├─ v1.2.3           │          │  ├─ v1.3.0           │
│  ├─ Traffic: 100%    │          │  ├─ Building...      │
│  └─ Status: Live     │          │  └─ Status: In-build │
└──────────────────────┘          └──────────────────────┘

STEP 3: Test Green
┌──────────────────────┐          ┌──────────────────────┐
│  BLUE (ACTIVE)       │          │  GREEN (TESTING)     │
│  ├─ v1.2.3           │          │  ├─ v1.3.0           │
│  ├─ Traffic: 100%    │          │  ├─ Health checks ✓  │
│  └─ Status: Live     │          │  ├─ Smoke tests ✓    │
└──────────────────────┘          │  └─ Load tests ✓     │
                                  └──────────────────────┘

STEP 4: Switch Traffic
┌──────────────────────┐          ┌──────────────────────┐
│  BLUE (STANDBY)      │          │  GREEN (ACTIVE)      │
│  ├─ v1.2.3           │          │  ├─ v1.3.0           │
│  ├─ Traffic: 0%      │◄─────────┤  ├─ Traffic: 100%    │
│  └─ Status: Standby  │          │  └─ Status: Live     │
└──────────────────────┘          └──────────────────────┘

STEP 5: Ready for Next Deployment
┌──────────────────────┐          ┌──────────────────────┐
│  BLUE (NEXT TARGET)  │          │  GREEN (ACTIVE)      │
│  ├─ Will deploy v1.4 │          │  ├─ v1.3.0           │
│  ├─ Traffic: 0%      │          │  ├─ Traffic: 100%    │
│  └─ Status: Standby  │          │  └─ Status: Live     │
└──────────────────────┘          └──────────────────────┘

ROLLBACK (If Issues Detected):
┌──────────────────────┐          ┌──────────────────────┐
│  BLUE (ACTIVE)       │          │  GREEN (STANDBY)     │
│  ├─ v1.2.3           │          │  ├─ v1.3.0           │
│  ├─ Traffic: 100%    │◄─────────┤  ├─ Traffic: 0%      │
│  └─ Status: Live     │          │  └─ Status: Offline  │
└──────────────────────┘          └──────────────────────┘
```

### Deployment Process

1. **Deploy to Green** - New version deployed to idle environment
2. **Validate Green** - Full testing without impacting users
   - Health checks
   - Smoke tests
   - Load tests
   - Integration tests
3. **Switch Traffic** - Load balancer/router redirects all traffic to green
4. **Monitor** - Watch green environment with real traffic
5. **Decommission or Keep Blue** - Blue becomes standby for next deployment

### Key Advantages

✅ **Zero Downtime** - Instantaneous traffic switch, users never see downtime
✅ **Instant Rollback** - If issues detected, flip traffic back to blue in seconds
✅ **Safe Testing** - Full production-like environment before traffic switch
✅ **No Rolling Updates** - Complete environment swap instead of gradual updates
✅ **Database Compatibility** - Single database, both environments use same schema
✅ **Quick Recovery** - Emergency recovery is just a traffic switch away

### Challenges & Considerations

⚠️ **Infrastructure Cost** - Running two identical production environments doubles costs
⚠️ **Database Migrations** - Schema changes need careful planning to support both environments
⚠️ **Session/State Management** - Must handle session persistence across switch
⚠️ **Cache Invalidation** - Caches need to be cleared or coordinated
⚠️ **Configuration Drift** - Both environments must stay perfectly synchronized
⚠️ **Data Sync Complexity** - If data is updated during switch window, could lose updates

### Best Practices

1. **Pre-deployment validation** - Run exhaustive tests on green before switching
2. **Health check during switch** - Verify endpoints responding immediately after traffic switch
3. **Gradual traffic shift** - Consider shifting 1% → 10% → 50% → 100% instead of instant
4. **Keep blue running** - Don't shut down blue immediately in case quick rollback needed
5. **Database versioning** - Use schema versioning that supports both old and new
6. **Monitoring** - Have comprehensive metrics during first hour after switch
7. **Quick decision point** - Have clear criteria for when to rollback (e.g., error rate >5%)

---

## Feature Flags / Feature Toggles

### Definition

Feature flags (also called feature toggles, feature flippers, or feature switches) are a software development concept that allow you to enable or disable a feature without modifying source code or requiring a redeploy. The feature's behavior is controlled at runtime by a flag configuration.

**Key Principle**: Code is deployed to production with new features hidden behind flags, allowing gradual release and instant rollback.

### How It Works

```
┌─────────────────────────────────────────────────────────┐
│           FEATURE FLAG ROLLOUT WORKFLOW                 │
└─────────────────────────────────────────────────────────┘

DAY 1: Deploy Code (Flag OFF)
┌────────────────────────────┐
│ New Feature Code: DEPLOYED │
│ Feature Flag: OFF          │
│ Users Affected: 0%         │
│ Status: Hidden             │
└────────────────────────────┘

DAY 2: Enable for 5% of Users
┌────────────────────────────┐
│ Users Seeing NEW: 5%       │
│ Users Seeing OLD: 95%      │
│ Monitoring: Errors ↓       │
│ Monitoring: Latency ↓      │
│ Status: Early Access       │
└────────────────────────────┘
    ↓ (Monitor 24 hours)
    If errors < 1%: Continue
    If errors > 2%: Rollback instantly

DAY 3: Expand to 25% of Users
┌────────────────────────────┐
│ Users Seeing NEW: 25%      │
│ Users Seeing OLD: 75%      │
│ Monitoring: Errors ↓       │
│ Monitoring: Latency ↓      │
│ Status: Broader Testing    │
└────────────────────────────┘
    ↓ (Monitor 24 hours)

DAY 4: Expand to 50% of Users
┌────────────────────────────┐
│ Users Seeing NEW: 50%      │
│ Users Seeing OLD: 50%      │
│ Monitoring: Errors ↓       │
│ Monitoring: Latency ↓      │
│ Status: Wide Testing       │
└────────────────────────────┘
    ↓ (Monitor 24 hours)

DAY 5: Expand to 100% of Users
┌────────────────────────────┐
│ Users Seeing NEW: 100%     │
│ Flag Status: FULLY ENABLED │
│ Monitoring: Metrics ↓      │
│ Status: Released           │
└────────────────────────────┘

DAY 6: Remove Flag from Code
┌────────────────────────────┐
│ Feature Now: Default       │
│ Flag Code: REMOVED         │
│ Status: Permanent          │
└────────────────────────────┘

EMERGENCY ROLLBACK (Any Day):
┌────────────────────────────┐
│ Detect: Error rate > 5%    │
│ Action: Flag toggle OFF    │
│ Time to Rollback: < 1s     │
│ Users Affected: 0 (instant)│
│ Status: Recovered          │
└────────────────────────────┘
```

### Types of Feature Flags

#### 1. **Release Flags** - Control visibility of new features

Control when new features are visible to users.

```typescript
// In application code
if (featureFlags.isEnabled('competitorIntelligenceDashboard')) {
  // Show new competitor intelligence features
  return <CompetitorIntelligenceDashboard />;
} else {
  // Show legacy version
  return <LegacyDashboard />;
}
```

**Use Case**: Rolling out the new "Predictive Alerts" feature gradually
- Deploy feature hidden
- Enable for internal team (100%)
- Enable for beta customers (5%)
- Enable for all customers (100%)

#### 2. **Permission/Entitlement Flags** - Tier-based feature access

Control feature access based on subscription tier or account type.

```typescript
// Tier-based features
if (user.subscriptionTier === 'enterprise' &&
    featureFlags.isEnabled('advancedAnalytics')) {
  return <AdvancedAnalyticsPanel />;
}

// Account-based features
if (user.organization.hasFeatureAccess('customAlerts') &&
    featureFlags.isEnabled('customAlerts')) {
  return <CustomAlertsBuilder />;
}
```

**Use Case**: Premium "Advanced Reporting" only for Pro/Enterprise tiers
- Feature deployed but hidden
- Only visible if plan level permits
- Can be toggled for individual accounts

#### 3. **Ops/Kill Switches** - Emergency disable

Disable features instantly if they're causing issues, without redeployment.

```typescript
// Payment processing kill switch
if (!featureFlags.isEnabled('stripePaymentProcessing')) {
  return new Error("Payment processing temporarily disabled for maintenance");
}

// Database query kill switch
if (!featureFlags.isEnabled('competitorDataSync')) {
  return cached_data; // Fallback to cached version
}

// API integration kill switch
if (!featureFlags.isEnabled('resendEmailNotifications')) {
  console.log('Resend integration temporarily disabled');
  return;
}
```

**Use Case**: External service goes down
- Immediately disable feature
- App continues working with fallback
- Re-enable when service recovered
- No code deploy, no restart needed

#### 4. **Experiment Flags** - A/B testing

Test variations with different user groups.

```typescript
// A/B test: new UI vs old UI
const variant = featureFlags.getVariant('dashboardUIVariant', userId);

if (variant === 'new') {
  return <NewModernDashboard />;
} else {
  return <CurrentDashboard />;
}

// Track metrics per variant
analyticsTrack('dashboard_view', {
  variant,
  renderTime: performance.now(),
  errorRate: calculateErrorRate(),
});
```

**Use Case**: Testing new UI design
- 50% of users see variant A (new UI)
- 50% of users see variant B (current UI)
- Compare performance, engagement, errors
- Roll out winner to everyone

### Gradual Rollout Strategy

**Standard Safe Rollout Pattern:**

```
Day 1:   Deploy feature with flag OFF
         └─ 0% of users see new feature
         └─ Only developers/QA can test

Day 2:   Enable for 5% of users
         └─ Monitor for 24 hours
         └─ Error rate acceptable? Continue : Rollback
         └─ If good: Expand tomorrow

Day 3:   Enable for 25% of users
         └─ Monitor for 24 hours
         └─ Performance acceptable? Continue : Rollback

Day 4:   Enable for 50% of users
         └─ Monitor for 24 hours
         └─ A/B test metrics favorable? Continue : Rollback

Day 5:   Enable for 100% of users
         └─ Monitor for 48 hours
         └─ Verify all metrics healthy

Day 6:   Remove feature flag from code
         └─ Feature now permanent behavior
         └─ Simplify codebase
```

**Example for OpenDash "Predictive Alerts" Feature:**

```
March 25:  New feature code deployed with flag OFF
           └─ Code change: predictiveAlerts.ts implemented
           └─ Flag in database: predictiveAlerts = false
           └─ No users affected
           └─ Pre-release testing: Claude Code team only

March 26:  Enable for 5% of active users (internal team + 1 beta customer)
           └─ Internal metrics collection
           └─ Manual QA verification
           └─ Slack notification: "5% rollout started"

March 27:  Review metrics from 5% cohort
           └─ Error rate: 0.1% ✓
           └─ Latency added: 12ms ✓
           └─ User feedback: Positive ✓
           └─ Expand to 25%

March 28:  Enable for 25% of users
           └─ Monitor error rates in production
           └─ Track feature adoption
           └─ Watch database performance

March 29:  Review 25% cohort metrics
           └─ Everything healthy
           └─ Expand to 50%

March 30:  Enable for 50% of users
           └─ Production A/B test
           └─ Compare with control group

March 31:  Full expansion to 100%
           └─ All users see predictive alerts
           └─ Monitor for 48 hours
           └─ Confirm no regression

April 1:   Remove feature flag from code
           └─ Simplify conditionals
           └─ Feature now permanent
           └─ Document in CHANGELOG.md
```

### Key Advantages

✅ **Decouple deployment from release** - Deploy code weeks before feature is visible
✅ **Gradual rollout** - Roll out 5% → 25% → 50% → 100% with monitoring at each step
✅ **Instant rollback** - Disable flag immediately if issues detected (no redeployment)
✅ **Production testing** - Test with real users and real traffic patterns
✅ **A/B testing** - Run experiments with different user groups
✅ **Feature access control** - Restrict features by subscription tier, organization, user role
✅ **Kill switches** - Disable external integrations instantly if they fail
✅ **Risk reduction** - Industry data shows 70-90% fewer production incidents with gradual rollouts

### Challenges & Considerations

⚠️ **Code Complexity** - Conditional logic increases code maintenance burden
⚠️ **Flag Proliferation** - Many flags create cognitive overhead (need flag registry/dashboard)
⚠️ **Database Schema** - Need table to store flag configurations
⚠️ **Performance** - Flag lookups add latency (must cache/optimize)
⚠️ **Flag Cleanup** - Old flags must be removed (discipline required)
⚠️ **Testing Complexity** - Must test all flag combinations
⚠️ **Tool Cost** - Managed solutions (LaunchDarkly, Statsig) have monthly costs

### Best Practices

1. **Create a flag registry** - Document all flags and their purpose
2. **Flag naming convention** - Use clear, consistent naming (e.g., `feature_`, `exp_`, `ops_`)
3. **Gradual rollout** - Never go 0% → 100% directly
4. **Monitor each stage** - Have clear metrics for deciding whether to continue
5. **Set expiration** - Remove flags after feature is live (e.g., after 2 weeks)
6. **Cache decisions** - Don't query flag state on every request
7. **Test without flags** - Eventually test with all flags enabled/disabled
8. **Documentation** - Document why each flag exists and when it can be removed

---

## Comparison Matrix

| Aspect | Blue-Green | Feature Flags |
|--------|-----------|---------------|
| **What It Controls** | Entire application version | Individual features |
| **Deployment Speed** | All at once (minutes) | Gradual (days/weeks) |
| **Rollback Speed** | Seconds (flip traffic) | Seconds (toggle flag) |
| **Infrastructure Cost** | 2x (duplicate environments) | Minimal (flag service only) |
| **Testing Location** | Separate environment | Production with real users |
| **User Impact** | All users simultaneously | Graduated per user |
| **Best For** | Major infrastructure changes | New features, experiments |
| **Rollback Impact** | All users affected | Only affected users |
| **Code Complexity** | None (transparent) | Medium (conditional logic) |
| **Database Changes** | Challenging to support both | Supported natively |
| **CI/CD Friendly** | Requires separate environment | Works with current deployment |
| **Team Readiness Needed** | High (coordinate switch) | Low (can be async) |
| **Risk Profile** | High risk if issues (full swap) | Low risk (partial rollout) |
| **Time to Full Release** | Minutes (switch complete) | Days (gradual rollout) |

---

## Integration Strategies for OpenDash

### Strategy 1: Feature Flags Only (Recommended First)

**Implementation approach**: Add feature flags without changing current deployment process.

**Database Changes:**
```sql
-- New table in migrations/0008_feature_flags.sql
CREATE TABLE feature_flags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT, -- 'release' | 'permission' | 'ops' | 'experiment'
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE flag_rollouts (
  id TEXT PRIMARY KEY,
  flag_id TEXT NOT NULL,
  rollout_percentage INT DEFAULT 0, -- 0-100
  target_users TEXT, -- JSON: specific user IDs
  target_accounts TEXT, -- JSON: specific account IDs
  target_tiers TEXT, -- JSON: ['pro', 'enterprise']
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (flag_id) REFERENCES feature_flags(id)
);

CREATE TABLE flag_audit (
  id TEXT PRIMARY KEY,
  flag_id TEXT NOT NULL,
  action TEXT, -- 'enabled' | 'disabled' | 'percentage_changed'
  old_value TEXT,
  new_value TEXT,
  changed_by TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (flag_id) REFERENCES feature_flags(id)
);
```

**Code Changes:**
```typescript
// src/server/feature-flags.ts
export interface FeatureFlag {
  id: string;
  name: string;
  type: 'release' | 'permission' | 'ops' | 'experiment';
  enabled: boolean;
}

export interface RolloutContext {
  userId: string;
  accountId: string;
  userTier: 'free' | 'pro' | 'enterprise';
}

export async function isFeatureEnabled(
  flagName: string,
  context: RolloutContext
): Promise<boolean> {
  const flag = await db.query(
    'SELECT * FROM feature_flags WHERE name = ?',
    [flagName]
  );

  if (!flag.enabled) return false;

  const rollout = await db.query(
    'SELECT * FROM flag_rollouts WHERE flag_id = ?',
    [flag.id]
  );

  // Check percentage-based rollout
  if (rollout.rollout_percentage > 0) {
    const hash = hashUserId(context.userId);
    if ((hash % 100) >= rollout.rollout_percentage) {
      return false;
    }
  }

  // Check specific user targeting
  if (rollout.target_users) {
    const targetUsers = JSON.parse(rollout.target_users);
    if (!targetUsers.includes(context.userId)) return false;
  }

  // Check tier-based access
  if (rollout.target_tiers) {
    const targetTiers = JSON.parse(rollout.target_tiers);
    if (!targetTiers.includes(context.userTier)) return false;
  }

  return true;
}
```

**Deployment Scripts:**
```bash
# deploy/enable-feature-flag.sh
# deploy/disable-feature-flag.sh
# deploy/rollout-feature-flag.sh (5% → 25% → 50% → 100%)
# deploy/feature-flags-status.sh (list all flags and status)
```

**Timeline:**
- Week 1: Implement database tables and flag service
- Week 2: Update deployment scripts to manage flags
- Week 3: Start using for new features (hidden behind flags)
- Week 4: Document flag best practices

**Cost:** Minimal (just database storage for flag configs)
**Risk:** Low (feature flags are opt-in, can be disabled instantly)

---

### Strategy 2: Blue-Green Only

**Implementation approach**: Deploy to separate green environment, validate, switch traffic.

**Infrastructure Changes:**
```
Cloudflare Workers:
- Blue route: workers.opendash.app/blue/*
- Green route: workers.opendash.app/green/*
- Active route: opendash.app/* (controlled by router)

Durable Objects:
- Create "RouteState" object to track which is active
- Stores: { activeRoute: 'blue' | 'green', lastSwitch: timestamp }

Workers KV:
- Store: { route_config: { active: 'blue', canary: 'green' } }
```

**Deployment Scripts:**
```bash
# deploy/blue-green-deploy.sh
#   ├─ Deploy new version to GREEN environment
#   ├─ Run all validation tests on GREEN
#   ├─ If tests pass: Continue
#   └─ If tests fail: Cleanup, exit

# deploy/switch-traffic.sh
#   ├─ Update route configuration
#   ├─ Switch traffic to GREEN
#   ├─ Monitor health for 5 minutes
#   ├─ If healthy: Mark SUCCESS
#   └─ If unhealthy: Revert to BLUE

# deploy/validate-green.sh
#   ├─ Health checks
#   ├─ Smoke tests
#   ├─ Load tests (k6)
#   └─ Performance validation

# deploy/revert-to-blue.sh
#   └─ Instantly switch traffic back to BLUE
```

**Timeline:**
- Week 1-2: Design infrastructure (routing, Durable Objects)
- Week 3: Implement blue-green scripts
- Week 4: Testing and refinement
- Week 5: Production use

**Cost:** Higher (infrastructure to support 2 environments, but can be scaled down)
**Risk:** Medium (complete environment swap, but instant rollback available)

---

### Strategy 3: Combined (Recommended Long-Term)

**Implementation approach**: Use both feature flags AND blue-green for maximum control.

**Workflow:**
```
1. Deploy new version to GREEN environment (flag: OFF)
2. Validate GREEN thoroughly
3. Switch traffic from BLUE to GREEN
4. Gradually enable features with flags (5% → 25% → 50% → 100%)
5. Monitor with real traffic
6. Remove flags once at 100%
7. Next deployment: Switch back to BLUE, repeat

Benefits:
- Infrastructure changes via blue-green (zero downtime)
- Feature changes via flags (gradual, safe)
- Both can be rolled back independently
- Maximum control and safety
```

**Timeline:**
- Phase 1 (Weeks 1-2): Implement feature flags
- Phase 2 (Weeks 3-4): Implement blue-green
- Phase 3 (Week 5+): Combined operations

**Cost:** Medium (flag service + extra infrastructure)
**Risk:** Low (maximum safety with both patterns)

---

## Implementation Roadmap

### Immediate (Weeks 1-2): Feature Flags Foundation

**Deliverables:**
- [ ] Feature flags database schema (0008 migration)
- [ ] Feature flags service (`src/server/feature-flags.ts`)
- [ ] Flag management dashboard (internal use)
- [ ] Deployment scripts for flag operations
- [ ] Documentation and best practices

**GitHub Issues:**
- #105: Database schema for feature flags
- #106: Feature flag service implementation
- #107: Flag management dashboard
- #108: Deployment automation for flags
- #109: Documentation and training

**Acceptance Criteria:**
- Can enable/disable flags via script
- Can rollout features 5% → 25% → 50% → 100%
- Can instantly disable flag if issues occur
- Team trained on flag best practices

---

### Medium-Term (Weeks 3-4): Blue-Green Deployment

**Deliverables:**
- [ ] Blue-green infrastructure design
- [ ] Cloudflare routing configuration
- [ ] Blue-green deployment scripts
- [ ] Traffic switching automation
- [ ] Emergency rollback procedures

**GitHub Issues:**
- #110: Blue-green infrastructure design
- #111: Cloudflare routing setup
- #112: Blue-green deployment scripts
- #113: Traffic switching automation
- #114: Emergency rollback procedures

**Acceptance Criteria:**
- Can deploy to green environment
- Can run full validation suite on green
- Can switch traffic with zero downtime
- Can rollback within 30 seconds
- Monitoring shows no user impact

---

### Long-Term (Week 5+): Combined Operations

**Deliverables:**
- [ ] Combined deployment workflow
- [ ] Integrated monitoring and alerting
- [ ] Team training on both strategies
- [ ] Continuous improvement process

**Metrics to Track:**
- Time from code commit to production
- Error rate during deployments
- Time to rollback if needed
- User impact from deployments
- Team confidence in deployment process

---

## Decision Framework

**Use Blue-Green Deployment if:**
- Making major infrastructure changes (framework, database migration, API redesign)
- Need zero-downtime deployment
- Have resources for duplicate infrastructure
- Risk of issues is high
- Rollback needs to be instant for all users

**Use Feature Flags if:**
- Rolling out new features
- Want gradual user exposure
- Need to A/B test variations
- Risk is moderate (can disable one feature)
- Want to decouple deployment from release

**Use Both if:**
- Making large changes with new features
- Want maximum control and safety
- Have the infrastructure budget
- Team can handle coordinated deployments
- Risk profile is high

---

## References

### Blue-Green Deployment
- [RedHat: Blue-Green Deployment](https://www.redhat.com/en/topics/devops/what-is-blue-green-deployment)
- [Harness: Blue-Green and Canary Deployments](https://www.harness.io/blog/blue-green-canary-deployment-strategies)
- [AWS Blue/Green Deployments](https://docs.aws.amazon.com/whitepapers/latest/blue-green-deployments/welcome.html)
- [Cloud Foundry: Blue-Green Deployment](https://docs.cloudfoundry.org/devguide/deploy-apps/blue-green.html)
- [Octopus Deploy: Blue-Green Best Practices](https://octopus.com/devops/software-deployments/blue-green-deployment/)

### Feature Flags
- [LaunchDarkly: Feature Flags 101](https://launchdarkly.com/blog/what-are-feature-flags/)
- [GrowthBook: Feature Flags Guide](https://blog.growthbook.io/what-are-feature-flags/)
- [Flagsmith: Feature Flag Tools](https://www.flagsmith.com/blog/top-7-feature-flag-tools)
- [SaaS Feature Flags Implementation Guide 2026](https://designrevision.com/blog/saas-feature-flags-guide)
- [Kameleoon: Top Feature Flag Tools 2026](https://www.kameleoon.com/blog/top-feature-flag-management-tools)

### Deployment Patterns
- [Canary Deployments](https://martinfowler.com/bliki/CanaryRelease.html)
- [Rolling Deployments](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/)
- [Feature Toggle Patterns](https://martinfowler.com/articles/feature-toggles.html)

---

## Next Steps

**Awaiting Direction**: User will specify which strategy (Feature Flags, Blue-Green, or Combined) to implement first.

This document serves as a reference for:
- Understanding both deployment patterns
- Comparing approaches
- Making implementation decisions
- Planning the roadmap
- Training the team

---

**Document Status**: ✅ Complete - Research documented and ready for decision
**Date Created**: 2026-03-25
**Last Updated**: 2026-03-25
