# Next Actions: Component Architecture

**Date**: 2026-03-25
**Status**: Ready for Execution
**Priority**: High - Foundation for all future composition work

---

## What We're Building

A system where OpenDash apps are defined by:
1. **Feature flags** (which components enabled, how configured)
2. **Component communication** (how components talk to each other)
3. **Templates** (pre-built feature flag combinations)

Result: Same codebase creates Studio, DJ, Simple Player (or any user composition).

---

## Phase 0: Foundation (This Week)

### Task 1: Implement CompositionContext
**File**: `src/lib/composition-context.ts`
**Lines**: ~100
**Complexity**: Low
**Owner**: Start now

What it does:
- Defines the interface for component-to-component communication
- Manages component registry
- Routes events between components

**Acceptance criteria**:
- ✅ Can register components
- ✅ Can emit/listen to events
- ✅ No circular dependencies
- ✅ TypeScript types complete

---

### Task 2: Implement CompositionProvider
**File**: `src/lib/composition-provider.tsx`
**Lines**: ~150
**Complexity**: Medium
**Depends on**: Task 1
**Owner**: After Task 1

What it does:
- React Context provider that implements CompositionContext
- Manages event listeners
- Tracks component state

**Acceptance criteria**:
- ✅ Provider wraps components
- ✅ useCompositionContext hook works
- ✅ Events route correctly
- ✅ No memory leaks from listeners

---

### Task 3: Create useCompositionContext Hook
**File**: `src/hooks/useCompositionContext.ts`
**Lines**: ~20
**Complexity**: Low
**Depends on**: Task 1, 2
**Owner**: After Task 2

What it does:
- Hook for components to access CompositionContext
- Throws error if not within provider

**Acceptance criteria**:
- ✅ Accessible from components
- ✅ Proper error handling

---

## Phase 1: Proof of Concept (Week 2)

### Task 4: Convert Composer + Transport Example
**Files**: Update `src/components/` (2-3 components)
**Complexity**: Medium
**Depends on**: Tasks 1-3
**Owner**: After Phase 0

What it does:
- Update two components to use CompositionContext
- Composer emits 'track-added' → Transport listens
- Demonstrates event-based communication

**Acceptance criteria**:
- ✅ Composer and Transport are wrapped in CompositionProvider
- ✅ Composer registers itself with context
- ✅ Composer emits 'track-added' event
- ✅ Transport listens for 'track-added' event
- ✅ Transport updates when Composer adds track
- ✅ No prop drilling between components
- ✅ Works in unit tests

---

### Task 5: Create First Template System
**File**: `src/templates/MusicPlayerTemplate.tsx`
**Lines**: ~200
**Complexity**: Low
**Depends on**: Task 4
**Owner**: After Task 4

What it does:
- Define what a "template" is
- Create 3 templates: studio, dj, simple
- Each template is a different feature flag combination

**Acceptance criteria**:
- ✅ Studio template shows all components
- ✅ DJ template shows subset
- ✅ Simple template shows minimal
- ✅ Same components in all three
- ✅ Different behavior based on props

---

## Phase 2: Feature Flags Integration (Week 3)

### Task 6: Map Feature Flags to Composition
**File**: `src/lib/feature-flags-to-composition.ts`
**Lines**: ~100
**Complexity**: Medium
**Depends on**: Task 5
**Owner**: After Task 5

What it does:
- Convert feature flags to component configuration
- Enable/disable components based on flags
- Pass configuration to components

**Acceptance criteria**:
- ✅ Feature flags can enable/disable components
- ✅ Feature flags can configure component props
- ✅ Changes to flags update rendered components
- ✅ Works with existing card registry

---

### Task 7: Integrate with Existing Card Registry
**File**: Update `src/lib/card-registry.tsx`
**Complexity**: Low
**Depends on**: Task 1-2, Task 6
**Owner**: After Task 6

What it does:
- Update card registry to wrap components in CompositionProvider
- Maintain backward compatibility
- Support both manual composition and template-based

**Acceptance criteria**:
- ✅ Existing card rendering still works
- ✅ Cards have access to CompositionContext
- ✅ No breaking changes to card API

---

## Implementation Order

**Week 1** (Foundation):
1. Task 1: CompositionContext (Low risk, high value)
2. Task 2: CompositionProvider (Medium risk, high value)
3. Task 3: useCompositionContext hook (Low risk)

**Week 2** (Proof of Concept):
4. Task 4: Composer + Transport example (Real-world test)
5. Task 5: Template system (Shows the vision)

**Week 3** (Integration):
6. Task 6: Feature flags mapping (Ties to OpenDash architecture)
7. Task 7: Card registry integration (Production ready)

---

## Success Metrics

### After Phase 0 (End of Week 1)
- [ ] CompositionContext is implemented and tested
- [ ] Components can communicate through context
- [ ] No TypeScript errors
- [ ] Event routing works correctly

### After Phase 1 (End of Week 2)
- [ ] Composer → Transport communication works
- [ ] Event-based communication is seamless
- [ ] Three templates render correctly
- [ ] Same code creates different experiences

### After Phase 2 (End of Week 3)
- [ ] Feature flags control component composition
- [ ] Card registry integrates with composition
- [ ] Existing functionality still works
- [ ] Ready for production

---

## Key Risks & Mitigation

**Risk 1**: Event listener memory leaks
- **Mitigation**: Strict cleanup in useEffect, test for leaks

**Risk 2**: Prop drilling still happens
- **Mitigation**: CompositionContext is the single source of truth

**Risk 3**: Components still import each other
- **Mitigation**: Code review, linting rules to prevent direct imports

**Risk 4**: Breaking existing functionality
- **Mitigation**: Backward compatibility in card registry, gradual rollout

---

## Testing Strategy

**Unit Tests**:
- CompositionContext event routing
- useCompositionContext hook behavior
- Component registration/unregistration

**Integration Tests**:
- Composer + Transport communication
- Multiple components listening to same event
- Template switching

**E2E Tests**:
- Music Player in all three modes
- Feature flags controlling composition
- Card registry rendering with composition

---

## Documentation Needed

1. **Component Communication Guide** - How to write components that use CompositionContext
2. **Event Type Reference** - All available events for each component type
3. **Template Guide** - How to create new templates
4. **Feature Flags Reference** - Complete list of available flags

---

## Estimated Timeline

- **Phase 0**: 2-3 days
- **Phase 1**: 2-3 days
- **Phase 2**: 2-3 days
- **Buffer**: 2-3 days for unforeseen issues

**Total**: 1-2 weeks to production-ready implementation

---

## Next Action

Ready to start with **Task 1: Implement CompositionContext**.

Should we:
1. **Start now** - Begin Task 1 immediately
2. **Review first** - Review documents before starting
3. **Prioritize differently** - Focus on different task first
4. **Adjust scope** - Change which tasks are included

What would you like to do?
