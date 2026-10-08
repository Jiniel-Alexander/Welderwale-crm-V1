# CONSTRUCTION CRM V1 — SYSTEM-DRIVEN APPLICATION STANDARD & RECORD HISTORY SPECIFICATION

**Status:** Proposed operating standard for implementation
**Applies to:** All V1 modules, screens, workflows, calculations, automations, integrations, and future changes
**Immediate implementation increment:** M1.1 — Derived Data, Automation & History Foundation

---

## 1. Purpose

Construction CRM V1 must behave as a system-driven application, not as a collection of independent forms.

The user should enter a business fact once. The system should reuse that fact, derive dependent values, propagate relevant context, create required downstream records, and expose the resulting changes without asking the user to re-enter the same information on multiple screens.

Every future module must therefore be implemented together with its:

- source-of-truth definition;
- downstream effects;
- workflow/state behavior;
- Logic Function or server-side calculation requirements;
- Business Integrity requirements where applicable;
- audit/history behavior;
- notification requirements;
- permissions;
- duplicate/idempotency rules;
- failure/retry behavior;
- UI/context propagation;
- tests and reconciliation checks.

This document becomes the reusable implementation pattern for future work.

---

## 2. Authority Hierarchy

When implementing or modifying the product, use the following authority order:

1. **PHASE_0D_V1_RISK_ACCEPTANCE_AND_IMPLEMENTATION_CONTROL_PLAN.md** — technical/security authority.
2. **CONSTRUCTION_CRM_V1_BUSINESS_REQUIREMENTS_AND_DOMAIN_MODEL_v1.0.md** — business authority.
3. **PHASE_1A_REVISION_1_1_DOMAIN_OBJECT_ARCHITECTURE.md** — frozen domain/object architecture.
4. **PHASE_1A_REVISION_1_1_ARCHITECTURE_DECISION_LOG.md** — approved architecture decisions and rationale.
5. **Phase 1B implementation documents** — implementation mapping and capability decisions.
6. **This standard** — reusable delivery pattern for system-driven behavior, history, and change impact analysis.
7. **Current implementation state and tests** — evidence of what is actually deployed.

An implementation must never silently create a competing source of truth because it is easier to code.

---

## 3. Core Product Principle

### ENTER ONCE → STORE ONCE → DERIVE/PROPAGATE → AUDIT → DISPLAY

For every business fact:

**User input**
→ authoritative record
→ downstream synchronization/calculation
→ dependent screens refresh from system data
→ audit/history entry
→ notifications/tasks/approvals where required
→ reconciliation when asynchronous processing is unavoidable.

The CRM should minimize duplicate entry and make exception handling the normal point of human intervention.

---

## 4. Required Source-of-Truth Rules

### 4.1 Hierarchy

`Organization → Worksite → Project`

One Worksite can contain multiple Projects. Every Project belongs to exactly one Worksite. Customer context for Project must come from the Worksite. If a duplicated Project.Customer field is technically required for query/UI convenience, it is a derived/cache field and must never become an independently editable source of truth.

### 4.2 Commercial source-of-truth examples

- Quotation totals = derived from Quotation Revision Lines.
- BOQ value = derived from BOQ Lines.
- Invoice totals = derived from Invoice Lines.
- Payment balance = derived from Payment Amount and Payment Allocations.
- Inventory balance = derived from Inventory Movement history.
- Labour cost = derived from Labour entries.
- Expense cost = derived from Expense entries.
- Project cost = derived from Material + Labour + Expense and other explicitly approved direct-cost sources.
- Project profitability = derived, never manually entered as an authoritative value.
- Retention = authoritative customer-withheld receivable tracking, released through the defined payment allocation mechanism.

### 4.3 Immutable / historical sources

The system must preserve authoritative historical transactions. Issued commercial documents, posted inventory movements, payments, approved quotation revisions, and audit records must not be silently overwritten.

---

## 5. Mandatory Development Pattern for Every Future Module

No module is considered implemented merely because its page renders.

Every implementation request must answer these questions before code is written:

### A. Business purpose
What real business process does this module represent?

### B. Objects and relationships
Which objects are created, read, updated, related, or derived?

### C. Source of truth
Which field/object owns each business fact?

### D. Context propagation
Which values should automatically populate from the current context?

