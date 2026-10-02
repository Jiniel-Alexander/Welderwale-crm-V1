# Phase 1A Revision 1.1: Domain & Object Architecture

**Project**: CONSTRUCTION CRM V1
**Phase**: 1A Revision 1.1
**Date**: September 29, 2026

## 1. Executive Summary
This Phase 1A Revision 1.1 document serves as the final architectural baseline for the Construction CRM V1 project prior to implementation planning. It refines the Revision 1 architecture by explicitly defining M:N Contact relationships, strict Header → Line-Item boundaries, derived Customer tracking via Worksite, deterministic BOQ Change structures, rigid quotation versioning, separated PO types, and robust financial source-of-truth rules. No production implementation has occurred to produce this documentation.

## 2. Source Documents
1. `PHASE_0D_V1_RISK_ACCEPTANCE_AND_IMPLEMENTATION_CONTROL_PLAN.md` (Highest Technical/Security Authority)
2. `CONSTRUCTION_CRM_V1_BUSINESS_REQUIREMENTS_AND_DOMAIN_MODEL_v1.0.md` (Highest Business Authority)
3. `PHASE_1A_REVISION_1_DOMAIN_OBJECT_ARCHITECTURE.md` (Previous Architecture Baseline)
4. `PHASE_1A_BUSINESS_ARCHITECTURE_GAP_ANALYSIS.md` (Analysis/Gap Identification)
5. `PHASE_1A_REVISION_1_ARCHITECTURE_DECISION_LOG.md` (Decision History)

## 3. Construction CRM Domain Model
The CRM centers on the physical execution of metal fabrication. An `Organization` establishes a `Worksite`, which hosts multiple `Projects`. The commercial lifecycle spans independent `Quotations` (versioned via `Quotation Revisions`), which baseline into an active `Commercial Scope / BOQ`. This BOQ drives `Fabrication`, `Delivery`, and `RA Billing`. `Direct Costs` (Material, Labour, Expense) and `Revenue` (Invoices, Payment Allocations, Retention) mathematically derive `Project Profitability`. Governance is maintained via strict Append-Only ledgers (`Inventory Movement`, `AuditLog`, `Approval History`).

## 4. Object Inventory
**CORE:**
- `Customer / Organization`
- `Contact / Person`
- `Organization Contact` (M:N)
- `Worksite`
- `Project`
- `Project Team Assignment` (Operational)

**COMMERCIAL:**
- `Quotation`
- `Quotation Revision`
- `Quotation Revision Lines`
- `Commercial Scope / BOQ`
- `BOQ Lines`
- `BOQ Change`
- `BOQ Change Lines`
- `Customer PO` & `Customer PO Lines`
- `Supplier PO` & `Supplier PO Lines`
- `Contract` & `Contract Lines`
- `Supplier Bill` & `Supplier Bill Lines`

**OPERATIONS:**
- `Material`
- `Inventory Movement`
- `Fabrication Job`
- `Delivery Challan` & `DC Lines`
- `Task`

**FINANCIAL:**
- `Invoice` & `Invoice Lines`
- `Credit Note` & `Credit Note Lines`
- `Debit Note` & `Debit Note Lines`
- `Payment`
- `Payment Allocation`
- `Expense`
- `Labour`

**GOVERNANCE:**
- `Approval History`
- `AuditLog`
- `Activity Timeline` (Derived)
- `Notification`
- `Documents / Attachments`

## 5. Object-by-Object Purpose
- **Customer / Organization**: Represents companies/entities. Master record for billing/purchasing.
- **Contact / Person**: Universal directory of humans.
- **Organization Contact**: Resolves M:N linking humans to organizations with contextual designations.
- **Worksite**: The physical locus of execution.
- **Project**: The commercial job.
- **Project Team Assignment**: Operational tracking of who is on-site (NOT RLS).
- **Quotation**: The persistent pre-sales identity header.
- **Quotation Revision / Lines**: Append-only snapshot of commercial proposed state.
- **Commercial Scope / BOQ**: The single active authorized baseline for execution/billing.
- **BOQ Lines**: Individual deliverables tracked progressively.
- **BOQ Change / Lines**: Controlled historical amendments to the BOQ.
- **Customer PO / Lines**: Inbound revenue commitment.
- **Supplier PO / Lines**: Outbound purchasing commitment.
- **Contract / Lines**: Master legal/project agreement.
- **Supplier Bill / Lines**: Inbound accounts payable record.
- **Material**: Catalog of items (MS Plates, Consumables).
- **Inventory Movement**: Immutable ledger of stock.
- **Fabrication Job**: Minimal tracking of Raw Material → Finished Structure.
- **Delivery Challan / Lines**: Record of physical material dispatch/receipt.
- **Task**: Standard activities.
- **Invoice / Lines**: Outbound billing document (Final, RA, Advance).
- **Credit/Debit Note / Lines**: Post-issue invoice corrections.
- **Payment**: Universal receipt/dispatch of funds.
- **Payment Allocation**: Distributes Payment amounts strictly against Invoices.
- **Expense**: Workshop/Project direct costs (transport, tools).
- **Labour**: Employee/contractor daily/piece-rate work.
- **Approval History**: Append-only manual approval tracking.
- **AuditLog**: Append-only system mutation ledger.

