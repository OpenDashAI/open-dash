# ODA Quick Reference

**ODA** — Competitive Intelligence Command Line Tool

## Common Commands

```bash
# Competitors
oda competitors list                    # List all competitors
oda competitors add "Name" "domain.com" # Add competitor
oda competitors metrics metabase        # Get metrics for one

# SERP Rankings
oda serp check "keyword"                # Current rankings
oda serp rankings metabase 7            # History (7 days)

# Market Intelligence
oda insights opportunities              # Market gaps
oda insights threats                    # Competitive threats
oda insights gaps                       # Content gaps

# Operations
oda jobs status                         # Job status & quota
oda jobs run daily                      # Run job now

# Analytics
oda dashboard                           # Full overview
oda costs breakdown                     # Cost analysis
```

## Full Documentation

See **ODA-GUIDE.md** for complete reference, examples, and architecture details.

## Chat Integration

Ask the AI directly:
```
"What competitive threats should we address?"
"Show me content gaps vs competitors"
"Check ranking for 'business intelligence'"
```

All commands available as AI tools with full cost control via API Mom.
