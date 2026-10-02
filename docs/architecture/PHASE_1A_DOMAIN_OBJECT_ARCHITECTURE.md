# Phase 1A: Construction CRM Domain & Object Architecture

**Project**: CONSTRUCTION CRM V1 **Phase**: 1A Architecture Specification **Baseline**: Phase 0D Final Architecture Decision Record

## 1. Executive Summary

This document specifies the complete domain and object architecture for Construction CRM V1, serving as the blueprint for Phase 1B (Implementation). It rigorously maps object purposes, lifecycles, configurable approval routing, append-only ledgers, and strict detective controls. No production code, fields, or database changes have been implemented to produce this architecture.

---

## 2. Construction CRM Domain Model

The Construction CRM V1 domain is built around the **Project**. Projects aggregate operational objects (Sites, Contacts, Tasks) and commercial documents (Quotations, POs, Invoices, Contracts). Governance is maintained via explicit assignment (`Project Owner`), dynamic authority (`Manager Approver`), technical immutability (`Inventory Movement Ledger`), and compensating controls (`Reconciliation` and `AuditLog`).

---

## 3. & 4. Object Inventory & Object-by-Object Purpose

Every item evaluated for the V1 architecture:

### Project

- **Purpose**: Central operational hub aggregating all activity and financials.
- **Why it exists**: Core business record mapping work to revenue.
- **Type**: Primary Object.
- **Ownership**: `Project Owner` (Workspace Member).
- **Lifecycle**: DRAFT → SUBMITTED → APPROVED → ACTIVE → LOCKED.
- **Append-Only?**: No.
- **Financially Sensitive?**: Yes (Internal Cost, Margin).
- **Approval Controlled?**: Yes (Status/Budget changes).
- **Audit Controlled?**: Yes.

### Customer

- **Purpose**: The client entity.
- **Why it exists**: Billing and CRM relationship.
- **Type**: Standard Object (Mapped to Twenty `Company`).
- **Ownership**: Global/Account Owner.
- **Lifecycle**: ACTIVE / INACTIVE.
- **Append-Only?**: No.
- **Financially Sensitive?**: No.
- **Approval Controlled?**: No.
- **Audit Controlled?**: Yes (Creation/Deletion).

### Contact

- **Purpose**: Human stakeholders.
- **Type**: Standard Object (Mapped to Twenty `Person`).
- **Ownership**: Inherited from Customer/Project.
- **Lifecycle**: ACTIVE / INACTIVE.
- **Append-Only?**: No.

### Site / Location

- **Purpose**: Physical location for material delivery and work execution.
- **Why it exists**: Disambiguates delivery targets from billing addresses.
- **Type**: Relational Field on Project OR Custom Object (if multiple sites per project). For V1: Custom Object linked to Project.
- **Append-Only?**: No.
- **Financially Sensitive?**: No.
- **Approval Controlled?**: No.

### Quotation

- **Purpose**: Commercial proposal.
- **Type**: Document Object.
- **Lifecycle**: DRAFT → SUBMITTED → APPROVED → SENT/ACTIVE → EXPIRED/REVISED/ACCEPTED.
- **Append-Only?**: No (Uses Application-level locking & versioning).
- **Financially Sensitive?**: Yes.
- **Approval Controlled?**: Yes.

### Purchase Order (PO)

- **Purpose**: Formal supplier commitment.
- **Type**: Document Object.
- **Lifecycle**: DRAFT → SUBMITTED → APPROVED → ISSUED → LOCKED / CANCELLED.
- **Append-Only?**: Yes (Requires Technical Immutability post-issue).
- **Financially Sensitive?**: Yes.
- **Approval Controlled?**: Yes.

### Delivery Challan (DC)

- **Purpose**: Proof of material movement.
- **Type**: Document Object.
- **Lifecycle**: DRAFT → APPROVED → ISSUED → LOCKED / REVERSED.
- **Append-Only?**: Yes (Requires Technical Immutability post-issue).
- **Financially Sensitive?**: No (Quantity focused).
- **Approval Controlled?**: Yes.

### Invoice

- **Purpose**: Billing document.
- **Type**: Document Object.
- **Lifecycle**: DRAFT → SUBMITTED → APPROVED → ISSUED → LOCKED / VOIDED.
- **Append-Only?**: Yes (Requires Technical Immutability post-issue).
- **Financially Sensitive?**: Yes.
- **Approval Controlled?**: Yes.

### Contract

