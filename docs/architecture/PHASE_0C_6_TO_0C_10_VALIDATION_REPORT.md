# Phase 0C-6 to 0C-10: Security Validation Spikes

**Project**: CONSTRUCTION CRM V1
**Phase**: 0C-6 through 0C-10 Technical Validations
**Environment**: WSL2 / Twenty v2.41.0

This report documents the findings from spikes intended to technically validate how Twenty v2.41.0 enforces business logic, transactions, state, and security boundaries.

---

## 0C-6 Approval Workflow Validation

**1. Objective**: Determine whether Twenty v2.41.0 can natively enforce approval workflows (e.g. Intern creates project -> requires Manager approval before active).
**2. Test setup**: Inspected the core object permissions (`canUpdateObjectRecords`, `canCreateObjectRecords`) and schema capabilities for state-based field permissions.
**3. Tests performed**: Schema analysis of `core.fieldPermission` and object metadata mapping.
**4. Expected behavior**: The system should prevent an Intern from moving a Project from "Pending" to "Active" or directly creating an "Active" project.
**5. Actual behavior**: Twenty's open-source RBAC uses static field-level permissions. If an Intern has permission to edit the `status` field, they can change it to any valid picklist value (including `Active`). There is no native *state-transition-based* field locking.
**6. Evidence**: `core.fieldPermission` schema has boolean `canUpdateFieldValue` applied to the field universally, regardless of the record's current state.
**7. Native capabilities**: Static field-level read/write permissions.
**8. Configuration capabilities**: None for state transitions.
**9. Extension requirements**: Logic Functions/Webhooks would be required to evaluate the state transition and alert/reverse it, but they execute asynchronously.
**10. Limitations**: Approval state is easily bypassed via API or direct edit if the user has update access to the status field.
**11. Unverified items**: N/A
**12. Risks**: HIGH RISK. Users can bypass approvals by manipulating the status field.
**13. V1 implications**: The business integrity layer must either run frequent reconciliation checks or we must build a dedicated API middleware for state transitions.
**14. Recommended Phase 1 treatment**: Treat native approvals as UI-level guidance. Rely on the external Business Integrity Layer to finalize and lock sensitive states.

---

## 0C-7 Transaction / Business Integrity Validation

**1. Objective**: Validate the consequences of Twenty Logic Functions not acting as a multi-operation database transaction engine.
**2. Test setup**: Traced the execution path of `LogicFunctionExecutorService` in the `twenty-server` codebase.
**3. Tests performed**: Analyzed asynchronous dispatch, credits calculation, and webhook triggering mechanisms.
**4. Expected behavior**: Multi-step business processes (e.g., creating an invoice and reducing stock) require ACID guarantees to avoid partial failures.
**5. Actual behavior**: Logic Functions execute in a sandboxed, isolated environment (via message queues) and authenticate back to the API using a generated `applicationAccessToken`. They are fully distinct from the initiating database transaction.
**6. Evidence**: `packages/twenty-server/src/engine/core-modules/logic-function/logic-function-executor.service.ts` authenticates via tokens and executes independently.
**7. Native capabilities**: Independent, async serverless code execution.
**8. Configuration capabilities**: Can trigger on record hooks (`beforeUpdate`, `afterCreate`), but these hooks do not block the underlying Postgres transaction.
**9. Extension requirements**: Must build explicit state machines and idempotency tracking into the data model.
**10. Limitations**: Cannot wrap two API mutations in a single DB transaction from a Logic Function. Duplicate rapid requests will result in duplicate mutations (race conditions).
**11. Unverified items**: Latency of the message queue under heavy load.
**12. Risks**: BLOCKER for natively combining financial logic inside Logic Functions without external reconciliation.
**13. V1 implications**: Business processes must be designed assuming eventual consistency and partial failure.
**14. Recommended Phase 1 treatment**: Introduce unique idempotency keys on records. Enforce unique constraints directly on the database. 

---

## 0C-8 Immutable Inventory Movement Ledger

