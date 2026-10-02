 have successfully completed the final architecture consolidation and updated the Phase 0D document.

### Summary of Newly Consolidated Architecture Decisions

1. **Project Ownership Model**: Introduced `Project Owner` as a User/Workspace Member relationship field. It serves as the authoritative business assignment and accountability reference, replacing the generic text concept of "Project Lead."
2. **Dynamic Approval Routing**: Introduced `Manager Approver` and `Super Manager Approver` as explicit User relationship fields on the Project. Workflows will route dynamically based on these configured authorities, explicitly avoiding hardcoded universal approval chains.
3. **Self-Approval Validation**: Established the baseline rule that `Submitter != Approver`.
4. **Approval History vs. Audit Log vs. Timeline**:
   - *Approval History*: Dedicated records tracking workflow journeys (who approved what, when, and comments).
   - *AuditLog*: Strict, append-only technical ledger for material business events.
   - *Project Activity Timeline*: Human-friendly chronological UI presentation derived from audit/activity records.
5. **UX Filtering vs. Security**: Explicitly defined "My Work" and "My Projects" as UX filters (e.g., `Project Owner = Current User`). These are convenience views, not true technical row-level security boundaries.
6. **Routine vs. Sensitive Changes**: Codified that routine edits (site notes, photos) are directly editable, whereas sensitive edits (contract value, budget) require the formal approval workflow.

### Phase 1A Architecture Validation Items (Unverified)

The following capabilities must be technically validated as soon as Phase 1 begins to determine if they are supported natively, require configuration, or must be shifted to the Business Integrity Layer:

1. Can Twenty natively filter User/Workspace Member relation picklists (e.g., restricting the `Manager Approver` dropdown solely to users actively holding the "Manager" role)?
2. Can self-approval (`Submitter != Approver`) be prevented server-side via UI/API, or must this rely entirely on external Business Integrity validation?
3. Does Twenty's dashboarding natively support aggregating Organization Oversight metrics, or must this be exported/derived externally?

### Artifact Generated

You can review the final consolidated plan here: **PHASE_0D_V1_RISK_ACCEPTANCE_AND_IMPLEMENTATION_CONTROL_PLAN.md**

**Phase 1 implementation has NOT started.**

Execution is stopped, and I am awaiting your explicit approval of this final consolidated architecture before proceeding.

2:57 PM

svg

svg

svg

svg

svg

svg

svg

svg

Phase 0d V1 Risk Acceptance And Implementation Control Plan

# Phase 0D: V1 Risk Acceptance & Implementation Control Plan

**Project**: CONSTRUCTION CRM V1 **Phase**: 0D Control Gate **Status**: DRAFT FOR REVIEW (FINAL CONSOLIDATION)

This document translates the accepted limitations from Phase 0C into concrete implementation controls, defining exactly how Construction CRM V1 will enforce or reconcile business rules, security, and integrity without compromising the open-source Twenty v2.41.0 baseline.

---

## 1. Executive Summary

Phase 0D finalizes the architectural control plan prior to Phase 1 implementation. It establishes strict rules for document immutability, financial integrity, inventory ledgers, and reconciliation. It clarifies that known limitations (e.g., lack of strict technical Row-Level Security for updates) are mitigated through explicitly defined detective controls and business risk acceptance, rather than false claims of technical enforcement.

## 2. Control Classification — Prevention vs Detection

To accurately map the architecture, all controls in V1 are strictly classified into one of four categories:

1. **TRUE TECHNICAL ENFORCEMENT (Preventive)**: A platform or database-level permission actually prevents the unauthorized mutation from occurring.
2. **CONTROLLED WORKFLOW**: The normal application workflow guides users and restricts actions through the intended UI, but does not technically prevent an API-capable actor from bypassing it.
3. **DETECTIVE / RECONCILIATION CONTROL**: A compensating control that detects, flags, and records violations *after* they occur. It does not prevent an API mutation. It must not be represented as equivalent to database-level enforcement.
4. **ACCEPTED LIMITATION (Residual Risk)**: The platform cannot technically enforce a requirement in the OSS baseline, and the business explicitly accepts the residual risk for V1.

## 3. Accepted Phase 0 Architecture

The frozen architecture is: **TWENTY v2.41.0 + CONSTRUCTION CRM BUSINESS INTEGRITY LAYER**

The system will **NOT** introduce a second database, custom transaction engine, raw SQL RLS hacks, custom API proxy, replacement RBAC engine, or alternative CRM platform.

## 4. V1 Business Requirements

The CRM will manage Projects, CRM profiles, Financial Documents, and an Immutable Inventory Movement Ledger, establishing clear role boundaries, ownership, and business workflows.

## 5. Accepted Platform Limitations

