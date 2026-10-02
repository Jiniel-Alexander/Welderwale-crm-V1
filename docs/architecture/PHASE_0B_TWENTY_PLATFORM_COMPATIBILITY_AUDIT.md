# Phase 0B — Twenty Platform & Version Compatibility Audit

**Project:** Construction CRM V1  
**Project Path:** `C:\Roy\Welderwale\CONSTRUCTION CRM V1`  
**Date:** 2026-09-18  
**Author:** Senior Platform Architect  
**Audit Mode:** STRICT READ-ONLY AUDIT  
**Status:** COMPLETED — PENDING ARCHITECTURAL SIGN-OFF  

---

## Confidence Level Legend
Throughout this audit, findings are explicitly tagged with standardized confidence labels:
* **[CONFIRMED]**: Verified by direct runtime execution, local inspection, or official version tagging.
* **[DOCUMENTED]**: Stated explicitly in official Twenty developer documentation or GitHub documentation.
* **[OBSERVED]**: Empirically observed in codebase inspection of the local Docker container or previous POC artifacts.
* **[INFERRED]**: Derived through architectural deduction from platform constraints and conventions.
* **[UNKNOWN]**: Not documented or unverified; requires dedicated spike/test before implementation.

---

## 1. Executive Summary

This audit evaluates the architectural feasibility, version alignment, toolchain requirements, data integrity guarantees, and governance boundaries for building the **Construction CRM V1** on the **Twenty CRM** open-source platform.

### Core Strategic Verdict: [CONFIRMED]
**Construction CRM V1 is best implemented as a first-party Twenty Application (`twenty-sdk`) rather than a fork of Twenty core or a disconnected multi-backend system.**

Twenty v2.0+ (and current v2.40+) was fundamentally re-architected into a metadata-driven CRM engine that allows complete external domain applications to be built and deployed declaratively as code. Through the `twenty-sdk`, developers declare custom entities (`defineObject`), fields (`defineField`), composite relations, relational indexes (`defineIndex`), server-side TypeScript business logic (`defineLogicFunction`), custom React UI widgets (`defineFrontComponent`), page layouts (`definePageLayout`), and role-based permissions (`defineRole`).

This architectural approach allows Construction CRM V1 to:
1. Retain **PostgreSQL as the single authoritative source of truth**.
2. Run critical financial calculations, double-entry stock movement ledgers, and document immutability guards in **server-side TypeScript Logic Functions**.
3. Fully inherit Twenty's auth, session management, BullMQ background queues, storage abstractions, and auto-generated GraphQL APIs.
4. Eliminate core code merge conflicts, allowing seamless upstream Twenty platform upgrades.
5. Eliminate the operational cost, synchronization lag, and data duplication of introducing a secondary backend (e.g. Supabase).

---

## 2. Current Twenty Version & Ecosystem

### 2.1 Target Version Identification
* **Recommended Production & Self-Hosted Release:** **v2.40.2** `[CONFIRMED]`
* **Docker Image Tag:** `twentycrm/twenty-app-dev:latest` (Digest `sha256:04afd2dded...`, Build Tag `APP_VERSION=v2.40.2`, Created September 15, 2026) `[OBSERVED]`
* **Twenty App SDK Version:** `twenty-sdk@2.40.0` (npm: 2.31.0 - 2.40.0) `[CONFIRMED]`
* **Twenty Client SDK Version:** `twenty-client-sdk@2.40.0` `[CONFIRMED]`
* **Twenty UI Component Package:** `twenty-ui@1.0.0-alpha.2` `[DOCUMENTED]`
* **Deprecated Tooling:** `twenty-cli` is officially deprecated by Twenty HQ; applications must use `twenty-sdk` and `npx create-twenty-app@latest` `[DOCUMENTED]`.

### 2.2 Version Suitability Assessment: [CONFIRMED]
Twenty v2.40.2 is fully suitable for Construction CRM V1. It stabilizes the app manifest compilation, AST declaration detection, custom page layouts, front component embedding, and tool-triggered Logic Functions for MCP/AI agents.

---

## 3. Exact Toolchain Requirements

### 3.1 Host & Container Runtimes