### E. Downstream effects
What should change when this record is created, updated, approved, issued, reversed, or closed?

### F. Workflow
Which state transitions, approvals, tasks, notifications, or reminders are required?

### G. Server-side logic
Which deterministic calculations or synchronization rules require Logic Functions / server-side extension?

### H. Business Integrity
Which rules require asynchronous validation, numbering, reconciliation, idempotency, or compensating controls?

### I. Audit/history
Which business events and field changes must be recorded?

### J. Permissions
Who may view, create, update, approve, issue, reverse, or correct the record?

### K. Failure behavior
What happens on duplicate submit, timeout, retry, partial processing, stale data, or downstream failure?

### L. Tests
Which positive, negative, permission, duplicate, concurrency, historical, and cross-module tests prove completion?

---

## 6. Workflow vs Logic Function vs Business Integrity Layer

### Use Workflow for business process orchestration

Typical examples:

- create a follow-up Task after a status change;
- notify the appropriate manager after approval submission;
- route an approval;
- send a reminder;
- create a non-financial operational activity;
- perform simple business-user-configurable branching.

### Use Logic Functions / server-side extension for deterministic domain behavior

Typical examples:

- Worksite Customer → Project Customer synchronization;
- derived field propagation;
- deterministic line-item calculations;
- earned value calculations;
- profitability cache/read model refresh;
- material weighted-average costing;
- generation of derived operational summaries;
- creating a controlled audit event after a domain mutation when appropriate.

### Use the Business Integrity Layer for rules that cannot safely be guaranteed by normal UI/workflow behavior

Typical examples:

- concurrency-safe document numbering;
- payment allocation hard caps;
- idempotency and duplicate protection for retriable business actions;
- asynchronous integrity checks;
- reconciliation and exception detection;
- controlled state/lock enforcement where native synchronous blocking is unavailable.

**Important:** asynchronous BIL/Logic Functions must not be described as transactional rollback protection. If Twenty cannot block a mutation atomically, the product must use a safe pending/validation state, compensating control, or reconciliation pattern instead of pretending the check is synchronous.

---

## 7. System-Driven Context Propagation Standard

### 7.1 Context chain

- Selecting **Organization/Customer** should provide relevant customer context to dependent screens.
- Selecting **Worksite** should carry customer/site context.
- Selecting **Project** should carry worksite + customer context.
- Selecting **Quotation** should carry quotation/customer/worksite/project context where the relationship exists.
- Selecting **Project** while creating a transaction should prefill project-related context and valid downstream relationships.
- Selecting **Material**, **Worker/Labour**, **Supplier**, or **Equipment** should reuse master identity rather than requiring re-entry.

### 7.2 Progressive disclosure

Users should enter only information that is not already known by the system.

Advanced costing, commercial overrides, exception fields, and governance controls should appear only when relevant.

### 7.3 Batch operations

Where the process is repetitive, use grid/batch entry rather than forcing one-record-at-a-time entry.

---

## 8. Cross-Module Impact Rule

Every field change must be classified before implementation as one of:

- **Source field** — authoritative business fact.
- **Derived field** — calculated from source data.
- **Context/cache field** — duplicated only for query/UI convenience and synchronized from the source.
- **Snapshot field** — intentionally frozen historical value.
- **Operational field** — user-maintained state that does not become a source for unrelated derived values.
- **Governance field** — approval, audit, lock, correction, or control metadata.

When a source field changes, the agent must identify all dependent fields, pages, reports, workflows, notifications, and reconciliation rules before changing the schema/UI.

No new field may be added without answering:

1. What owns it?
2. What reads it?
3. What writes it?
4. What derives from it?
5. What history does it generate?
6. What happens if it changes later?
7. Is it authoritative, derived, cached, snapshot, operational, or governance data?

---

## 9. Module Dependency / Behavior Baseline

### Organization / Customer

Source-of-truth for customer identity, billing/business identity and reusable customer context.

Changes may affect:
- Worksite customer context;
- Project customer convenience/cache fields;
- quotations;
- contracts;
- customer POs;
- invoices;
- payment party context;
- customer-level reporting.

The system should not ask the user to re-enter customer identity on every dependent record.

### Contact / Organization Contact

Universal contact directory with contextual organization relationships.

