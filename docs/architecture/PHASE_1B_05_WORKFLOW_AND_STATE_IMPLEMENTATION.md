# PHASE 1B - 05: WORKFLOW AND STATE IMPLEMENTATION

## State Representation
States are natively implemented using Twenty `Picklist` fields. Transitions are driven by human UI updates, subject to Business Integrity Layer (BIL) validation hooks.

### Core Object Workflows

**1. Project**
- `DRAFT` → `PENDING APPROVAL` → `ACTIVE` → `ON HOLD` → `COMPLETED` → `CLOSED / CANCELLED`
- *Trigger*: Changing to ACTIVE requires BIL check for Worksite existence and Approval History confirmation.

**2. Commercial Documents (PO, Contract, Invoice, DC)**
- `DRAFT` → `SUBMITTED` → `APPROVED` → `ISSUED` → `LOCKED` (or `VOIDED` / `CANCELLED`)
- *Trigger*: Transitioning to `ISSUED` triggers the BIL Auto-Numbering generator.
- *Validation*: Transitioning to `ISSUED` locks the record via UI configuration and triggers BIL immutability tracking.

**3. Quotation Revision**
- `DRAFT` → `SUBMITTED`
- *Validation*: A submitted revision becomes historically locked. Any further edits to the Quotation header create a new cloned Revision.

**4. Approval Governance**
- `PENDING` → `APPROVED` | `REJECTED`
- *Validation*: When status changes to `APPROVED`, BIL hook checks:
  1. `Submitter == Approver`? 
  2. If Yes, is role `Admin` or `Super Manager`? (Allowed).
  3. If No, flag/revert the approval and notify Admin.

## Notification Routing
- Notifications use Twenty's native system or email integration via Logic Functions.
- Fired explicitly on:
  - Transition to `PENDING APPROVAL` (Notify Approver).
  - BIL Validation Failures (Notify Submitter).
  - Transition to `ISSUED` for large invoices (Notify Super Manager).