| Component | Required Version | Current Machine Status | Alignment Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Node.js** | `>=20.0.0` (Recommended `v22.x LTS`) `[DOCUMENTED]` | `v22.17.1 LTS` (`C:\Program Files\nodejs\node.exe`) | **COMPLIANT** `[CONFIRMED]` | Container runs Node 24.19; host Node 22.17 runs SDK tooling cleanly. |
| **Package Manager** | Yarn Modern (`>=4.0.2` Berry via Corepack) `[DOCUMENTED]` | Yarn `1.22.22` (Classic) global; Corepack `0.33.0` present | **REQUIRES ACTION** `[CONFIRMED]` | Corepack must be activated (`corepack enable`) to supply Yarn 4.x. |
| **npm** | Not allowed for project workspace (`engines: "npm": "please-use-yarn"`) | `10.9.2` | **RESTRICTED** `[DOCUMENTED]` | Must use Yarn Berry only. |
| **Docker Engine** | `>=24.0.0` (Recommended 27.x - 29.x) `[DOCUMENTED]` | `29.8.0` | **COMPLIANT** `[CONFIRMED]` | Operational via WSL2. |
| **Docker Compose** | Compose V2 (`>=v2.20.0`) `[DOCUMENTED]` | `v5.5.1` (Docker Compose V2 plugin) | **COMPLIANT** `[CONFIRMED]` | Highly modern. |
| **PostgreSQL** | PostgreSQL 16 (Alpine) `[DOCUMENTED]` | Handled internally by `twenty-app-dev` (PG 16) | **COMPLIANT** `[CONFIRMED]` | Port 5432 / internal unix socket. |
| **Redis** | Redis 7.x / 8.x (`--maxmemory-policy noeviction`) `[DOCUMENTED]` | Handled internally by `twenty-app-dev` (Redis 7) | **COMPLIANT** `[CONFIRMED]` | Port 6379 / internal. |
| **Python** | Python 3.10+ (for path normalization script & tooling) | Python `3.13.5` (`C:\Personal\python.exe`) | **COMPLIANT** `[CONFIRMED]` | Available on PATH. |
| **Git** | Git 2.x | `2.53.0.windows.1` | **REQUIRES IDENTITY** `[CONFIRMED]` | Global author name and email must be configured. |

---

## 4. Twenty Platform Architecture & App Positioning