1. **No API-level Row-Level Security for Updates**: Project Leads can view all projects and are restricted to editing assigned projects via application/UI convention, not strict DB locking.
2. **No Native DB State-Locks**: A "LOCKED" status field does not natively freeze the database row against API edits.
3. **Non-ACID Logic Functions**: Logic Functions execute asynchronously and cannot wrap multiple mutations in a single, rollback-capable DB transaction.

---

## 6. Security Controls (Project Lead)

*Classification: ACCEPTED LIMITATION + CONTROLLED WORKFLOW + DETECTIVE RECONCILIATION*

- **Business Rule**: Project Leads may VIEW all projects in V1. Project Leads may EDIT only assigned projects through the controlled application workflow.
- **UI Actions Allowed (Controlled Workflow)**: Project Leads see "Edit" paths only on projects where they are assigned as the `Project Owner`.
- **Visibility**: They may see project names and metadata, but not restricted financial fields.
- **Available Edits**: Normal operational updates (site notes, photos, task status) on owned projects. Sensitive changes require approval.
- **Unauthorized Mutation Logic (Actor-Aware)**: An unauthorized mutation is defined as: `Project Lead Actor` + `Actor != Project Owner` + `Actor performed a restricted mutation`.
- **Reconciliation (Detective Control)**: A periodic background check evaluates the actor-aware logic against recent updates. Violations trigger administrative alerts.

## 7. Approval Controls

*Classification: CONTROLLED WORKFLOW + DETECTIVE RECONCILIATION*

*State Machine: DRAFT → SUBMITTED → APPROVED → ACTIVE → LOCKED*

- **Dynamic Approval Routing**: Approval chains are driven by configured `Manager Approver` and `Super Manager Approver` fields on the Project, rather than a hardcoded universal sequence. Unnecessary steps are skipped (e.g., if a Super Manager owns the project).
- **Self-Approval Validation**: `Submitter != Approver` normally. Invalid self-approvals will be rejected via server-side validation where supported, or reconciliation.
- **Workflow vs Database Mutation**: Controlled transition actions are the authoritative *Business Workflow*. Direct API mutation of a status/field that bypasses the intended workflow remains a residual platform limitation (Logic Functions do not act as pre-commit DB hooks).
- **Correction Mechanism**: Rejected records transition back to DRAFT. Locked records requiring correction must be VOIDED/ARCHIVED and versioned.

## 8. Document Immutability Controls

*Classification: OPERATIONAL LOCK + DETECTIVE RECONCILIATION*

**BUSINESS REQUIREMENT**: Invoice, Purchase Order, Delivery Challan, Contract, and Payment Records must be technically immutable after their authoritative/issued state. **CURRENT OSS CAPABILITY**: The Twenty architecture does not natively state-lock databases against arbitrary API mutations. **V1 CONTROL**: Operational Lock + Controlled Workflow + Audit + Detective Reconciliation. **RESIDUAL RISK**: An API-capable actor may mutate a locked record before reconciliation detects it.

| **DocumentRequired ImmutabilityAllowed Edits (Pre-Issue)Allowed Edits (Post-Issue)Correction Mechanism** |                                       |                         |      |                       |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------- | ---- | --------------------- |
| **Invoice**                                                                                              | Technical Immutability (Business Req) | Full edits (Draft)      | None | Void & Reissue        |
| **Purchase Order**                                                                                       | Technical Immutability (Business Req) | Full edits (Draft)      | None | Cancel & Reissue      |
| **Delivery Challan**                                                                                     | Technical Immutability (Business Req) | Full edits (Draft)      | None | Reversal Movement     |
| **Contract**                                                                                             | Technical Immutability (Business Req) | Full edits (Draft)      | None | Void & Reissue        |
| **Payments**                                                                                             | Technical Immutability (Business Req) | None (Created as final) | None | Reversal / Refund     |
| **Quotation**                                                                                            | Application-level lock acceptable     | Full edits (Draft)      | None | Versioning / Revision |

## 9. Financial Integrity Controls

*Classification: TRUE TECHNICAL ENFORCEMENT (unique constraints) + CONTROLLED WORKFLOW*

- **Authoritative Source**: Deterministic server-side calculations ONLY.
- **Representation**: Integer monetary representation (e.g., cents/paise).
- **Concurrency**: Idempotency keys included in payloads and enforced via unique constraints.
- **Failures**: Explicit state machines track partial completion. Multi-step failures rely on compensating operations.

## 10. Inventory Ledger Controls

*Classification: TRUE TECHNICAL ENFORCEMENT*

**IMMUTABLE INVENTORY MOVEMENT LEDGER**

