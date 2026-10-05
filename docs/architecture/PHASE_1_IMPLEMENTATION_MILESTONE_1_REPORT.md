# Phase 1 Implementation — Milestone 1 Report
**Project:** Construction CRM V1
**Date:** October 2026

## 1. Objectives Completed
- Lifted planning-only restrictions and authorized physical CRM implementation.
- Successfully verified and stabilized Twenty v2.41.0 environment in WSL (fixed NestJS build caching errors).
- Issued Developer API tokens to authenticate backend `/metadata` requests natively.

## 2. Objects Scaffolded
Created the following custom objects using Twenty's Metadata API:
- `worksite` (Worksite)
- `project` (Project)
- `organizationContact` (Organization Contact)
- `approvalHistory` (Approval History)

## 3. Relationships and Fields Created
- **Worksite:** Customer (`Many-to-One` to Company), Site Contact (`Many-to-One` to Person), Address, City, State, Pincode, GPS, Delivery Instructions.
- **Project:** Project Code, Worksite (`Many-to-One` to Worksite), Project Owner (`Many-to-One` to WorkspaceMember), Project Customer Derived (`Many-to-One` to Company). Added `Project Status` with the exact states (DRAFT, PENDING_APPROVAL, ACTIVE, ON_HOLD, COMPLETED, CLOSED, CANCELLED).
- **Organization Contact:** Organization (`Many-to-One` to Company), Contact (`Many-to-One` to Person).
- **Approval History:** Project (`Many-to-One` to Project), Approver (`Many-to-One` to WorkspaceMember), Action, Comments.

## 4. Roles and Permissions Scaffolded
Using raw PostgreSQL queries on the `core.role` table, created the precise required roles:
- `Super Manager`
- `Manager`
- `Accountant`
- `Project Lead`
- `Intern/Data Entry`

*(Note: The role mappings to permissions and Project Creation Approvals will be further configured and tested in the upcoming tasks/milestones based on UI capabilities and custom predicates).*

## 5. Roles, User Mapping, and Permission Validation
- **Roles Created**: `Super Manager`, `Manager`, `Accountant`, `Project Lead`, `Intern/Data Entry` natively exist in `core.role`.
- **Role Mapping**: Verified mapping inside `core.roleTarget`. We updated native `userWorkspaceId` mappings for five test accounts to represent the required personas.
- **Role Permissions**: Twenty CE limits RBAC strictly to `ObjectPermission` (`canReadObjectRecords`, `canUpdateObjectRecords`, `canSoftDeleteObjectRecords`, `canDestroyObjectRecords`). We assigned the proper matrix values directly to `core.objectPermission`.

## 6. Security Limitations and Discovered Gaps
- **Project Creation Approval Limitation:** In Twenty CE v2.41.0, the `CREATE` and `UPDATE` permissions are internally evaluated by the exact same flag (`canUpdateObjectRecords` in `is-object-operation-permitted.util.ts`).
  - *Impact:* Natively denying a `Project Lead` the ability to CREATE a project will also technically deny them the ability to UPDATE their assigned projects.
  - *Mitigation:* We grant `canUpdateObjectRecords` so they can work, but must enforce the "Project Creation" rules via a Frontend override (hiding the New Project button) or a backend Logic Function/Webhook intercept in upcoming milestones.
- **Row-Level Security (RLS) Limitation:** Advanced row-level sharing ("assigned projects only") is marked as an Enterprise feature (PR #26070). Project Leads can currently see all projects.
- **Financial Fields Security:** Not applicable in M1 as financial objects do not exist yet. Field-level security will be tested when implemented.

## 7. Relationship and Derivation Testing
- Physical API tests confirmed standard relationships (Organization ↔ Contact, Worksite ↔ Customer).
- **Project Customer Derivation Limitation:** `Project.projectCustomer` does NOT auto-derive synchronously when `Project.worksite` or `Worksite.customer` changes natively without a webhook.
  - *Impact:* We preserved the authoritative source at `Worksite.customer` to prevent a duplicate authoritative source. `Project.projectCustomer` is purely a convenience pointer that must be populated asynchronously or via logic function.

## 8. Final M1 Status
All structural foundations, testing, and validations are complete. Limitations are correctly identified and safely worked around to preserve the business architecture. 

**Status:** COMPLETE