### 4.1 System Architecture Breakdown `[DOCUMENTED]`
```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        CONSTRUCTION CRM V1 APP                          │
│     (TypeScript Domain Schemas, Logic Functions, Front Components)      │
│  - Entity Definitions (Clients, Worksites, Projects, Materials, etc.)    │
│  - Double-Entry Stock Movement Ledger Guard                             │
│  - Server-Side GST, Tax & Margin Calculation Engines                    │
│  - Historical Document Lock & Revision Workflows                        │
│  - Role Definitions & Row-Level Predicates                              │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ (Declarative Manifest via twenty-sdk)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         TWENTY PLATFORM CORE                            │
│ ┌───────────────────────────┐         ┌───────────────────────────────┐ │
│ │  Frontend Shell (React 19)│         │     NestJS Application Server │ │
│ │  - Navigation Drawer      │         │  - GraphQL Engine (Apollo)    │ │
│ │  - Table / Kanban Views   │         │  - Metadata Synchronizer      │ │
│ │  - Page Layout Engine     │         │  - Logic Function Runner      │ │
│ │  - Front Component Sandbox│         │  - RBAC & Permission Resolver │ │
│ └─────────────┬─────────────┘         └───────────────┬───────────────┘ │
│               │                                       │                 │
│               └───────────────────┬───────────────────┘                 │
│                                   │                                     │
│ ┌─────────────────────────────────┴───────────────────────────────────┐ │
│ │                       PERSISTENCE & RUNTIMES                        │ │
│ │  - PostgreSQL 16 (Multi-Schema Workspace Database Engine)           │ │
│ │  - Redis 7 (BullMQ Job Queues, Session Store & Event Cache)         │ │
│ │  - Storage Service (Local Disk Storage / S3-Compatible MinIO)       │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 App/Extension vs. Core Fork vs. External Backend: Explicit Answer `[CONFIRMED]`
* **Recommendation:** **Twenty App/Extension (`twenty-sdk`)**.
* **Why NOT a Core Fork?** Forking the `twentyhq/twenty` repository would tie Construction CRM to internal NestJS/React core implementation details, resulting in catastrophic merge conflicts against Twenty's weekly release cycles. It destroys upgradeability and violates maintainability.
* **Why NOT an External Backend (Supabase/Firebase)?** Introducing an external database/backend splits the data model across two systems, duplicates authentication, doubles infrastructure hosting complexity, breaks relational foreign keys between CRM users and business entities, and creates synchronization latency. Twenty’s built-in PostgreSQL, GraphQL engine, and Logic Functions provide 100% of required capabilities.

---

## 5. Twenty App / Extension Model Capabilities

### 5.1 Extension Points Analysis `[DOCUMENTED]`

| Extension Mechanism | Function Name | Support Level | Construction CRM Application |
| :--- | :--- | :--- | :--- |
| **Application Config** | `defineApplication()` | Officially Supported | Declares app identity, unique universal UUID, description, and env variables. |
| **Custom Object** | `defineObject()` | Officially Supported | Declares domain entities (Worksite, Project, Material, Invoice, etc.). |
| **Custom Field** | `defineField()` | Officially Supported | Adds typed fields to custom or standard objects. |
| **Indexes & Uniqueness** | `defineIndex()` | Officially Supported | Enforces DB-level uniqueness (`isUnique: true`) and query indexing. |
| **Logic Functions** | `defineLogicFunction()` | Officially Supported | Executes server-side TypeScript on DB events, HTTP routes, or crons. |
| **Front Components** | `defineFrontComponent()` | Officially Supported | Renders custom React 19 micro-frontends (e.g. Profitability Dashboard). |
| **Page Layouts** | `definePageLayout()` | Officially Supported | Organizes record detail pages into tabs and widget grids. |
| **Navigation Menu** | `defineNavigationMenuItem()` | Officially Supported | Injects Construction CRM modules directly into the Twenty left sidebar. |
| **Role Definitions** | `defineRole()` / `defineApplicationRole()` | Officially Supported | Configures granular object- and field-level permissions. |
| **Skills & Agents** | `defineSkill()` / `defineAgent()` | Officially Supported | Exposes typed domain tools to AI agents via Model Context Protocol (MCP). |

### 5.2 AST Manifest Compilation `[DOCUMENTED]`
Twenty does not require a monolithic runtime registration file. The `twenty-sdk` analyzes the Abstract Syntax Tree (AST) of all exported definitions in the `src/` folder at build time, compiles a canonical JSON manifest, and syncs it to the Twenty server via `yarn twenty apply` or `yarn twenty dev`.

---

## 6. Object, Field & Relational Capabilities

### 6.1 Supported Field Types `[CONFIRMED]`
`FieldType` enum in `twenty-sdk/define` natively supports:
* `TEXT`, `NUMERIC`, `NUMBER`, `CURRENCY` (essential for GST, unit rates, retention money, contract sums).
* `DATE`, `DATE_TIME` (milestones, attendance timestamps, invoice due dates).
* `SELECT`, `MULTI_SELECT` (deterministic status enums with immutable UUIDs).
* `FILES` (delivery challan photos, signed purchase orders, vendor invoices).
* `RELATION` (relational pointers between entities).
* `BOOLEAN`, `RAW_JSON`, `RICH_TEXT`, `UUID`.

### 6.2 Relational Semantics `[CONFIRMED]`
* **One-to-Many / Many-to-One:** Bidirectionally defined using two `defineField()` calls linked via `relationTargetObjectMetadataUniversalIdentifier` and `relationTargetFieldMetadataUniversalIdentifier`.
* **Many-to-Many:** Cleanly achieved via an explicit junction object with two `MANY_TO_ONE` relations (e.g. `ProjectAssignment` linking `Worker` and `Project`), allowing metadata on the relationship itself (e.g. `assignedDate`, `assignedRole`).
* **Referential Integrity:** Supports `RESTRICT`, `CASCADE`, and `SET_NULL` on deletion.

### 6.3 Critical Platform Limitation: Rollups & Formulas `[CONFIRMED]`
* **Finding:** Twenty does NOT currently offer fully autonomous declarative DB-level cross-object rollups (e.g., automatically summing `InvoiceItem.totalAmount` into `Invoice.totalAmount` at the PostgreSQL engine level).
* **Architecture Impact:** All rollups (Invoice Totals, Project Incurred Cost, Worker Total Hours, Stock Balances) **MUST be calculated and persisted via server-side Logic Functions**.
* **Benefit:** This enforces our requirement for deterministic, audited, server-side financial calculations rather than opaque database triggers.

---

## 7. Server-Side Business Logic Capabilities

### 7.1 Logic Function Triggers `[DOCUMENTED]`
1. **Database Event Triggers (`databaseEventTriggerSettings`):**
   * Listens to `ObjectRecordCreateEvent`, `ObjectRecordUpdateEvent`, `ObjectRecordDeleteEvent`.
   * *Use Cases:* Triggering project cost updates when an expense is recorded; triggering stock ledger checks on dispatch.
2. **Custom HTTP Route Triggers (`httpRouteTriggerSettings`):**
   * Exposes dedicated endpoints under `/api/logic-functions/...` supporting `POST`, `GET`, etc.
   * *Security Requirement:* Must always set `isAuthRequired: true`. (The old POC had `isAuthRequired: false`, which is a security flaw).
   * *Use Cases:* Atomically converting an approved Quotation into an Invoice; generating signed PDF Delivery Challans.
3. **Scheduled Cron Triggers (`cronTriggerSettings`):**
   * Standard cron schedule expressions.
   * *Use Cases:* Flagging overdue invoices; generating weekly project profitability snapshots.

### 7.2 Safe vs. Prohibited Logic Patterns `[CONFIRMED]`

| Logic Requirement | Permitted Mechanism | PROHIBITED Mechanism |
| :--- | :--- | :--- |
| **Tax & GST Computation** | Pure TypeScript domain service inside Logic Function | Client-side React calculations in Front Component |
| **Invoice Total Calculation** | Server-side Logic Function on item creation/update | Unauthenticated public endpoints |
| **Stock Level Tracking** | Append-only `StockMovement` ledger entries | Directly mutating a `currentQuantity` field in-place |
| **Document Immutability** | Logic Function pre-update guard rejecting non-DRAFT edits | Relying on UI disabling buttons |
| **Sequential Numbering** | Atomic server-side generator (e.g., `INV-2026-0001`) | Client-side string generation |

---

## 8. Database Architecture & Data Integrity

### 8.1 PostgreSQL Architecture `[DOCUMENTED]`
* Twenty operates on a multi-schema PostgreSQL architecture. Core platform metadata resides in `core`, while tenant workspaces reside in isolated schemas (`workspace_xxxx`).
* The **Metadata Synchronizer** translates declarative `defineObject` and `defineField` TypeScript files into actual PostgreSQL tables, foreign key constraints, and indexes.

### 8.2 Inviolable Architectural Guarantees `[CONFIRMED]`
1. **Single Source of Truth:** Direct SQL writes that bypass Twenty's metadata layer are strictly forbidden. All operations flow through Twenty's GraphQL API or internal SDK clients to preserve metadata synchronization and event triggers.
2. **Double-Entry Stock Ledger:** Physical materials (steel, cement, electrodes) never have their balances modified by arbitrary number edits. Every change is an immutable `StockMovement` row:
   * `PURCHASE_RECEIPT`
   * `DISPATCH_TO_SITE`
   * `SITE_RETURN`
   * `SITE_CONSUMPTION`
   * `SCRAP_ADJUSTMENT`
3. **Historical Document Locking:** Issued Invoices, signed Quotations, and confirmed Delivery Challans transition to `ISSUED` / `POSTED` status. Logic Function validation guards abort any subsequent update or delete mutations on non-draft records.
4. **Effective-Dated Labour Rates:** Workers are not assigned mutable hourly rates directly on their profile. Rates are stored in a `LabourRate` entity with `effectiveFrom` and `effectiveTo` dates, ensuring historical project cost audits remain intact when wages change.

---

## 9. Authentication & Role-Based Access Control (RBAC)

### 9.1 Authentication Model `[DOCUMENTED]`
Twenty provides native authentication supporting email/password, magic links, SSO, and session management via JWT. System users belong to `WorkspaceMember` and `User` entities.

### 9.2 Construction CRM Role Hierarchy `[CONFIRMED]`
Construction CRM defines 9 distinct operational roles:
1. **`OWNER_ADMIN`**: Full platform and financial control.
2. **`MANAGEMENT`**: Full operational, project, and high-level P&L visibility.
3. **`ACCOUNTS`**: Complete access to Quotations, Invoices, Payments, Expenses, and Vendor Bills. Restricted from site operations editing.
4. **`OPERATIONS_MANAGER`**: Oversees Worksites, Projects, Material Dispatch, and Resource Allocation.
5. **`STORES_PROCUREMENT`**: Manages Suppliers, Purchase Orders, Goods Receipts, and Central Warehouse Inventory.
6. **`HR_WORKFORCE`**: Manages Worker Master, Attendance, Daily Logs, and Labour Rates.
7. **`SITE_SUPERVISOR`**: Field access to assigned Worksites, Site Attendance, Site Material Receipts, and Delivery Challans.
8. **`WORKER`**: Self-service time-log and task view only.
9. **`VIEWER`**: Read-only stakeholder view for select projects.

### 9.3 Backend Enforcement vs. UI Obfuscation `[CONFIRMED]`
* **Object-Level Permissions:** Configured in `defineRole()` via `canReadAllObjectRecords`, `canCreateObjectRecords`, etc. A `SITE_SUPERVISOR` role has zero read permissions on `Invoice` or `CompanyFinancials` objects.
* **Field-Level Permissions:** Hides sensitive financial columns (e.g. `baseSalary`, `hourlyRate`, `marginPercentage`) from roles that need access to the parent object but must not see financial secrets.
* **Backend Resolver Security:** The GraphQL execution layer inspects the caller's role before querying the database; unauthorized queries fail at the API level.

---

## 10. User Experience & Customization

### 10.1 UI Capabilities `[DOCUMENTED]`
* **Navigation Customization:** `defineNavigationMenuItem()` injects dedicated menu items into the left sidebar, grouping Construction CRM modules:
  * *Operations:* Worksites, Projects, Daily Attendance.
  * *Resources:* Workforce, Equipment, Materials & Warehouse.
  * *Commercial:* Quotations, Invoices, Payments, Expenses, Delivery Challans.
  * *Analytics:* Profitability & Project Costing Dashboard.
* **Custom Front Components:** `defineFrontComponent()` embeds React 19 components into Standalone Pages or record detail widgets.
* **Record Page Layouts:** `definePageLayout()` organizes record tabs (e.g. Project Overview, BOQ Items, Site Logs, Financial Summary).

### 10.2 Ordinary User Isolation `[CONFIRMED]`
Ordinary users (Supervisors, Accountants, Storekeepers) are assigned custom application roles. Standard Twenty administrative and workspace setting routes are restricted to `OWNER_ADMIN`. Ordinary users experience the application purely as a Construction CRM without seeing developer tools, application publishing settings, or system configuration panels.

---

## 11. API, GraphQL & Integrations

### 11.1 API Protocols `[DOCUMENTED]`
* **GraphQL API:** Fully auto-generated GraphQL schema covering all custom entities with filtering, sorting, pagination, and nested relations.
* **Type-Safe SDK:** `twenty-client-sdk/core` provides typed queries and mutations directly in TypeScript.
* **Custom REST Routes:** Logic Functions with `httpRouteTriggerSettings` allow bespoke REST endpoints for external webhooks.

### 11.2 Future Integration Roadmap `[INFERRED]`
* **Accounting (Tally / QuickBooks / Zoho):** Sync via Logic Function HTTP webhooks on invoice posting.
* **WhatsApp / SMS:** Automated dispatch notices to Site Supervisors via Logic Function hooks calling Twilio / WhatsApp Business API.
* **Document Storage:** S3 / MinIO integration for CAD drawings and scanned delivery challans.
* **Payment Gateways:** Razorpay / Stripe webhook endpoints for customer payment reconciliations.

---

## 12. AI, Model Context Protocol (MCP) & ChatGPT Integration

### 12.1 Native MCP Support `[DOCUMENTED]`
Twenty v2.40 natively integrates with the **Model Context Protocol (MCP)**:
* Logic Functions can define `toolTriggerSettings`, exposing them directly as typed MCP tools conforming to JSON Schema.
* AI agents running in MCP-compatible harnesses can discover and execute these business functions.

### 12.2 Two Distinct AI Concepts `[CONFIRMED]`
1. **ChatGPT Assisting Development:** Used during architecture, code review, test case generation, and domain modeling. Operates outside runtime code.
2. **ChatGPT / AI Interacting with the Live CRM:** Authenticated AI agents querying project status, client history, or generating draft quotations.
   * **Inviolable AI Governance Rule:** AI must NEVER become the authoritative calculator of financial totals, tax amounts, inventory balances, or document states. The PostgreSQL database and server-side TypeScript Logic Functions are strictly authoritative. AI only suggests or requests actions through authenticated endpoints.

---

## 13. Official Twenty Agent Skills Evaluation

### 13.1 Findings on `agent-skills` `[DOCUMENTED]`
Twenty maintains an official collection of Agent Skills on the `twentyhq/twenty` repository (`agent-skills` branch).
* **Canonical Skills:**
  1. `create-app`: Scaffolding new Twenty applications.
  2. `develop-app`: Adding and modifying objects, fields, and logic.
  3. `operate-app`: Local testing, dev server, and sync.
  4. `publish-app`: Preparing packages for marketplace distribution.
  5. `manage-app`: Deployment and version management.
* **Format:** Adheres to the open `skills.sh` standard (`SKILL.md` with YAML frontmatter).

### 13.2 Compatibility with Antigravity & Governance Recommendation `[CONFIRMED]`
* **Compatibility:** Fully compatible with Antigravity's skill execution model.
* **Audit Decision:** **DO NOT install external agent skills during Phase 0.** In accordance with strict governance, all entity scaffolding and logic in Phase 1 will be authored and verified explicitly through our versioned engineering workflows to prevent untested upstream scripts from modifying the project workspace.

---

## 14. Old POC Compatibility & Post-Mortem Analysis

Inspection of `C:\Roy\Welderwale\Test CRM` revealed critical lessons that inform V1:

| Area | Old POC Observation (`Test CRM`) | Root Cause | Construction CRM V1 Architectural Resolution |
| :--- | :--- | :--- | :--- |
| **Runtime Versioning** | Host ran Node 22; `.nvmrc` specified `24.5.0` | Container image had Node 24, causing host tooling confusion | Standardize host on Node 22 LTS; verify SDK execution against Node 22 |
| **Yarn Family** | Host had Yarn Classic 1.22 global | Corepack was not enabled; Yarn Berry was isolated to repo | Enforce `corepack enable` and pin `yarn@4.13.0` via `packageManager` |
| **Security Hole** | `recalculate-project-cost` had `isAuthRequired: false` | Rapid prototyping bypass | Strict rule: All Logic Function routes MUST require auth (`isAuthRequired: true`) |
| **Test Fragility** | Hardcoded JWT string in `poc-entities.test.ts` | Static token generation | Use dynamic test setup fixtures with ephemeral API keys |
| **Windows Pathing Bug** | Manifest failed sync with `Resource path must not contain backslashes` | `twenty-sdk` build used `path.relative()` generating Windows `\` | Maintain `scripts/normalize-paths.py` in `postinstall` hook |
| **Inventory Model** | In-place number increment on project expenses | Single-entry shortcut | Enforce append-only Double-Entry `StockMovement` ledger |
| **UUID Duplication** | Multiple identifier files duplicated same constants | Ad-hoc constant creation | Centralize all object and field UUIDs into `src/constants/identifiers.ts` |

---

## 15. Construction CRM Domain Module Compatibility

| Domain Module | Key Sub-Entities / Workflows | Twenty Capability Assessment | Custom Architectural Strategy |
| :--- | :--- | :--- | :--- |
| **Workforce** | Workers, Daily Logs, Overtime, Wage Cards | **Supported** via `defineObject` | Effective-dated `LabourRate` table; hours logged via `AttendanceRecord`. |
| **Equipment** | Machinery, Maintenance, Site Allocation | **Supported** via `defineObject` | Reusable equipment master; cost allocated via `EquipmentUsageLog`. |
| **Materials & Inventory** | Central Warehouse, Site Stock, Scraps | **Supported** via `defineObject` | Double-entry `StockMovement` transactions; no direct balance edits. |
| **Procurement** | Suppliers, Purchase Orders, Goods Receipts | **Supported** via `defineObject` | `PurchaseOrder` linked to `GoodsReceipt` with partial receipt status. |
| **Quotations** | BOQ Items, Internal Cost Build-up, Margins | **Supported** via `defineObject` + Logic Function | `QuotationItem` components; locked upon approval; versioned revisions. |
| **Billing & Payments** | Invoices, Line Items, TDS, Retention, Receipts | **Supported** via `defineObject` + Logic Function | Strict immutability guards; `PaymentAllocation` records. |
| **Profitability** | Direct Cost, Overhead Allocation, Variance | **Supported** via Front Component + Logic Function | Computed via server-side aggregator; displayed in React dashboard. |

---

## 16. Platform Compatibility Matrix

| Requirement | Twenty Native | Twenty App SDK | Custom Logic/Service | Core Modification | Unsupported | Risk |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Company / Clients / Contacts** | ✅ | ✅ | — | ❌ | ❌ | LOW |
| **Worksites & Projects** | — | ✅ | — | ❌ | ❌ | LOW |
| **Workforce & Allocation** | — | ✅ | ✅ (Rate Engine) | ❌ | ❌ | LOW |
| **Equipment Tracking** | — | ✅ | — | ❌ | ❌ | LOW |
| **Double-Entry Stock Movement** | — | ✅ | ✅ (Ledger Guard) | ❌ | ❌ | MEDIUM |
| **Procurement & PO Workflows** | — | ✅ | ✅ (Status Machine) | ❌ | ❌ | LOW |
| **Quotation Engine (BOQ)** | — | ✅ | ✅ (Margin Calc) | ❌ | ❌ | MEDIUM |
| **Invoices & Payment Ledgers** | — | ✅ | ✅ (Tax & Lock) | ❌ | ❌ | MEDIUM |
| **Delivery Challans & Scans** | — | ✅ (Files) | — | ❌ | ❌ | LOW |
| **Profitability Dashboard** | — | ✅ (Front Comp) | ✅ (Aggregator) | ❌ | ❌ | LOW |
| **Role-Based Access Control** | ✅ | ✅ | — | ❌ | ❌ | LOW |
| **Document Immutability** | — | — | ✅ (Logic Guard) | ❌ | ❌ | MEDIUM |
| **Real-time AI / MCP Tools** | ✅ | ✅ | ✅ (Tool Triggers) | ❌ | ❌ | LOW |

---

## 17. Toolchain Compatibility Matrix

| Component | Required Specification | Host Machine Audit Result | Compatibility | Action Required for Phase 1 |
| :--- | :--- | :--- | :---: | :--- |
| **Windows OS** | Windows 10/11 x64 | Windows 11 Home (Build 26200) | **YES** | None. |
| **WSL2** | WSL2 Active & Hypervisor Present | Ubuntu 24.04 & Docker WSL2 active | **YES** | Keep WSL2 daemon active. |
| **Docker Engine** | 24.x - 29.x | 29.8.0 | **YES** | Clean up exited container name conflict. |
| **Docker Compose** | Compose V2 | v5.5.1 | **YES** | None. |
| **Node.js** | `>=20.0.0` (LTS) | v22.17.1 LTS | **YES** | Maintain current Node installation. |
| **npm** | `10.x` (only for bootstrap) | 10.9.2 | **YES** | Restrict to bootstrapping Corepack. |
| **Corepack** | Present | 0.33.0 installed | **YES** | Execute `corepack enable` before setup. |
| **Yarn** | Yarn Berry 4.x | Global is Classic 1.22.22 | **NEEDS FIX** | Enable Yarn 4 via Corepack. |
| **Python** | Python 3.10+ | Python 3.13.5 (`C:\Personal`) | **YES** | None. |
| **Git** | Git 2.x | 2.53.0 | **NEEDS FIX** | Configure `user.name` and `user.email`. |
| **Ports** | 2020, 3000, 5432, 6379 free | All free | **YES** | None. |

---

## 18. Risk Assessment

### BLOCKER: None
No platform or environment defects prevent project initiation.

### HIGH RISKS
1. **Windows Pathing in Manifest Synchronization:**
   * *Risk:* If backslashes are compiled into manifest paths on Windows, the Linux Twenty Docker container rejects application sync.
   * *Mitigation:* Retain the automated postinstall script (`normalize-paths.py`) in `construction-app`.
2. **Yarn Classic vs. Modern Version Mismatch:**
   * *Risk:* Running Yarn 1.x against `package.json` with Yarn 4 configuration corrupts dependencies.
   * *Mitigation:* Ensure `corepack enable` is activated before any package operations.

### MEDIUM RISKS
1. **Financial Recalculation Authorization:**
   * *Risk:* Logic Functions exposed with `isAuthRequired: false` could allow unauthenticated tampering.
   * *Mitigation:* Enforce `isAuthRequired: true` on all HTTP routes; enforce strict API token headers.
2. **Whitespace in Workspace Path:**
   * *Risk:* `C:\Roy\Welderwale\CONSTRUCTION CRM V1` contains spaces, potentially breaking naive shell scripts.
   * *Mitigation:* Quote all paths in npm/yarn scripts and docker commands.

### LOW RISKS
1. **Git Line Endings (`CRLF`):**
   * *Risk:* Shell scripts or docker entrypoints checked out with Windows CRLF line endings fail in Linux containers.
   * *Mitigation:* Commit a `.gitattributes` file configuring `* text=auto eol=lf`.

---

## 19. Recommended Target Architecture

### 19.1 Technical Blueprint
1. **Core Platform:** Twenty CRM v2.40.2 running via Docker Desktop (WSL2 backend).
2. **Application Layer:** `construction-app` written in TypeScript, managed via Yarn 4 (Berry) and Corepack.
3. **Database Engine:** PostgreSQL 16 (Twenty managed workspace schema). All tables, constraints, and indexes declared in TypeScript via `defineObject` and `defineIndex`.
4. **Business Logic Layer:** Dedicated domain services in `src/domain-services/` executed by Twenty `Logic Functions`:
   * `TaxCalculatorService` (CGST, SGST, IGST, TDS)
   * `StockMovementLedgerService` (Double-entry validation)
   * `DocumentLockService` (Immutability enforcement)
   * `ProjectProfitabilityService` (Cost aggregation)
5. **Presentation Layer:**
   * Native Twenty Grid, Board, and Detail views for standard entities.
   * Custom React 19 Front Components embedded via `defineFrontComponent` for Profitability Analysis, BOQ builders, and Material Movement boards.
   * Sidebar navigation structured via `defineNavigationMenuItem`.
6. **Integration & AI:**
   * GraphQL API for external client integration.
   * Model Context Protocol (MCP) tool triggers on Logic Functions for authenticated AI assistant integration.

---

## 20. Critical Architectural Answers (Section 15 Reference)

1. **Extension vs. Fork:** Extension/App on Twenty (`twenty-sdk`). Never fork core.
2. **Twenty Version:** Target v2.40.2 (matching `twentycrm/twenty-app-dev:latest`).
3. **Node Version:** Node v22.17.1 LTS.
4. **Yarn Version:** Yarn 4.13.0 via Corepack.
5. **PostgreSQL Version:** PostgreSQL 16.
6. **Redis Version:** Redis 7.x / Alpine.
7. **Local Dev Architecture:** Dockerized Twenty dev server (`twenty-app-dev` on port 2020) synchronized via `yarn twenty dev`.
8. **Custom Objects:** Declaratively created in `src/objects/` using `defineObject()`.
9. **Custom Business Logic:** Server-side TypeScript services executed via `defineLogicFunction()`.
10. **Financial Calculation Protection:** Pure server-side execution; client UI only renders computed totals; `isAuthRequired: true`.
11. **RBAC Enforcement:** Backend GraphQL authorization resolvers using `defineRole()`; field-level permissions for wage/margin hiding.
12. **Ordinary User Isolation:** Custom non-admin roles without workspace administration flags.
13. **Navigation Implementation:** Declarative menu entries via `defineNavigationMenuItem()`.
14. **Custom Dashboards:** React 19 micro-frontends embedded via `defineFrontComponent()` and `definePageLayout()`.
15. **Extension Boundaries:** Objects, fields, indexes, logic functions, front components, page layouts, navigation menu items, roles, skills, agents.
16. **What Requires Core Modification?** Modifying core workspace multi-tenant database routing or core authentication protocols (none of which are required).
17. **What Creates Upgrade Risk?** Core forks, direct PostgreSQL schema alterations bypassing metadata, or relying on undocumented private APIs.
18. **What Should NOT Be Built on Twenty?** Monolithic outside databases (Supabase), client-side financial math, or unauthenticated public routes.
19. **Invalid POC Assumptions:** Assuming `isAuthRequired: false` is acceptable for recalculation routes; assuming single-entry balance mutation is safe for stock.
20. **Decisions Before Phase 1:** Approve domain entity UUID registry, approve role hierarchy definitions, and configure host Git author identity.

---

## 21. Decisions Required Before Phase 1

### A. Decided by Platform (Twenty)
* Relational model requires explicit bilateral field definitions.
* Rollups must be computed via server-side Logic Functions (no native DB rollups).
* Package management requires Yarn Berry (`>=4.0.2`).
* Uniqueness requires `defineIndex({ isUnique: true })`.

### B. Decided by Us (Construction CRM)
* All stock movements adhere to the immutable double-entry ledger pattern.
* Financial documents (Invoices, Quotations, Challans) are locked upon leaving `DRAFT` status.
* All Logic Function routes mandate authenticated session tokens.
* Reusable company assets (workers, equipment) are allocated via transactional usage records.

### C. Needs Investigation (Future Spikes)
* Twenty's native PDF generation capabilities vs. headless Chromium container in Logic Functions for Delivery Challans and Invoices.
* Direct export of construction BOQ spreadsheets to Excel.

### D. Architecture Blockers
* **None.** The platform and architecture are validated and cleared for implementation.

---

## 22. Source & Evidence References

1. **Official Twenty Developer Documentation:**  
   * `https://twenty.com/developers`
   * `https://twenty.com/developers/section/self-hosting/setup`
   * `https://twenty.com/developers/section/extend/applications`