- **Purpose**: Master agreement defining overarching project values.
- **Type**: Document Object.
- **Lifecycle**: DRAFT → SUBMITTED → APPROVED → ISSUED → LOCKED / VOIDED.
- **Append-Only?**: Yes.
- **Financially Sensitive?**: Yes.
- **Approval Controlled?**: Yes.

### Payment

- **Purpose**: Log of received/dispatched funds.
- **Why it exists**: Reconciles against Invoices/POs.
- **Type**: Ledger Record / Object.
- **Append-Only?**: YES.
- **Financially Sensitive?**: Yes.
- **Approval Controlled?**: No (Created as final; corrections require Reversals).

### Material

- **Purpose**: Catalog of items.
- **Type**: Reference Object.
- **Append-Only?**: No.

### Inventory Movement

- **Purpose**: Tracks exact stock flow.
- **Why it exists**: Provides an immutable trail instead of a mutable "stock count" field.
- **Type**: Ledger Object.
- **Append-Only?**: YES.
- **Financially Sensitive?**: Yes (Affects asset value).
- **Approval Controlled?**: Derived from parent document (DC/PO).

### Task

- **Purpose**: Assignable to-dos.
- **Type**: Native Activity Object.
- **Approval Controlled?**: No.

### Document/Attachment

- **Purpose**: File storage (PDFs, photos).
- **Type**: Native Attachment Object.

### Approval History

- **Purpose**: Tracks the workflow journey.
- **Type**: Dedicated Governance Object.
- **Append-Only?**: YES.
- **Audit Controlled?**: System-managed.

### AuditLog

- **Purpose**: Broad business history of material changes.
- **Type**: Dedicated Governance Object.
- **Append-Only?**: YES (Enforced via DB permissions).

---

## 5. Relationship Map

