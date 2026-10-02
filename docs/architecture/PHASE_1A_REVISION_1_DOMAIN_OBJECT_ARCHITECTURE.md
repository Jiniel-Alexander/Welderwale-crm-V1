# Phase 1A Revision 1: Domain & Object Architecture

**Project**: CONSTRUCTION CRM V1
**Phase**: 1A Revision 1
**Date**: September 27, 2026

## 1. Executive Summary
This Phase 1A Revision 1 document represents the comprehensive, business-aligned domain and object architecture for the Construction CRM V1 project. It corrects fundamental cardinality issues (Worksite → Project), introduces crucial financial and operational objects (BOQ, Expense, Labour, Payment Allocation), explicitly models transactional line items, and separates Customer vs. Supplier commitments. This architecture serves as the verified blueprint for Phase 1B implementation. No production code has been written to generate this architecture.

## 2. Source Documents
1. `PHASE_0D_V1_RISK_ACCEPTANCE_AND_IMPLEMENTATION_CONTROL_PLAN.md` (Frozen technical/security baseline)
2. `PHASE_1A_DOMAIN_OBJECT_ARCHITECTURE.md` (Original architecture, superseded by this document)
3. `CONSTRUCTION_CRM_V1_BUSINESS_REQUIREMENTS_AND_DOMAIN_MODEL_v1.0.md` (Business domain baseline)
4. `PHASE_1A_BUSINESS_ARCHITECTURE_GAP_ANALYSIS.md` (Gap analysis driving this revision)

## 3. Construction CRM Domain Model
The construction and metal-fabrication domain is anchored by the **Customer**, who establishes a **Worksite**. Multiple **Projects** are executed at that Worksite. Pre-sales are handled via **Quotations** (which can predate Projects) and **Quotation Revisions**. Active projects are governed by a **Commercial Scope / BOQ** baseline, against which **Fabrication**, **Delivery**, and **RA Billing** (Invoices) are tracked. Operations are powered by an **Immutable Inventory Ledger**, **Labour**, and **Expenses**, which collectively derive **Project Profitability**.

## 4. Object Inventory
**Core Hierarchy & People:**
`Customer` (Company), `Contact` (Person), `Worksite`, `Project`, `Project Team` (Relation)

**Commercial & Scope:**
`Quotation`, `Quotation Lines`, `Quotation Revision`, `Quotation Revision Lines`, `Commercial Scope / BOQ`, `BOQ Lines`

**Purchasing & Commitments:**
`Customer PO`, `Customer PO Lines`, `Supplier PO`, `Supplier PO Lines`, `Contract`, `Contract Lines`

**Operations & Inventory:**
`Material`, `Inventory Movement`, `Fabrication Job` (Minimal), `Delivery Challan`, `DC Lines`, `Task`

**Financials:**
`Supplier Bill`, `Invoice`, `Invoice Lines`, `Payment`, `Payment Allocation`, `Expense`, `Labour`

**Governance & Tracking:**
`Approval History`, `AuditLog`, `Activity Timeline` (Derived), `Notification`

## 5. Object-by-Object Purpose
- **Customer**: The organization giving work or owing payment.
- **Contact**: An individual stakeholder (internal/external) tied to the universal directory.
- **Worksite**: The reusable physical location established by the customer where multiple projects occur.
- **Project**: The specific commercial/business job.
- **Quotation / Quotation Lines**: The initial commercial proposal to the customer.
- **Quotation Revision / Lines**: Append-only snapshot of the quotation at a specific historical point.
- **Commercial Scope / BOQ / Lines**: The authorized deliverables, quantities, and rates for tracking progress.
- **Customer PO / Lines**: The inbound revenue commitment from the customer.
- **Supplier PO / Lines**: The outbound purchasing commitment to a supplier.
- **Contract / Lines**: The master agreement governing the project.
- **Material**: The master catalog of items (MS plates, angles, etc.).
- **Inventory Movement**: The immutable ledger of stock flow.
- **Fabrication Job**: Minimal tracking for raw material → finished structure progress.
- **Delivery Challan / Lines**: The record of physical material dispatch/receipt.
- **Supplier Bill**: The inbound invoice from a supplier for AP tracking.
- **Invoice / Lines**: The outbound billing document to the customer, supporting RA billing.
- **Payment**: The record of received funds.
- **Payment Allocation**: Distributes one payment across multiple invoices.
- **Expense**: Logs direct costs (transport, tools, workshop overhead).
- **Labour**: Logs employee/contractor daily or piece-rate work for costing.
- **Approval History**: Tracks state transitions and manual approvals.
- **AuditLog**: Dedicated append-only ledger for material system events and field changes.

