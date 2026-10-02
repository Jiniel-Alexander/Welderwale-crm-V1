# PHASE 1B - 04: BUSINESS INTEGRITY IMPLEMENTATION

This document defines rules that CANNOT be safely implemented using normal UI validation and require server-side enforcement via the Business Integrity Layer (BIL).

## 1. Document Numbering (Concurrency & Idempotency)
- **Problem**: Twenty natively uses UUIDs. Construction documents require sequential, gap-safe, or at least immutable official numbers (e.g., INV-26-27-0001).
- **Implementation**: BIL intercepts the `STATUS = ISSUED` transition. An external idempotent service generates the number and updates the Twenty record. If the update fails, the number is burned (no gaps strictly required, maintaining auditability over perfection).

## 2. Line-Item Rollups (Deterministic Calculation)
- **Problem**: Twenty lacks synchronous auto-sum fields.
- **Implementation**: BullMQ / Webhook logic function triggered on `Line Item` Create/Update/Delete. 
  - Script recalculates `Base * Rate = Amount -> Tax -> Total`.
  - Script writes total back to Header object.
  - UI will show updated totals after a ~1-3s async delay.

## 3. Payment Allocation Limits
- **Problem**: Users cannot allocate more cash than received.
- **Implementation**: BIL webhook triggered on `Payment Allocation` save.
  - Queries `SUM(Allocations)` for the `Payment`.
  - If `Sum > Payment.Amount`, the transaction is flagged/reverted, and a Notification is sent to the user.

## 4. Cumulative RA Billing Validation
- **Problem**: Billed quantity cannot exceed Approved BOQ quantity.
- **Implementation**: BIL triggers on `Invoice Line` save. 
  - Compares `BOQ Line Approved Qty` vs `Historical Billed Qty + Current Qty`.
  - Flags violation for review/rejection.

## 5. Material Weighted-Average Costing
- **Implementation**: BIL listens for `Inventory Movement` of type `PURCHASE_RECEIPT` or `ADJUSTMENT`.
  - Recalculates `New Average Cost = (Old Qty * Old Avg + New Qty * Purchase Rate) / (Old Qty + New Qty)`.
  - Updates the master `Material` record cache.
