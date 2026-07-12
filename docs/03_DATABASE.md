# 03. Database Architecture

> **Version:** 1.1  
> **Status:** Draft — Pending Approval  
> **Source:** Derived strictly from `00_PRD.md`, `01_DOMAIN_MODEL.md`, and `02_SYSTEM_ARCHITECTURE.md`.

## 1. Database Philosophy

MongoDB is the ideal database for the AssetFlow ERP system because its document-oriented nature aligns perfectly with Domain-Driven Design (DDD) Aggregates. 

* **Document Database & Aggregate Design:** In DDD, an Aggregate is a transaction boundary. MongoDB allows us to store an Aggregate (like an Asset or an Organization) as a single document, ensuring atomic updates without complex multi-table joins.
* **Flexibility:** Asset Categories often require custom fields. A schema-less (or flexible schema) database allows for storing polymorphic asset attributes cleanly.
* **Read Patterns:** AssetFlow is read-heavy (Dashboards, Audit Checklists, Asset Registries). MongoDB's capability to embed related data and use powerful Aggregation Pipelines makes generating complex views highly efficient.
* **Append-only History:** The requirement for immutable audit trails (Allocations, Maintenance, Audits) fits naturally into time-series-like collections where documents are inserted but never updated or deleted.
* **Scalability:** Horizontal scaling via sharding ensures that as the organization grows (accumulating thousands of historical records and activity logs), the database can scale seamlessly.

## 2. Collection Design

The logical collections map directly to the Bounded Contexts and Aggregates defined in the Domain Model.

### `organizations`
* **Purpose:** Stores the root tenant configuration.
* **Ownership:** Organization Context.
* **Primary Identifier:** `_id` (ObjectId)
* **Lifecycle:** Created once, rarely updated, never deleted.
* **Relationships:** Parent to Departments and Asset Categories.

### `departments`
* **Purpose:** Represents organizational units.
* **Ownership:** Organization Context.
* **Primary Identifier:** `_id` (ObjectId)
* **Lifecycle:** Created by Admin, can be deactivated.
* **Relationships:** References `organizationId`. Referenced by Employees and Assets.

### `employees`
* **Purpose:** Stores user identities and roles.
* **Ownership:** Organization Context.
* **Primary Identifier:** `_id` (ObjectId)
* **Lifecycle:** Created via signup/admin, updated by Admin, deactivated.
* **Relationships:** References `departmentId`.

### `assetCategories`
* **Purpose:** Defines classification and custom field schemas for assets.
* **Ownership:** Organization Context.
* **Primary Identifier:** `_id` (ObjectId)
* **Lifecycle:** Created/Updated by Admin.
* **Relationships:** References `organizationId`.

### `assets`
* **Purpose:** The core physical registry.
* **Ownership:** Asset Lifecycle Context.
* **Primary Identifier:** `_id` (ObjectId), globally unique `assetTag`.
* **Lifecycle:** Registered → Stateful Transitions → Disposed.
* **Relationships:** References `categoryId`, `departmentId`.

### `allocations`
* **Purpose:** Tracks current and historical custody of assets.
* **Ownership:** Custody Context.
* **Primary Identifier:** `_id` (ObjectId)
* **Lifecycle:** Created upon assignment, closed upon return. Append-only history.
* **Relationships:** References `assetId`, `assignedTo` (EmployeeId), `departmentId`.

### `bookings`
* **Purpose:** Manages time-slot reservations.
* **Ownership:** Booking Context.
* **Primary Identifier:** `_id` (ObjectId)
* **Lifecycle:** Created → Ongoing → Completed/Cancelled.
* **Relationships:** References `assetId`, `bookedBy` (EmployeeId).

### `maintenanceRequests`
* **Purpose:** Tracks repair workflows.
* **Ownership:** Maintenance Context.
* **Primary Identifier:** `_id` (ObjectId)
* **Lifecycle:** Raised → Approved → Resolved/Rejected.
* **Relationships:** References `assetId`, `requestedBy`, `assignedTechnician`.

### `auditCycles`
* **Purpose:** Defines the temporal and physical scope of an audit.
* **Ownership:** Audit Context.
* **Primary Identifier:** `_id` (ObjectId)
* **Lifecycle:** Opened → Closed (Irreversible).
* **Relationships:** References `departmentId` (Scope).

