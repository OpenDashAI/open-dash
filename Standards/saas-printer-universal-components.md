---
name: SaaS Printer — Universal Component Theory
description: Most micro-SaaS products reduce to combinations of fewer than 50-100 universal components. The registry accumulates these components, making each new SaaS cheaper to print.
type: standard
---

# SaaS Printer — Universal Component Theory

**Date**: 2026-03-25
**Status**: Strategic insight — derived from architecture + market analysis

---

## The Insight

There are millions of micro-SaaS products. But they all use the same building blocks:

- Lists (contacts, invoices, tickets, timers, tasks, emails)
- Forms (create, edit, configure)
- Filters (search, date range, category, status)
- Displays (table, card, kanban, timeline, calendar, chart)
- Actions (send, approve, reject, archive, export)
- Notifications (alert, email, slack, flash)
- Timers (countdown, countup, schedule, recurring)
- Auth flows (login, invite, role-based views)

Most micro-SaaS = some combination of these, with domain-specific labels and business logic.

---

## The Component Primitive Library

| Category | Components | Used By |
|----------|-----------|---------|
| **Data** | List, Table, KanbanBoard, Timeline, Calendar, Chart, Card | Everything |
| **Input** | Form, Search, Filter, DatePicker, FileUpload, RichTextEditor | Everything |
| **Action** | Button, ApprovalFlow, SendEmail, CreateRecord, Export, Archive | SaaS with write |
| **Display** | MetricCard, ProgressBar, StatusBadge, Avatar, EmptyState | Dashboards |
| **Timer** | Countdown, Countup, Scheduler, Recurring, Stopwatch | Time-based products |
| **Communication** | MessageSender, NotificationPanel, ChatWidget, CommentThread | Collaborative products |
| **Navigation** | Sidebar, Tabs, Breadcrumb, CommandPalette | Everything |
| **Layout** | SplitPane, Grid, Stack, Modal, Drawer | Everything |

That's roughly **30-40 component primitives**.

---

## How Micro-SaaS Products Map

### Stagetimer (~6 components)
List + Timer + Controls + MessageSender + Display + Flash

### CRM (~8 unique + primitives)
ContactList + DealKanban + ActivityTimeline + EmailComposer + TaskList + Pipeline + Analytics + Form

### Invoicing tool (~8 unique + primitives)
InvoiceForm + InvoiceList + PaymentTracker + Timer + ClientList + ExpenseTracker + TaxCalculator + Report

### Project Manager (~8 unique + primitives)
TaskBoard + Sprint + Timeline + AssigneeList + CommentThread + FileAttachment + StatusTracker + Burndown

### Support Desk (~7 unique + primitives)
TicketList + TicketDetail + CustomerProfile + KnowledgeBase + SLATracker + AssignmentQueue + ResponseTemplate

### Email Marketing (~6 unique + primitives)
CampaignBuilder + ContactList + TemplateEditor + SendScheduler + AnalyticsChart + UnsubscribeManager

### Booking/Scheduling (~6 unique + primitives)
CalendarView + AvailabilityEditor + BookingForm + ReminderSender + ClientList + PaymentCollector

### Analytics Dashboard (~5 unique + primitives)
MetricsSource + Chart + Filter + AlertRule + Summary

---

## The Math

Each micro-SaaS needs:
- ~5-10 **domain-specific** components (the unique stuff)
- ~10-20 **universal primitives** (list, form, filter, table, chart, etc.)

If the registry has the universal primitives, each new micro-SaaS only needs the 5-10 domain components.

At 50 universal components in the registry:
- Most micro-SaaS = 5-10 new components + composition
- Time to print: days, not months
- Each new SaaS adds 5-10 components to the registry
- Registry grows: 50 → 60 → 70 → ...
- After 10 SaaS products: ~100 components, most new products need 0-5 new ones

**The registry is a flywheel.** Each print makes the next print cheaper.

---

## What This Changes

### Product positioning
Not: "Dashboard printer"
Not: "SaaS printer"
But: **"Component registry that enables AI to compose any micro-SaaS from universal building blocks"**

### Revenue model
- Free tier: Use registry, compose with AI, limited features
- Pro: Unlimited compositions, real-time data, custom domains
- Business: Team collaboration, SSO, API access
- Enterprise: Custom components, dedicated support, SLA

### Competitive moat
- The registry IS the moat
- More components → more products possible → more users → more components
- Network effect: each user's custom composition potentially adds components
- AI composition means non-technical users can "build" SaaS

### TAM
Not: "People who need dashboards" (~$5B)
But: "People who need micro-SaaS" (~$100B+)

Every small business, freelancer, team lead, operator who currently:
- Uses spreadsheets because real SaaS is too expensive
- Cobbles together 10 tools because no single tool fits
- Wishes they could build their own tool but can't code

---

## The Catch (Honest Assessment)

### What's easy (the wiring)
- Composing components via events: solved
- AI selecting and wiring components: solved (constraint satisfaction)
- Adding components to registry: trivial (shadcn model)

### What's hard (the business logic inside components)
- Each domain-specific component contains real logic
- InvoiceForm needs tax calculation (hard)
- DealKanban needs pipeline rules (medium)
- Timer needs countdown math (easy)

### What's unknown
- Can AI compose a USEFUL product, or just a technically valid one?
- Do compositions need manual refinement to be production-ready?
- How deep do components need to be before they're genuinely useful?

---

## Execution Path

1. **Build the 30-40 universal primitives** (List, Form, Filter, Table, Chart, Timer, etc.)
2. **Print Dashboard #1** (founder briefing) — validates the full stack
3. **Print 5 more products** (stagetimer, CRM-lite, project board, support desk, booking)
4. **Observe which components are reused** — those are the universal ones
5. **AI composition layer** — user describes what they need, AI composes from registry
6. **Open the registry** — others contribute domain-specific components

The first 50 components are the investment. After that, it's compounding.