## 6. Relationship Map (Matrix)

| Object A | Relationship | Object B | Cardinality | Mandatory? | Integrity Rule |
|----------|--------------|----------|-------------|------------|----------------|
| Organization | 1:N | Organization Contact | M:N (resolved) | No | |
| Organization | 1:N | Worksite | 1:N | Yes | |
| Worksite | 1:N | Project | 1:N | Yes | WS-P-001, WS-P-002, WS-P-003 |
| Worksite | 1:N | Quotation | 1:N | Yes | |
| Project | 1:N | Quotation | 1:N | No | Q-P-001 (Quotation belongs to max 1 Project) |
| Quotation | 1:N | Quotation Revision | 1:N | Yes | Q-V-001 |
| Quotation Revision | 1:N | Quotation Revision Lines | 1:N | Yes | |
| Project | 1:1 | Commercial Scope / BOQ | 1:1 | Yes | BOQ-001 |
| Commercial Scope / BOQ | 1:N | BOQ Lines | 1:N | Yes | |
| Commercial Scope / BOQ | 1:N | BOQ Change | 1:N | No | BOQ-002 |
| Project | 1:N | Customer PO | 1:N | No | |
| Project | 1:N | Supplier PO | 1:N | No | |
| Project | 1:N | Contract | 1:N | No | |
| Project | 1:N | Invoice | 1:N | No | |
| Invoice | 1:N | Payment Allocation | 1:N | No | PAY-002 |
| Payment | 1:N | Payment Allocation | 1:N | No | PAY-001 |
| Project | 1:N | Expense | 1:N | No | |
| Project | 1:N | Labour | 1:N | No | |
| Project | 1:N | Inventory Movement | 1:N | No | INV-001 |
| Project | 1:N | Fabrication Job | 1:N | No | |
| Project | 1:N | Delivery Challan | 1:N | No | |

## 7. Cardinality Rules
- **WS-P-001**: One Worksite can have many Projects.
- **WS-P-002**: Every Project belongs to exactly ONE Worksite.
- **Q-P-001**: A Quotation record maps to 0..1 Projects.
- **Q-P-002**: Quotation revisions CANNOT create new Project relationships.

## 8. Worksite Architecture
Worksite MUST exist before a Project can be created.
**Key Fields**: Site Name, Address, Customer (Relation), Site Contact.

## 9. Project Architecture
A Project does NOT maintain an independent Customer relationship. 
`Project.Customer` MUST mathematically equal `Project.Worksite.Customer`. 
*Implementation*: Derive Customer from Worksite. If Twenty requires duplication for querying, it must be synced identically.
**Key Fields**: Project Name, Worksite (Relation), Project Owner, Status. 
*(No duplicate Project Lead/Owner fields).*

## 10. Quotation Architecture
Quotation is the persistent commercial identity (Header).
**Key Fields**: Worksite, Project (Optional, 0..1), Quotation Number.
*Note: A Quotation may exist before a Project.*

## 11. Quotation Revision Architecture
Historical commercial versions. 
**Hierarchy**: `Quotation` → `Current Revision` → `Quotation Revision Lines`.
**Rules**: Submitted revisions become immutable. Editing a submitted quotation requires generating a new revision.

## 12. Commercial Scope / BOQ
The ONE active execution baseline per project.
**Hierarchy**: `BOQ` → `BOQ Lines`.
**Changes**: Handled via `BOQ Change` → `BOQ Change Lines`. Approved changes update the Active BOQ baseline. Quantity cannot fall below Billed Quantity.

## 13. Customer PO
Inbound revenue document.
**Hierarchy**: `Customer PO` → `Customer PO Lines`.

## 14. Supplier PO
Outbound expense document.
**Hierarchy**: `Supplier PO` → `Supplier PO Lines`.

## 15. Contract
Master agreement document.
**Hierarchy**: `Contract` → `Contract Lines`.

