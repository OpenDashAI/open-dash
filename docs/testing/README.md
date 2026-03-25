# Testing & QA Documentation

Guide to testing strategy, test execution, and quality assurance for OpenDash.

**Quick Navigation**: [← Back to Docs](../README.md) | [Quick Start](../QUICK-START.md)

---

## What's Here

This section covers **how OpenDash is tested**, including:
- Testing strategy and philosophy
- Test types (unit, integration, e2e)
- Smoke test baseline
- Test execution and CI integration
- Quality metrics and standards

**Use this section if you need to**:
- Write tests for new features
- Understand testing strategy
- Run test suite locally
- Review test coverage
- Set up automated testing

---

## Testing Strategy

### Philosophy
OpenDash uses a **layered testing approach**:

```
E2E Tests (User workflows)
        ↑
    Integration Tests (APIs, databases)
        ↑
    Unit Tests (Functions, classes)
        ↓
    Code quality (Linting, formatting)
```

**Goal**: Catch bugs early (unit), verify integration (integration), validate user experience (e2e).

### Coverage Targets

| Test Type | Target | Current |
|-----------|--------|---------|
| Unit tests | >80% | ✅ ~85% |
| Integration tests | >70% | ✅ ~75% |
| E2E tests | >50% | ✅ ~60% |
| **Overall coverage** | **>75%** | ✅ **~80%** |

---

## Test Types

### 1. Unit Tests
**What**: Test individual functions/classes in isolation

**Where**: `.test.ts` or `.spec.ts` files next to source code

**Example**:
```typescript
// src/lib/formatting.test.ts
describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });
});
```

**Tools**: Vitest, Jest
**Speed**: ~100ms per test file

### 2. Integration Tests
**What**: Test multiple components working together (API routes, databases, services)

**Where**: `tests/integration/` directory

**Example**:
```typescript
// tests/integration/api.test.ts
describe('GET /api/briefing', () => {
  it('returns briefing items for org', async () => {
    const response = await fetch('/api/briefing?orgId=123');
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.items).toBeDefined();
  });
});
```

**Tools**: Vitest with test database
**Speed**: ~500ms per test

### 3. E2E Tests
**What**: Test complete user workflows (browser automation)

**Where**: `tests/e2e/` directory

**Example**:
```typescript
// tests/e2e/login.test.ts
describe('User login flow', () => {
  it('user can log in and view dashboard', async () => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });
});
```

**Tools**: Playwright, Puppeteer
**Speed**: ~2-5s per test

---

## Running Tests

### Locally
```bash
# Run all tests
npm test

# Run specific test file
npm test src/lib/formatting.test.ts

# Run with coverage
npm test -- --coverage

# Run in watch mode (auto-rerun on changes)
npm test -- --watch
```

### In CI/CD
Tests run automatically on every push via GitHub Actions.

See [../setup/CI_CD_SETUP.md](../setup/CI_CD_SETUP.md) for configuration.

---

## Smoke Test Baseline

### What's a Smoke Test?
**Smoke tests** verify that critical features work after deployment.

| Feature | Test | Pass Criteria |
|---------|------|---------------|
| API startup | `GET /health` | Returns 200 |
| Database connect | Query metrics table | Returns results |
| Auth system | Login flow | Token issued |
| Dashboard load | `GET /api/briefing` | Returns items |
| Datasource sync | Stripe fetch | Metrics recorded |

See [SMOKE-TEST-BASELINE.md](./SMOKE-TEST-BASELINE.md) for complete checklist.

### Running Smoke Tests
```bash
# After deployment, run:
npm run test:smoke

# Or manually:
curl https://opendash.ai/health
curl https://opendash.ai/api/briefing -H "Authorization: Bearer <token>"
```

---

## Test Coverage

### Current Coverage by Area

| Area | Coverage | Status |
|------|----------|--------|
| Core datasources | 85% | ✅ Excellent |
| API routes | 78% | ✅ Good |
| UI components | 72% | ✅ Good |
| Utility functions | 88% | ✅ Excellent |
| Permission system | 81% | ✅ Good |
| **Overall** | **80%** | ✅ **Good** |

### Improving Coverage
To increase coverage:

1. **Identify untested code**: `npm test -- --coverage`
2. **Add tests for gaps**: New tests in appropriate `.test.ts` files
3. **Update CI threshold**: CI will fail if coverage drops below ~75%
4. **Review coverage reports**: HTML report in `coverage/` directory

---

## Test Examples

### Testing a Component

```typescript
// src/components/BriefingCard.test.tsx
import { render, screen } from '@testing-library/react';
import { BriefingCard } from './BriefingCard';

describe('BriefingCard', () => {
  it('displays briefing item', () => {
    const item = {
      id: '1',
      title: 'Stripe Revenue',
      value: '$15,500',
    };

    render(<BriefingCard item={item} />);

    expect(screen.getByText('Stripe Revenue')).toBeInTheDocument();
    expect(screen.getByText('$15,500')).toBeInTheDocument();
  });

  it('handles missing data gracefully', () => {
    render(<BriefingCard item={null} />);

    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });
});
```

### Testing an API Route

```typescript
// tests/integration/api-briefing.test.ts
import { createTestClient } from 'test-utils';

describe('GET /api/briefing', () => {
  it('returns briefing for authenticated user', async () => {
    const client = createTestClient();
    const { status, body } = await client.get('/api/briefing')
      .auth('valid-token');

    expect(status).toBe(200);
    expect(body.items).toBeArray();
    expect(body.items[0]).toHaveProperty('title');
  });

  it('rejects unauthenticated requests', async () => {
    const client = createTestClient();
    const { status } = await client.get('/api/briefing');

    expect(status).toBe(401);
  });
});
```