Changes may affect:
- primary/contact display on Worksite and Project;
- document contact selections;
- operational communication records.

A relationship change must not duplicate or delete the underlying master person/company incorrectly.

### Worksite

Authoritative physical execution context.

Changes may affect:
- all Projects under the Worksite;
- derived Project Customer context;
- site contact/site engineer/site supervisor references;
- project/site document context;
- worksite-level reporting.

### Project

Primary commercial/operational unit for project execution and profitability.

Changes may affect:
- BOQ;
- quotations;
- contracts;
- customer/supplier POs;
- fabrication;
- inventory consumption;
- labour;
- expenses;
- challans;
- invoices;
- payments/outstanding;
- profitability;
- project tasks and notifications.

### Quotation / Revision / Lines

Quotation header identifies the commercial object; revision represents the commercial state.

Submitting/issuing a revision must preserve history. Editing a submitted commercial version creates a new revision instead of overwriting the old state.

Conversion to invoice must use the approved quotation snapshot and must be idempotent.

### BOQ / BOQ Lines / BOQ Changes

BOQ is the execution/billing baseline.

Changes must be historically represented. Approved quantities cannot fall below quantities already billed.

BOQ changes can affect:
- fabrication planned quantities;
- delivery/installation progress;
- RA billing eligibility;
- earned value;
- project profitability.

### Material / Inventory Movement

Material is master data. Inventory Movement is the authoritative stock ledger.

Movement creation must automatically update derived stock visibility and project cost views where applicable.

Posted movement history must remain immutable; corrections use reversals/adjustments rather than destructive edits.

### Labour

Labour entries drive project labour costing and operational workforce reporting.

A worker remains reusable company resource; project allocation is not permanent ownership.

### Expense

Expense records drive project/workshop cost analysis and profitability.

### Fabrication Job

Fabrication progress should connect to BOQ and project context so planned/actual quantities can flow into execution reporting and, where applicable, earned-value logic.

### Delivery Challan

Dispatch/receipt information should inherit Project + Worksite context and preserve historical issued snapshots.

### Invoice / Invoice Lines

Invoice is a controlled commercial document.

Header totals must derive from lines and defined deductions. After issue, correction uses Credit Note/Debit Note or Void/Reissue rather than silent mutation.

### Payment / Payment Allocation

Payment is the monetary ledger entry. Payment Allocation distributes it against invoices or defined allocation types.

Balances and outstanding must derive from transaction history. Payment deletion is prohibited; corrections use reversal/correction patterns.

### Project Profitability / Dashboards

These are read/derived views, never manual sources of truth.

Dashboards must recalculate from underlying transactions and should never maintain independent authoritative counters.

---

## 10. Record History Tab — Required V1 UX

### 10.1 Goal

Every major business record should have a **History** tab that presents record history as a searchable, filterable table rather than relying on a scrolling timeline.

This is an extension of the existing append-only AuditLog concept, not a competing second audit database.

### 10.2 Required table columns

| Column | Meaning |
|---|---|
| Timestamp | Exact date/time of change |
| Changed By | User who performed the mutation |
| Role | Effective role at time of change |
| Action | CREATE / UPDATE / APPROVE / REJECT / ISSUE / VOID / REVERSE / DELETE_ATTEMPT / SYSTEM_UPDATE / etc. |
| Field | Business field that changed |
| Previous Value | Value before change; blank for creation |
| New Value | Value after change; blank for deletion/reversal where appropriate |
| Source | USER / WORKFLOW / LOGIC_FUNCTION / BIL / SYSTEM |
| Reason / Reference | Optional business reason, approval reference, correction reference, or related event |

### 10.3 Required interactions

The History tab must support:

- search by field name;
- search by old value;
- search by new value;
- search by changed-by user;
- filter by action;
- filter by source;
- filter by date range;
- sort by newest/oldest;
- pagination;
- clear filters;
- export where supported and safe.

Examples:

- Search `Price` → see all price changes.
- Search `Material` → see material changes.
- Search `Contact` → see contact changes.
- Search `Customer` → see customer changes.
- Search a value such as `₹25,000` → find where it changed.

### 10.4 Scope

Create a reusable Record History component/page pattern that can be attached to every applicable record type:

- Organization / Customer
- Contact
- Organization Contact
- Worksite
- Project
- Quotation / Revision
- BOQ / BOQ Change
- Customer PO
- Supplier PO
- Contract
- Material
- Inventory Movement
- Fabrication Job
- Delivery Challan
- Invoice / Credit Note / Debit Note
- Payment / Payment Allocation
- Expense
- Labour
- Approval History where appropriate

### 10.5 What should NOT become noisy history

Routine technical metadata such as internal update timestamps, framework bookkeeping IDs, or non-business rendering state should not flood the table.

The rule is: **all business/user-visible field changes are historically visible; technical noise is suppressed or grouped.**

---

## 11. AuditLog Architecture for the History Tab

The History tab should read from a structured append-only AuditLog source.

Required AuditLog logical model:

- Target Object
- Target Record ID
- Changed By User
- Role
- Timestamp
- Action
- Field
- Old Value
- New Value
- Source
- Request/Execution ID where available
- Correlation/Idempotency ID where applicable
- Reason/Reference

AuditLog must not be exposed as a normal editable business table to standard users.

The UI History tab is a presentation/query layer over this structured history.

Do not create separate history tables for each module unless a technical constraint forces one. Prefer one reusable audit model with indexed target object + target record filtering.

---

## 12. Automatic History Capture Rules

For an UPDATE:

1. Detect actual value change.
2. Record one audit entry per changed business field.
3. Capture old and new values.
4. Capture user/role or system actor.
5. Capture action/source.
6. Capture correlation/execution ID when available.
7. Do not create duplicate history from a retry of the same event.

For CREATE:

- record creation event;
- optionally include initial business-field values according to volume/performance rules.

For state transitions:

- capture previous state → new state as a first-class history event;
- connect approval/submission/issue/reversal events to Approval History when applicable.

For system-derived updates:

- Source = LOGIC_FUNCTION / WORKFLOW / BIL / SYSTEM.
- The history must make it clear that the user did not manually change the value.

---

## 13. Idempotency / Retry Standard

Every system-driven action that can be retried must have a duplicate-protection strategy.

Examples:

- Worksite Customer sync must be safe to execute multiple times.
- Convert Quotation → Invoice must never create duplicate invoices on repeated clicks.
- Inventory consumption must never double-consume because a request was retried.
- Payment posting must not create duplicate ledger rows after a network retry.
- Audit events must not be duplicated by repeated event delivery.

Use event IDs, execution IDs, idempotency keys, processed-event markers, or equivalent supported mechanisms.

Do not use timer throttling as the primary loop-prevention mechanism.

---

## 14. Future Change Impact Analysis — Mandatory Gate

Before any future developer/agent adds a field, changes a relationship, changes a status, or changes a page, it must create a short impact map covering:

### Schema impact
What objects, fields, relations, indexes, unique constraints or permissions change?

### Source-of-truth impact
Does the change create a new authoritative field or duplicate an existing fact?

### Automation impact
Which workflows, Logic Functions, event triggers, calculations, or sync rules need modification?

### UI impact
Which list/detail/create/edit/history/report screens change?

### History impact
What new field/action needs audit tracking?

### Permission impact
Who gains/loses read/create/update/approve/issue/reverse rights?

### Financial/inventory impact
Could this affect revenue, cost, stock, payments, outstanding, profitability, GST/TDS/retention, or document numbering?

### Data migration impact
Does existing data need backfill or reconciliation?

### Test impact
Which regression cases must be added or changed?

No production change should bypass this impact analysis.

---

## 15. Mandatory Implementation Sequence for Each Module

The preferred sequence is:

1. Read authoritative source documents and existing context files.
2. Inspect the existing implementation before changing it.
3. Identify sources of truth and dependencies.
4. Produce a bounded implementation plan and side-effect map.
5. Implement schema/relations/constraints/permissions.
6. Implement workflows and state transitions.
7. Implement Logic Functions/server-side derived behavior.
8. Implement Business Integrity controls/reconciliation where required.
9. Implement UI screens and context propagation.
10. Implement History tab/event capture for the module.
11. Write unit/integration/E2E/security/idempotency tests.
12. Run architecture, security and QA review.
13. Update module registry, workflow registry, data dictionary, build state, test matrix, and decision log where applicable.
14. Gate the module as complete only when behavior and tests prove it.

The application should not build a polished UI on top of an unstable data contract.