- **Project -> Customer**: Many-to-One. (Projects belong to one client entity).
- **Project -> Contact**: Many-to-Many.
- **Project -> Site**: One-to-Many. (A project can span multiple physical sites).
- **Project -> Quotation / PO / Invoice / DC / Contract**: One-to-Many. (Objects because they require independent lifecycles, approvals, and line items).
- **Invoice -> Payment**: One-to-Many. (Partial payments allowed).
- **Delivery Challan -> Inventory Movement**: One-to-Many. (A single DC triggers multiple ledger entries).
- **Inventory Movement -> Material & Site**: Many-to-One. (The ledger joins what moved and where).
- **Project -> Approval History**: One-to-Many. (A dedicated object because standard Activity timelines lack structured workflow fields like Prev Status/New Status/Approval Level).
- **Any Object -> AuditLog**: Morphic relation. (A dedicated object because we must enforce append-only security, which native timelines don't natively segregate for financial rigor).

---

## 6. Project Architecture

The Project object will not have redundant "Project Lead" and "Project Owner" fields. **Project Owner** is the sole authoritative business assignment reference.

**Fields**:

- `Project Name` (Text)
- `Project Code` (Auto-number/Unique Text)
- `Customer` (Relation to Company)
- `Site / Location` (Relation to Site)
- `Project Type` (Picklist)
- `Project Status` (Picklist)
- `Approval Status` (Picklist)
- `Project Owner` (Relation to Workspace Member - The primary Project Lead)
- `Manager Approver` (Relation to Workspace Member)
- `Super Manager Approver` (Relation to Workspace Member)
- `Start Date` (Date)
- `Expected End Date` (Date)
- `Contract Value` (Currency Integer)
- `Internal Cost` (Currency Integer) [Restricted]
- `Margin / Profitability` (Currency Integer) [Restricted]
- `Actual Cost` (Currency Integer - Derived) [Restricted]
- `Total Invoiced` (Currency Integer - Derived)

---

## 7. Ownership Model

- **Role**: Defines *what* an actor can do globally (e.g., "Manager").
- **Project Ownership**: Defines *who* is responsible for the project (`Project Owner`). Governs UX filtering ("My Projects") and Reconciliation checks.
- **Project Team Membership**: Not utilized as a technical boundary in V1 to avoid false claims of RLS. Roles provide broad access; Ownership provides accountability.
- **Approval Authority**: Assigned per-project via `Manager Approver` and `Super Manager Approver` fields.
- **Financial Authority**: Restricted strictly by Global Role (Interns/Project Leads cannot view; Managers cannot view restricted fields; Super Managers/Accountants can).

---

## 8. Approval Architecture

Approval routing is dynamic and defined by the Project's relationships. We will **NOT** hardcode a generic `Lead -> Manager -> Super Manager` chain.

**Workflows:**

- If an action requires Manager approval, it routes to the `Manager Approver`.
- If the Submitter IS the `Manager Approver`, it escalates to `Super Manager Approver`.
- **Validation**: `Submitter != Approver`. *Technical Enforcement*: This cannot be enforced server-side natively in Twenty prior to commit (see Validation section). It must be handled via UI restriction + Detective Reconciliation + Async Webhook Reversal.

**Fields (on Approval History)**: Submitter, Approver, Approval Level, Approval Status, Previous Status, New Status, Date/Time, Comment, Reason.

---

## 9. Approval History Architecture

**Decision**: It MUST be a dedicated object, not merged into standard notes/activities. **Why**: Approvals require structured, queryable data (Previous Status, New Status, Approval Level) to trigger downstream automations and pass audit scrutiny. Standard activities are unstructured text. **Fields**: Target Record (Morphic), Action, Submitter, Approver, Previous Status, New Status, Timestamp, Comments.

---

## 10. AuditLog Architecture

**Nature**: Captures MATERIAL business events and MATERIAL field changes. Does NOT log UI interactions. **Fields**: WHO (User), WHEN (Timestamp), ROLE, OBJECT, RECORD, ACTION (Update/Create), FIELD, OLD VALUE, NEW VALUE, REASON, REFERENCE, SOURCE/WORKFLOW. **Append-Only Implementation**: Twenty allows object-level permission configuration. We will set `canUpdateObjectRecords = false` and `canDestroyObjectRecords = false` for ALL roles, including Admins. Only system-level API keys (Business Integrity Layer) will create records, or native triggers if supported.

---

## 11. Activity Timeline Architecture

**Decision**: Derive from a combination. Native Twenty activities (Tasks, Notes) will provide operational context. Material changes will surface in the UI by querying the `AuditLog` and `Approval History`. **Reasoning**: Avoids duplicate storage. The Timeline is simply a UX presentation layer combining operational and governance objects.

---

## 12. My Work Architecture (UX Filters)

These are explicitly **UX filters**, NOT row-level security.

- **Project Lead**: *My Projects* (Filter: Project Owner = Current User).
- **Manager**: *Projects Requiring My Action* (Filter: Manager Approver = Current User AND Status = Submitted).
- **Super Manager**: *Organization Overview* (Unfiltered).
- **Admin**: *Administration* (Unfiltered).
- **My Tasks**: Filter: Assignee = Current User.
- **My Approvals**: Filter: Approver = Current User.

---

## 13. Project Team Architecture

**Decision**: V1 will utilize `Project Owner` ONLY. **Reasoning**: Without native Row-Level Security, a complex multi-member `Project Team` relationship implies granular access sharing that the platform cannot enforce. A single `Project Owner` establishes clear business accountability and reconciliation rules. Other actors (Estimators, Accountants) access projects via their global Role permissions.

---

## 14. Document Architecture

All documents inherit their primary relationships from the `Project` and `Customer`. **Document Immutability Limitations**: The business requires technical immutability post-issue for Invoices, POs, DCs, Contracts, and Payments. Twenty OSS does NOT natively state-lock databases against API edits. V1 will utilize Operational Locking (UI disable) + Detective Reconciliation (Alerts on tampering).

- **Quotation**: DRAFT → SUBMITTED → APPROVED → SENT/ACTIVE → EXPIRED/REVISED/ACCEPTED. (App-level locking).
- **PO**: DRAFT → SUBMITTED → APPROVED → ISSUED → LOCKED / CANCELLED. (Immutability required).
- **Invoice**: DRAFT → SUBMITTED → APPROVED → ISSUED → LOCKED / VOIDED. (Immutability required).
- **Contract**: DRAFT → SUBMITTED → APPROVED → ISSUED → LOCKED / VOIDED. (Immutability required).
- **Delivery Challan**: DRAFT → APPROVED → ISSUED → LOCKED / REVERSED. (Immutability required).
- **Payment**: Automatically ACTIVE. Append-only. Corrections require Reversals.

---

## 15. Inventory Ledger Architecture

**Concept**: IMMUTABLE INVENTORY MOVEMENT LEDGER. (Not "double-entry accounting"). **Movements**: PURCHASE_RECEIPT, DISPATCH_TO_SITE, SITE_RETURN, CONSUMPTION, SCRAP_ADJUSTMENT, REVERSAL. **Fields**: Material, Project, Site, Quantity (Integer), Unit, Reference Document (DC/PO), Movement Date, Actor, Reversal Relationship, Source. **Enforcement**: Object permissions disable edit/delete for historical movements. Corrections are purely additive (Reversals).

---

## 16. Financial Data Architecture

**Calculations**: Deterministic and server-side ONLY. AI is never authoritative. **Representation**: Integers (e.g., paisa/cents) for all monetary fields (Amount, Line Totals, GST/Tax, Document Totals). **Separation**:

- *PUBLIC / OPERATIONAL*: Contract Value, Invoice Totals.
- *RESTRICTED FINANCIAL*: Internal Cost, Labour Cost, Material Cost, Project Cost, Margin, Profitability, Salary. **Implementation**: Mapped via `core.fieldPermission` (`canReadFieldValue = false` for Project Leads/Interns/Managers).

---

## 17. State Machines

Refined State Machines:

- **Project**: DRAFT → SUBMITTED → APPROVED → ACTIVE → LOCKED. (Void/Cancel are typically handled by archiving or setting status to CANCELLED).
- **Quotation**: DRAFT → SUBMITTED → APPROVED → SENT → ACCEPTED / REVISED / EXPIRED.
- **Contract**: DRAFT → SUBMITTED → APPROVED → ISSUED → LOCKED (or VOIDED).
- **Purchase Order**: DRAFT → SUBMITTED → APPROVED → ISSUED → LOCKED (or CANCELLED).
- **Delivery Challan**: DRAFT → APPROVED → ISSUED → LOCKED (or REVERSED).
- **Invoice**: DRAFT → SUBMITTED → APPROVED → ISSUED → LOCKED (or VOIDED).
- **Payment**: APPLIED (No draft state; immediate ledger impact) → REVERSED (if corrected).
- **Inventory Movement**: RECORDED (No draft state; immediate ledger impact) → REVERSED.

---

## 18. Numbering Architecture

**Requirements**: Unique, deterministic, supports concurrency, idempotent. **Design**:

- Rely on native PostgreSQL `UNIQUE` constraints on the Document Number field.
- Numbers (e.g., `INV-2026-0001`) are generated precisely at the transition to `ISSUED` or `SUBMITTED`, avoiding skipped numbers on abandoned drafts.
- Workflows must handle HTTP 409/Constraint violations gracefully by fetching the next sequence.

---

## 19. Permission Dependencies

**Conflicts & Dependencies**:

- *Interns/Project Leads* -> `canReadFieldValue` = FALSE on Financials.
- *Project Leads* -> `canUpdateObjectRecords` globally TRUE on Projects (Platform constraint), but UI and Reconciliation restrict them to Owned projects.
- *All Roles* -> `canUpdateObjectRecords` = FALSE on `AuditLog` and `Inventory Movement`.
- *Accountant* -> Full Document rights, but limited operational Project edit rights.

---

## 20. Notification Architecture

**Mechanism**: CONFIGURATION + BUSINESS INTEGRITY LAYER. **Material Events**: Project submitted, Approval rejected/completed, Owner/Approver changed, Contract value changed, Budget changed, Invoice issued, PO approved, Payment recorded, Critical reconciliation exception, Unauthorized mutation detected. Routine site notes will NOT trigger management notifications.

---

## 21. Organization Oversight Architecture

**Metrics**: Active Projects, Pending Approvals, Financial Exceptions, Inventory Anomalies, Integrity Violations. **Dependencies**: Requires aggregation across `Project`, `Approval History`, and `Reconciliation Logs`. **Limitation**: Twenty's native dashboard is a UI layout tool, not a BI aggregator. V1 will rely on filtered List Views and external summary scripts for oversight.

---

## 22. Reconciliation Dependencies

Reconciliation is a DETECTIVE / COMPENSATING CONTROL. It is NOT preventative.

- **Security**: Unauthorized Lead mutation (Requires evaluating Actor vs Project Owner).
- **Documents**: Locked document modification (Requires comparing `updatedAt` vs `lockedAt`).
- **Financial**: Invoice total mismatch (Requires summing line items vs document total).
- **Inventory**: Balance anomaly (Requires summing `Inventory Movement` vs cached balance).
- **Audit**: Missing audit records (Requires comparing `updatedAt` of Project vs `AuditLog` entries).

---

## 23. Phase 1A Technical Validation Results

**A. Can Twenty natively filter User/Workspace Member relationship picklists by role?**

- **Tested**: Schema introspection of `core.fieldMetadata` via `psql`.
- **How it was tested**: Ran `\d core."fieldMetadata"` in the Twenty database to search for relation filter properties.
- **Result**: NO NATIVE SQL/SCHEMA FILTER.
- **Evidence**: The schema contains `options` and `settings` JSONB fields, but no explicit `relationFilter` mechanism is natively enforced at the DB level for relations.
- **Limitation**: Natively, users might see all Workspace Members in the `Manager Approver` dropdown.
- **Architecture Impact**: Must be handled via UI convention and validated defensively in the Business Integrity Layer (detective).

**B. Can Submitter != Approver be enforced server-side natively?**

- **Tested**: SDK and Logic Function execution model.
- **How it was tested**: Reviewed `LogicFunctionExecutorService` limits from Phase 0C.
- **Result**: NO.
- **Evidence**: Twenty lacks a synchronous pre-commit validation rule engine. Logic functions run via BullMQ (asynchronous).
- **Limitation**: Cannot technically prevent a user from assigning themselves and saving the record.
- **Architecture Impact**: Must be enforced via UI (hiding the button) + Detective Reconciliation (Alerting/Reverting post-commit).

**C. What native Twenty dashboard/reporting capabilities exist for Organization Oversight metrics?**

- **Tested**: Schema introspection of `workspace_XYZ.dashboard`.
- **How it was tested**: Queried the dashboard schema in the Twenty database.
- **Result**: LIMITED.
- **Evidence**: The `dashboard` table only contains a `pageLayoutId` and `title`. It is a container for views, not a BI engine for complex aggregations.
- **Limitation**: Cannot natively plot complex cross-object aggregated exception metrics.
- **Architecture Impact**: Organization Oversight in V1 will rely on filtered standard List Views (e.g., "Exceptions List") rather than graphical charts.

---

## 24. Classification

| **ComponentClassification**            |                                      |
| -------------------------------------- | ------------------------------------ |
| Inventory Ledger Immutability          | **TRUE TECHNICAL ENFORCEMENT**       |
| AuditLog Append-Only                   | **TRUE TECHNICAL ENFORCEMENT**       |
| Document Numbering Uniqueness          | **TRUE TECHNICAL ENFORCEMENT**       |
| Restricted Financial Fields            | **CONFIGURATION**                    |
| Project Owner "My Work" Filtering      | **CONTROLLED WORKFLOW** (UX Only)    |
| Operational Document Locks             | **CONTROLLED WORKFLOW**              |
| Submitter != Approver Rule             | **DETECTIVE / COMPENSATING CONTROL** |
| Unauthorized Edit Detection            | **DETECTIVE / COMPENSATING CONTROL** |
| Project Lead strict API edit isolation | **ACCEPTED LIMITATION**              |

---

## 25. Open Questions

**Must resolve before Phase 1B:**

- What is the specific string prefix format for auto-numbering (e.g., `INV-2026-` vs `INV-`)?
- Since native role-filtering on Approver dropdowns is unverified/unsupported, do we proceed with an unfiltered UI dropdown + reconciliation, or requires a custom frontend patch immediately?

**Can resolve during Phase 1B:**

- Exact selection of fields to mask from Manager roles (Internal Cost, Margin are confirmed, but what about Labour vs Material splits?).

**Can defer to later phase:**

- Graphical BI Dashboarding (Oversight will use raw List Views for V1).

---

## 26. Recommended Phase 1B Implementation Sequence

To safely implement the CRM without risking data integrity, Phase 1B should strictly follow these increments:

1. **Increment 1: Core Master Data** (Projects, Customers, Contacts, Sites, Materials).
2. **Increment 2: Role & Permission Foundation** (Implement workspace roles, restrict financial fields, disable update/destroy on ledgers).
3. **Increment 3: Governance Base** (Create `AuditLog` and `Approval History` objects, apply append-only permissions).
4. **Increment 4: Ownership & Approvals** (Add `Project Owner`, `Manager Approver`, build state picklists).
5. **Increment 5: Document Foundation** (Quotation, PO, Invoice, DC, Contract without financial math yet).
6. **Increment 6: Financial Layer** (Add integer financial fields, deterministic calculation scripts).
7. **Increment 7: Inventory Ledger** (Implement `Inventory Movement` object).
8. **Increment 8: Integrity & Numbering** (Apply unique constraints, deploy reconciliation scripts).
9. **Increment 9: Testing & Validation**.

svg