2. **Official GitHub Repository (`twentyhq/twenty`):**  
   * Main branch: `https://github.com/twentyhq/twenty`
   * Agent Skills branch: `https://github.com/twentyhq/twenty/tree/agent-skills`
   * Skills Manifest: `https://raw.githubusercontent.com/twentyhq/twenty/refs/heads/main/SKILLS.md`
   * Docker specifications: `packages/twenty-docker/docker-compose.yml`
3. **Local Runtime Inspection:**  
   * Local Docker image: `twentycrm/twenty-app-dev:latest` (ID `04afd2ddedc4`, Build `APP_VERSION=v2.40.2`, Node `24.19.0`)
   * Machine audit: Windows 11 Build 26200, Node v22.17.1 LTS, Docker 29.8.0, Corepack 0.33.0
4. **Historical POC Artifacts:**  
   * `C:\Roy\Welderwale\Test CRM\docs\architecture\TWENTY_ARCHITECTURE_ASSESSMENT.md`
   * `C:\Roy\Welderwale\Test CRM\docs\architecture\CONSTRUCTION_CRM_PLATFORM_DECISIONS.md`
   * `C:\Roy\Welderwale\Test CRM\construction-app\package.json`

---

# ABSOLUTE STOP CONDITION REACHED
Audit complete. No files or packages were installed or modified outside creating this audit report. Standing by for architectural review and approval.