### `auditRecords`
* **Purpose:** Individual verification checkpoints per asset during an audit.
* **Ownership:** Audit Context (Composition of Audit Cycle).
* **Primary Identifier:** `_id` (ObjectId)
* **Lifecycle:** Created with Cycle, updated during cycle, locked upon closure.
* **Relationships:** References `auditCycleId`, `assetId`, `verifiedBy`.

### `transferRequests`
* **Purpose:** Manages the workflow of handing over custody of an asset.
* **Ownership:** Custody Context.
* **Primary Identifier:** `_id` (ObjectId)
* **Lifecycle:** Requested → Approved/Rejected.
* **Relationships:** References `assetId`, `targetEmployeeId`, `requestedBy`.

### `notifications`
* **Purpose:** System alerts for users.
* **Ownership:** System/User Context.
* **Primary Identifier:** `_id` (ObjectId)
* **Lifecycle:** Created by system events, marked read by user.
* **Relationships:** References `userId` (Recipient).

### `activityLogs`
* **Purpose:** Immutable system-wide audit trail.
* **Ownership:** System Context.
* **Primary Identifier:** `_id` (ObjectId)
* **Lifecycle:** Insert-only.
* **Relationships:** References `actorId` (Employee), `targetId` (Any Entity).

## 3. Document Design

*(Note: Data types and exact schemas are omitted per constraints; focus is on logical structure.)*

### `assets`
* **Required Fields:** `assetTag`, `name`, `status`, `condition`.
* **Optional Fields:** `serialNumber`, `acquisitionDate`, `acquisitionCost`, `location`.
* **Immutable Fields:** `assetTag`, `serialNumber` (once set).
* **Mutable Fields:** `status`, `condition`, `location`.
* **Derived Fields:** `isOverdue` (Computed at runtime based on active allocations).
* **Business Meaning:** Represents the physical existence and current state of a trackable item.

### `allocations`
* **Required Fields:** `assetId`, `assignedTo`, `allocationDate`, `expectedReturnDate`, `status`.
* **Optional Fields:** `actualReturnDate`, `checkoutNotes`, `checkinNotes`.
* **Immutable Fields:** `assetId`, `allocationDate`.
* **Mutable Fields:** `status`, `actualReturnDate`, `checkinNotes`.
* **Business Meaning:** Proof of custody and accountability over a specific timeframe.

### `bookings`
* **Required Fields:** `assetId`, `bookedBy`, `startDate`, `endDate`, `status`.
* **Immutable Fields:** `assetId`, `bookedBy`.
* **Mutable Fields:** `status`, `startDate`, `endDate` (if rescheduled).
* **Business Meaning:** A guaranteed future reservation of a shared resource.

### `transferRequests`
* **Required Fields:** `assetId`, `requestedBy`, `targetEmployeeId`, `status`, `reason`.
* **Optional Fields:** `rejectionReason`.
* **Immutable Fields:** `assetId`, `requestedBy`, `targetEmployeeId`.
* **Mutable Fields:** `status`, `rejectionReason`.
* **Derived Fields:** None.
* **Business Meaning:** Formal request to transfer physical custody of an allocated asset.

## 4. Reference Strategy

* **Reference (Normalization):** Used universally for bridging Bounded Contexts (e.g., `Allocation` references `Employee`). 
  * *Why:* Employees and Assets have independent lifecycles. Updating an Employee's name should not require updating thousands of historical Allocation documents.
* **Embedding:** Used for highly coupled Value Objects (e.g., `ConditionNotes` inside a `MaintenanceRequest`, or custom fields inside an `Asset`).
  * *Why:* These fields have no independent identity and are always read alongside their parent document.
* **Composition vs. Aggregation:** `AuditRecord` references `AuditCycle` (Aggregation structurally), but conceptually it is Composition. They are stored in separate collections because a single cycle might generate 10,000 records, which would breach MongoDB's 16MB document limit if embedded as an array inside `auditCycles`.

## 5. Index Strategy

Indexes are crucial for read performance and business invariant enforcement.