## 16. Material
Master item catalog.
**Key Fields**: Name, Code, Grade, Size, Purchase Unit, Stock Unit. (No complex conversion engine for V1).

## 17. Inventory Movement Ledger
IMMUTABLE INVENTORY MOVEMENT LEDGER.
**Types**: PURCHASE_RECEIPT, TRANSFER, RETURN_TO_SUPPLIER, CONSUMPTION, SCRAP, WASTAGE, ADJUSTMENT, REVERSAL.
**Fields**: Source, Destination, Material, Quantity (Decimal), Date.

## 18. Fabrication Architecture
Minimal structure for V1.
**Fields**: Project, BOQ Line, Job Number, Planned Qty, Actual Qty, Status (PLANNED → IN_PROGRESS → QC → COMPLETED). No detailed routing (Cutting/Welding) for V1.

## 19. Delivery Architecture
**Hierarchy**: `Delivery Challan` → `DC Lines`.
**Fields**: Project, Worksite, Vehicle, Driver, Status.

## 20. Invoice Architecture
**Hierarchy**: `Invoice` → `Invoice Lines`.
**Fields**: Gross Amount, Discount, GST, Advance Adjustment, **TDS** (Customer deduction), **Retention** (Customer-withheld receivable), Net Payable.
**Corrections**: After issue, uses Credit Note/Debit Note or Void+Reissue.

## 21. RA Billing
**Mechanism**: Maps Invoice Lines to BOQ Lines. Calculates cumulative billing.
**Calculation**: Previous Cumulative Billed + Current RA Qty = New Cumulative Billed.

## 22. Payment Architecture
**Key Fields**: Party (Customer/Supplier), Direction (RECEIVE/PAY), Amount, Date, Unallocated Amount.
**Rules**: Deletion prohibited. Corrections use reversals.

## 23. Payment Allocation
**Mechanism**: Maps `Payment` → `Invoice`.
**Types**: NORMAL, ADVANCE, RETENTION_RELEASE.
**Integrity**: Sum of allocations cannot exceed Payment Amount.

## 24. Expense
Direct project/workshop costs.
**Fields**: Project, Category, Amount, Date.

## 25. Labour
Direct project labour.
**Fields**: Worker, Project, Hours/Days, Rate, Amount.

## 26. Project Profitability
**Rule**: Strictly DERIVED. 
`Gross Profit = Earned Value - Actual Direct Project Cost (Material + Labour + Expenses)`.
No manually entered Profit field.

## 27. Approval Architecture
**Rule**: Admin and Super Manager MAY self-approve within their authority. Lower roles follow separation-of-duty configuration.

## 28. Approval History
**Fields**: Target Record, Submitter, Approver, Previous Status, New Status, Date. (Distinct from AuditLog).

## 29. AuditLog
**Fields**: WHO, WHEN, ROLE, OBJECT, RECORD, ACTION, FIELD, OLD VALUE, NEW VALUE.
**Rule**: Append-only (`canUpdate=false`).

## 30. Activity Timeline
Human-friendly timeline blending notes and critical events.

## 31. Document Architecture
Stores PDFs, POs, Drawings categorized by Project/Worksite.

## 32. Numbering Architecture
**Rule**: Official numbers generated at ISSUED state. If technical failure consumes a number, preserve uniqueness over sequence perfection (no gaps required).
**Format**: Configurable Prefix + Sequence (e.g., INV-26-27-0001).

## 33. State Machines
- **Project**: DRAFT → PENDING APPROVAL → ACTIVE → ON HOLD → COMPLETED → CLOSED / CANCELLED.
- **Quotation**: DRAFT → SUBMITTED → APPROVED → SENT → ACCEPTED / REVISED / EXPIRED.
- **Customer PO / Supplier PO / Contract**: DRAFT → SUBMITTED → APPROVED → ISSUED → LOCKED / CANCELLED.
- **Fabrication**: PLANNED → IN_PROGRESS → QC → COMPLETED.
- **Delivery Challan**: DRAFT → APPROVED → ISSUED → LOCKED / REVERSED.
- **Invoice**: DRAFT → SUBMITTED → APPROVED → ISSUED → LOCKED / VOIDED.
- **Payment**: ACTIVE → REVERSED.
- **Approval**: PENDING → APPROVED / REJECTED.

## 34. Permission Dependencies
- **Project Lead**: Operational visibility (BOQ, scope, docs) but financial rates/values/profitability restricted.
- **Admin/Super Manager**: Full visibility + Self Approval.

## 35. Notification Dependencies
Material events only (Status changes, Approvals, Integrity Exceptions).