### Testing a Datasource

```typescript
// src/datasources/stripe.test.ts
import { StripeDataSource } from './stripe';
import { vi } from 'vitest';

describe('StripeDataSource', () => {
  it('fetches and transforms revenue data', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      data: [{ amount: 10000, timestamp: Date.now() }],
    });

    const source = new StripeDataSource({ apiKey: 'test-key', fetch: mockFetch });
    const result = await source.fetch();

    expect(result).toEqual({
      metric: 'revenue',
      value: 10000,
    });
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('stripe.com'));
  });
});
```

---

## Debugging Tests

### Test Fails Locally?

```bash
# 1. Run test in isolation
npm test -- src/my.test.ts

# 2. Debug with --inspect
node --inspect-brk ./node_modules/.bin/vitest src/my.test.ts

# 3. Add console.log in test
console.log('Debugging:', variable);

# 4. Check test output carefully
# 5. Run with --reporter=verbose for detailed output
```

### "ECONNREFUSED" (Database connection fails)?
```bash
# 1. Check D1 local state: ls .wrangler/state/v3/d1/
# 2. Clear and reset: rm -rf .wrangler/state/
# 3. Run migrations: wrangler d1 migrations list
# 4. Try again: npm test
```

### "Timeout" (Test hangs)?
```bash
# 1. Increase timeout (default 10s)
it('slow test', async () => { ... }, 30000);

# 2. Check for infinite loops or hanging promises
# 3. Add timeout handler: setTimeout(() => { throw new Error('timeout') }, 5000);
```

---

## Best Practices

### When Writing Tests

✅ **Do**:
- Test behavior, not implementation details
- Keep tests small and focused
- Use descriptive test names
- Mock external dependencies
- Test error cases
- Keep tests fast (<100ms each)

❌ **Don't**:
- Test framework functionality
- Create tight coupling to implementation
- Sleep/delay in tests (use fake timers)
- Make real network calls
- Share state between tests
- Write tests that pass by accident

### Code Review

During PR review, check:
- ✅ Tests pass locally and in CI
- ✅ New code has tests (>80% coverage)
- ✅ Tests are readable
- ✅ No hardcoded test data
- ✅ Error cases covered

---

## CI/CD Integration

### Automated Test Runs
Tests run automatically on:
- Every push to any branch
- Every pull request
- Before merge to main

### CI Requirements
For code to merge:
- ✅ All tests pass
- ✅ Coverage maintained (>75%)
- ✅ No linting errors
- ✅ Build succeeds

See [../setup/CI_CD_SETUP.md](../setup/CI_CD_SETUP.md) for GitHub Actions config.

---

## Test Performance

### Optimize Slow Tests

| Technique | Impact | Example |
|-----------|--------|---------|
| Mock HTTP calls | 10x faster | `vi.mock('fetch')` |
| Fake timers | 100x faster | `vi.useFakeTimers()` |
| Parallel execution | 2-4x faster | `npm test -- --workers=4` |
| Focused tests | Skip irrelevant | `it.only(...)` |

### Monitoring Test Speed
```bash
# Show slowest tests
npm test -- --reporter=verbose | grep -E "✓|✕" | sort -t' ' -k2 -rn | head -10
```

---

## Continuous Improvement

### Metrics to Track
- Test count (growing)
- Coverage % (maintaining >75%)
- Test execution time (ideally <5 min)
- Flaky test rate (should be <1%)

### Reduce Flaky Tests
Flaky tests (pass/fail randomly) indicate:
- Timing issues (add `await`)
- Uncontrolled randomness (seed randomness)
- Shared state (reset between tests)
- External dependencies (mock them)

---

## Related Documentation

### Setup & Configuration
- [../setup/CI_CD_SETUP.md](../setup/CI_CD_SETUP.md) - GitHub Actions configuration
- [SMOKE-TEST-BASELINE.md](./SMOKE-TEST-BASELINE.md) - Post-deployment verification

### Development
- [../guides/](../guides/) - How-to guides
- [../architecture/ARCHITECTURE-REVIEW-data-integrity-schema.md](../architecture/ARCHITECTURE-REVIEW-data-integrity-schema.md) - Data validation patterns

### Quality
- [../audits/](../audits/) - Code quality audits
- [../status/](../status/) - Project status

---

## Tools & Frameworks

### Test Runners
- **Vitest** - Fast unit test runner (default)
- **Jest** - Alternative test runner
- **Playwright** - Browser automation (E2E)

### Test Utilities
- **Testing Library** - React component testing
- **Zod** - Schema validation in tests
- **MSW** - Mock Service Worker (HTTP mocking)

### CI/CD
- **GitHub Actions** - Automated test runs
- **Codecov** - Coverage tracking

---

## See Also

- 📚 [Complete Documentation Index](../README.md)
- ⚡ [Quick Start](../QUICK-START.md)
- 🔄 [CI/CD Setup](../setup/CI_CD_SETUP.md)
- ✅ [Quality Audits](../audits/)
- 📊 [Project Status](../status/)

---

**Last updated**: 2026-03-25
**Maintainers**: QA / Testing team
**Issues**: Use `test:` or `qa:` prefix for testing issues
