# PHASE 1B - 09: IMPLEMENTATION SEQUENCE

Implementation will proceed in strictly controlled, testable milestones to mitigate risk. Do NOT begin without explicit authorization.

## Milestone 1: Master Data & Role Foundation
1. Configure Twenty RBAC roles (Admin, Super Manager, Manager, Accountant, Project Lead, Intern).
2. Create Core Objects: `Organization Contact`, `Worksite`.
3. Apply `core.fieldPermission` rules to mask financial fields from operational roles.

## Milestone 2: Project & Commercial Baseline
1. Create `Project` object and establish relationship with `Worksite`.
2. Create `Quotation`, `Quotation Revision`, and `Quotation Revision Lines`.
3. Create `Commercial Scope / BOQ` and `BOQ Lines`.

## Milestone 3: Execution & Ledgers
1. Create `Material` master.
2. Create `Inventory Movement` ledger. Lock permissions (`canUpdate = false`, `canDestroy = false`).
3. Create `Delivery Challan`, `DC Lines`, `Fabrication Job`, `Labour`, `Expense`.

## Milestone 4: Financial Transactions
1. Create `Invoice`, `Invoice Lines`, `Credit/Debit Notes`.
2. Create `Customer PO`, `Supplier PO`, `Supplier Bill`, `Contract`.
3. Create `Payment`, `Payment Allocation`.

## Milestone 5: Governance & Business Integrity Layer (BIL)
1. Create `Approval History` and `AuditLog` (lock permissions).
2. Deploy external/async BIL logic for:
   - Line Item Rollups.
   - Numbering Generator.
   - Payment Allocation validation.
   - Project Profitability caching.

## Milestone 6: UI/UX & Views
1. Build specific Twenty workspace views (My Projects, My Approvals).
2. Configure record page layouts and related lists.

## Milestone 7: Testing & Hardening
1. Execute Test Strategy (Phase 1B - 08).
2. Validate against Phase 0D Security baselines.