---

## 16. M1.1 — Immediate Foundation Work

Before continuing deep commercial implementation, implement the reusable technical foundation below.

### M1.1-A — Worksite → Project Customer synchronization

- Worksite.Customer is authoritative.
- Project.Customer, if retained for query convenience, is a derived/cache field.
- Trigger on Worksite Customer change.
- Find all Projects linked to the Worksite.
- Synchronize Project.Customer.
- Idempotent and retry-safe.
- Prevent reverse synchronization.
- Record system-originated audit events.
- Add failure/retry/reconciliation handling.

### M1.1-B — Generic system-driven automation pattern

Create a reusable implementation convention for:

- event trigger;
- correlation/execution ID;
- idempotency guard;
- deterministic action;
- audit event;
- retry handling;
- failure state;
- reconciliation path.

### M1.1-C — AuditLog foundation

Implement/validate the append-only AuditLog required for record-level History.

### M1.1-D — Generic Record History tab

Create one reusable table-based History UI that accepts:

- object type;
- record ID;
- filter criteria;
- pagination/sort configuration.

Do not build separate bespoke history implementations per module.

### M1.1-E — History indexing / performance

Ensure the audit structure can efficiently answer:

`target_object + target_record_id + timestamp`

and filter by:

`field + actor + action + source + date range`.

### M1.1-F — Test foundation

Minimum tests:

- manual Worksite Customer change propagates to Project;
- unrelated Worksite changes do not alter Project Customer;
- repeated sync produces no incorrect duplicate effects;
- multiple Projects on one Worksite all synchronize;
- history shows manual and system-derived changes distinctly;
- history filters return the expected records;
- audit history cannot be edited/deleted by normal users;
- failed automation can be detected/retried/reconciled.

---

## 17. Definition of Done for Future Modules

A module is **NOT DONE** unless all applicable items are true:

- Data model implemented according to architecture.
- Source of truth defined.
- Dependencies and side effects implemented.
- Context propagation implemented.
- Duplicate protection defined.
- Idempotency defined for retriable actions.
- Workflow/state behavior implemented.
- Logic Functions/server-side derivations implemented where required.
- Business Integrity/reconciliation implemented where required.
- Permissions tested.
- History/audit implemented.
- Error/loading/empty states implemented.
- UI is consistent with system-driven behavior.
- Cross-module updates tested.
- Historical/immutable records protected.
- Regression tests pass.
- Architecture/security/QA review completed.
- Documentation/context files updated.

---

## 18. Non-Negotiable Engineering Rules

1. No second competing CRM database.
2. No raw SQL RLS hacks or unsupported replacement authorization system.
3. No localStorage as business source of truth.
4. No manual duplicate counters for authoritative financial/operational data.
5. No calculation logic scattered inside UI components.
6. No silent overwrite of issued/historical commercial records.
7. No deletion of posted inventory movements or payments.
8. No AI as authoritative source for GST, invoice totals, stock balances, numbering, permissions, transaction state, or accounting totals.
9. No workflow loop protection based only on arbitrary timers.
10. No new field without source-of-truth and downstream-impact definition.
11. No new module without History behavior and cross-module side-effect analysis.
12. No module declared complete because only the screen renders.

---

## 19. Recommended Project Operating Model

The repository should become the durable product memory.

For each module, maintain:

- module registry;
- workflow registry;
- data dictionary;
- source-of-truth map;
- dependency/impact map;
- decision log;
- build state;
- test matrix;
- reconciliation registry;
- history/audit specification.

The engineering agent must read the relevant context before implementation and update it after implementation.

---

## 20. Final Decision

The Construction CRM should proceed with a **Twenty-first, system-driven extension architecture**:

**Twenty native capabilities**
+ **supported workflows**
+ **server-side Logic Functions / extensions**
+ **Business Integrity and reconciliation controls**
+ **reusable History/Audit UX**
= **one integrated Construction CRM**

The objective is not to eliminate all user input. The objective is to ensure that users enter business facts once, while the system handles propagation, calculation, synchronization, audit, and downstream updates wherever technically and safely possible.

---

## 21. Immediate Next Development Gate

**M1.1 — Derived Data, Automation & History Foundation**

After M1.1 is validated, proceed with the next commercial module using this standard from the first line of implementation.