## 36. Reporting Dependencies
- **Customer**: Outstanding (Derived from Invoices - Allocations).
- **Project**: Profitability (Derived from Direct Costs vs Earned Value).
- **Inventory**: Stock (Derived from Movement Ledger).

## 37. Reconciliation Dependencies
- **Financial**: Verify Payment Allocations <= Payment Totals.
- **Documents**: Verify Document Total == SUM(Line Totals).
- **Inventory**: Verify Stock == SUM(Movements).

## 38. Financial Source-of-Truth Rule
Avoid duplicate authoritative fields.
- **Quotation Totals**: DERIVED strictly from `SUM(Quotation Revision Lines)`.
- **BOQ Values**: DERIVED strictly from `SUM(BOQ Lines)`.
- **Invoice Totals**: DERIVED strictly from `SUM(Invoice Lines)`.
- **Payment Balances**: DERIVED strictly from `Payment Amount - SUM(Payment Allocations)`.
- **Inventory Balances**: DERIVED strictly from `SUM(Inventory Movements)`.
- **Material Cost**: DERIVED via weighted-average calculations on purchase receipts + direct costs.
- **Labour Cost**: DERIVED strictly from `Labour` object entries.
- **Expense Cost**: DERIVED strictly from `Expense` object entries.
- **Project Cost**: DERIVED strictly from `Material + Labour + Expense`.
- **Earned Value**: DERIVED strictly from BOQ Approved/Installed quantities.
- **Profit / Margin**: DERIVED strictly from `Earned Value - Project Cost`.
- **Retention**: AUTHORITATIVE tracking via `Retention` fields on Invoice, resolved via `RETENTION_RELEASE` payment allocations.

## 39. Data Integrity Invariants
- **WS-P-001**: One Worksite → many Projects.
- **WS-P-002**: Every Project has exactly one Worksite.
- **WS-P-003**: Worksite must exist before Project.
- **Q-P-001**: Quotation → Project = 0..1.
- **Q-P-002**: Quotation revisions cannot create new Project relationships.
- **Q-V-001**: Historical quotation revisions cannot be silently modified/deleted.
- **BOQ-001**: One Project has one active BOQ.
- **BOQ-002**: Approved BOQ changes require controlled history.
- **BOQ-003**: Approved BOQ quantity cannot fall below already billed quantity.
- **DOC-001**: Authoritative document history cannot be silently overwritten.
- **LINE-001**: Document totals must equal deterministic line-item totals.
- **PAY-001**: Payment allocations cannot exceed Payment Amount.
- **PAY-002**: Invoice allocations/outstanding must remain mathematically consistent.
- **INV-001**: Posted inventory movements cannot be edited/deleted.
- **INV-002**: Inventory balance is derived from movement history.
- **APP-001**: Admin/Super Manager self-approval permitted within authority.
- **AUD-001**: AuditLog is append-only.
- **NUM-001**: Official document numbers are unique.
- **NUM-002**: Official document numbers cannot be reused.
- **NUM-003**: Number generation must be concurrency-safe and idempotent.
- **PROF-001**: Authoritative project profitability is derived, not manually entered.

## 40. Technical Validation Classification
- **A. Business Architecture Requirement**: Separated POs, Payment Allocations, Expenses, BOQ Changes.
- **B. Twenty Native Capability**: Relational mapping, Object-level RBAC (`canUpdate = false`).
- **C. Supported Extension/App Capability**: None assumed.
- **D. Business Integrity Layer**: Numbering idempotency, Payment Allocation checks, RA Cumulative logic, Weighted-Average Material Cost recalculations.
- **E. Unverified / Requires Technical Validation**: 
   - Synchronous server-side Line-Item rollups (summing lines to header on save).
   - Derivation of `Customer` on `Project` via `Worksite` vs requiring duplicated storage synced by hooks.
- **F. Accepted Limitation**: Project Team serves strictly as operational UX filtering, not Database-level Row-Level Security (RLS).

## 41. Open Questions
1. **Line-Item Rollup Latency**: If the CRM cannot sum lines synchronously, is a slight asynchronous delay (via webhook) acceptable to the business for updating Header totals?
2. **Customer Syncing**: If the platform requires `Customer` to physically exist on the `Project` record for querying purposes, we must duplicate it from `Worksite`. Will the business accept a background-sync mechanism enforcing `Project.Customer == Project.Worksite.Customer`?

## 42. Phase 1B Readiness

**PHASE 1A REVISION 1.1 STATUS**:
**READY FOR PHASE 1B REVIEW**

All approved business decisions have been structurally incorporated. No unresolved business contradictions remain. Technical implementation planning (Phase 1B) may commence pending formal sign-off.