- **Append-Only**: Movements (PURCHASE_RECEIPT, DISPATCH_TO_SITE, SITE_RETURN, CONSUMPTION, SCRAP_ADJUSTMENT, REVERSAL) are strictly append-only.
- **Historical Edits**: Prevented via Object permissions (`canUpdateObjectRecords = false`, `canDestroyObjectRecords = false`).
- **Corrections**: Explicit reversal/adjustment movements.
- **Balances**: Deterministically calculated by aggregating movements.

## 11. Document Numbering Controls

*Classification: TRUE TECHNICAL ENFORCEMENT*

- **Uniqueness**: Enforced via PostgreSQL `UNIQUE` database constraints.
- **Generation**: Deterministic generation at the exact transition to `SUBMITTED` or `ACTIVE`.
- **Concurrency**: Unique constraints natively reject race conditions.
- **Drafts**: Drafts will not hold an official document number.

## 12. Audit Controls (Append-Only)

*Classification: TRUE TECHNICAL ENFORCEMENT*

A dedicated `AuditLog` object will capture material business events (creation, owner change, approval, activation, financial adjustments, permission changes). It will NOT log trivial UI interactions.

- **Append-Only Rule**: Normal users cannot edit/delete audit records. Enforced via object permissions.
- **Captured Fields**: WHO, WHEN, ROLE, OBJECT, RECORD, ACTION, FIELD, OLD VALUE, NEW VALUE, REASON, REFERENCE, SOURCE / WORKFLOW.

## 13. Expanded Reconciliation Control Set

*Classification: DETECTIVE / COMPENSATING CONTROLS*

Reconciliation detects and records violations after they occur.

**SECURITY RECONCILIATION**

- **Unauthorized Project Lead mutations**: (Project Lead Actor + Actor != Project Owner + Restricted mutation). Freq: Hourly. Severity: High. Action: Alert Admin, flag record.
- **Unauthorized financial-field mutations**: Freq: Hourly. Severity: Critical. Action: Alert Admin, initiate reversal review.
- **Unauthorized permission/role changes**: Freq: Daily. Severity: Critical.

**DOCUMENT RECONCILIATION**

- **Locked document modified**: (`updatedAt` > `lockedAt` or state mutation). Freq: Hourly. Severity: Critical.
- **Issued document modified**: Freq: Hourly. Severity: Critical.
- **Duplicate document number**: Freq: Daily. Severity: High.
- **Invalid document state transition**: Freq: Hourly. Severity: High.

**FINANCIAL RECONCILIATION**

- **Invoice total mismatch**: Freq: Daily. Severity: High.
- **Tax/GST calculation mismatch**: Freq: Daily. Severity: High.
- **Duplicate financial submission**: Freq: Daily. Severity: High.
- **Payment exceeding permitted balance**: Freq: Daily. Severity: High.

**INVENTORY RECONCILIATION**

- **Inventory balance anomaly**: (Aggregated ledger != Cached balance). Freq: Daily. Severity: High. Action: Recalculate cache.
- **Negative stock where prohibited**: Freq: Hourly. Severity: High.
- **Invalid movement reference/reversal**: Freq: Daily. Severity: High.
- **Movement record modified/deleted**: (Detects DB-level tampering). Freq: Daily. Severity: Critical.

**AUDIT RECONCILIATION**

- **Critical mutation without corresponding audit event**: Freq: Daily. Severity: High.
- **Audit record modification/deletion**: Freq: Daily. Severity: Critical.

## 14. Role/Permission Baseline

Roles are strictly frozen: ADMIN, SUPER MANAGER, MANAGER, ACCOUNTANT, PROJECT LEAD, INTERN / DATA ENTRY.

## 15. AI Governance

- **FROZEN RULE**: AI/LLM MUST NEVER be authoritative for GST, tax, invoice totals, accounting totals, stock balances, document numbering, permissions, approval state, transaction state, or financial state.

## 16. V1 Blockers & Risk Acceptance

| **REQUIREMENTCURRENT CAPABILITYV1 STATUSCONTROLRESIDUAL RISKBLOCKING CONDITION** |                            |                            |                                                     |                                                |                                  |
| -------------------------------------------------------------------------------- | -------------------------- | -------------------------- | --------------------------------------------------- | ---------------------------------------------- | -------------------------------- |
| **Strict Project Lead Edit Isolation**                                           | No open-source update RLS  | Accepted Limitation        | Controlled Workflow + Detective Reconciliation      | API-capable actor could modify unowned project | MUST pass reconciliation tests.  |
| **Immutability of Locked Documents**                                             | No DB state-locks          | Accepted Limitation        | Operational Lock + Detective Reconciliation         | API-capable actor could modify locked document | MUST pass reconciliation tests.  |
| **Atomic Financial Transactions**                                                | Async Logic Functions only | Accepted Limitation        | Idempotency Keys + Unique Constraints + Append-Only | Double-clicks spawn duplicate async tasks      | Idempotency MUST be proven.      |
| **Approval Workflow State Locks**                                                | Static Field Permissions   | Accepted Limitation        | Controlled Workflow + Detective Reconciliation      | Direct API status edit bypass                  | Verification MUST detect bypass. |
| **Inventory Movement History**                                                   | Full                       | True Technical Enforcement | Object Permissions (`canUpdate = false`)            | None via Twenty API                            | None                             |

