# Phase 0C: Final Architecture Decision Record

**Project**: CONSTRUCTION CRM V1
**Phase**: 0C Final Architecture Decision Gate
**Date**: September 24, 2026
**Status**: DRAFT FOR REVIEW

This document converts the technical findings from Phase 0C-5 through 0C-10 into explicit architecture decisions for V1. It defines the boundaries of what will be natively enforced, what requires application-level controls, and what limitations are explicitly accepted.

---

## DECISION 1 — PROJECT LEAD ROW-LEVEL ACCESS

**Context & Findings:**
- Strict row-level visibility and update enforcement is NOT available in the current open-source Twenty v2.41.0 baseline.
- Logic Functions cannot provide secure read filtering and can only offer reactive (post-commit) rollback for updates.
- Direct SQL predicate manipulation (`core.rowLevelPermissionPredicate`) is considered HIGH RISK, unsupported by the open-source frontend, and is NOT approved.
- A custom API proxy is NOT approved at this stage.

**Business Requirement Evaluation:**
The business requirement states: *"Project Lead can view all projects under the current V1 business model. Can edit only projects assigned to the Project Lead."*
Since global read visibility is explicitly intended for V1, the lack of read-filtering RLS is a non-issue. The remaining gap is enforcing the *update restriction* (only editing assigned projects).

**V1 Decision:**
**ACCEPTED LIMITATION.** V1 explicitly accepts that:
"Project Leads may view all projects, while assigned-project editing is handled through a controlled application workflow (UI-level enforcement and convention)."
We will not implement raw SQL hacks or reactive rollback mechanisms and call them "security." If strict API-level technical prevention against unauthorized edits by Project Leads becomes a critical necessity, it must be escalated as a future architecture requirement.

---

## DECISION 2 — APPROVAL WORKFLOW

**Context & Findings:**
Twenty's static field permissions cannot enforce state transitions (e.g., ensuring only a Manager can move a status from `SUBMITTED` to `APPROVED`). Relying solely on permissions for a `status` field is structurally insufficient, as anyone with edit rights to the field can bypass the flow.

**V1 Decision:**
Approval logic will be driven by explicit state machines. The following potential model establishes the foundation:
`DRAFT` → `SUBMITTED` → `APPROVED` → `ACTIVE` → `LOCKED`

**Authoritative Transitions:**
The following transitions must be authoritative and protected (either via strict UI routing, dedicated action buttons, or external business integrity validation):
1. `SUBMITTED` → `APPROVED` (Requires Super Manager or Manager depending on creator).
2. `ACTIVE` → `LOCKED` (Requires Admin/Super Manager or automated financial closure).
3. Any transition involving sensitive financial/budget values moving into an active state.

---

## DECISION 3 — FINANCIAL/BUSINESS INTEGRITY

**Context & Findings:**
Logic Functions are explicitly NOT a multi-operation ACID transaction engine. They execute asynchronously and independently of the initiating database transaction.

**V1 Decision:**
V1 will not create a second database or a custom transaction engine. V1 explicitly rejects claiming that multi-step operations in Twenty are natively atomic.

To guarantee business integrity, the architecture will rely exclusively on:
- Deterministic server-side calculations.
- Unique constraints applied directly to the PostgreSQL schema.
- Idempotency keys included in payload submissions.
- Explicit state machines tracking partial completion.
- Immutable records where required.
- Periodic reconciliation.
- Compensating/reversal operations (instead of rollbacks) for multi-step failures.

---

## DECISION 4 — INVENTORY

**Context & Findings:**
Inventory balances cannot be safely maintained as a simple, mutable "stock count" field due to the lack of transaction guarantees.

**V1 Decision:**
V1 will implement an **IMMUTABLE INVENTORY MOVEMENT LEDGER**.
Movement records (e.g., `PURCHASE_RECEIPT`, `DISPATCH_TO_SITE`, `SITE_RETURN`, `CONSUMPTION`, `SCRAP_ADJUSTMENT`):
- Can be created.
- Cannot be edited.
- Cannot be silently deleted.
- Corrections must occur through explicit reversal/adjustment movements.
Current balances will be deterministically derived from the immutable ledger.

---

## DECISION 5 — DOCUMENT IMMUTABILITY

**Context & Findings:**
This is a **HIGH-RISK** architecture issue. Twenty cannot technically guarantee that a `LOCKED` document cannot be modified via API paths, as asynchronous Logic Functions cannot preemptively abort transactions.

