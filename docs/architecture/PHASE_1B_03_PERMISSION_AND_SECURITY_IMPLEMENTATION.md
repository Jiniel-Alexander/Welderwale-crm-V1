# PHASE 1B - 03: PERMISSION AND SECURITY IMPLEMENTATION

## Role-Based Access Control (RBAC) Mapping

Twenty implements RBAC via `core.role`, `core.objectPermission`, and `core.fieldPermission`.

| Role | Operational Objects (Project, Worksite) | Financial Objects (Invoice, PO, Payment) | Ledgers (Inventory, AuditLog) | Approval Authority |
|---|---|---|---|---|
| **Admin** | Full CRUD | Full CRUD | Create/Read (NO Update/Delete) | Full (Self-Approve) |
| **Super Manager** | Full CRUD | Full CRUD | Create/Read (NO Update/Delete) | Full (Self-Approve) |
| **Manager** | Full CRUD | Create/Read/Update (NO Delete) | Create/Read | Follows Configured Chain |
| **Accountant** | Read-Only | Full CRUD | Create/Read | Follows Configured Chain |
| **Project Lead** | Read/Update (Owned) | Read-Only (Masked) | Read-Only | Submit Only |
| **Intern** | Draft Create (Submit) | Draft Create | No Access | Submit Only |

## Field-Level Security Constraints
- **Project Lead / Intern**: 
  - `canReadFieldValue = false` for: Invoice Rates, Labour Rates, Material Purchase Rates, Expense Amounts, Supplier PO values.
  - *Implementation limitation*: Twenty natively masks fields if configured, but complex conditional masking (e.g., hiding only if project is outside team) is not supported natively. Global masking for these roles is the accepted approach.

## Append-Only Enforcement
- **Inventory Movement**, **Approval History**, **AuditLog**:
  - `canUpdateObjectRecords = false`
  - `canDestroyObjectRecords = false`
  - Applied to ALL roles globally in Twenty to guarantee audit preservation. Corrections strictly use new Reversal records.

## Custom API & Data Integrity Boundaries
- Because API access inherits role permissions, Project Leads could technically query other projects.
- *Mitigation*: UX-level filtering ("My Projects"). Accepted limitation per Phase 0D that strict multi-tenant style RLS is not native in V1.