## 6. Relationship Map
- `Customer` → `Worksite` (1:N)
- `Customer` → `Contact` (1:N)
- `Worksite` → `Project` (1:N)
- `Worksite` → `Quotation` (1:N)
- `Project` → `Quotation` (1:N)
- `Quotation` → `Quotation Revision` (1:N)
- `Project` → `Commercial Scope / BOQ` (1:1 or 1:N depending on phases)
- `Project` → `Customer PO` (1:N)
- `Project` → `Supplier PO` (1:N)
- `Project` → `Delivery Challan` (1:N)
- `Project` → `Invoice` (1:N)
- `Invoice` → `Payment Allocation` (1:N)
- `Payment` → `Payment Allocation` (1:N)
- `Project` → `Expense` / `Labour` / `Inventory Movement` (1:N)

## 7. Cardinality Rules
- **WS-P-001**: One Worksite can have many Projects. Each Project belongs to exactly ONE Worksite.
- **Q-P-001**: One Quotation can belong to at most ONE Project (0..1). A Project can have multiple Quotations (0..N).

## 8. Worksite Architecture
Worksite is a first-class object representing a physical location.
**Key Fields**: Site Name, Address, City, State, GPS, Customer (Relation), Site Contact, Delivery Instructions.
**Lifecycle**: ACTIVE → ARCHIVED.

## 9. Project Architecture
**Key Fields**: Project Name, Project Code, Worksite (Relation), Project Type, Project Status, Approval Status, Project Owner (Accountable User), Project Team (Operational Participants), Start Date, Expected End Date.
**Note**: Project Owner is for accountability; Project Team is for operational tracking. Neither constitutes technical RLS. Worksite MUST exist before Project creation.

## 10. Quotation Architecture
A Quotation supports pre-sales (Workflow A) and post-award quoting (Workflow B).
**Key Fields**: Worksite (Relation), Project (Relation, Optional), Date, Valid Until, Total Value, Status.
**Relationship**: Links to `Quotation Lines` (Material, Qty, Unit, Rate, Amount).

## 11. Quotation Revision Architecture
Historical snapshots. When a Quotation is updated, the previous state is saved here.
**Key Fields**: Quotation (Relation), Revision Number, Saved Date, Saved By, Total Value.
**Relationship**: Links to `Quotation Revision Lines` to preserve exact rates/quantities. Revisions DO NOT create duplicate Project relationships.

## 12. Commercial Scope / BOQ
The core baseline for execution and billing.
**Key Fields**: Project (Relation), Approved Total, Status.
**BOQ Lines**: Item, Quoted Qty, Approved Qty, Fabricated Qty, Delivered Qty, Installed Qty, Billed Qty, Unit, Rate. (Supports additions and reductions over time).

## 13. Customer PO
Inbound revenue commitment.
**Key Fields**: Customer (Relation), Project (Relation), PO Number, Date, Total Value.
**Relationship**: `Customer PO Lines`.

## 14. Supplier PO
Outbound purchasing commitment.
**Key Fields**: Supplier (Relation), Project (Relation), PO Number, Date, Total Value.
**Relationship**: `Supplier PO Lines`.

## 15. Contract
Master project agreement.
**Key Fields**: Customer, Project, Contract Value, Terms. Links to `Contract Lines`.

## 16. Material
Master item catalog.
**Key Fields**: Name, Code, Category, Grade, Size, Thickness, Purchase Unit, Stock Unit, Purchase Rate. Complex unit conversion is deferred for V1.

## 17. Inventory Movement Ledger
IMMUTABLE INVENTORY MOVEMENT LEDGER.
**Key Fields**: Material, Qty, Unit, Source Location, Destination Location (Worksite/Workshop), Type (Receipt, Dispatch, Consumption, Scrap, Reversal), Reference Doc, Date.
**Rule**: Posted movements cannot be edited/deleted. Current stock is derived from movements.

## 18. Fabrication Architecture
**Minimal V1 Approach**: A `Fabrication Job` object linked to a Project and BOQ Line, tracking Raw Material Estimated, Raw Material Actual, Status (Pending, In Progress, QC, Completed). Detailed manufacturing ERP features are deferred.

## 19. Delivery Architecture
**Key Fields (DC)**: Customer, Project, Worksite, Vehicle, Driver, Remarks, Status.
**DC Lines**: Material, Qty, Unit, Weight, HSN. Triggers Inventory Movements upon issue.

## 20. Invoice Architecture
**Key Fields**: Customer, Project, Invoice Type (RA, Final, Advance), Date, Gross Total, Discount, GST, **TDS** (Optional Deduction), **Retention** (Customer-Withheld Receivable), Net Payable.
**Invoice Lines**: Item, HSN, Qty, Rate, Amount.

## 21. RA Billing
**Architecture**: Achieved by linking `Invoice Lines` to `BOQ Lines`. The system must calculate: Previous Cumulative Billed + Current RA Qty = New Cumulative Billed.
*Technical Validation Required*: Complex cumulative aggregations may require external Business Integrity Layer scripting.

## 22. Payment Architecture
**Key Fields**: Customer, Amount, Payment Method, Reference, Date.
**Rule**: Payments cannot be deleted. Corrections require Reversals.