* **Unique Indexes:**
  * `assets.assetTag` (Enforces PRD invariant: globally unique tags).
  * `assets.serialNumber` (Sparse, Unique).
  * `employees.email` (Enforces unique login identities).
  * `departments.name` (Unique within organization).
* **Compound Indexes:**
  * `allocations { assetId: 1, status: 1 }` (Rapidly find active custody to prevent double-allocation).
  * `transferRequests { assetId: 1, status: 1 }` (Prevent duplicate pending transfers for the same asset).
  * `auditRecords { auditCycleId: 1, assetId: 1 }` (Unique compound index to ensure an asset is only audited once per cycle).
* **Booking Conflict Indexes:**
  * `bookings { assetId: 1, startDate: 1, endDate: 1 }` (Accelerates overlap detection queries).
* **Search Indexes:**
  * `assets { name: "text", assetTag: "text" }` (Powers the global search bar).
* **Dashboard Indexes:**
  * `maintenanceRequests { status: 1, priority: -1 }` (Quickly load high-priority pending requests).

## 6. Query Patterns

### Find active maintenance
* **Frequency:** High (Asset Managers checking daily workflow).
* **Optimization Strategy:** Filter by `status: { $in: ['Pending', 'Approved', 'InProgress'] }`.
* **Required Indexes:** Single-field index on `status`.

### Find overdue allocations
* **Frequency:** High (Dashboard automated checks).
* **Optimization Strategy:** Query `allocations` where `status: 'Active'` and `expectedReturnDate < NOW()`.
* **Required Indexes:** Compound index `{ status: 1, expectedReturnDate: 1 }`.

### Booking conflicts (Check availability)
* **Frequency:** Medium (Whenever a booking is created).
* **Optimization Strategy:** Query for existing active bookings on the `assetId` where the time ranges intersect.
* **Required Indexes:** `{ assetId: 1, status: 1, startDate: 1, endDate: 1 }`.

### Audit Reports
* **Frequency:** Low (End of cycle).
* **Optimization Strategy:** Aggregation pipeline joining `auditCycles` with `auditRecords`, computing discrepancy counts.
* **Required Indexes:** `{ auditCycleId: 1 }` on `auditRecords`.

### Find pending transfer requests
* **Frequency:** Medium (Asset Manager dashboards).
* **Optimization Strategy:** Query `transferRequests` by `status: 'Pending'`.
* **Required Indexes:** Single-field index on `status`.

## 7. Transaction Strategy

MongoDB multi-document ACID transactions are required where operations span multiple aggregates and must succeed or fail together.

* **Allocation Creation:** 
  * *Atomicity:* Insert `Allocation` AND update `Asset.status` to 'Allocated'. 
  * *Consistency:* If the asset status update fails, the allocation is rolled back.
* **Transfer Approval:**
  * *Atomicity:* Update Old `Allocation.status` to 'Returned' AND insert New `Allocation` AND update `TransferRequest.status`.
* **Audit Closure:**
  * *Atomicity:* Update `AuditCycle.status` to 'Closed' AND bulk update all missing `Asset.status` to 'Lost'.

## 8. Data Integrity

* **Uniqueness:** Enforced at the database level via Unique Indexes (Emails, Asset Tags).
* **Referential Integrity:** Enforced at the Application Layer (MongoDB lacks foreign keys). Services must verify an `EmployeeId` exists before creating an `Allocation`.
* **Soft Deletes:** Deletions are logical. Entities have a `status` field (e.g., 'Inactive', 'Retired', 'Disposed').
* **Append-Only History:** No `UPDATE` or `DELETE` queries are permitted on `allocations`, `auditRecords`, or `activityLogs` once they reach a terminal state.
* **Duplicate Prevention:** Handled by application-level locking and database-level unique constraints.

## 9. Read Models

* **Dashboard Read Model:** Instead of computing KPI aggregates on every page load, heavy metrics (e.g., "Total Value of Disposed Assets") can be periodically computed and cached, or utilizing MongoDB Aggregation Pipelines with `$facet` for efficient multi-metric retrieval in a single database round-trip.
* **Denormalization:** 
  * *Example:* Embedding the `Employee.name` inside `ActivityLog` along with `EmployeeId`. Since logs are immutable historical records, if the employee changes their name later, the log accurately reflects their name *at the time of the action*.

