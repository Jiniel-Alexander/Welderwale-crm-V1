# PHASE 1B - 01: TWENTY IMPLEMENTATION CAPABILITY MATRIX

| Requirement | Twenty Capability | Classification | Evidence / Details | Limitation | Recommended Implementation |
|---|---|---|---|---|---|
| Custom Objects & Relations | Custom Object Builder | Native / Config | Verified native 1:N, M:1 creation | Deep relational filtering restricted in UI | Use standard Twenty custom objects with relations |
| Header → Line Item Structure | Parent/Child Objects | Native / Config | O2M relations fully supported natively | UI entry is separate from header | Native relations, customized related-list views |
| Line Item Auto-Rollup (Totals) | Logic Functions / Webhooks | Async / BIL | Twenty lacks synchronous cross-object formula rollups | Async execution means 1-3s delay | BIL script via BullMQ/Webhooks updating header total |
| Append-Only Ledgers | Object Permissions | Native / Config | `canUpdateObjectRecords=false`, `canDestroy=false` | None | Configure RBAC appropriately for Inventory/AuditLog |
| Financial Field Masking | Field Permissions | Native / Config | `core.fieldPermission` natively hides fields | Hard to conditionally hide based on record state | Hide entirely for PL/Interns at the role level |
| Submitter != Approver Rule | Logic Functions | Async / BIL | No native sync validation engine | Reactive (undo) rather than preventive | UI guideline + Async BIL check to revert/flag |
| Admin Self-Approval | RBAC / Logic Functions | Async / BIL | Identity checking in script | Reactive | Exclude Admin/SuperManager roles in BIL validation |
| Payment Allocation Validation | External API / Logic | BIL | Native cannot sum child records against a cap | Synchronous prevention requires custom proxy | Async BIL flags over-allocation, sets 'Invalid' state |
| Auto-Numbering Concurrency | DB Constraints / External | BIL | Native UUIDs are default, custom sequences aren't | No native locking sequence generator | External idempotent generator service updating Twenty |
| BOQ Cumulative Validation | External Logic | BIL | Need to compare previous billed + new billed | Cannot natively block save | Async BIL checks and flags/reverts if exceeded |
| M:N Org ↔ Contact | Join Object | Native / Config | `Organization Contact` custom object | Extra UI clicks to link | Create joining object and surface in related lists |