## 23. Payment Allocation
**Architecture**: `Payment Allocation` object links one `Payment` to one `Invoice` with an `Allocated Amount`. Resolves the Many-to-Many requirement.

## 24. Expense
**Key Fields**: Project (Optional), Expense Type (Workshop vs Project), Category (Transport, Consumables), Amount, Date, Logged By.

## 25. Labour
**Key Fields**: Worker (Relation), Project (Relation), Date, Hours/Days Worked, Rate Type (Hourly, Daily, Piece), Overtime Hours, Total Amount.

## 26. Project Profitability
**Architecture**: Derived dynamically.
*Earned Value (from BOQ/Invoices) - Actual Cost (Sum of Material Cost + Labour + Expenses) = Gross Profit*.
No manual "Profit" field will be created.

## 27. Approval Architecture
Configurable authority.
**Key Rule**: Admin and Super Manager MAY self-approve within their authority. Lower roles follow configured `Submitter != Approver` rules.

## 28. Approval History
**Key Fields**: Target Record (Morphic), Action, Submitter, Approver, Previous Status, New Status, Date, Comments.

## 29. AuditLog
**Key Fields**: WHO, WHEN, ROLE, OBJECT, RECORD, ACTION, FIELD, OLD VALUE, NEW VALUE.
**Rule**: Strictly append-only via `canUpdate = false`.

## 30. Activity Timeline
Derived UX layer blending native Tasks/Notes with AuditLog/Approval History events.

## 31. Document Architecture
Stores attachments (PDFs, Drawings) categorized by Customer, Worksite, and Project.

## 32. Numbering Architecture
**Rule**: Official numbers (INV-001) are generated at ISSUED state to avoid gaps. Must be concurrency-safe.
*Technical Validation Required*: Idempotent retry logic via Business Integrity Layer.

## 33. State Machines
- **Project**: DRAFT → PENDING APPROVAL → ACTIVE → ON HOLD → COMPLETED → CLOSED / CANCELLED.
- **Quotation**: DRAFT → SUBMITTED → APPROVED → SENT → ACCEPTED / REVISED / EXPIRED.
- **Documents (PO/Invoice/DC)**: DRAFT → APPROVED → ISSUED → LOCKED (or VOIDED/CANCELLED/REVERSED).

## 34. Permission Dependencies
- **Project Owner**: Operational visibility (BOQ, progress) but financial rates/profitability restricted (masked).
- **Admin/Super Manager**: Full visibility, self-approval authority.
- **Accountant**: Full financial/payment allocation visibility.
- **Intern**: Draft creation, strictly requires approval.

## 35. Notification Dependencies
Material events only: Approvals, Status changes, Project closure, Reconciliation exceptions.

## 36. Reporting Dependencies
- **Customer**: Joins Customer → Invoices, Payments (Outstanding).
- **Project**: Joins Project → BOQ, Labour, Expenses, Material (Profitability).
- **Inventory**: Joins Movement Ledger (Stock levels).

## 37. Reconciliation Dependencies
Detective controls run by the Business Integrity Layer:
- Validation of `updatedAt` vs `lockedAt` on issued documents.
- Verification that Document Totals == SUM(Line Items).
- Verification that Payment Allocations <= Payment Amount.

## 38. Data Integrity Invariants
- **Q-P-001**: Quotation → Project = 0..1.
- **Q-P-002**: Quotation Revisions cannot create new Project relationships.
- **WS-P-001**: Project → Worksite = exactly 1.
- **WS-P-002**: Worksite must exist before Project.
- **PAY-001**: Sum of Allocations ≤ Payment Amount.
- **INV-001**: Posted inventory movements cannot be edited/deleted.
- **APP-001**: Admin/Super Manager self-approval permitted.
- **DOC-001**: Authoritative document history cannot be silently overwritten.
- **NUM-001**: Official document numbers must be unique.

## 39. Technical Validation Classification
- **A. Business Architecture Requirement**: Worksites, Separated POs, RA Billing.
- **B. Twenty Native Capability**: Basic Relations, Object Permissions (Append-only).
- **C. Supported Extension/App Capability**: None explicitly assumed.
- **D. Business Integrity Layer**: Numbering concurrency, complex RA cumulative aggregations, Payment allocation limit checks.
- **E. Unverified / Requires Validation**: Server-side line-item auto-rollups (Totals).
- **F. Accepted Limitation**: True API-level row-level security (RLS) for Project Teams.

## 40. Open Questions (DECISION REQUIRED)
1. **Fabrication Depth**: Is the minimal `Fabrication Job` object sufficient for V1, or does the business require a multi-step routing workflow (Cutting → Welding → Painting) immediately?
2. **Line-Item Rollups**: If Twenty cannot natively sum Line Items into the Header Total automatically on save, we must implement Webhooks/Logic Functions. Is the slight async delay acceptable for the business?

## 41. Phase 1B Readiness
**Status**: **READY FOR REVIEW**
The architecture has been structurally revised to meet the business domain realities. Once this document and the Decision Log are approved by the business, implementation (Phase 1B) may commence.