## 10. Repository Design

Repositories act as the exclusive gateway to the collections, encapsulating all database query logic.

* **Asset Repository:** Handles searches, status updates, and unique tag validation.
* **Allocation Repository:** Handles custody history and overdue detection.
* **Booking Repository:** Encapsulates the complex date-math required for conflict detection.
* **Audit Repository:** Handles the heavy aggregation pipelines required for generating discrepancy reports.
* **Transfer Repository:** Manages transfer request lifecycle and historical transfer queries.
* **Boundaries:** A service operating on an Asset MUST use the Asset Repository. It cannot query the `assets` collection directly.

## 11. Concurrency Strategy

* **Booking Conflicts:** Optimistic locking or Transactions. Two users booking the same asset simultaneously will trigger a transaction, and the second transaction will fail the overlap check or encounter a write conflict.
* **Audit Race Conditions:** If two auditors attempt to verify the same asset simultaneously, the unique compound index on `{ auditCycleId, assetId }` will reject the second insertion.
* **Conflict Detection:** Utilizing Mongoose's inherent `__v` (version key) for optimistic concurrency control on concurrent Asset updates.

## 12. Data Lifecycle

* **Creation:** Standard inserts via REST APIs.
* **Updates:** Mutable fields updated via `PUT/PATCH`. Immutable fields rejected.
* **Archival:** Records are never physically moved; they are filtered out by UI views based on terminal statuses ('Disposed', 'Closed', 'Returned').
* **Retention:** Data is kept indefinitely to satisfy enterprise auditability requirements.

## 13. Backup & Recovery

* **Snapshots:** Daily automated volume snapshots.
* **Point-in-Time Recovery:** MongoDB Oplog retention allows restoring the database to any specific second in the past (Disaster Recovery).

## 14. Scalability

* **Sharding:** If the `activityLogs` or `auditRecords` collections grow into the billions of rows, they can be sharded (e.g., using a hashed shard key on `_id` or `assetId`) to distribute the write load.
* **Read Replicas:** Read-heavy dashboard queries can be routed to secondary replica set nodes to preserve the primary node's write performance.

## 15. Database Constraints

Developers MUST NOT violate these rules:
1. **Never bypass repositories:** Do not use `Model.find()` directly inside a Controller.
2. **Never update immutable history:** Terminal records (e.g., Returned Allocations) must reject updates.
3. **Never duplicate Asset Tags:** Ensure the unique index is never dropped.
4. **Never delete audit records:** `DELETE` operations are strictly forbidden on audit collections.

## 16. Document Traceability

* **`04_API.md`:** Translates the Collection Design into route endpoints (e.g., `/api/v1/assets`).
* **`05_RBAC.md`:** Will define which roles are allowed to trigger the Transactions defined in Section 7.
* **`06_FRONTEND_ARCHITECTURE.md`:** Uses the Query Patterns (Section 6) to design the data-fetching hooks (e.g., `useOverdueAllocations()`).
* **`07_BACKEND_ARCHITECTURE.md`:** Implements the Repositories defined in Section 10.
* **`08_IMPLEMENTATION_PLAN.md`:** DB Schema creation forms Phase 1 of the execution sequence.

## 17. Collection Growth Expectations

For every collection, understanding scale informs indexing, sharding, and archival strategies.

* **`organizations`**
  * *Hackathon:* 1
  * *Production:* 1 (Single Tenant) or 100+ (Multi-Tenant)
  * *Growth Pattern:* Static/Extremely Slow
  * *Read Intensity:* Low (Cached)
  * *Write Intensity:* Extremely Low

* **`departments` & `assetCategories`**
  * *Hackathon:* 5–20
  * *Production:* 50–500
  * *Growth Pattern:* Slow
  * *Read Intensity:* Medium (Dropdowns)
  * *Write Intensity:* Low

* **`employees`**
  * *Hackathon:* 10–50
  * *Production:* 1,000–50,000
  * *Growth Pattern:* Linear (Correlates with hiring)
  * *Read Intensity:* High (Auth/References)
  * *Write Intensity:* Low

