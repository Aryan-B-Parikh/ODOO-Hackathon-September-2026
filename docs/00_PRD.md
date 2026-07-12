# AssetFlow — Product Requirements Document

> **Version:** 1.1  
> **Date:** 2026-07-12  
> **Status:** Baseline Approved — Enhanced  
> **Source of Truth:** AssetFlow Problem Statement PDF + UI Mockups (Screens 1–10)  
> **Changelog:** v1.1 adds Requirements Traceability, Business Entities, Cross-Module Dependencies, RBAC Matrix, NFRs, Success Metrics, Notification Priority Model, State Ownership Matrix, Glossary, and Authentication Assumptions. All v1.0 content preserved verbatim.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Vision](#product-vision)
3. [Problem Statement](#problem-statement)
4. [Goals](#goals)
5. [Non-Goals](#non-goals)
6. [User Roles](#user-roles)
7. [Functional Requirements](#functional-requirements)
8. [Asset Lifecycle](#asset-lifecycle)
9. [Booking Workflow](#booking-workflow)
10. [Allocation Workflow](#allocation-workflow)
11. [Transfer Workflow](#transfer-workflow)
12. [Maintenance Workflow](#maintenance-workflow)
13. [Audit Workflow](#audit-workflow)
14. [Notification Rules](#notification-rules)
15. [Dashboard KPIs](#dashboard-kpis)
16. [Reports](#reports)
17. [Search & Filters](#search--filters)
18. [Error Handling](#error-handling)
19. [Assumptions](#assumptions)
20. [Future Enhancements](#future-enhancements)
21. [Acceptance Criteria](#acceptance-criteria)
22. [Functional Invariants](#functional-invariants)
23. [Requirements Traceability Matrix](#requirements-traceability-matrix)
24. [Business Entity Overview](#business-entity-overview)
25. [Cross-Module Dependency Map](#cross-module-dependency-map)
26. [Role Permission Matrix](#role-permission-matrix)
27. [Non-Functional Requirements](#non-functional-requirements)
28. [Success Metrics](#success-metrics)
29. [Notification Priority Model](#notification-priority-model)
30. [State Ownership Matrix](#state-ownership-matrix)
31. [Glossary](#glossary)
32. [Authentication Assumptions](#authentication-assumptions)

---

## Executive Summary

AssetFlow is an enterprise-grade Asset & Resource Management System designed to replace spreadsheet-based and paper-log tracking with a centralized, role-driven ERP platform. It enables organizations across any industry — offices, hospitals, factories, schools, agencies — to register physical assets, manage their full lifecycle, allocate them to employees and departments with conflict prevention, book shared resources by time slot with overlap validation, route maintenance through an approval workflow, conduct structured audit cycles with auto-generated discrepancy reports, and surface operational KPIs through dashboards, reports, and real-time notifications.

The system enforces four distinct user roles (Admin, Asset Manager, Department Head, Employee) with strict permission boundaries. Self-elevation of roles is explicitly prohibited — only Admins can promote users. Every state transition is validated, every booking is overlap-checked, every allocation is conflict-guarded, and every audit closure is irreversible.

---

## Product Vision

Simplify and digitize how organizations track, allocate, and maintain their physical assets and shared resources through a centralized ERP platform — industry-agnostic, scalable, and built on clean modular architecture.

AssetFlow delivers core ERP functionality with role-based workflows and real-time visibility into **who holds what, where it is, and its condition** — without touching purchasing, invoicing, or accounting concerns.

---

## Problem Statement

Organizations today rely on fragmented manual processes — spreadsheets, paper logs, email threads — to track physical assets and shared resources. This leads to:

- **Double allocations** — the same asset assigned to multiple people without anyone knowing.
- **Booking conflicts** — shared rooms, vehicles, and equipment double-booked with no central visibility.
- **Untracked maintenance** — repair requests lost in email, assets left in broken states indefinitely.
- **Ghost assets** — no periodic audits mean lost or damaged assets go undetected for months.
- **Overdue returns** — no alerting mechanism; assets silently drift past their return dates.
- **No operational visibility** — leadership has no real-time view of asset utilization, idle inventory, or departmental allocation.

AssetFlow addresses every one of these failures through structured lifecycles, conflict-guarded allocation, time-slot booking with overlap rejection, approval-gated maintenance, scheduled audit cycles, and a notification-driven KPI dashboard.

---

## Goals

| # | Goal | Measurement |
|---|------|-------------|
| G1 | Eliminate double-allocation of assets | System blocks allocation of already-allocated assets with zero exceptions |
| G2 | Prevent booking overlaps for shared resources | Overlap validation rejects 100% of conflicting time-slot requests |
| G3 | Enforce maintenance approval before repair work begins | No asset transitions to "Under Maintenance" without an approved request |
| G4 | Provide periodic audit cycles with discrepancy detection | Audit cycles produce auto-generated discrepancy reports; closure updates asset statuses |
| G5 | Surface overdue returns proactively | Overdue allocations auto-flagged on Dashboard and pushed via Notifications |
| G6 | Enforce role-based access with no self-elevation | Signup creates Employee-only accounts; only Admin promotes roles |
| G7 | Deliver real-time operational KPIs | Dashboard reflects current counts for available, allocated, maintenance, bookings, transfers, returns |
| G8 | Maintain full audit trail | Every admin/manager/employee action logged with who, what, when |

---

## Non-Goals

| # | Explicitly Excluded | Rationale |
|---|---------------------|-----------|
| NG1 | Purchasing / Procurement | PDF explicitly excludes purchasing concerns |
| NG2 | Invoicing | PDF explicitly excludes invoicing |
| NG3 | Accounting / Financial Modules | PDF states acquisition cost is "kept for ranking/reports only, not linked to accounting" |
| NG4 | Multi-tenant / SaaS architecture | Not mentioned in PDF or mockups |
| NG5 | Mobile-native application | Not referenced; "responsive" web UI is the target |
| NG6 | Third-party integrations (SSO, LDAP, external calendars) | Not referenced in PDF or mockups |
| NG7 | Asset depreciation calculations | Not referenced |
| NG8 | Barcode/QR code generation | Search supports QR code lookup, but code generation is not specified |

---

## User Roles

### Admin

| Attribute | Detail |
|-----------|--------|
| **Responsibilities** | Manage departments (create/edit/deactivate). Manage asset categories (create/edit). Manage the Employee Directory (add employees, set status). Promote Employees to Department Head or Asset Manager. Create and manage audit cycles. View organization-wide analytics. |
| **Permissions** | Full access to Organization Setup (Screen 3 — all three tabs). Create/close audit cycles. View all reports and analytics. View all notifications and activity logs. Access Dashboard with organization-wide KPIs. |
| **Restrictions** | Cannot self-assign the Admin role (must be assigned by another Admin or seeded at system initialization). Does not directly register or allocate assets (that is the Asset Manager's domain). Does not directly approve maintenance requests. |

### Asset Manager

| Attribute | Detail |
|-----------|--------|
| **Responsibilities** | Register new assets into the system. Allocate assets to employees/departments. Approve or reject transfer requests. Approve or reject maintenance requests. Approve asset returns and capture condition check-in notes. Approve audit discrepancy resolution. |
| **Permissions** | Full access to Asset Registration & Directory (Screen 4). Full access to Allocation & Transfer (Screen 5). Approve/reject on Maintenance Management (Screen 7). Approve discrepancy resolution on Audit (Screen 8). View reports and analytics. |
| **Restrictions** | Cannot manage departments, categories, or the employee directory (Admin-only). Cannot create or close audit cycles. Cannot promote users to any role. |

### Department Head

| Attribute | Detail |
|-----------|--------|
| **Responsibilities** | View all assets allocated to their department. Approve allocation/transfer requests within their department. Book shared resources on behalf of the department. |
| **Permissions** | View department-scoped asset data. Approve/reject intra-department transfers and allocations. Book shared resources (Screen 6). View department-relevant reports. |
| **Restrictions** | Cannot register new assets. Cannot approve maintenance requests (Asset Manager's domain). Cannot manage organization setup. Cannot view or act on data outside their department scope. |

### Employee

| Attribute | Detail |
|-----------|--------|
| **Responsibilities** | View assets currently allocated to them. Book shared resources for personal/team use. Raise maintenance requests for assets they hold or observe. Initiate return requests. Initiate transfer requests. |
| **Permissions** | View own allocations. Create bookings (Screen 6). Raise maintenance requests (Screen 7). Submit return/transfer requests (Screen 5). View own notifications. |
| **Restrictions** | Cannot register or allocate assets. Cannot approve any requests. Cannot access Organization Setup. Cannot view other employees' allocations. Cannot promote roles. |

---

## Functional Requirements

### Module 1: Authentication

**Purpose:** Authenticate users with realistic, non-self-elevating account creation.

**Business Rules:**
- Signup creates an **Employee account only** — no role selection is offered at signup.
- Admin promotes Employees to Department Head or Asset Manager exclusively through the Employee Directory (Organization Setup, Screen 3 Tab C).
- Login requires email and password.
- Forgot-password flow must be provided.
- Session validation must be enforced on every authenticated route.

**Inputs:**
- Signup: Email, Password
- Login: Email, Password

**Outputs:**
- Authenticated session token
- User profile with role context
- Error messages for invalid credentials

**Validation Rules:**
- Email must be valid format and unique in the system.
- Password must meet minimum complexity requirements.
- Duplicate email registration must be rejected.

**Edge Cases:**
- User attempts to sign up with an email already registered → reject with "Email already in use."
- User attempts to log in with correct email but wrong password → generic error ("Invalid credentials") to prevent email enumeration.
- Session expires while user is mid-action → redirect to login, preserve intended destination.
- Forgot-password request for non-existent email → show generic success message (no email enumeration).

**Dependencies:** None — this is the entry point.

**Success Criteria:**
- New signups always produce Employee-role accounts.
- No UI or API pathway exists for a user to self-assign Admin, Asset Manager, or Department Head.
- Session validation blocks unauthenticated access to all screens beyond login/signup.

**UI Reference:** Screen 1 — Login screen with Email, Password fields, "Forgot password" link, "Create Account" button, and explicit note: "Sign up creates an employee account. Admin roles assigned later."

---

### Module 2: Dashboard

**Purpose:** Provide every role a real-time operational snapshot.

**Business Rules:**
- Dashboard is the landing screen after login.
- KPI cards refresh to reflect current system state.
- Overdue returns (past Expected Return Date) are highlighted separately with visual emphasis (red/warning).
- Quick-action buttons provide shortcuts to high-frequency operations.
- Recent Activity feed shows the latest system events relevant to the user's role.

**Inputs:**
- Authenticated user session (role determines data scope).

**Outputs:**
- KPI card values: Available assets count, Allocated assets count, Under Maintenance count (**Assumption A1**), Active Bookings count, Pending Transfers count, Upcoming Returns count.
- Overdue returns alert banner (e.g., "3 assets overdue for return — flagged for follow-up").
- Recent Activity feed (e.g., "Laptop AF-0114 — allocated to Priya Shah — IT dept").
- Quick-action buttons: "+ Register Asset", "Book Resource", "Raise Requests".

**Validation Rules:**
- KPI counts must be computed in real time from current system state.
- Overdue returns must be calculated as: `current_date > expected_return_date AND asset_status == 'Allocated'`.

**Edge Cases:**
- Zero-state dashboard (new organization, no assets registered) → KPIs show 0, no recent activity, quick actions available.
- Role-based scoping: Employee sees only their own data; Department Head sees department data; Admin/Asset Manager sees organization-wide data.

**Dependencies:** All other modules feed data into the Dashboard.

**Success Criteria:**
- Every KPI card displays an accurate, real-time count.
- Overdue returns are visually distinct from upcoming returns.
- Quick actions navigate to the correct target screen.

**UI Reference:** Screen 2 — Dashboard with six KPI cards, overdue alert banner, three quick-action buttons, and Recent Activity feed.

---

### Module 3: Organization Setup

**Purpose:** Maintain the master data that everything else depends on. **Admin-only access.**

**Business Rules:**

**Tab A — Department Management:**
- Create, edit, and deactivate departments.
- Each department has: Name, Head (assigned person), optional Parent Department (for hierarchy), Status (Active / Inactive).
- Editing a department here drives the department picklists in Screen 4 (Assets) and Screen 5 (Allocation & Transfer).
- Deactivating a department does not delete it; it becomes unavailable for new allocations/bookings.

**Tab B — Asset Category Management:**
- Create and edit asset categories (e.g., Electronics, Furniture, Vehicles).
- Optional category-specific custom fields (e.g., warranty period for Electronics).
- Categories drive the Category picklist in asset registration (Screen 4).

**Tab C — Employee Directory:**
- Maintain employee records: Name, Email, Department, Role, Status (Active / Inactive).
- **This is the only place** where an Admin can promote an Employee to Department Head or Asset Manager.
- Deactivating an employee does not delete their records or allocation history.

**Inputs:**
- Tab A: Department Name, Head, Parent Department (optional), Status
- Tab B: Category Name, Custom Fields (optional)
- Tab C: Employee Name, Email, Department, Role, Status

**Outputs:**
- Updated picklists across Screens 4 and 5.
- Role assignments take effect immediately.

**Validation Rules:**
- Department Name must be unique.
- Category Name must be unique.
- Employee Email must be unique.
- An inactive department cannot be set as a Parent Department for a new department.
- Deactivating a department with active allocations should trigger a warning.

**Edge Cases:**
- Deactivating a department that has assets currently allocated → warn Admin; do not auto-deallocate.
- Deactivating an employee who currently holds assets → warn Admin; assets remain allocated until explicitly returned.
- Removing a Department Head while they have pending approvals → warn Admin.
- Attempting to set a circular parent-department hierarchy → reject.

**Dependencies:** None (upstream master data).

**Success Criteria:**
- All department/category/employee changes propagate to dependent picklists.
- Only Admins can access this screen.
- Role promotions are limited to this screen.

**UI Reference:** Screen 3 — Three tabs (Departments, Categories, Employee) with "+ Add" button. Department table shows columns: Department, Head, Parent Dept, Status. Note: "Editing a department here also drives the picklist in Screen 4 & 5."

---

### Module 4: Asset Registry

**Purpose:** Register assets and search/track them centrally.

**Business Rules:**
- Each asset receives an auto-generated Asset Tag (format: `AF-XXXX`, e.g., AF-0001).
- Assets are registered with: Name, Category (from Organization Setup), Asset Tag (auto), Serial Number, Acquisition Date, Acquisition Cost (for reports only — not linked to accounting), Condition, Location, Photo/Documents, and a "Shared/Bookable" flag.
- Lifecycle status displayed per asset: Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed.
- Each asset maintains a per-asset history: allocation history + maintenance history.
- Assets with the "Shared/Bookable" flag enabled become available for time-slot booking in Screen 6.

**Inputs:**
- Name, Category, Serial Number, Acquisition Date, Acquisition Cost, Condition, Location, Photo/Documents, Shared/Bookable flag.

**Outputs:**
- Auto-generated Asset Tag.
- Asset record visible in the directory.
- Asset available for allocation or booking depending on its flag.

**Validation Rules:**
- Asset Tag must be auto-generated and unique.
- Serial Number must be unique if provided.
- Category must be selected from existing categories (Screen 3 Tab B).
- Acquisition Date must be a valid past or present date.
- Acquisition Cost must be a non-negative number.

**Edge Cases:**
- Registering an asset with a duplicate Serial Number → reject with error.
- Registering an asset under an inactive category → reject; category must be active.
- Uploading invalid file types for photos/documents → reject with supported-format message.
- Asset Tag counter overflow (beyond AF-9999) → **Assumption:** system extends to AF-XXXXX format.

**Dependencies:** Organization Setup (categories, departments).

**Success Criteria:**
- Every registered asset has a unique, auto-generated tag.
- All assets are searchable and filterable.
- Lifecycle status is always accurate and reflects the latest state transition.

**UI Reference:** Screen 4 — Search bar ("Search by tag, serial, or QR code…"), filter buttons (Category, Status, Department), "+ Register Asset" button. Asset table columns: Tag, Name, Category, Status, Location.

---

### Module 5: Allocation & Transfer

**Purpose:** Manage who holds what, with explicit conflict rules.

**Business Rules:**
- Allocate an asset to an employee or department with an optional Expected Return Date.
- **Double-allocation prevention:** If an asset is already allocated, the system blocks re-allocation, displays the current holder, and offers a Transfer Request button instead.
- Transfer workflow: Requested → Approved (by Asset Manager or Department Head) → Re-allocated (history updated automatically).
- Return flow: Mark asset as returned, capture condition check-in notes, asset status reverts to Available.
- Overdue allocations (past Expected Return Date) are auto-flagged and feed the Dashboard and Notifications.
- Allocation history is maintained per asset.

**Inputs:**
- Allocation: Asset selection, Employee/Department, Expected Return Date (optional).
- Transfer: From (current holder — auto-populated), To (target employee), Reason.
- Return: Condition check-in notes.

**Outputs:**
- Updated asset status (Allocated / Available).
- Allocation history entry.
- Transfer request record.
- Notifications to affected parties.

**Validation Rules:**
- Cannot allocate an asset whose status is not "Available."
- Cannot allocate to an inactive employee or inactive department.
- Transfer request requires a reason.
- Return must include condition check-in notes.

**Edge Cases:**
- Attempting to allocate an already-allocated asset → block with message: "Already Allocated to [Name] ([Department]). Direct re-allocation is blocked — submit a transfer request below."
- Attempting to allocate an asset that is Under Maintenance → block; asset must be Available.
- Transfer request submitted but the asset is returned before approval → auto-cancel the pending transfer.
- Two transfer requests for the same asset submitted simultaneously → process first-approved, reject the second.
- Expected Return Date set in the past → reject.

**Dependencies:** Asset Registry, Organization Setup (employees, departments).

**Success Criteria:**
- Zero double-allocations across the entire system.
- Every allocation and return is logged in the asset's history.
- Overdue returns are automatically flagged.

**UI Reference:** Screen 5 — Asset field (auto-populated), red conflict banner ("Already Allocated to Priya Shah (Engineering). Direct re-allocation is blocked — submit a transfer request below"), Transfer Request form (From, To, Reason), "Submit Request" button, Allocation History log.

---

### Module 6: Resource Booking

**Purpose:** Time-slot booking of shared resources with no overlaps.

**Business Rules:**
- Only assets flagged as "Shared/Bookable" appear for booking.
- Calendar view shows a resource's existing bookings by time slot.
- **Overlap validation:** Two people cannot book the same resource at overlapping times. Adjacent bookings (e.g., 9:00–10:00 and 10:00–11:00) are allowed since the end time of one equals the start time of the next.
- Booking statuses: Upcoming, Ongoing, Completed, Cancelled.
- Users can cancel or reschedule bookings.
- Reminder notification sent before the slot starts.

**Inputs:**
- Resource selection, Date, Start Time, End Time.

**Outputs:**
- Confirmed booking with status.
- Calendar updated.
- Notifications: confirmation, reminder, cancellation.

**Validation Rules:**
- Start Time must be before End Time.
- Booking time must be in the future.
- Overlap check: `new_start < existing_end AND new_end > existing_start` → reject.
- Resource must be in "Available" lifecycle status and flagged as bookable.

**Edge Cases:**
- Booking a resource currently Under Maintenance → reject; resource not available.
- Two users submit overlapping bookings simultaneously → first-committed wins; second gets a conflict error.
- Cancelling a booking that is already Ongoing → **Assumption:** allowed, but booking record is retained with "Cancelled" status.
- Booking a resource for a past time → reject.
- Booking duration exceeds organizational limits → **Assumption:** no maximum duration is enforced unless configured.

**Dependencies:** Asset Registry (bookable flag), Notifications.

**Success Criteria:**
- Zero overlapping bookings for any resource.
- Calendar view accurately reflects all existing bookings.
- Reminders are sent before every upcoming booking.

**UI Reference:** Screen 6 — Resource field ("Conference Room B2 — Tue, 7 Jul"), timeline view (9:00–1:00) showing booked slots (blue) and conflict rejections (red dashed outline with "Requested 9:30 to 10:30 — conflict — slot is unavailable"), "Book a slot" button.

---

### Module 7: Maintenance

**Purpose:** Route repairs through an approval workflow before work starts.

**Business Rules:**
- Any user can raise a maintenance request: select asset, describe issue, set priority, attach photo.
- Workflow stages: Pending → Approved / Rejected (by Asset Manager) → Technician Assigned → In Progress → Resolved.
- **Asset status auto-updates:** On approval, asset moves to "Under Maintenance." On resolution, asset reverts to "Available."
- Maintenance history is retained per asset.
- Displayed as a Kanban board with columns for each workflow stage.

**Inputs:**
- Asset selection, Issue description, Priority level, Photo attachment (optional).

**Outputs:**
- Maintenance request record with workflow status.
- Asset status transition (to Under Maintenance / back to Available).
- Notifications at each stage transition.

**Validation Rules:**
- Cannot raise a maintenance request for a Disposed or Retired asset.
- Priority must be set (e.g., Low, Medium, High, Critical).
- Approval must precede any technician assignment.
- An asset already Under Maintenance cannot have a second concurrent maintenance request. (**Assumption**)

**Edge Cases:**
- Maintenance request raised for an asset currently in a booking slot → maintenance request is created but approval should consider booking impact.
- Asset Manager rejects a maintenance request → asset status remains unchanged; requester is notified with rejection reason.
- Technician assigned but becomes unavailable → reassignment mechanism needed. (**Assumption:** Asset Manager can reassign.)
- Resolving maintenance when the asset was previously "Allocated" → **Assumption:** asset reverts to "Allocated" (not "Available") since it still belongs to the original holder.

**Dependencies:** Asset Registry, Notifications.

**Success Criteria:**
- No asset transitions to "Under Maintenance" without an approved maintenance request.
- Every maintenance event is logged in the asset's maintenance history.
- Kanban board reflects accurate real-time status of all maintenance requests.

**UI Reference:** Screen 7 — Kanban board with columns: Pending, Approved, Technician Assigned, In Progress, Resolved. Cards show Asset Tag, issue description, and technician name. Note: "Approving a card moves the asset to under maintenance, resolving return it to available."

---

### Module 8: Audit

**Purpose:** Run structured verification cycles with discrepancy detection.

**Business Rules:**
- Create an Audit Cycle with scope (department and/or location) and date range.
- Assign one or more auditors to the cycle.
- Auditors verify each asset within scope: mark as Verified, Missing, or Damaged.
- System auto-generates a discrepancy report for all flagged (Missing/Damaged) items.
- Closing an Audit Cycle is **irreversible** — it locks the cycle and updates affected asset statuses (e.g., confirmed-missing items transition to "Lost").
- Audit history is retained per cycle.

**Inputs:**
- Audit Cycle: Scope (department/location), Date Range, Assigned Auditors.
- Per-asset verification: Verification status (Verified / Missing / Damaged).

**Outputs:**
- Checklist of assets within scope with verification status.
- Auto-generated discrepancy report.
- Updated asset statuses upon cycle closure.
- Audit history records.

**Validation Rules:**
- Audit cycle date range must be valid (start ≤ end, not in the past for new cycles).
- At least one auditor must be assigned.
- Auditors must be active employees.
- An asset can only be in one open audit cycle at a time. (**Assumption**)
- Closure requires all assets in scope to have a verification status.

**Edge Cases:**
- Audit cycle created for a department with zero assets → valid but empty; cycle can still be closed.
- Auditor deactivated mid-cycle → warn Admin; allow reassignment.
- Asset transferred out of a department during an active audit → flag for auditor attention.
- Closing a cycle with "Missing" assets → system sets those assets to "Lost" status.
- Closing a cycle with "Damaged" assets → **Assumption:** system flags for maintenance but does not auto-create maintenance requests.

**Dependencies:** Asset Registry, Organization Setup (departments, employees).

**Success Criteria:**
- Every audit cycle produces a discrepancy report.
- Cycle closure is irreversible and updates asset statuses.
- Full audit history is preserved per cycle.

**UI Reference:** Screen 8 — Audit cycle header ("Q3 audit: Engineering dept — 1–15 Jul, Auditors: A. Rao, S. Iqbal"), asset checklist table (Asset, Expected Location, Verification with color-coded status tags: Verified/green, Missing/red, Damaged/yellow), discrepancy alert banner ("2 assets flagged — discrepancy report generated automatically"), "Close audit cycle" button.

---

### Module 9: Reports

**Purpose:** Give managers actionable operational insight.

**Business Rules:**
- Asset utilization trends: most-used vs. idle assets.
- Maintenance frequency by asset and category.
- Assets due for maintenance or nearing retirement.
- Department-wise allocation summary.
- Resource booking heatmap (peak usage windows).
- Reports must be exportable.

**Inputs:**
- Date range filters, department filters, category filters.

**Outputs:**
- Utilization by department chart (bar chart).
- Maintenance frequency chart (line chart).
- Most-used assets list with usage counts.
- Idle assets list with days-unused count.
- Assets due for maintenance / nearing retirement list.
- Exportable report files.

**Validation Rules:**
- Date range must be valid.
- Reports reflect data up to the current moment.

**Edge Cases:**
- Report generated for a department with no assets → empty report with appropriate messaging.
- Export with very large data sets → **Assumption:** pagination or background-export mechanism.

**Dependencies:** All operational modules (Assets, Allocations, Bookings, Maintenance, Audits).

**Success Criteria:**
- All specified report types are available and accurate.
- Export functionality works reliably.
- Reports respect role-based data scoping.

**UI Reference:** Screen 9 — Two charts (Utilization by department bar chart, Maintenance Frequency line chart), Most Used Assets list, Idle Assets list, "Assets due for maintenance / nearing retirement" section, "Export report" button.

---

### Module 10: Notifications

**Purpose:** Keep every role informed without digging for updates.

**Business Rules:**
- Notification types: Asset Assigned, Maintenance Approved/Rejected, Booking Confirmed/Cancelled/Reminder, Transfer Approved, Overdue Return Alert, Audit Discrepancy Flagged.
- Full audit log of admin/manager/employee actions (who did what, when).
- Notifications are filterable by category: All, Alerts, Approvals, Bookings.
- Each notification shows a description and relative timestamp (e.g., "2m ago," "1h ago," "2d ago").

**Inputs:**
- System events trigger notifications automatically.

**Outputs:**
- Notification entries with category, description, timestamp.
- Activity log entries for all user actions.

**Validation Rules:**
- Every state transition in any module must generate a corresponding notification.
- Notifications must be delivered to all relevant roles.

**Edge Cases:**
- Bulk operations (e.g., closing an audit cycle affecting many assets) → generate individual notifications per affected asset or a summary notification. (**Assumption:** individual notifications.)
- User has hundreds of unread notifications → pagination required.

**Dependencies:** All other modules.

**Success Criteria:**
- Every system event produces the appropriate notification.
- Notifications are filterable and timestamped.
- Full audit log is queryable and complete.

**UI Reference:** Screen 10 — Filter tabs (All, Alerts, Approvals, Bookings), notification list with color-coded category indicators, descriptions, and relative timestamps. Example entries: "Laptop AF-0014 assigned to Priya Shah" (2m ago), "Maintenance request AF-0055 approved" (18m ago), "Booking confirmed: Room B2 : 2:00 to 3:00 PM" (1h ago), "Transfer approved: AF-0033 to facilities dept" (3h ago), "Overdue return: AF-0021 was due 3 days ago" (1d ago), "Audit discrepancy flagged: AF-0088 damaged" (2d ago).

---

## Asset Lifecycle

### Lifecycle States

| State | Description |
|-------|-------------|
| **Available** | Asset is registered and ready for allocation or booking. Default state on registration. |
| **Allocated** | Asset is assigned to a specific employee or department. |
| **Reserved** | Asset is reserved (e.g., through a pending booking or pre-allocation hold). |
| **Under Maintenance** | Asset is undergoing approved repair/maintenance work. |
| **Lost** | Asset confirmed missing during an audit cycle closure. |
| **Retired** | Asset has reached end-of-life and is no longer in active service but is retained in records. |
| **Disposed** | Asset has been physically removed from the organization's inventory. Terminal state. |

### Legal State Transitions

| From | To | Trigger |
|------|-----|---------|
| Available | Allocated | Asset allocated to employee/department |
| Available | Reserved | Asset reserved via booking or hold |
| Available | Under Maintenance | Maintenance request approved |
| Available | Retired | Admin/Asset Manager retires the asset |
| Available | Disposed | Admin/Asset Manager disposes the asset |
| Allocated | Available | Asset returned by holder |
| Allocated | Under Maintenance | Maintenance request approved for allocated asset |
| Allocated | Lost | Audit cycle closure confirms asset missing |
| Reserved | Available | Booking cancelled or reservation released |
| Reserved | Allocated | Reserved asset formally allocated |
| Under Maintenance | Available | Maintenance resolved (if asset was previously Available) |
| Under Maintenance | Allocated | Maintenance resolved (if asset was previously Allocated — returns to original holder) |
| Lost | Available | Asset recovered and verified |
| Lost | Disposed | Lost asset formally written off |
| Retired | Disposed | Retired asset formally disposed |

### Illegal State Transitions

| From | To | Reason |
|------|-----|--------|
| Allocated | Allocated | Double-allocation is explicitly blocked. Transfer workflow required. |
| Disposed | Any state | Disposed is a terminal state. No recovery. |
| Under Maintenance | Allocated (different holder) | Cannot reassign during maintenance. Must resolve first. |
| Lost | Allocated | Cannot allocate a lost asset. Must be recovered first (Lost → Available → Allocated). |
| Lost | Under Maintenance | Cannot maintain a lost asset. |
| Retired | Allocated | Cannot allocate a retired asset. |
| Retired | Under Maintenance | Cannot maintain a retired asset. |
| Retired | Reserved | Cannot book a retired asset. |
| Reserved | Under Maintenance | Must cancel reservation first, then initiate maintenance. |

---

## Booking Workflow

```
┌─────────────┐
│   Employee   │
│ selects      │
│ resource +   │
│ time slot    │
└──────┬──────┘
       │
       ▼
┌──────────────────┐     ┌─────────────────┐
│ Overlap Check    │────▶│ REJECTED        │
│ (system auto)    │ Yes │ "Slot is         │
│                  │     │  unavailable"    │
└──────┬───────────┘     └─────────────────┘
       │ No overlap
       ▼
┌──────────────────┐
│ BOOKING          │
│ CONFIRMED        │
│ Status: Upcoming │
└──────┬───────────┘
       │
       ├── Reminder notification sent before slot
       │
       ▼ (slot start time reached)
┌──────────────────┐
│ Status: Ongoing  │
└──────┬───────────┘
       │
       ▼ (slot end time reached)
┌──────────────────┐
│ Status: Completed│
└──────────────────┘

Alternative flows:
- User cancels before slot → Status: Cancelled
- User reschedules → New overlap check → new booking created
```

**Rules:**
1. Overlap formula: `new_start < existing_end AND new_end > existing_start` → conflict.
2. Adjacent bookings are allowed: end time of Booking A == start time of Booking B.
3. Only bookable/shared-flagged assets can be booked.
4. Booking for past times is rejected.
5. Cancelled bookings retain their record but free the time slot.

---

## Allocation Workflow

```
┌───────────────────┐
│ Asset Manager     │
│ selects asset     │
│ + employee/dept   │
└──────┬────────────┘
       │
       ▼
┌──────────────────────┐     ┌───────────────────────────┐
│ Is asset Available?  │──▶  │ BLOCKED                   │
│                      │ No  │ "Already Allocated to     │
│                      │     │  [Name] ([Dept])"         │
│                      │     │ Offer Transfer Request    │
└──────┬───────────────┘     └───────────────────────────┘
       │ Yes
       ▼
┌──────────────────────┐
│ ALLOCATED            │
│ Optional: Expected   │
│ Return Date set      │
└──────┬───────────────┘
       │
       │ (if Expected Return Date passes)
       ▼
┌──────────────────────┐
│ OVERDUE              │
│ Auto-flagged on      │
│ Dashboard +          │
│ Notifications        │
└──────┬───────────────┘
       │
       ▼ (asset returned)
┌──────────────────────┐
│ RETURN PROCESSED     │
│ Condition check-in   │
│ notes captured       │
│ Status → Available   │
└──────────────────────┘
```

**Rules:**
1. Only "Available" assets can be allocated.
2. Allocated assets cannot be re-allocated — transfer workflow is required.
3. Expected Return Date is optional but, when set, enables overdue tracking.
4. Return requires condition check-in notes.
5. Allocation history is appended, never overwritten.

---

## Transfer Workflow

```
┌───────────────────────┐
│ User selects          │
│ already-allocated     │
│ asset                 │
└──────┬────────────────┘
       │
       ▼
┌────────────────────────────────────────┐
│ System displays:                       │
│ "Already Allocated to [Name] ([Dept])" │
│ "Submit a transfer request below"      │
└──────┬─────────────────────────────────┘
       │
       ▼
┌───────────────────────┐
│ TRANSFER REQUEST      │
│ From: [current holder]│
│ To: [target employee] │
│ Reason: [free text]   │
│ Status: Requested     │
└──────┬────────────────┘
       │
       ▼
┌───────────────────────┐     ┌──────────────────┐
│ Approved by           │     │ REJECTED         │
│ Asset Manager /       │────▶│ Requester        │
│ Department Head       │ No  │ notified         │
└──────┬────────────────┘     └──────────────────┘
       │ Yes
       ▼
┌───────────────────────┐
│ RE-ALLOCATED          │
│ Asset moved to new    │
│ holder                │
│ History updated       │
│ Notifications sent    │
└───────────────────────┘
```

**Rules:**
1. Transfer can only be initiated for an already-allocated asset.
2. Reason field is mandatory.
3. Approval authority: Asset Manager or Department Head (for intra-department transfers).
4. Upon approval, the asset is automatically re-allocated and history is updated.
5. If the asset is returned before the transfer is approved, the pending transfer is auto-cancelled.

---

## Maintenance Workflow

```
┌───────────────────────┐
│ User raises request   │
│ Asset + Issue +       │
│ Priority + Photo      │
│ Status: PENDING       │
└──────┬────────────────┘
       │
       ▼
┌───────────────────────┐     ┌──────────────────┐
│ Asset Manager         │     │ REJECTED         │
│ reviews               │────▶│ Asset status     │
│                       │ No  │ unchanged        │
└──────┬────────────────┘     │ Requester        │
       │ Yes                  │ notified         │
       ▼                      └──────────────────┘
┌───────────────────────┐
│ APPROVED              │
│ Asset status →        │
│ Under Maintenance     │
└──────┬────────────────┘
       │
       ▼
┌───────────────────────┐
│ TECHNICIAN ASSIGNED   │
│ Tech name recorded    │
└──────┬────────────────┘
       │
       ▼
┌───────────────────────┐
│ IN PROGRESS           │
│ Work underway         │
└──────┬────────────────┘
       │
       ▼
┌───────────────────────┐
│ RESOLVED              │
│ Asset status →        │
│ Available (or         │
│ previous state)       │
│ Maintenance history   │
│ updated               │
└───────────────────────┘
```

**Rules:**
1. Maintenance cannot start before approval.
2. Asset status auto-transitions to "Under Maintenance" upon approval.
3. Asset status auto-reverts to previous state (Available or Allocated) upon resolution.
4. Each stage transition generates a notification.
5. Maintenance history is retained per asset indefinitely.

---

## Audit Workflow

```
┌───────────────────────┐
│ Admin creates         │
│ Audit Cycle           │
│ Scope + Date Range    │
│ + Auditors            │
└──────┬────────────────┘
       │
       ▼
┌───────────────────────┐
│ AUDIT CYCLE OPEN      │
│ Checklist generated   │
│ (all assets in scope) │
└──────┬────────────────┘
       │
       ▼
┌───────────────────────┐
│ Auditors verify       │
│ each asset:           │
│ ✓ Verified            │
│ ✗ Missing             │
│ ⚠ Damaged             │
└──────┬────────────────┘
       │
       ▼
┌───────────────────────┐
│ Discrepancy report    │
│ auto-generated for    │
│ Missing + Damaged     │
└──────┬────────────────┘
       │
       ▼
┌───────────────────────┐
│ CLOSE AUDIT CYCLE     │
│ ⚠ IRREVERSIBLE        │
│ Missing → Lost        │
│ Cycle locked          │
│ History preserved     │
└───────────────────────┘
```

**Rules:**
1. Only Admins can create and close audit cycles.
2. Audit scope is defined by department and/or location.
3. At least one auditor must be assigned.
4. Discrepancy reports are auto-generated — not manually created.
5. Closing an audit cycle is **irreversible**.
6. Confirmed-missing assets transition to "Lost" status upon closure.
7. Audit history is retained per cycle indefinitely.

---

## Notification Rules

| Event | Recipients | Category |
|-------|-----------|----------|
| Asset allocated to employee | Employee (assignee), Asset Manager | Alerts |
| Asset returned | Asset Manager, previous holder | Alerts |
| Transfer requested | Asset Manager, Department Head | Approvals |
| Transfer approved | Requester, From-employee, To-employee | Approvals |
| Transfer rejected | Requester | Approvals |
| Maintenance request raised | Asset Manager | Approvals |
| Maintenance approved | Requester, assigned technician | Approvals |
| Maintenance rejected | Requester | Approvals |
| Maintenance resolved | Requester, Asset Manager | Alerts |
| Booking confirmed | Booker | Bookings |
| Booking reminder (before slot) | Booker | Bookings |
| Booking cancelled | Booker, affected parties | Bookings |
| Overdue return alert | Employee (holder), Asset Manager, Department Head | Alerts |
| Audit discrepancy flagged | Admin, Asset Manager | Alerts |
| Audit cycle closed | Admin, assigned auditors | Alerts |
| Role promotion | Promoted employee | Alerts |

---

## Dashboard KPIs

| KPI Card | Value Source | Visible To |
|----------|-------------|------------|
| Available Assets | Count of assets with status = Available | All roles (scoped by role) |
| Allocated Assets | Count of assets with status = Allocated | All roles (scoped by role) |
| Under Maintenance | Count of assets with status = Under Maintenance | All roles (scoped by role) |
| Active Bookings | Count of bookings with status = Upcoming or Ongoing | All roles (scoped by role) |
| Pending Transfers | Count of transfer requests with status = Requested | Asset Manager, Department Head, Admin |
| Upcoming Returns | Count of allocations with Expected Return Date within next 7 days | All roles (scoped by role) |
| Overdue Returns (alert banner) | Count of allocations where current_date > Expected Return Date | All roles (scoped by role) |

**Scoping Rules:**
- **Admin / Asset Manager:** Organization-wide counts.
- **Department Head:** Department-scoped counts.
- **Employee:** Personal counts only (own allocations, own bookings).

---

## Reports

| Report | Content | Visualization |
|--------|---------|---------------|
| **Utilization by Department** | Asset allocation counts per department | Bar chart |
| **Maintenance Frequency** | Maintenance request counts over time, by asset/category | Line chart |
| **Most-Used Assets** | Assets ranked by allocation + booking frequency | Ranked list with counts |
| **Idle Assets** | Assets with no allocation/booking activity for extended periods | List with days-unused |
| **Assets Due for Maintenance / Nearing Retirement** | Assets approaching service dates or retirement age | List with due dates |
| **Booking Heatmap** | Peak usage windows for shared resources | Heatmap (implied by PDF, not shown in mockup) |
| **Department-wise Allocation Summary** | Allocation breakdown by department | Table / chart |

**Export:** All reports must be exportable (format not specified — **Assumption:** CSV and/or PDF).

---

## Search & Filters

### Asset Search (Screen 4)

| Mechanism | Description |
|-----------|-------------|
| **Free-text search** | Search by Asset Tag, Serial Number, or QR code |
| **Category filter** | Filter by asset category (from Organization Setup) |
| **Status filter** | Filter by lifecycle status (Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed) |
| **Department filter** | Filter by owning/allocated department |

### Notification Filters (Screen 10)

| Filter Tab | Shows |
|------------|-------|
| **All** | All notification types |
| **Alerts** | Asset assigned, overdue returns, maintenance resolved, audit discrepancies |
| **Approvals** | Transfer requests, maintenance approvals/rejections |
| **Bookings** | Booking confirmations, reminders, cancellations |

### General Search Principles
- All searches should be case-insensitive.
- Partial-match search should be supported for free-text fields.
- Filters should be combinable (AND logic).
- Empty search results should display a clear "No results found" message.

---

## Error Handling

| Error Scenario | System Behavior |
|----------------|----------------|
| Double-allocation attempt | Block action. Display: "Already Allocated to [Name] ([Dept]). Direct re-allocation is blocked — submit a transfer request below." |
| Booking overlap | Block action. Display: "Requested [time range] — conflict — slot is unavailable." |
| Duplicate email at signup | Block action. Display: "Email already in use." |
| Duplicate Serial Number at asset registration | Block action. Display: "Serial Number already exists." |
| Invalid credentials at login | Display: "Invalid credentials." (generic — no email enumeration) |
| Allocating to inactive employee/department | Block action. Display: "Cannot allocate to inactive [employee/department]." |
| Registering asset under inactive category | Block action. Display: "Selected category is inactive." |
| Booking a resource under maintenance | Block action. Display: "Resource is currently under maintenance and not available for booking." |
| Closing an audit with unverified assets | Block action. Display: "All assets in scope must be verified before closing the audit cycle." |
| Access denied (insufficient role) | Block action. Display: "You do not have permission to perform this action." |
| Session expired | Redirect to login. Display: "Session expired. Please log in again." |
| Circular parent-department hierarchy | Block action. Display: "Cannot set parent department — circular hierarchy detected." |
| Expected Return Date in the past | Block action. Display: "Expected Return Date must be in the future." |
| Maintenance request for Disposed/Retired asset | Block action. Display: "Cannot raise maintenance for a [Disposed/Retired] asset." |

---

## Assumptions

| # | Assumption | Rationale |
|---|-----------|-----------|
| A1 | The third KPI card on the Dashboard labeled "Available" in the mockup represents **Under Maintenance** count, since "Available" is already the first card. | Screen 2 shows three cards in the top row, all labeled similarly — likely a mockup placeholder. The PDF lists "Maintenance Today" as a KPI. |
| A2 | Asset Tag format extends beyond AF-9999 (e.g., AF-00001) if the organization exceeds 9,999 assets. | PDF specifies auto-generated tags with format AF-XXXX but does not address overflow. |
| A3 | Export format for reports is CSV and/or PDF. | PDF states "Exportable reports" without specifying format. |
| A4 | An asset already under maintenance cannot have a second concurrent maintenance request. | PDF does not address this explicitly, but it is implied by the single-status lifecycle model. |
| A5 | When maintenance resolves for a previously-allocated asset, the asset reverts to "Allocated" (not "Available"). | PDF states asset "status auto-updates to Under Maintenance on approval and back to Available on resolution" — but logically, if an asset was allocated before maintenance, it should return to its holder. |
| A6 | Cancelling an ongoing booking is allowed but the booking record is retained with "Cancelled" status. | PDF mentions cancel/reschedule but does not specify rules for in-progress cancellations. |
| A7 | No maximum booking duration is enforced unless configured by Admin. | PDF does not specify booking duration limits. |
| A8 | Audit discrepancy for "Damaged" assets flags for maintenance review but does not auto-create maintenance requests. | PDF specifies auto-status-update only for "Missing → Lost." |
| A9 | Bulk audit closure notifications generate individual notifications per affected asset. | PDF does not specify bulk notification behavior. |
| A10 | An asset can only appear in one open audit cycle at a time. | PDF does not address concurrent audit cycles for the same asset. |
| A11 | The initial Admin account is seeded at system initialization (not self-created). | PDF states "not self-assigned admin roles" but does not specify the bootstrap mechanism. |
| A12 | The "Forgot password" flow sends a reset link via email. | Screen 1 shows "Forgot password" but does not detail the flow. |
| A13 | QR code in search (Screen 4) refers to scanning an existing QR code on a physical asset tag, not generating QR codes within the system. | PDF mentions search "by QR code" but does not mention QR code generation. |
| A14 | The "Raise Requests" quick action on the Dashboard (Screen 2) navigates to the Maintenance request form. | PDF lists "Raise Maintenance Request" as a quick action. |
| A15 | Asset Manager can reassign a technician on an in-progress maintenance request if the originally assigned technician becomes unavailable. | PDF does not address technician unavailability. |

---

## Future Enhancements

| # | Enhancement | Notes |
|---|------------|-------|
| FE1 | QR code / barcode generation for physical asset tags | Only search-by-QR is in scope currently |
| FE2 | Mobile-native application | Current scope is responsive web only |
| FE3 | SSO / LDAP integration | Not referenced in source materials |
| FE4 | Email notification delivery (in addition to in-app) | PDF references in-app notifications only |
| FE5 | Asset depreciation tracking | Excluded from current scope (no accounting) |
| FE6 | Recurring booking templates | Not referenced; only one-time bookings are described |
| FE7 | Multi-organization / tenant support | Not referenced |
| FE8 | Custom workflow stages (configurable maintenance/transfer pipelines) | Current workflows are fixed |
| FE9 | Asset insurance tracking | Not referenced |
| FE10 | Integration with procurement / purchasing systems | Explicitly excluded |
| FE11 | Bulk asset import (CSV upload) | Not referenced but implied for large organizations |
| FE12 | Dashboard customization (configurable KPI cards) | Current layout is fixed |

---

## Acceptance Criteria

### Authentication
- [ ] Signup creates an Employee-only account with no role selection.
- [ ] Login validates email and password; invalid credentials return a generic error.
- [ ] Forgot-password flow is accessible and functional.
- [ ] Session validation blocks unauthenticated access to all protected screens.
- [ ] No self-elevation pathway exists in the UI or API.

### Dashboard
- [ ] All six KPI cards display accurate real-time values.
- [ ] Overdue returns are highlighted in a distinct alert banner.
- [ ] Quick actions ("+ Register Asset", "Book Resource", "Raise Requests") navigate correctly.
- [ ] Recent Activity feed shows the latest relevant events.
- [ ] KPIs are scoped by user role.

### Organization Setup
- [ ] Only Admin role can access Organization Setup.
- [ ] Departments can be created, edited, and deactivated.
- [ ] Categories can be created and edited.
- [ ] Employees can be viewed, and their roles can be promoted (Employee → Department Head / Asset Manager).
- [ ] Changes to departments and categories propagate to downstream picklists (Screens 4, 5).

### Asset Registry
- [ ] Assets are registered with all required fields and receive an auto-generated unique tag.
- [ ] Search by Asset Tag, Serial Number, QR code works correctly.
- [ ] Filters by Category, Status, and Department work correctly and are combinable.
- [ ] Lifecycle status is displayed accurately per asset.
- [ ] Per-asset history (allocation + maintenance) is viewable.

### Allocation & Transfer
- [ ] Available assets can be allocated to an employee/department.
- [ ] Attempting to allocate an already-allocated asset is blocked with conflict message and Transfer Request option.
- [ ] Transfer requests flow through Requested → Approved → Re-allocated.
- [ ] Returns capture condition check-in notes and revert asset status to Available.
- [ ] Overdue allocations are auto-flagged on Dashboard and Notifications.

### Resource Booking
- [ ] Only shared/bookable assets appear in the booking screen.
- [ ] Calendar view accurately shows existing bookings.
- [ ] Overlapping booking requests are rejected with a clear conflict message.
- [ ] Adjacent bookings (end = start) are allowed.
- [ ] Booking statuses transition correctly: Upcoming → Ongoing → Completed.
- [ ] Cancellation and rescheduling are functional.
- [ ] Reminder notification is sent before the booking slot.

### Maintenance
- [ ] Any user can raise a maintenance request with asset, issue, priority, and optional photo.
- [ ] Workflow progresses: Pending → Approved → Technician Assigned → In Progress → Resolved.
- [ ] Approval transitions asset status to "Under Maintenance."
- [ ] Resolution transitions asset status back to Available (or previous state).
- [ ] Rejection leaves asset status unchanged and notifies the requester.
- [ ] Kanban board reflects accurate real-time status.

### Audit
- [ ] Admin can create an audit cycle with scope, date range, and auditors.
- [ ] Auditors can mark each asset as Verified, Missing, or Damaged.
- [ ] Discrepancy report is auto-generated for flagged items.
- [ ] Closing an audit cycle is irreversible.
- [ ] Missing assets transition to "Lost" status upon cycle closure.
- [ ] Audit history is retained per cycle.

### Reports
- [ ] All report types are available: utilization, maintenance frequency, most-used, idle, due-for-maintenance, booking heatmap.
- [ ] Reports are exportable.
- [ ] Reports respect role-based data scoping.

### Notifications
- [ ] All specified notification events generate notifications.
- [ ] Notifications are filterable by category (All, Alerts, Approvals, Bookings).
- [ ] Activity log captures all user actions with who, what, when.
- [ ] Relative timestamps are displayed correctly.

---

## Functional Invariants

These invariants must hold true at all times across the entire system. Any violation constitutes a critical bug.

1. **An allocated asset cannot be allocated again.** Direct re-allocation is blocked; a transfer request is required instead.
2. **Booking overlaps are impossible.** No two confirmed bookings for the same resource can have overlapping time ranges.
3. **Admin role cannot be self-assigned.** No user can promote themselves to Admin, Department Head, or Asset Manager through signup or any user-facing action.
4. **Maintenance cannot start before approval.** An asset's status cannot transition to "Under Maintenance" without an approved maintenance request.
5. **Closing an audit cycle is irreversible.** Once closed, an audit cycle cannot be reopened, edited, or deleted.
6. **Disposed is a terminal state.** No asset can transition out of "Disposed" to any other lifecycle state.
7. **Asset Tags are globally unique.** No two assets in the system can share the same Asset Tag.
8. **Serial Numbers are unique.** No two assets can share the same Serial Number when provided.
9. **Department Names are unique.** No two departments can have the same name.
10. **Category Names are unique.** No two asset categories can have the same name.
11. **Employee Emails are unique.** No two user accounts can share the same email address.
12. **An asset can exist in exactly one lifecycle state at any time.** No asset can simultaneously be "Available" and "Allocated," or any other dual-state.
13. **Overdue detection is automatic.** Any allocation past its Expected Return Date is flagged without manual intervention.
14. **Discrepancy reports are system-generated.** Auditors do not manually create discrepancy reports; the system auto-generates them from Missing/Damaged flags.
15. **Role promotion is Admin-exclusive.** Only the Admin role can change another user's role, and only through the Employee Directory (Organization Setup, Screen 3 Tab C).
16. **Notifications are never lost.** Every state transition in every module produces the corresponding notification entry in the system.
17. **History is append-only.** Allocation history, maintenance history, and audit history records are never deleted or overwritten.

---


---

## Requirements Traceability Matrix

This matrix maps every requirement from the AssetFlow Problem Statement PDF and every UI Mockup screen to the corresponding PRD section, ensuring complete coverage with zero unmapped requirements.

### PDF Requirements → PRD Mapping

| Req ID | Source | Requirement Summary | PRD Section | Status |
|--------|--------|---------------------|-------------|--------|
| PDF-VIS-01 | PDF p.1 — Overall Vision | Simplify and digitize asset tracking through centralized ERP platform | Product Vision | Covered |
| PDF-VIS-02 | PDF p.1 — Overall Vision | Industry-agnostic: offices, schools, hospitals, factories, agencies | Executive Summary, Product Vision | Covered |
| PDF-VIS-03 | PDF p.1 — Overall Vision | Reduce manual tracking (spreadsheets, paper logs) | Problem Statement | Covered |
| PDF-VIS-04 | PDF p.1 — Overall Vision | Structured asset lifecycles, centralized booking, real-time visibility | Asset Lifecycle, Module 6, Dashboard KPIs | Covered |
| PDF-VIS-05 | PDF p.1 — Overall Vision | Core ERP without purchasing, invoicing, or accounting | Non-Goals (NG1, NG2, NG3) | Covered |
| PDF-MIS-01 | PDF p.1 — Mission | User-centric, responsive application | Non-Functional Requirements (Responsiveness) | Covered |
| PDF-MIS-02 | PDF p.1 — Mission | Set up departments, asset categories, employee directory | Module 3: Organization Setup | Covered |
| PDF-MIS-03 | PDF p.1 — Mission | Register and track assets through full lifecycle | Module 4: Asset Registry, Asset Lifecycle | Covered |
| PDF-MIS-04 | PDF p.1 — Mission | Allocate assets with conflict handling | Module 5: Allocation & Transfer | Covered |
| PDF-MIS-05 | PDF p.1 — Mission | Book shared resources without overlaps | Module 6: Resource Booking | Covered |
| PDF-MIS-06 | PDF p.1 — Mission | Structured maintenance approval workflow | Module 7: Maintenance | Covered |
| PDF-MIS-07 | PDF p.1 — Mission | Structured audit cycles to catch discrepancies | Module 8: Audit | Covered |
| PDF-MIS-08 | PDF p.1 — Mission | Notifications for overdue returns, bookings, maintenance | Module 10: Notifications, Notification Rules | Covered |
| PDF-PS-01 | PDF p.1 — Problem Statement | Maintain departments, categories, employee directory | Module 3: Organization Setup | Covered |
| PDF-PS-02 | PDF p.1 — Problem Statement | Track assets through flexible lifecycle (7 states) | Asset Lifecycle | Covered |
| PDF-PS-03 | PDF p.1 — Problem Statement | State transitions: Available ↔ Under Maintenance, Allocated → Available | Asset Lifecycle (Legal Transitions) | Covered |
| PDF-PS-04 | PDF p.1 — Problem Statement | Prevent double-allocation | Module 5, Functional Invariant #1 | Covered |
| PDF-PS-05 | PDF p.1 — Problem Statement | Book shared resources by time slot with overlap validation | Module 6, Functional Invariant #2 | Covered |
| PDF-PS-06 | PDF p.1 — Problem Statement | Route maintenance through approval before work starts | Module 7, Functional Invariant #4 | Covered |
| PDF-PS-07 | PDF p.1 — Problem Statement | Scheduled audit cycles with auditors and auto-generated discrepancy reports | Module 8, Audit Workflow | Covered |
| PDF-PS-08 | PDF p.1 — Problem Statement | Surface overdue returns, bookings, maintenance via notifications and KPI dashboard | Dashboard KPIs, Notification Rules | Covered |
| PDF-ARCH-01 | PDF p.2 | Proper ERP architecture, reusable modules | Non-Functional Requirements (Maintainability) | Covered |
| PDF-ARCH-02 | PDF p.2 | Secure role-based workflows | User Roles, Role Permission Matrix | Covered |
| PDF-ARCH-03 | PDF p.2 | Realistic account creation, not self-assigned admin roles | Module 1, Functional Invariant #3 | Covered |
| PDF-ARCH-04 | PDF p.2 | Intuitive UI/UX | Non-Functional Requirements (Accessibility) | Covered |
| PDF-F1-01 | PDF p.2 — Feature 1 | Signup creates Employee account only — no role selection | Module 1: Authentication | Covered |
| PDF-F1-02 | PDF p.2 — Feature 1 | Admin promotes from Employee Directory (Screen 3) | Module 3 Tab C, Functional Invariant #15 | Covered |
| PDF-F1-03 | PDF p.2 — Feature 1 | Email & password login, forgot password, session validation | Module 1: Authentication | Covered |
| PDF-F2-01 | PDF p.2 — Feature 2 | KPI cards: Available, Allocated, Maintenance Today, Active Bookings, Pending Transfers, Upcoming Returns | Dashboard KPIs | Covered |
| PDF-F2-02 | PDF p.2 — Feature 2 | Overdue returns highlighted separately | Module 2: Dashboard | Covered |
| PDF-F2-03 | PDF p.2 — Feature 2 | Quick actions: Register Asset, Book Resource, Raise Maintenance Request | Module 2: Dashboard | Covered |
| PDF-F3-01 | PDF p.2 — Feature 3 | Organization Setup — Admin only, 3 tabs | Module 3: Organization Setup | Covered |
| PDF-F3-02 | PDF p.2 — Feature 3 | Tab A: Create/edit/deactivate department, Head, Parent Dept, Status | Module 3 Tab A | Covered |
| PDF-F3-03 | PDF p.2 — Feature 3 | Tab B: Create/edit categories with optional custom fields | Module 3 Tab B | Covered |
| PDF-F3-04 | PDF p.2 — Feature 3 | Tab C: Employee directory with Name, Email, Dept, Role, Status | Module 3 Tab C | Covered |
| PDF-F3-05 | PDF p.2 — Feature 3 | Admin promotes Employee to Dept Head / Asset Manager — only here | Module 3 Tab C, Functional Invariant #15 | Covered |
| PDF-F4-01 | PDF p.3 — Feature 4 | Register: Name, Category, auto-tag, Serial, Acquisition Date/Cost, Condition, Location, photo/docs, bookable flag | Module 4: Asset Registry | Covered |
| PDF-F4-02 | PDF p.3 — Feature 4 | Acquisition Cost for reports only, not accounting | Module 4, Non-Goals (NG3) | Covered |
| PDF-F4-03 | PDF p.3 — Feature 4 | Search/filter by Tag, Serial, QR, category, status, department, location | Search & Filters | Covered |
| PDF-F4-04 | PDF p.3 — Feature 4 | Lifecycle status per asset (7 states) | Asset Lifecycle | Covered |
| PDF-F4-05 | PDF p.3 — Feature 4 | Per-asset history: allocation + maintenance | Module 4: Asset Registry | Covered |
| PDF-F5-01 | PDF p.3 — Feature 5 | Allocate to employee/department with optional Expected Return Date | Module 5: Allocation & Transfer | Covered |
| PDF-F5-02 | PDF p.3 — Feature 5 | Double-allocation conflict rule with example (Priya/Raj) | Module 5, Allocation Workflow, Functional Invariant #1 | Covered |
| PDF-F5-03 | PDF p.3 — Feature 5 | Transfer workflow: Requested → Approved → Re-allocated | Transfer Workflow | Covered |
| PDF-F5-04 | PDF p.3 — Feature 5 | Return flow: mark returned, condition check-in notes, status → Available | Module 5, Allocation Workflow | Covered |
| PDF-F5-05 | PDF p.3 — Feature 5 | Overdue allocations auto-flagged, feed Dashboard + Notifications | Module 5, Dashboard KPIs, Notification Rules | Covered |
| PDF-F6-01 | PDF p.3 — Feature 6 | Calendar view of resource bookings | Module 6: Resource Booking | Covered |
| PDF-F6-02 | PDF p.3 — Feature 6 | Overlap validation with example (Room B2, 9:00–10:00 / 9:30–10:30 / 10:00–11:00) | Module 6, Booking Workflow, Functional Invariant #2 | Covered |
| PDF-F6-03 | PDF p.3 — Feature 6 | Booking status: Upcoming, Ongoing, Completed, Cancelled | Module 6: Resource Booking | Covered |
| PDF-F6-04 | PDF p.3 — Feature 6 | Cancel/reschedule; reminder notification before slot | Module 6, Notification Rules | Covered |
| PDF-F7-01 | PDF p.3 — Feature 7 | Raise request: asset, issue, priority, photo | Module 7: Maintenance | Covered |
| PDF-F7-02 | PDF p.3 — Feature 7 | Workflow: Pending → Approved/Rejected → Tech Assigned → In Progress → Resolved | Maintenance Workflow | Covered |
| PDF-F7-03 | PDF p.3 — Feature 7 | Asset status auto-updates to Under Maintenance on approval, back to Available on resolution | Maintenance Workflow, Asset Lifecycle | Covered |
| PDF-F7-04 | PDF p.3 — Feature 7 | Maintenance history retained per asset | Module 7: Maintenance | Covered |
| PDF-F8-01 | PDF p.4 — Feature 8 | Create Audit Cycle: scope (dept/location), date range | Module 8: Audit | Covered |
| PDF-F8-02 | PDF p.4 — Feature 8 | Assign one or more auditors | Module 8: Audit | Covered |
| PDF-F8-03 | PDF p.4 — Feature 8 | Auditor marks each asset: Verified / Missing / Damaged | Module 8: Audit | Covered |
| PDF-F8-04 | PDF p.4 — Feature 8 | Auto-generated discrepancy report for flagged items | Module 8, Functional Invariant #14 | Covered |
| PDF-F8-05 | PDF p.4 — Feature 8 | Close Audit Cycle — irreversible, locks cycle, updates asset statuses (Lost) | Audit Workflow, Functional Invariant #5 | Covered |
| PDF-F8-06 | PDF p.4 — Feature 8 | Audit history retained per cycle | Module 8: Audit | Covered |
| PDF-F9-01 | PDF p.4 — Feature 9 | Asset utilization trends; most-used vs. idle | Module 9: Reports | Covered |
| PDF-F9-02 | PDF p.4 — Feature 9 | Maintenance frequency by asset/category | Module 9: Reports | Covered |
| PDF-F9-03 | PDF p.4 — Feature 9 | Assets due for maintenance or nearing retirement | Module 9: Reports | Covered |
| PDF-F9-04 | PDF p.4 — Feature 9 | Department-wise allocation summary | Module 9: Reports | Covered |
| PDF-F9-05 | PDF p.4 — Feature 9 | Resource booking heatmap (peak usage windows) | Module 9: Reports | Covered |
| PDF-F9-06 | PDF p.4 — Feature 9 | Exportable reports | Module 9: Reports | Covered |
| PDF-F10-01 | PDF p.4 — Feature 10 | Notification types: Asset Assigned, Maintenance Approved/Rejected, Booking Confirmed/Cancelled/Reminder, Transfer Approved, Overdue Return, Audit Discrepancy | Module 10: Notifications, Notification Rules | Covered |
| PDF-F10-02 | PDF p.4 — Feature 10 | Full audit log of actions (who did what, when) | Module 10: Notifications | Covered |
| PDF-R-01 | PDF p.5 — Roles | Admin: manages depts, categories, audit cycles, employee/role assignment, org-wide analytics | User Roles: Admin | Covered |
| PDF-R-02 | PDF p.5 — Roles | Asset Manager: registers/allocates, approves transfers/maintenance/returns | User Roles: Asset Manager | Covered |
| PDF-R-03 | PDF p.5 — Roles | Department Head: views dept assets, approves intra-dept requests, books resources | User Roles: Department Head | Covered |
| PDF-R-04 | PDF p.5 — Roles | Employee: views own assets, books resources, raises maintenance, initiates return/transfer | User Roles: Employee | Covered |
| PDF-WF-01 | PDF p.5 — Basic Workflow | Admin sets up departments, categories, promotes employees | Module 3, Allocation Workflow | Covered |
| PDF-WF-02 | PDF p.5 — Basic Workflow | Asset Manager registers asset → Available | Module 4, Asset Lifecycle | Covered |
| PDF-WF-03 | PDF p.5 — Basic Workflow | Allocation blocked if already allocated → transfer required | Allocation Workflow, Transfer Workflow | Covered |
| PDF-WF-04 | PDF p.5 — Basic Workflow | Employees book by time slot; overlaps rejected | Booking Workflow | Covered |
| PDF-WF-05 | PDF p.5 — Basic Workflow | Maintenance request must be approved before work/status change | Maintenance Workflow | Covered |
| PDF-WF-06 | PDF p.5 — Basic Workflow | Overdue returns flagged automatically | Dashboard KPIs, Notification Rules | Covered |
| PDF-WF-07 | PDF p.5 — Basic Workflow | Audit cycles: assign auditors, verify, auto-generate discrepancy, close | Audit Workflow | Covered |
| PDF-WF-08 | PDF p.5 — Basic Workflow | All activity tracked via notifications, logs, reports | Module 10, Module 9 | Covered |

### UI Mockup Screens → PRD Mapping

| Req ID | Source | Screen Content | PRD Section | Status |
|--------|--------|---------------|-------------|--------|
| UI-S01-01 | Screen 1 | Login form: Email + Password fields | Module 1: Authentication | Covered |
| UI-S01-02 | Screen 1 | "Forgot password" link | Module 1: Authentication | Covered |
| UI-S01-03 | Screen 1 | "Create Account" button | Module 1: Authentication | Covered |
| UI-S01-04 | Screen 1 | Note: "Sign up creates an employee account. Admin roles assigned later" | Module 1, Functional Invariant #3 | Covered |
| UI-S02-01 | Screen 2 | KPI cards: Available (128), Allocated (76), Available (4) | Dashboard KPIs (Assumption A1) | Covered |
| UI-S02-02 | Screen 2 | KPI cards: Active Bookings (9), Pending Transfers (3), Upcoming Returns (12) | Dashboard KPIs | Covered |
| UI-S02-03 | Screen 2 | Overdue alert: "3 assets overdue for return — flagged for follow-up" | Module 2: Dashboard | Covered |
| UI-S02-04 | Screen 2 | Quick actions: "+ register asset", "Book resource", "Raise requests" | Module 2: Dashboard | Covered |
| UI-S02-05 | Screen 2 | Recent Activity feed with allocation/booking/maintenance entries | Module 2: Dashboard | Covered |
| UI-S02-06 | Screen 2 | Left sidebar navigation: Dashboard, Org Setup, Assets, Allocation & Transfer, Resource Booking, Maintenance, Audit, Reports, Notifications | All Modules | Covered |
| UI-S03-01 | Screen 3 | "Admin only" label | Module 3: Organization Setup | Covered |
| UI-S03-02 | Screen 3 | Three tabs: Departments, Categories, Employee | Module 3 Tabs A, B, C | Covered |
| UI-S03-03 | Screen 3 | "+ Add" button | Module 3: Organization Setup | Covered |
| UI-S03-04 | Screen 3 | Department table: Department, Head, Parent Dept, Status (Active/Inactive) | Module 3 Tab A | Covered |
| UI-S03-05 | Screen 3 | Note: "Editing a department here also drives the picklist in Screen 4 & 5" | Module 3: Organization Setup | Covered |
| UI-S04-01 | Screen 4 | Search bar: "Search by tag, serial, or QR code…" | Search & Filters | Covered |
| UI-S04-02 | Screen 4 | Filter buttons: Category, Status, Department | Search & Filters | Covered |
| UI-S04-03 | Screen 4 | "+ Register Asset" button | Module 4: Asset Registry | Covered |
| UI-S04-04 | Screen 4 | Asset table: Tag, Name, Category, Status, Location | Module 4: Asset Registry | Covered |
| UI-S04-05 | Screen 4 | Sample statuses: Allocated, Maintenance, Available | Asset Lifecycle | Covered |
| UI-S05-01 | Screen 5 | Asset field: "AF-0114 — Dell laptop" | Module 5: Allocation & Transfer | Covered |
| UI-S05-02 | Screen 5 | Red conflict banner: "Already Allocated to Priya Shah (Engineering). Direct re-allocation is blocked" | Module 5, Error Handling | Covered |
| UI-S05-03 | Screen 5 | Transfer Request form: From, To, Reason | Transfer Workflow | Covered |
| UI-S05-04 | Screen 5 | "Submit Request" button | Module 5: Allocation & Transfer | Covered |
| UI-S05-05 | Screen 5 | Allocation history entries with dates and condition notes | Module 5: Allocation & Transfer | Covered |
| UI-S06-01 | Screen 6 | Resource field: "Conference room B2 — Tue, 7 Jul" | Module 6: Resource Booking | Covered |
| UI-S06-02 | Screen 6 | Timeline view (9:00–1:00) with booked slots | Module 6: Resource Booking | Covered |
| UI-S06-03 | Screen 6 | Booked slot (blue): "Booked — Procurement Team — 9 to 10" | Module 6: Resource Booking | Covered |
| UI-S06-04 | Screen 6 | Conflict rejection (red dashed): "Requested 9:30 to 10:30 — conflict — slot is unavailable" | Module 6, Booking Workflow, Error Handling | Covered |
| UI-S06-05 | Screen 6 | "Book a slot" button | Module 6: Resource Booking | Covered |
| UI-S07-01 | Screen 7 | Kanban board: Pending, Approved, Technician Assigned, In Progress, Resolved | Module 7: Maintenance, Maintenance Workflow | Covered |
| UI-S07-02 | Screen 7 | Cards with Asset Tag, issue description, technician name | Module 7: Maintenance | Covered |
| UI-S07-03 | Screen 7 | Note: "Approving a card moves the asset to under maintenance, resolving return it to available" | Maintenance Workflow, Asset Lifecycle | Covered |
| UI-S08-01 | Screen 8 | Audit cycle header: scope, date range, auditors | Module 8: Audit | Covered |
| UI-S08-02 | Screen 8 | Asset checklist: Asset, Expected Location, Verification | Module 8: Audit | Covered |
| UI-S08-03 | Screen 8 | Verification statuses: Verified (green), Missing (red), Damaged (yellow) | Module 8: Audit | Covered |
| UI-S08-04 | Screen 8 | Discrepancy alert: "2 assets flagged — discrepancy report generated automatically" | Module 8, Functional Invariant #14 | Covered |
| UI-S08-05 | Screen 8 | "Close audit cycle" button | Audit Workflow, Functional Invariant #5 | Covered |
| UI-S09-01 | Screen 9 | Utilization by department bar chart | Module 9: Reports | Covered |
| UI-S09-02 | Screen 9 | Maintenance Frequency line chart | Module 9: Reports | Covered |
| UI-S09-03 | Screen 9 | Most used assets list with counts | Module 9: Reports | Covered |
| UI-S09-04 | Screen 9 | Idle assets list with days-unused | Module 9: Reports | Covered |
| UI-S09-05 | Screen 9 | Assets due for maintenance / nearing retirement section | Module 9: Reports | Covered |
| UI-S09-06 | Screen 9 | "Export report" button | Module 9: Reports | Covered |
| UI-S10-01 | Screen 10 | Filter tabs: All, Alerts, Approvals, Bookings | Module 10: Notifications, Search & Filters | Covered |
| UI-S10-02 | Screen 10 | Notification list with descriptions and relative timestamps | Module 10: Notifications | Covered |
| UI-S10-03 | Screen 10 | Notification types: assignment, maintenance approval, booking confirmed, transfer approved, overdue return, audit discrepancy | Notification Rules | Covered |
| UI-S10-04 | Screen 10 | Color-coded category indicators per notification | Module 10: Notifications | Covered |

**Coverage Summary:** 80 PDF requirements mapped. 44 UI mockup elements mapped. **0 unmapped requirements.**

---

## Business Entity Overview

> **Note:** This section defines business entities and their responsibilities at the conceptual level. It does NOT define database schemas, table structures, or column types.

### Organization

| Attribute | Detail |
|-----------|--------|
| **Purpose** | The top-level container representing the company or institution using AssetFlow. All departments, employees, assets, and operational data exist within a single organization context. |
| **Key Attributes** | Name, Address, Contact Information, Initialization Date. |
| **Relationships** | Contains → Departments. Contains → Employees. Contains → Assets. Contains → Asset Categories. |
| **Lifecycle** | Created at system initialization. Persists indefinitely. |
| **Ownership** | Admin (system-seeded). |

### Department

| Attribute | Detail |
|-----------|--------|
| **Purpose** | An organizational unit to which employees belong and assets are allocated. Supports hierarchical structure via optional parent department. |
| **Key Attributes** | Name (unique), Head (Employee reference), Parent Department (optional, self-referencing), Status (Active / Inactive). |
| **Relationships** | Belongs to → Organization. Has → Parent Department (optional). Contains → Employees. Receives → Asset Allocations. Scopes → Audit Cycles. Drives → Picklists in Asset Registry and Allocation screens. |
| **Lifecycle** | Created → Active → Inactive (deactivated). Deactivation does not delete; department remains in historical records. |
| **Ownership** | Admin (create/edit/deactivate). Department Head (operational ownership). |

### Employee

| Attribute | Detail |
|-----------|--------|
| **Purpose** | A user of the system. Every authenticated person is an Employee; elevated roles (Admin, Asset Manager, Department Head) are promotions layered on top of the Employee entity. |
| **Key Attributes** | Name, Email (unique), Department, Role (Employee / Department Head / Asset Manager / Admin), Status (Active / Inactive), Password (hashed). |
| **Relationships** | Belongs to → Department. Holds → Allocated Assets. Creates → Bookings. Raises → Maintenance Requests. Assigned as → Auditor in Audit Cycles. Receives → Notifications. |
| **Lifecycle** | Created at Signup (as Employee) → Active → Promoted (role change) → Inactive (deactivated). Deactivation preserves records and allocation history. |
| **Ownership** | Self (profile). Admin (role, status, department assignment). |

### Asset Category

| Attribute | Detail |
|-----------|--------|
| **Purpose** | A classification grouping for assets (e.g., Electronics, Furniture, Vehicles). Drives picklists and enables category-level reporting. |
| **Key Attributes** | Name (unique), Custom Fields (optional, category-specific — e.g., warranty period for Electronics). |
| **Relationships** | Belongs to → Organization. Classifies → Assets. Referenced by → Reports (maintenance frequency by category). |
| **Lifecycle** | Created → Active → Edited. Categories are not deleted; they persist for historical reporting. |
| **Ownership** | Admin (create/edit). |

### Asset

| Attribute | Detail |
|-----------|--------|
| **Purpose** | A physical item tracked by the organization — equipment, furniture, vehicles, rooms, or shared resources. The central entity of AssetFlow. |
| **Key Attributes** | Asset Tag (auto-generated, unique, format AF-XXXX), Name, Category, Serial Number (unique if provided), Acquisition Date, Acquisition Cost (reports only), Condition, Location, Photo/Documents, Shared/Bookable Flag, Lifecycle Status. |
| **Relationships** | Belongs to → Asset Category. Allocated to → Employee / Department (via Allocation). Booked by → Employees (via Booking, if bookable). Subject of → Maintenance Requests. Verified in → Audit Records. |
| **Lifecycle** | Registered (Available) → Allocated / Reserved / Under Maintenance → Lost / Retired → Disposed (terminal). See Asset Lifecycle section for full state machine. |
| **Ownership** | Asset Manager (registration, allocation). Current holder (operational custody). |

### Allocation

| Attribute | Detail |
|-----------|--------|
| **Purpose** | A record of an asset being assigned to a specific employee or department for a period of time. |
| **Key Attributes** | Asset (reference), Allocated To (Employee / Department), Allocated By (Asset Manager), Allocation Date, Expected Return Date (optional), Actual Return Date, Condition at Check-in, Status (Active / Returned / Overdue). |
| **Relationships** | References → Asset. References → Employee / Department. Triggers → Notifications. Feeds → Dashboard KPIs (Allocated, Upcoming Returns, Overdue). Generates → Activity Log entry. |
| **Lifecycle** | Created (Active) → Overdue (if past Expected Return Date) → Returned (closed). History is append-only. |
| **Ownership** | Asset Manager (creates). Employee (holds, returns). |

### Transfer Request

| Attribute | Detail |
|-----------|--------|
| **Purpose** | A formal request to move an already-allocated asset from one holder to another, bypassing the double-allocation block. |
| **Key Attributes** | Asset (reference), From (current holder — auto-populated), To (target employee), Reason (mandatory), Status (Requested / Approved / Rejected), Requested By, Approved/Rejected By, Timestamp. |
| **Relationships** | References → Asset. References → Allocation (current). References → Employees (from, to). Approved by → Asset Manager / Department Head. Triggers → Re-allocation on approval. Generates → Notifications. |
| **Lifecycle** | Requested → Approved → Re-allocated (new Allocation created) OR Requested → Rejected. Auto-cancelled if asset returned before approval. |
| **Ownership** | Requester (initiates). Asset Manager / Department Head (approves/rejects). |

### Booking

| Attribute | Detail |
|-----------|--------|
| **Purpose** | A time-slot reservation of a shared/bookable resource. |
| **Key Attributes** | Resource (Asset reference, must be bookable), Booked By (Employee), Date, Start Time, End Time, Status (Upcoming / Ongoing / Completed / Cancelled). |
| **Relationships** | References → Asset (bookable). References → Employee (booker). Validated against → Other Bookings (overlap check). Triggers → Notifications (confirmation, reminder, cancellation). Feeds → Dashboard KPIs (Active Bookings). |
| **Lifecycle** | Created (Upcoming) → Ongoing (at start time) → Completed (at end time) OR Cancelled (by user). Cancelled bookings retain records but free the time slot. |
| **Ownership** | Employee (creates, cancels). System (status transitions). |

### Maintenance Request

| Attribute | Detail |
|-----------|--------|
| **Purpose** | A formal request to repair or service an asset, routed through an approval workflow. |
| **Key Attributes** | Asset (reference), Reported By (Employee), Issue Description, Priority (Low / Medium / High / Critical), Photo (optional), Status (Pending / Approved / Rejected / Technician Assigned / In Progress / Resolved), Assigned Technician, Resolution Notes. |
| **Relationships** | References → Asset. Raised by → Employee. Approved by → Asset Manager. Assigned to → Technician (Employee). Transitions → Asset Lifecycle (Available ↔ Under Maintenance). Generates → Notifications at each stage. |
| **Lifecycle** | Pending → Approved (asset → Under Maintenance) → Technician Assigned → In Progress → Resolved (asset → previous state) OR Pending → Rejected (asset unchanged). |
| **Ownership** | Requester (raises). Asset Manager (approves/rejects, assigns technician). Technician (resolves). |

### Audit Cycle

| Attribute | Detail |
|-----------|--------|
| **Purpose** | A structured verification campaign to physically confirm the presence and condition of assets within a defined scope. |
| **Key Attributes** | Scope (Department / Location), Date Range (Start, End), Assigned Auditors (one or more Employees), Status (Open / Closed), Discrepancy Report (auto-generated). |
| **Relationships** | Scoped by → Department / Location. Assigned to → Employees (auditors). Contains → Audit Records (per asset). Generates → Discrepancy Report. Transitions → Asset statuses on closure (Missing → Lost). |
| **Lifecycle** | Created (Open) → Verification in progress → Closed (irreversible). Closure locks the cycle and all its records. |
| **Ownership** | Admin (creates, closes). Auditors (verify assets). |

### Audit Record

| Attribute | Detail |
|-----------|--------|
| **Purpose** | An individual verification entry within an Audit Cycle, representing one asset's audit result. |
| **Key Attributes** | Audit Cycle (reference), Asset (reference), Expected Location, Verification Status (Verified / Missing / Damaged), Auditor (Employee), Verification Timestamp. |
| **Relationships** | Belongs to → Audit Cycle. References → Asset. Verified by → Employee (auditor). Contributes to → Discrepancy Report (if Missing/Damaged). |
| **Lifecycle** | Created (pending verification) → Verified / Missing / Damaged. Locked when parent Audit Cycle is closed. |
| **Ownership** | Auditor (sets verification status). System (locks on cycle closure). |

### Notification

| Attribute | Detail |
|-----------|--------|
| **Purpose** | An in-app message delivered to users when system events occur. |
| **Key Attributes** | Recipient (Employee), Category (Alerts / Approvals / Bookings), Description, Timestamp, Read/Unread Status, Priority (Critical / High / Medium / Low), Source Event Reference. |
| **Relationships** | Delivered to → Employee. Triggered by → System events (allocation, transfer, booking, maintenance, audit, overdue). Categorized by → Notification Category. |
| **Lifecycle** | Created (Unread) → Read. Notifications are never deleted. |
| **Ownership** | System (generates). Recipient (reads). |

### Activity Log

| Attribute | Detail |
|-----------|--------|
| **Purpose** | An immutable audit trail of every action performed in the system. |
| **Key Attributes** | Actor (Employee), Action Type, Target Entity (Asset / Department / Employee / Booking / etc.), Description, Timestamp, IP Address (optional). |
| **Relationships** | References → Employee (actor). References → Target entity. Queryable by → Admin, Asset Manager. |
| **Lifecycle** | Created → Persists indefinitely. Append-only — never edited or deleted. |
| **Ownership** | System (generates). Admin (queries). |

---

## Cross-Module Dependency Map

### Module 1: Authentication

| Dimension | Detail |
|-----------|--------|
| **Depends On** | — (no upstream dependencies) |
| **Used By** | All modules (session validation gate) |
| **Produces** | Authenticated Session, User Profile with Role Context, Employee Record (on signup) |
| **Consumes** | Email, Password |
| **Critical Events** | Signup completed, Login successful, Login failed, Session expired, Password reset requested |
| **System Side Effects** | Employee record created on signup. Activity Log entry on every login/logout. Session token issued/invalidated. |

### Module 2: Dashboard

| Dimension | Detail |
|-----------|--------|
| **Depends On** | Authentication (session), Asset Registry (asset counts), Allocation & Transfer (allocated/overdue/return counts), Resource Booking (active bookings), Maintenance (under maintenance count), Transfer (pending transfers) |
| **Used By** | — (consumer endpoint, no downstream modules) |
| **Produces** | KPI card values, Overdue alert banner, Recent Activity feed |
| **Consumes** | Asset status counts, Allocation records, Booking records, Transfer request counts, Notification feed |
| **Critical Events** | Dashboard loaded, Quick action clicked |
| **System Side Effects** | None (read-only aggregation). |

### Module 3: Organization Setup

| Dimension | Detail |
|-----------|--------|
| **Depends On** | Authentication (Admin role validation) |
| **Used By** | Asset Registry (Category picklist, Department picklist), Allocation & Transfer (Department/Employee picklists), Audit (Department scope, Auditor assignment), Reports (department grouping) |
| **Produces** | Department records, Asset Category records, Employee role assignments, Picklist data for downstream modules |
| **Consumes** | Admin input (department, category, employee data) |
| **Critical Events** | Department created/edited/deactivated, Category created/edited, Employee promoted/deactivated |
| **System Side Effects** | Picklists updated in Screens 4 and 5. Notification generated on role promotion. Activity Log entry for every change. |

### Module 4: Asset Registry

| Dimension | Detail |
|-----------|--------|
| **Depends On** | Organization Setup (categories, departments), Authentication (Asset Manager role) |
| **Used By** | Allocation & Transfer (asset selection), Resource Booking (bookable assets), Maintenance (asset selection), Audit (asset checklist generation), Reports (utilization data), Dashboard (asset counts) |
| **Produces** | Asset records with auto-generated tags, Asset lifecycle status, Bookable resource pool |
| **Consumes** | Category picklist, Department picklist, Registration form data |
| **Critical Events** | Asset registered, Asset status changed, Bookable flag set/unset |
| **System Side Effects** | Auto-generated Asset Tag (AF-XXXX). Asset appears in downstream module selectors. Activity Log entry. |

### Module 5: Allocation & Transfer

| Dimension | Detail |
|-----------|--------|
| **Depends On** | Asset Registry (asset availability check), Organization Setup (employee/department lists), Authentication (Asset Manager / Department Head role) |
| **Used By** | Dashboard (allocated/overdue/return KPIs), Notifications (allocation/return/overdue events), Reports (utilization, department allocation), Audit (asset-holder verification) |
| **Produces** | Allocation records, Transfer Request records, Return records, Overdue flags, Asset status transitions (Available ↔ Allocated) |
| **Consumes** | Asset availability status, Employee/Department picklists, Expected Return Date |
| **Critical Events** | Asset allocated, Asset returned, Transfer requested, Transfer approved/rejected, Allocation overdue detected |
| **System Side Effects** | Asset status transitions. Allocation history appended. Overdue detection triggers Dashboard update + Notification. Pending transfer auto-cancelled on asset return. Activity Log entry. |

### Module 6: Resource Booking

| Dimension | Detail |
|-----------|--------|
| **Depends On** | Asset Registry (bookable flag, asset availability), Authentication (any authenticated user), Notifications (reminders) |
| **Used By** | Dashboard (active bookings KPI), Notifications (confirmation/reminder/cancellation), Reports (booking heatmap, most-used assets) |
| **Produces** | Booking records, Calendar entries, Booking status transitions |
| **Consumes** | Bookable asset list, Existing booking slots (for overlap validation), Date/Time input |
| **Critical Events** | Booking created, Booking cancelled, Booking rescheduled, Booking started (Ongoing), Booking completed, Overlap rejected |
| **System Side Effects** | Calendar updated. Reminder notification scheduled. Asset reserved during booking window. Activity Log entry. |

### Module 7: Maintenance

| Dimension | Detail |
|-----------|--------|
| **Depends On** | Asset Registry (asset selection, lifecycle status), Authentication (any user raises; Asset Manager approves), Notifications (stage transition alerts) |
| **Used By** | Dashboard (under maintenance KPI), Asset Registry (asset status update), Notifications (approval/rejection/resolution), Reports (maintenance frequency) |
| **Produces** | Maintenance Request records, Asset status transitions (→ Under Maintenance, → Available/Allocated), Maintenance history entries |
| **Consumes** | Asset reference, Issue description, Priority, Photo, Technician assignment |
| **Critical Events** | Request raised, Request approved, Request rejected, Technician assigned, Work started, Maintenance resolved |
| **System Side Effects** | Asset status transitions on approval/resolution. Maintenance history appended to asset. Kanban board updated. Notifications generated at each stage. Activity Log entry. |

### Module 8: Audit

| Dimension | Detail |
|-----------|--------|
| **Depends On** | Asset Registry (asset list within scope), Organization Setup (department scope, auditor assignment), Authentication (Admin role for create/close) |
| **Used By** | Asset Registry (status update on cycle closure: Missing → Lost), Dashboard (indirectly via asset status changes), Notifications (discrepancy flagged, cycle closed), Reports (audit data) |
| **Produces** | Audit Cycle records, Audit Record entries, Discrepancy Reports (auto-generated), Asset status transitions on closure |
| **Consumes** | Department/location scope, Date range, Auditor assignments, Per-asset verification input |
| **Critical Events** | Audit cycle created, Asset verified/flagged, Discrepancy report generated, Audit cycle closed (irreversible) |
| **System Side Effects** | Asset statuses updated on closure (Missing → Lost). Discrepancy report auto-generated. Cycle locked permanently. Notifications to Admin + auditors. Activity Log entry. |

### Module 9: Reports

| Dimension | Detail |
|-----------|--------|
| **Depends On** | Asset Registry (asset data), Allocation & Transfer (utilization data), Resource Booking (booking data), Maintenance (frequency data), Audit (discrepancy data), Organization Setup (department grouping), Authentication (role-based scoping) |
| **Used By** | — (consumer endpoint for analytics) |
| **Produces** | Charts (bar, line, heatmap), Ranked lists (most-used, idle), Due-for-maintenance list, Exportable report files |
| **Consumes** | Aggregated data from all operational modules |
| **Critical Events** | Report generated, Report exported |
| **System Side Effects** | Activity Log entry on export. |

### Module 10: Notifications

| Dimension | Detail |
|-----------|--------|
| **Depends On** | All modules (event sources), Authentication (recipient identification) |
| **Used By** | Dashboard (recent activity feed), All users (in-app notification center) |
| **Produces** | Notification entries, Activity Log entries |
| **Consumes** | System events from all modules |
| **Critical Events** | Notification created, Notification read |
| **System Side Effects** | Activity Log appended. Unread count updated. |

---

## Role Permission Matrix

This matrix is the **authoritative RBAC definition** for AssetFlow. Each cell indicates the permitted operations for the role on the given resource.

**Legend:** ✅ = Permitted | ❌ = Denied | 🔶 = Conditional (see footnotes)

### Create Permissions

| Resource | Admin | Asset Manager | Department Head | Employee |
|----------|-------|---------------|-----------------|----------|
| User Account (Signup) | ❌ ¹ | ❌ ¹ | ❌ ¹ | ✅ (self only) |
| Department | ✅ | ❌ | ❌ | ❌ |
| Asset Category | ✅ | ❌ | ❌ | ❌ |
| Employee Record | ✅ | ❌ | ❌ | ❌ |
| Asset | ❌ | ✅ | ❌ | ❌ |
| Allocation | ❌ | ✅ | ❌ | ❌ |
| Transfer Request | ❌ | ✅ | ✅ | ✅ |
| Booking | ✅ | ✅ | ✅ | ✅ |
| Maintenance Request | ✅ | ✅ | ✅ | ✅ |
| Audit Cycle | ✅ | ❌ | ❌ | ❌ |
| Report | ❌ ² | ❌ ² | ❌ ² | ❌ ² |

> ¹ Admin account is seeded at initialization (Assumption A11). No user can self-create an Admin account.  
> ² Reports are system-generated. Users can generate/export but not create report templates.

### Read Permissions

| Resource | Admin | Asset Manager | Department Head | Employee |
|----------|-------|---------------|-----------------|----------|
| Dashboard (KPIs) | ✅ (org-wide) | ✅ (org-wide) | ✅ (dept-scoped) | ✅ (self-scoped) |
| Departments | ✅ | ✅ (read-only) | ✅ (own dept) | ✅ (own dept) |
| Asset Categories | ✅ | ✅ | ✅ | ✅ |
| Employee Directory | ✅ | ✅ (read-only) | 🔶 (dept members) | ❌ ³ |
| Assets | ✅ (all) | ✅ (all) | ✅ (dept assets) | ✅ (own allocations) |
| Allocation History | ✅ (all) | ✅ (all) | ✅ (dept scope) | ✅ (own) |
| Transfer Requests | ✅ (all) | ✅ (all) | ✅ (dept scope) | ✅ (own) |
| Bookings | ✅ (all) | ✅ (all) | ✅ (dept scope) | ✅ (own) |
| Maintenance Requests | ✅ (all) | ✅ (all) | ✅ (dept scope) | ✅ (own) |
| Audit Cycles | ✅ (all) | ✅ (all) | 🔶 (dept scope) | ❌ |
| Reports | ✅ (all) | ✅ (all) | ✅ (dept-scoped) | ❌ |
| Notifications | ✅ (all) | ✅ (own) | ✅ (own) | ✅ (own) |
| Activity Logs | ✅ (all) | ✅ (all) | ❌ | ❌ |

> ³ Employees can see colleagues' names in booking/allocation contexts but cannot browse the full Employee Directory.

### Update Permissions

| Resource | Admin | Asset Manager | Department Head | Employee |
|----------|-------|---------------|-----------------|----------|
| Department | ✅ (edit/deactivate) | ❌ | ❌ | ❌ |
| Asset Category | ✅ (edit) | ❌ | ❌ | ❌ |
| Employee Status/Role | ✅ (promote/deactivate) | ❌ | ❌ | ❌ |
| Asset Details | ❌ | ✅ | ❌ | ❌ |
| Asset Status | ❌ | ✅ (retire/dispose) | ❌ | ❌ |
| Booking (cancel/reschedule) | ✅ (own) | ✅ (own) | ✅ (own) | ✅ (own) |
| Maintenance Request (reassign tech) | ❌ | ✅ | ❌ | ❌ |

### Approve / Reject Permissions

| Resource | Admin | Asset Manager | Department Head | Employee |
|----------|-------|---------------|-----------------|----------|
| Transfer Request | ❌ | ✅ | 🔶 (intra-dept) | ❌ |
| Maintenance Request | ❌ | ✅ | ❌ | ❌ |
| Asset Return | ❌ | ✅ | ❌ | ❌ |
| Audit Discrepancy Resolution | ❌ | ✅ | ❌ | ❌ |

### Delete Permissions

| Resource | Admin | Asset Manager | Department Head | Employee |
|----------|-------|---------------|-----------------|----------|
| Department | ❌ ⁴ | ❌ | ❌ | ❌ |
| Asset Category | ❌ ⁴ | ❌ | ❌ | ❌ |
| Employee | ❌ ⁴ | ❌ | ❌ | ❌ |
| Asset | ❌ ⁴ | ❌ ⁴ | ❌ | ❌ |
| Booking | ❌ ⁵ | ❌ ⁵ | ❌ ⁵ | ❌ ⁵ |
| Audit Cycle (closed) | ❌ | ❌ | ❌ | ❌ |
| Activity Log | ❌ | ❌ | ❌ | ❌ |
| Notification | ❌ | ❌ | ❌ | ❌ |

> ⁴ Soft-delete via deactivation/disposal; hard deletion is not supported per Functional Invariant #17 (history is append-only).  
> ⁵ Bookings are cancelled, not deleted. Records are retained per business rules.

### Special Permissions

| Permission | Admin | Asset Manager | Department Head | Employee |
|------------|-------|---------------|-----------------|----------|
| Promote Employee Role | ✅ | ❌ | ❌ | ❌ |
| Close Audit Cycle | ✅ | ❌ | ❌ | ❌ |
| Export Reports | ✅ | ✅ | ✅ | ❌ |
| Assign Auditors | ✅ | ❌ | ❌ | ❌ |
| Assign Technician | ❌ | ✅ | ❌ | ❌ |
| View Org-wide Analytics | ✅ | ✅ | ❌ | ❌ |
| Access Organization Setup | ✅ | ❌ | ❌ | ❌ |

---

## Non-Functional Requirements

### NFR-01: Performance

| Requirement | Target |
|-------------|--------|
| Dashboard page load (including KPI computation) | ≤ 2 seconds |
| Asset search results returned | ≤ 1 second for up to 10,000 assets |
| Booking overlap validation | ≤ 500 milliseconds |
| Report generation | ≤ 5 seconds for standard reports |
| API response time (95th percentile) | ≤ 500 milliseconds |

### NFR-02: Scalability

| Requirement | Target |
|-------------|--------|
| Concurrent users | Support at least 100 simultaneous users |
| Asset volume | System must function correctly with up to 50,000 assets |
| Booking volume | Handle up to 1,000 bookings per day without degradation |
| Notification throughput | Deliver up to 500 notifications per minute |

### NFR-03: Availability

| Requirement | Target |
|-------------|--------|
| Uptime target | 99.5% availability during business hours |
| Planned maintenance windows | Outside business hours with advance notification |
| Graceful degradation | Non-critical features (reports, analytics) degrade gracefully; core workflows (allocation, booking) remain available |

### NFR-04: Reliability

| Requirement | Target |
|-------------|--------|
| Data consistency | All state transitions must be atomic — no partial updates |
| Booking conflict detection | 100% accuracy — zero false negatives |
| Allocation conflict detection | 100% accuracy — zero double-allocations |
| Audit cycle closure | Irreversible — no rollback mechanism once committed |

### NFR-05: Auditability

| Requirement | Target |
|-------------|--------|
| Activity logging | Every create, update, delete, approve, reject, and status-change action is logged with actor, action, target, timestamp |
| Log immutability | Activity logs are append-only — no modification or deletion |
| Log retention | All logs retained indefinitely within the application lifecycle |
| Traceability | Every asset status change traceable to the originating action and actor |

### NFR-06: Maintainability

| Requirement | Target |
|-------------|--------|
| Modular architecture | Each functional module (Authentication, Assets, Booking, etc.) is independently maintainable |
| Code reusability | Shared components (validation, notification dispatch, role checks) are extracted into reusable modules |
| Consistent patterns | All modules follow the same architectural patterns for routing, validation, error handling, and response formatting |

### NFR-07: Security

| Requirement | Target |
|-------------|--------|
| Authentication | All routes (except login/signup) require valid session/token |
| Authorization | Every API endpoint validates the caller's role before executing |
| Password storage | Passwords must be hashed — never stored in plaintext |
| Input validation | All user inputs are sanitized and validated server-side |
| CSRF protection | State-changing requests protected against cross-site request forgery |
| No self-elevation | No user can escalate their own role through any pathway |

### NFR-08: Accessibility

| Requirement | Target |
|-------------|--------|
| Keyboard navigation | All interactive elements are keyboard-accessible |
| Screen reader support | Semantic HTML with appropriate ARIA labels |
| Color contrast | Meet WCAG 2.1 AA contrast ratios |
| Error messaging | All errors communicated textually, not solely through color |

### NFR-09: Responsiveness

| Requirement | Target |
|-------------|--------|
| Target devices | Desktop browsers (Chrome, Firefox, Edge, Safari) |
| Responsive design | UI adapts to viewports from 1024px to 1920px+ |
| Mobile-responsive (stretch) | Functional (not optimized) on tablets ≥ 768px |

### NFR-10: Data Integrity

| Requirement | Target |
|-------------|--------|
| Referential integrity | No orphaned allocations, bookings, or maintenance requests |
| Uniqueness constraints | Asset Tags, Serial Numbers, Employee Emails, Department Names, Category Names enforced at the application and persistence layer |
| State consistency | An asset's lifecycle status always reflects the most recent valid transition |
| History immutability | Allocation, maintenance, and audit history records are never modified or deleted |

### NFR-11: Backup & Recovery

| Requirement | Target |
|-------------|--------|
| Data backup | Application data should support regular backup mechanisms |
| Recovery | System should be recoverable to a consistent state from the most recent backup |
| Data export | Admin should be able to export critical data (assets, allocations, reports) for offline backup |

### NFR-12: Logging

| Requirement | Target |
|-------------|--------|
| Application logging | Server-side errors, warnings, and info events logged with timestamps |
| Request logging | All API requests logged with method, path, status code, response time |
| Error tracking | Unhandled exceptions captured with full stack trace |

### NFR-13: Validation

| Requirement | Target |
|-------------|--------|
| Client-side validation | Immediate feedback on form fields (email format, required fields, date ranges) |
| Server-side validation | All business rules re-validated server-side — client-side validation is not trusted |
| Error messages | Human-readable, actionable error messages returned for all validation failures |

### NFR-14: Session Management

| Requirement | Target |
|-------------|--------|
| Session timeout | Sessions expire after a configurable period of inactivity |
| Session invalidation | Logout explicitly invalidates the session/token |
| Concurrent sessions | Users may have multiple active sessions (e.g., different browsers) |
| Session persistence | Session survives page refresh but not browser close (unless "remember me" is implemented) |

---

## Success Metrics

| Metric ID | Metric | Target | Measurement Method |
|-----------|--------|--------|-------------------|
| SM-01 | Dashboard Load Time | ≤ 2 seconds (p95) | Measure server response + client render time for Dashboard with 6 KPI cards |
| SM-02 | Asset Search Response Time | ≤ 1 second (p95) | Measure search query execution time with up to 10,000 asset records |
| SM-03 | Booking Conflict Detection Accuracy | 100% — zero false negatives | Automated test suite: submit 1,000 overlapping booking attempts; verify all rejected |
| SM-04 | Allocation Conflict Detection Accuracy | 100% — zero double-allocations | Automated test suite: attempt concurrent allocations of same asset; verify all blocked |
| SM-05 | Audit Completion Accuracy | 100% of scope-matched assets appear in checklist | Verify audit cycle checklist against actual assets in scoped department/location |
| SM-06 | Notification Delivery Rate | 100% of triggered events produce a notification | Count system events vs. notification records; delta must be zero |
| SM-07 | Average API Response Time | ≤ 500ms (p95) | Monitor all API endpoints under standard load |
| SM-08 | Data Integrity Score | Zero orphaned records, zero state inconsistencies | Periodic validation query: check all asset statuses match latest transition log |
| SM-09 | Role Enforcement Accuracy | 100% — zero unauthorized actions | Penetration testing: attempt every API endpoint with each role; verify all unauthorized calls rejected |
| SM-10 | Overdue Detection Latency | ≤ 1 minute from Expected Return Date passing | Verify time between Expected Return Date and overdue notification generation |
| SM-11 | Hackathon Demo Success | All 10 screens demonstrable with working workflows | End-to-end walkthrough: signup → allocate → book → maintain → audit → reports → notifications |

---

## Notification Priority Model

### Priority Levels

| Priority | Definition | Delivery Timing | Persistence |
|----------|-----------|-----------------|-------------|
| **Critical** | Requires immediate attention; data integrity or compliance impact | Immediate (real-time) | Persisted indefinitely; never auto-dismissed |
| **High** | Requires attention within the current work session; workflow-blocking | Immediate (real-time) | Persisted until read; retained in history |
| **Medium** | Informational update relevant to the user's active workflows | Immediate (real-time) | Persisted until read; retained in history |
| **Low** | Informational; no action required | Batched or real-time | Persisted until read; retained in history |

### Notification Type → Priority Mapping

| Notification Type | Priority | Recipients | Delivery Timing | Persistence |
|-------------------|----------|-----------|-----------------|-------------|
| Overdue return alert | **Critical** | Employee (holder), Asset Manager, Department Head | Immediate; daily repeat until resolved | Persisted indefinitely |
| Audit discrepancy flagged (Missing) | **Critical** | Admin, Asset Manager | Immediate | Persisted indefinitely |
| Audit discrepancy flagged (Damaged) | **High** | Admin, Asset Manager | Immediate | Persisted until read |
| Maintenance request approved | **High** | Requester, Assigned Technician | Immediate | Persisted until read |
| Maintenance request rejected | **High** | Requester | Immediate | Persisted until read |
| Transfer approved | **High** | Requester, From-employee, To-employee | Immediate | Persisted until read |
| Transfer rejected | **High** | Requester | Immediate | Persisted until read |
| Transfer requested | **High** | Asset Manager, Department Head | Immediate | Persisted until read |
| Maintenance request raised | **High** | Asset Manager | Immediate | Persisted until read |
| Asset allocated to employee | **Medium** | Employee (assignee), Asset Manager | Immediate | Persisted until read |
| Asset returned | **Medium** | Asset Manager, Previous holder | Immediate | Persisted until read |
| Maintenance resolved | **Medium** | Requester, Asset Manager | Immediate | Persisted until read |
| Booking confirmed | **Medium** | Booker | Immediate | Persisted until read |
| Booking cancelled | **Medium** | Booker, Affected parties | Immediate | Persisted until read |
| Audit cycle closed | **Medium** | Admin, Assigned auditors | Immediate | Persisted until read |
| Role promotion | **Medium** | Promoted employee | Immediate | Persisted until read |
| Booking reminder (before slot) | **Low** | Booker | Scheduled (configurable lead time before slot start) | Persisted until read |

---

## State Ownership Matrix

This matrix documents the ownership, authorization, and side-effect chain for every important state transition in the system.

### Asset Lifecycle Transitions

#### Available → Allocated

| Dimension | Detail |
|-----------|--------|
| **Initiated By** | Asset Manager |
| **Approved By** | System (automatic — if asset is Available and target is valid) |
| **Owned By** | Asset Manager (transition), Employee/Department (post-transition custody) |
| **Automatic System Actions** | Asset status updated to Allocated. Allocation record created. Expected Return Date tracking initiated (if set). |
| **Notifications Generated** | Employee (assignee): "Asset [Tag] assigned to you." Asset Manager: confirmation log. |
| **Audit Log Entry** | "Asset [Tag] allocated to [Employee/Dept] by [Asset Manager] at [timestamp]." |

#### Allocated → Available (Return)

| Dimension | Detail |
|-----------|--------|
| **Initiated By** | Employee (submits return) |
| **Approved By** | Asset Manager (accepts return with condition check-in notes) |
| **Owned By** | Asset Manager (transition) |
| **Automatic System Actions** | Asset status updated to Available. Allocation record closed with return date and condition notes. Pending transfer requests for this asset auto-cancelled. |
| **Notifications Generated** | Asset Manager: "Asset [Tag] returned by [Employee]." Previous holder: confirmation. |
| **Audit Log Entry** | "Asset [Tag] returned by [Employee], condition: [notes], approved by [Asset Manager] at [timestamp]." |

#### Available → Under Maintenance

| Dimension | Detail |
|-----------|--------|
| **Initiated By** | Any user (raises maintenance request) |
| **Approved By** | Asset Manager (approves maintenance request) |
| **Owned By** | Asset Manager (approval), Technician (execution) |
| **Automatic System Actions** | Asset status updated to Under Maintenance. Maintenance request status updated to Approved. |
| **Notifications Generated** | Requester: "Maintenance request [ID] approved." Technician (when assigned): "You have been assigned to [Asset Tag]." |
| **Audit Log Entry** | "Maintenance request [ID] for asset [Tag] approved by [Asset Manager] at [timestamp]. Asset status → Under Maintenance." |

#### Allocated → Under Maintenance

| Dimension | Detail |
|-----------|--------|
| **Initiated By** | Any user (raises maintenance request for an allocated asset) |
| **Approved By** | Asset Manager |
| **Owned By** | Asset Manager (approval), Technician (execution), Original holder retains logical allocation |
| **Automatic System Actions** | Asset status updated to Under Maintenance. Previous state (Allocated) recorded for reversion upon resolution. |
| **Notifications Generated** | Requester: "Maintenance approved." Current holder: "Asset [Tag] moved to maintenance." Asset Manager: confirmation. |
| **Audit Log Entry** | "Asset [Tag] (allocated to [Employee]) moved to Under Maintenance. Maintenance request [ID] approved by [Asset Manager]." |

#### Under Maintenance → Available / Allocated (Resolution)

| Dimension | Detail |
|-----------|--------|
| **Initiated By** | Technician (marks as resolved) |
| **Approved By** | System (automatic upon resolution) |
| **Owned By** | Asset Manager (oversight) |
| **Automatic System Actions** | Asset status reverts to previous state (Available if was Available; Allocated if was Allocated). Maintenance request status → Resolved. Maintenance history entry appended. |
| **Notifications Generated** | Requester: "Maintenance [ID] resolved." Asset Manager: "Asset [Tag] maintenance completed." |
| **Audit Log Entry** | "Maintenance request [ID] resolved. Asset [Tag] status → [Available/Allocated] at [timestamp]." |

#### Available → Reserved (Booking)

| Dimension | Detail |
|-----------|--------|
| **Initiated By** | Any authenticated user |
| **Approved By** | System (automatic — overlap check passes) |
| **Owned By** | Booker (booking holder) |
| **Automatic System Actions** | Booking record created with status Upcoming. Overlap validation executed. Calendar updated. Reminder notification scheduled. |
| **Notifications Generated** | Booker: "Booking confirmed: [Resource] [Date] [Time]." |
| **Audit Log Entry** | "Booking created by [Employee] for [Resource] on [Date] [Start]–[End]." |

#### Lost → Available (Recovery)

| Dimension | Detail |
|-----------|--------|
| **Initiated By** | Asset Manager (upon physical recovery of the asset) |
| **Approved By** | Admin / Asset Manager |
| **Owned By** | Asset Manager |
| **Automatic System Actions** | Asset status updated to Available. Asset record updated with recovery details. |
| **Notifications Generated** | Admin: "Asset [Tag] recovered and marked Available." |
| **Audit Log Entry** | "Asset [Tag] recovered from Lost status by [Asset Manager] at [timestamp]." |

### Transfer Request Transitions

#### Requested → Approved

| Dimension | Detail |
|-----------|--------|
| **Initiated By** | Any user (submits transfer request) |
| **Approved By** | Asset Manager or Department Head (intra-department) |
| **Owned By** | Approver |
| **Automatic System Actions** | Asset re-allocated to new holder. Previous allocation closed. New allocation record created. History updated. |
| **Notifications Generated** | Requester: "Transfer approved." From-employee: "Asset [Tag] transferred from you." To-employee: "Asset [Tag] assigned to you." |
| **Audit Log Entry** | "Transfer request [ID] approved by [Approver]. Asset [Tag] moved from [From] to [To]." |

### Audit Cycle Transitions

#### Open → Closed

| Dimension | Detail |
|-----------|--------|
| **Initiated By** | Admin |
| **Approved By** | System (validates all assets verified) |
| **Owned By** | Admin |
| **Automatic System Actions** | Cycle locked (irreversible). Missing assets → Lost status. Discrepancy report finalized. All audit records frozen. |
| **Notifications Generated** | Admin: "Audit cycle [ID] closed." Auditors: "Audit cycle [ID] you participated in has been closed." Discrepancy notifications for Missing/Damaged assets. |
| **Audit Log Entry** | "Audit cycle [ID] closed by [Admin] at [timestamp]. [N] assets flagged. [M] assets marked Lost." |

### Maintenance Request Transitions

#### Pending → Rejected

| Dimension | Detail |
|-----------|--------|
| **Initiated By** | Requester (original submission) |
| **Approved By** | Asset Manager (rejects) |
| **Owned By** | Asset Manager |
| **Automatic System Actions** | Maintenance request status → Rejected. Asset status unchanged. |
| **Notifications Generated** | Requester: "Maintenance request [ID] rejected. Reason: [reason]." |
| **Audit Log Entry** | "Maintenance request [ID] rejected by [Asset Manager] at [timestamp]. Reason: [reason]." |

---

## Glossary

| Term | Definition |
|------|-----------|
| **Acquisition Cost** | The original purchase price of an asset. Tracked for reporting and ranking purposes only — not linked to accounting, invoicing, or depreciation. |
| **Activity Log** | An immutable, append-only record of every action performed in the system. Captures who performed the action, what was changed, and when. |
| **Admin** | The highest-privilege role in AssetFlow. Manages organization setup (departments, categories, employees), promotes roles, creates/closes audit cycles, and views organization-wide analytics. Cannot be self-assigned. |
| **Allocation** | The act of assigning a specific asset to an employee or department. Creates an Allocation record and transitions the asset to "Allocated" status. |
| **Asset** | Any physical item tracked by the organization — equipment, furniture, vehicles, rooms, or shared resources. Each asset has a unique auto-generated Asset Tag. |
| **Asset Category** | A classification grouping for assets (e.g., Electronics, Furniture, Vehicles). Defined in Organization Setup and used for filtering, reporting, and optional category-specific fields. |
| **Asset Manager** | A promoted role responsible for registering assets, performing allocations, approving transfers and maintenance requests, and managing asset returns. |
| **Asset Tag** | A unique, system-generated identifier for each asset in the format AF-XXXX (e.g., AF-0001). Auto-incremented on registration. |
| **Audit Cycle** | A structured verification campaign scoped to a department or location over a date range, with assigned auditors who verify each asset's presence and condition. |
| **Audit Record** | An individual entry within an Audit Cycle representing one asset's verification result: Verified, Missing, or Damaged. |
| **Bookable Asset** | An asset flagged as "Shared/Bookable" during registration, making it available for time-slot booking by any authenticated user. |
| **Booking** | A time-slot reservation of a shared/bookable resource. Validated against existing bookings for overlap. Statuses: Upcoming, Ongoing, Completed, Cancelled. |
| **Condition Check-in Notes** | Free-text notes captured when an asset is returned, describing the asset's physical condition at the time of return. |
| **Department** | An organizational unit within the organization. Supports hierarchy via optional Parent Department. Has an assigned Head and Active/Inactive status. |
| **Department Head** | A promoted role with visibility into their department's assets and the authority to approve intra-department transfers and book resources on behalf of the department. |
| **Discrepancy Report** | An automatically generated report listing all assets marked as Missing or Damaged during an Audit Cycle. Cannot be manually created — system-generated only. |
| **Disposed** | A terminal lifecycle state indicating an asset has been permanently removed from the organization's inventory. No transitions out of this state are possible. |
| **Employee** | The default user role in AssetFlow, assigned automatically on signup. Can view own allocations, book shared resources, raise maintenance requests, and initiate returns/transfers. |
| **Expected Return Date** | An optional date set during asset allocation indicating when the asset is expected to be returned. Enables overdue detection and alerting. |
| **Lifecycle Status** | One of seven mutually exclusive states an asset can be in: Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed. |
| **Lost** | A lifecycle state indicating an asset has been confirmed missing during an audit cycle closure. Can be recovered (→ Available) or written off (→ Disposed). |
| **Maintenance Request** | A formal request to repair or service an asset. Routed through an approval workflow: Pending → Approved/Rejected → Technician Assigned → In Progress → Resolved. |
| **Notification** | An in-app message generated by system events (allocations, approvals, bookings, overdue alerts, audit flags). Categorized as Alerts, Approvals, or Bookings. |
| **Organization** | The top-level entity representing the company or institution. All departments, employees, and assets exist within this context. |
| **Overlap Validation** | The system check that prevents two bookings for the same resource from having overlapping time ranges. Formula: `new_start < existing_end AND new_end > existing_start`. |
| **Overdue Allocation** | An allocation where the current date has passed the Expected Return Date and the asset has not been returned. Auto-flagged on Dashboard and Notifications. |
| **Parent Department** | An optional hierarchical reference from one department to another, enabling organizational tree structures. Circular references are prohibited. |
| **Picklist** | A dropdown selection populated from master data (departments, categories, employees). Changes in Organization Setup propagate to picklists in Screens 4 and 5. |
| **Priority** | The urgency level of a maintenance request: Low, Medium, High, or Critical. Set by the requester at submission time. |
| **Reserved** | A lifecycle state indicating an asset is temporarily held for an upcoming booking or pre-allocation hold. |
| **Retired** | A lifecycle state indicating an asset has reached end-of-life. No longer available for allocation or booking, but retained in historical records. Can transition only to Disposed. |
| **Role Promotion** | The act of elevating an Employee to Department Head or Asset Manager. Performed exclusively by Admin through the Employee Directory (Organization Setup, Screen 3 Tab C). |
| **Serial Number** | A manufacturer-assigned identifier for an asset. Unique within the system when provided. |
| **Session** | An authenticated user session created upon successful login. Required for access to all screens beyond login/signup. Subject to timeout and explicit invalidation. |
| **Shared Resource** | An asset marked with the "Shared/Bookable" flag, making it available for time-slot booking rather than exclusive allocation. |
| **Transfer Request** | A formal request to reassign an already-allocated asset from one holder to another. Required because direct re-allocation is blocked (double-allocation prevention). |
| **Under Maintenance** | A lifecycle state indicating an asset is undergoing approved repair work. Entered only after a maintenance request is approved. Reverts to previous state upon resolution. |

---

## Authentication Assumptions

> **Context:** These assumptions define implementation-level details suitable for a MERN (MongoDB, Express.js, React, Node.js) stack. They are inferred from the PRD's functional requirements and do not alter any business rules.

### JWT (JSON Web Tokens)

| Aspect | Assumption |
|--------|-----------|
| Token type | JWT issued upon successful login. Encodes user ID, email, and role. |
| Token storage | Stored in an HTTP-only, secure cookie (preferred) or local storage (with XSS mitigation). |
| Token expiry | Access token expires after a configurable period (e.g., 1 hour). Refresh token with longer expiry (e.g., 7 days). |
| Token refresh | Silent refresh mechanism to extend sessions without re-authentication. |
| Token invalidation | Logout invalidates the refresh token. Access tokens are short-lived and naturally expire. |
| Token payload | Contains: `userId`, `email`, `role`, `departmentId`, `iat`, `exp`. |

### Password Hashing

| Aspect | Assumption |
|--------|-----------|
| Hashing algorithm | bcrypt with a minimum cost factor of 10. |
| Salt | Unique salt per password, automatically managed by bcrypt. |
| Plaintext storage | Never — passwords are never stored, logged, or transmitted in plaintext. |
| Password complexity | Minimum 8 characters, at least one uppercase, one lowercase, one digit, one special character. |
| Password comparison | bcrypt.compare() used for login — never raw string comparison. |

### Session Timeout

| Aspect | Assumption |
|--------|-----------|
| Inactivity timeout | Session expires after 30 minutes of inactivity (configurable). |
| Absolute timeout | Session expires after 8 hours regardless of activity (configurable). |
| Timeout behavior | User redirected to login screen. Original intended destination preserved for post-login redirect. |
| Concurrent sessions | Multiple sessions allowed (different browsers/devices). |

### Password Reset

| Aspect | Assumption |
|--------|-----------|
| Reset mechanism | Time-limited reset token sent to the user's registered email. |
| Token expiry | Reset token expires after 1 hour. |
| Token single-use | Reset token invalidated after use — cannot be reused. |
| Security | No indication of whether the email exists in the system (prevents enumeration). Generic success message shown. |
| Post-reset | All existing sessions invalidated after password change. |

### Email Uniqueness

| Aspect | Assumption |
|--------|-----------|
| Enforcement | Email uniqueness enforced at both application and database layer. |
| Case sensitivity | Emails are stored and compared in lowercase to prevent case-variant duplicates. |
| Signup validation | Duplicate email check performed before account creation; rejected with "Email already in use." |

### Authorization Middleware

| Aspect | Assumption |
|--------|-----------|
| Authentication middleware | Applied to all routes except `/login`, `/signup`, `/forgot-password`, and `/reset-password`. Validates JWT token presence and validity. |
| Role extraction | User role extracted from JWT payload and attached to the request context. |
| Token verification | Verifies JWT signature, expiry, and issuer. Rejects tampered or expired tokens with 401 Unauthorized. |

### Role Middleware

| Aspect | Assumption |
|--------|-----------|
| Role-based route guards | Middleware function accepts a list of permitted roles and rejects requests from unauthorized roles with 403 Forbidden. |
| Granular permissions | Role middleware checks are applied per-route (not globally) to enforce the Role Permission Matrix. |
| Admin-only routes | Organization Setup endpoints restricted to Admin role only. |
| Asset Manager routes | Asset registration, allocation, maintenance approval endpoints restricted to Asset Manager (and Admin where applicable). |
| Department-scoped access | Department Head queries are automatically scoped to their department ID. |
| Employee-scoped access | Employee queries are automatically scoped to their own user ID. |

---

*This document is the single source of truth for all subsequent design, architecture, and implementation documents for the AssetFlow project.*

