# PHASE 1B - 07: UI / UX IMPLEMENTATION PLAN

## Principle: Simplicity over Architecture
End-users must not be burdened with the complex backend architecture (BIL syncs, ledgers, revisions). The UI will map to their natural operational flow.

## Workspace & Navigation Layout
1. **My Workspace (Default Landing)**
   - Kanban/Table of `Projects` filtered by `Project Owner = {currentUser}`.
   - List of `Approvals` filtered by `Approver = {currentUser} AND Status = PENDING`.
2. **Operations Hub**
   - Worksite Directory
   - Material Master
   - Inventory Movements
3. **Commercial Hub (Role-restricted)**
   - Quotations, Invoices, POs, Delivery Challans.
4. **Governance Hub (Admin/Super Manager)**
   - AuditLog, System Exceptions (BIL failures).

## Record Page Layouts
- **Project Detail Page**:
  - *Header*: Core details, Status, Worksite.
  - *Tabs / Related Lists*:
    1. BOQ & Changes (Active scope).
    2. Commercial Docs (Quotes, Invoices, POs).
    3. Operations (Labour, Expenses, Delivery Challans).
    4. Timeline (Native activity + Approvals).
- **Invoice / PO Detail Page**:
  - *Header*: Totals, Status, Payment summary.
  - *Related List*: Line Items (embedded for quick addition).

## Role-Specific Visibility
- Using Twenty's Workspace views, we will create pre-filtered generic views. 
- Project Leads will have "Financials" tabs hidden or fields masked based on `core.fieldPermission`.