* **`assets`**
  * *Hackathon:* 100–5,000
  * *Production:* 100k+
  * *Growth Pattern:* Linear (Procurement cycles)
  * *Read Intensity:* Very High (Searches, Dashboards)
  * *Write Intensity:* Medium (Status updates)

* **`allocations`, `bookings`, `maintenanceRequests`**
  * *Hackathon:* 500–10,000
  * *Production:* 1M+
  * *Growth Pattern:* High/Continuous (Daily operations)
  * *Read Intensity:* High
  * *Write Intensity:* High

* **`auditCycles` & `auditRecords`**
  * *Hackathon:* 1–5 Cycles, 100s of Records
  * *Production:* 50+ Cycles, 100k+ Records/year
  * *Growth Pattern:* Burst (Periodic massive inserts)
  * *Read Intensity:* Medium (During cycle)
  * *Write Intensity:* High (During cycle)

* **`activityLogs` & `notifications`**
  * *Hackathon:* 10k+
  * *Production:* 10M+
  * *Growth Pattern:* Exponential
  * *Read Intensity:* Low (Logs) / High (Notifications)
  * *Write Intensity:* Very High (System-wide side effects)
  * *Impact:* Drives the need for TTL (on notifications) or sharding (on logs).

## 18. TTL / Ephemeral Collections

These collections support architectural workflows but do not represent permanent business state. They utilize MongoDB's Time-To-Live (TTL) indexes for automatic eviction.

* **`passwordResetTokens`**
  * *Purpose:* Temporarily authorize password changes.
  * *Retention Period:* 1 Hour.
  * *TTL Strategy:* Expire index on `createdAt`.
  * *Why Ephemeral:* Security risk if retained; useless after expiry.

* **`emailVerificationTokens`**
  * *Purpose:* Verify new employee emails.
  * *Retention Period:* 24 Hours.
  * *TTL Strategy:* Expire index on `createdAt`.
  * *Why Ephemeral:* One-time use.

* **`refreshTokens`** (If implemented)
  * *Purpose:* Issue new JWT access tokens without re-login.
  * *Retention Period:* 7–30 Days.
  * *TTL Strategy:* Expire index on `expiresAt`.
  * *Why Ephemeral:* Automatically logs out inactive users; limits DB bloat.

* **`temporaryImportSessions`**
  * *Purpose:* Hold CSV bulk-import data pending user validation.
  * *Retention Period:* 24 Hours.
  * *TTL Strategy:* Expire index on `createdAt`.
  * *Why Ephemeral:* Garbage collects abandoned import sessions.

* **`notificationDeliveryCache`**
  * *Purpose:* Idempotency keys for email/push delivery to prevent spam loops.
  * *Retention Period:* 7 Days.
  * *TTL Strategy:* Expire index on `createdAt`.
  * *Why Ephemeral:* Only needed to debounce immediate retries.

## 19. Database Naming Conventions

Strict conventions ensure code predictability and maintainability across the MERN stack.

* **Collection Naming:** `camelCase` and `plural` (e.g., `maintenanceRequests`, `assetCategories`).
* **Field Naming:** `camelCase` (e.g., `expectedReturnDate`, `assetTag`).
* **Reference Naming:** Append `Id` to the referenced entity name in `camelCase` (e.g., `departmentId`, `assignedToId` or `assignedTo`). If it strictly holds an ObjectId, `Id` is preferred (e.g., `assetId`).
* **Timestamp Naming:** Standardized Mongoose timestamps: `createdAt` and `updatedAt`.
* **Boolean Naming:** Prefix with `is`, `has`, or `can` (e.g., `isOverdue`, `hasAttachments`).
* **Status Fields:** Always named exactly `status` across all collections, storing string Enums (e.g., 'Active', 'Pending').
* **Identifier Conventions:** The primary key is always `_id` (ObjectId). Avoid creating custom `id` string fields unless mapping to an external system.
* **Deleted Fields:** For soft deletes, use `deletedAt` (Date). If null, the record is active.

*Why Consistency Matters:* It allows frontend developers to predict API payloads without checking schemas, prevents capitalization bugs in queries, and allows generic repository patterns (e.g., a base class handling `createdAt` logic).

---

*End of Document. Awaiting approval to proceed to `04_API.md`.*