---

## 17. Final Architecture Consolidation — Ownership, Approval, Audit & Oversight

### 1. Project Owner

- **Definition**: A user/workspace member relationship representing the primary Project Lead responsible for the Project.
- **Usage**: Authoritative business assignment reference for accountability, the default "My Projects" view, and reconciliation actor-checks.
- **Classification**: Business Assignment Field (NOT true DB-level row security).

### 2. Manager Approver & Super Manager Approver

- **Definition**: Explicit user relationships on the Project defining WHO approves workflows for that specific project.
- **Validation**: Selection must be limited to active users who actually hold the respective Manager/Super Manager roles.

### 3. Approval History

- **Definition**: A specialized related list capturing the complete journey of a record (Record, Approval Type, Action, Previous/New Status, Actioned By, Approval Level, Date, Comment).
- **Usage**: Distinct from the broader AuditLog; focused purely on workflow state changes.

### 4. AuditLog vs Project Activity Timeline

- **AuditLog**: Comprehensive, append-only technical ledger of material business events (creation, financial mods, permission changes).
- **Project Activity Timeline**: Human-friendly chronological presentation of important events, derived from the structured audit/activity records.

### 5. Notification Rules & Organization Oversight

- **Notifications**: Triggered by *material* events (Project submitted, Invoice issued, Critical recon exception), providing management oversight without noise.
- **Oversight Dashboard**: A future concept for Admin/Super Manager to view aggregate project statuses, overdue approvals, financial exceptions, and security violations.

### 6. "My Work" / Default User Views

- **Definition**: Role-aware default UX views filtering lists (e.g., "My Projects" filters where `Project Owner = Current User`).
- **Classification**: UX Filtering Mechanism (NOT true security enforcement). API users can bypass UX filters to view all projects.

### 7. Final Project Object Architecture (Conceptual)

The final architecture includes the following fields (to be built in Phase 1A): `Project Name`, `Project Code`, `Customer`, `Site / Location`, `Project Type`, `Project Status`, `Approval Status`, `Project Owner`, `Manager Approver`, `Super Manager Approver`, `Start Date`, `Expected End Date`, `Contract Value`, `Internal Cost [restricted]`, `Margin / Profitability [restricted]`.

---

## 18. Phase 1A Architecture Validation Items

Before full CRM development proceeds, the following specific capabilities must be technically validated in Twenty:

1. **Unverified Capability**: Can Twenty natively filter User/Workspace Member relation picklists (e.g., restricting `Manager Approver` solely to users with the "Manager" role) via native configuration, or does this require a Business Integrity validation hook?
2. **Unverified Capability**: Can self-approval (`Submitter != Approver`) be prevented server-side via UI/API, or must this rely entirely on external Business Integrity validation?
3. **Unverified Capability**: Does Twenty's dashboarding natively support aggregating Organization Oversight metrics, or must this be exported/derived externally?

## 19. Phase 1 Scope & Exclusions

**Allowed**: Data model, relationships, field definitions, permission mapping, state model, numbering, audit strategy, inventory architecture, and business integrity architecture. **Excluded**: Do NOT immediately build every UI screen. Do NOT start production workflows until their enforcement mechanism is defined.

## 20. Implementation Classification Rules

Every Phase 1 feature MUST be classified before implementation as: **TRUE TECHNICAL ENFORCEMENT**, **CONTROLLED WORKFLOW**, **DETECTIVE / RECONCILIATION CONTROL**, or **ACCEPTED LIMITATION**. *Undocumented internal database hacks are strictly prohibited.*

## 21. Release / Go-Live Conditions

Phase 1 cannot proceed to production unless:

1. Reconciliation is tested to demonstrate that it **DETECTS** API-level violations of locked documents and unauthorized Project Lead mutations.
2. The Immutable Inventory Ledger is tested to demonstrate that ordinary API users cannot update/delete historical movement records natively.
3. Idempotency, constraints, numbering concurrency, and audit append-only permissions are rigorously proven.

---

**FINAL GATE**: EXECUTION STOPPED — AWAITING EXPLICIT REVIEW AND APPROVAL.

svg