**V1 Decision:**
We will not claim that `LOCKED = technically immutable` natively. Technical immutability requires either strict DB-level triggers (bypassing Twenty's ORM) or complete API isolation. For V1, the classifications are:

| Document Type | Immutability Requirement | V1 Classification |
| :--- | :--- | :--- |
| **Invoice** | Must be technically immutable | Requires external enforcement (or append-only strictness). |
| **Quotation** | Application-level lock acceptable | Application-level lock + Reversal/versioning acceptable. |
| **Purchase Order** | Must be technically immutable | Requires external enforcement / strict reconciliation. |
| **Delivery Challan** | Must be technically immutable | Requires external enforcement. |
| **Contract** | Must be technically immutable | Requires external enforcement. |
| **Payment Records**| Must be technically immutable | Requires external enforcement / append-only ledger. |

*Note: For objects requiring technical immutability against internal API users, V1 will rely on a combination of append-only architectures (like the inventory ledger) and strict reconciliation audits, accepting that the API surface itself cannot natively lock records per-state without external proxies or DB-level hacks.*

---

## DECISION 6 — FINANCIAL AUTHORITY

**V1 Decision:**
AI, LLMs, and asynchronous Logic Functions **cannot** be authoritative for:
- GST/Tax calculations
- Invoice totals
- Financial totals
- Stock balances
- Document numbering
- Permissions
- Accounting state

Deterministic application/database mechanisms (e.g., rigid SQL views, constraint-backed unique IDs, append-only ledgers) must remain the sole authoritative source of truth.

---

## DECISION 7 — OVERALL V1 RISK MATRIX

| Requirement | Twenty Native Support | Configuration | Extension | Limitation | V1 Decision | Risk |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Object permissions** | FULL | UI/API | None | None | Use native `core.objectPermission`. | LOW |
| **Field permissions** | FULL | UI/API | None | None | Use native `core.fieldPermission`. | LOW |
| **Role assignment** | FULL | UI/API | None | None | Use native `core.roleTarget`. | LOW |
| **Project Lead row-level visibility** | NONE (Open Source) | N/A | N/A | Missing | Accept limitation: Leads view all projects. | ACCEPTABLE LIMITATION |
| **Project Lead assigned-project editing** | NONE (Open Source) | N/A | API Proxy | Cannot natively block API edits. | Application/UI-level enforcement only. | HIGH RISK |
| **Approval state transitions** | NONE | N/A | Webhooks | Easily bypassed via direct field edit. | Application-level flow; no strict DB lock. | HIGH RISK |
| **Financial calculations** | NONE | N/A | External | Logic functions aren't transactional. | Deterministic external/server-side only. | NOT RELEVANT TO V1 |
| **Idempotency** | NONE | N/A | Custom Fields | No native idempotency keys. | Enforce via custom unique constraints. | PHASE 1 SPIKE |
| **Inventory movement ledger** | FULL | Object Permissions| None | Requires reversal workflows. | Implement Immutable Movement Ledger. | LOW |
| **Document locking** | NONE | N/A | External | API edits cannot be blocked natively. | Application locks + reconciliation. | BLOCKER / HIGH RISK |
| **Hard deletion** | FULL | Object Permissions| None | None | Disable `canDestroyObjectRecords`. | LOW |
| **Auditability** | PARTIAL | Timeline | Webhooks | Timeline is UI-focused. | Combine Timeline with Immutable Ledgers. | ACCEPTABLE LIMITATION |

---

## FINAL STATUS

**Classification: YELLOW**

**Reasoning:**
The architecture is **YELLOW** (proceed only with explicit accepted limitations and defined controls). 
We have successfully mapped the core security boundaries (Object/Field/Role structures) to supported native mechanisms. However, critical V1 limitations exist around **Document Immutability**, **Approval State Locks**, and **Row-Level Updates**. 

Because we have elected to prioritize *Supported Native Mechanisms* over *Internal Database Hacks* (no raw SQL predicates) or *Custom Infrastructure* (no API proxy/second DB), we must explicitly accept that **API-level technical locking is porous**. The system is safe to proceed to Phase 1 *only* if the business formally accepts that these workflows will be enforced by application/UI convention and external business integrity reconciliation, rather than strict, impenetrable database state-locks.