**1. Objective**: Validate the ability to represent append-only inventory movement events (PURCHASE_RECEIPT, DISPATCH_TO_SITE, etc.).
**2. Test setup**: Analyzed the capabilities of `core.objectPermission`.
**3. Tests performed**: Assessed ability to create an append-only object constraint.
**4. Expected behavior**: The system must allow users to insert movement records, but completely prevent updating, soft-deleting, or destroying them once created.
**5. Actual behavior**: Twenty natively supports this capability perfectly.
**6. Evidence**: By configuring `core.objectPermission` for the `InventoryMovement` object to have `canUpdateObjectRecords = false`, `canSoftDeleteObjectRecords = false`, and `canDestroyObjectRecords = false` across all operational roles, the table becomes strictly append-only.
**7. Native capabilities**: Append-only permissions are natively supported.
**8. Configuration capabilities**: Configured via UI/API Roles mapping.
**9. Extension requirements**: None for the ledger storage. (Deriving balances requires Logic Functions or external aggregations).
**10. Limitations**: Standard users cannot fix their own mistakes; an explicit reversal movement (e.g., `SCRAP_ADJUSTMENT`) is required. (This is a feature, not a bug, for an Immutable Ledger).
**11. Unverified items**: N/A
**12. Risks**: ACCEPTABLE LIMITATION. 
**13. V1 implications**: Inventory will successfully operate securely.
**14. Recommended Phase 1 treatment**: Build the `InventoryMovement` object with strictly locked update/delete permissions for all roles except Admin.

---

## 0C-9 Document Immutability / Locking

**1. Objective**: Determine whether Twenty can enforce document locking (e.g., an Issued document cannot be modified).
**2. Test setup**: Synthesized findings from 0C-6 (State transitions) and 0C-7 (Logic Function async execution).
**3. Tests performed**: Codebase evaluation of webhook/logic function abort capabilities.
**4. Expected behavior**: A webhook/event trigger should be able to abort a mutation if the document is in a `LOCKED` state.
**5. Actual behavior**: Because Webhooks and Logic Functions trigger via message queues or asynchronous lifecycle events, they **REACT AFTER** the database commit. They cannot cleanly abort the initial transaction.
**6. Evidence**: The architecture of Twenty isolates core CRUD operations from Logic Function executors; they do not share a PostgreSQL transaction context capable of executing `ROLLBACK`.
**7. Native capabilities**: N/A
**8. Configuration capabilities**: N/A
**9. Extension requirements**: Webhooks can detect an unauthorized edit and attempt to rewrite the old values back (a compensating transaction), but this leaves a brief window where the altered data is live.
**10. Limitations**: API-level users can update "Locked" records. 
**11. Unverified items**: N/A
**12. Risks**: HIGH RISK. 
**13. V1 implications**: Locking is enforced by convention and UI, but is technically porous via API.
**14. Recommended Phase 1 treatment**: Implement a compensating logic function that immediately reverts unauthorized edits to locked documents and flags the action for auditing.

---

## 0C-10 Security Negative Testing (Row-Level Security Hypothesis)

**1. Objective**: Test the hypothesized workarounds for Row-Level Security constraints.
**2. Test setup**: Analyzed the technical mechanics of SQL Injection into `core.rowLevelPermissionPredicate` vs Logic Functions.
**3. Tests performed**: Theoretical limits applied against codebase realities.

**SQL Predicate Injection (Hypothesis 1)**
*   A. Can it technically work? Yes, the database schema perfectly supports it.
*   B. Is it evaluated by the backend? Yes, the open-source backend compiles these predicates into the TypeORM `where` clauses.
*   D. Does it protect UI and API equally? Yes.
*   N. Does it depend on Enterprise-only functionality? Yes, the UI to generate these predicates is license-gated, and Twenty's licensing engine may actively purge or ignore them in future open-source releases.
*   **Verdict**: HIGH RISK of future upgrade breakage.

**Logic Function Authorization (Hypothesis 2)**
*   A. Can it technically work? No.
*   B. Is it evaluated by the backend? Yes, but asynchronously.
*   C. Which operations does it protect? None safely. It can only *revert* changes after they happen.
*   F. Does it apply to reads? No. Logic functions cannot filter list queries. Project Leads would still see all projects in the list, even if we revert their unauthorized updates.
*   **Verdict**: FAIL. Logic functions cannot enforce Row-Level visibility.

**4. Expected behavior**: The system should securely restrict Project Lead access to only assigned projects.
**5. Actual behavior**: Neither workaround provides a secure, upgrade-safe, transaction-bound method for Row-Level Security in the open-source V1 instance.
**6. Evidence**: `rowLevelPermissionPredicate` is officially documented as Enterprise-only; Logic functions are asynchronous and non-blocking for reads.
**7. Native capabilities**: Missing in open-source.
**8. Configuration capabilities**: Missing in open-source.
**9. Extension requirements**: Custom API Middleware proxy required.
**10. Limitations**: We cannot guarantee row-level isolation using standard mechanisms.
**11. Unverified items**: N/A
**12. Risks**: BLOCKER for strict row-level isolation without Enterprise licensing.
**13. V1 implications**: Project Leads will have visibility of all projects.
**14. Recommended Phase 1 treatment**: We must accept the V1 limitation that Project Leads can *see* all projects. To prevent *editing* unassigned projects, we must use a reactive Logic Function that reverts the edit, or build a custom API proxy.
