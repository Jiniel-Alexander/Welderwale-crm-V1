# PHASE 1B - 06: FINANCIAL AND INVENTORY IMPLEMENTATION

## Financial Representation Precision
Twenty uses standard numeric types. To eliminate floating-point arithmetic errors:
- **Money**: Represented as Integers in *paise* (cents). `₹25,500.75` → `2550075`. UI formatting handles display.
- **Quantity / Weight**: Represented as Decimal (scale 3). `5975.500`.
- **Rates & Percentages**: Represented as Decimal (scale 2). `18.00`.

## Invoice & Receivables Model
- **TDS**: Stored as a deduction field on the Invoice.
- **Retention**: Stored as a customer-withheld receivable field on the Invoice. 
- *Outstanding Calculation*: `Gross - TDS - Advance - Cash Payments = Normal Outstanding`. Retention is tracked separately.

## Inventory Movement Ledger Implementation
- **Data Model**: Implemented as a Twenty custom object.
- **Types (Picklist)**: `PURCHASE_RECEIPT`, `TRANSFER`, `RETURN_TO_SUPPLIER`, `CONSUMPTION`, `SCRAP`, `WASTAGE`, `ADJUSTMENT`, `REVERSAL`.
- **RBAC**: `canUpdate = false`, `canDestroy = false`.
- **Current Stock**: Not stored authoritatively. A derived field/view aggregates `SUM(Movements)` grouped by Location and Material. Caching may be implemented for UI performance, but the Ledger remains the mathematical source of truth.

## Project Profitability Engine
- Derived exclusively from transactions. 
- **Earned Value**: Aggregated from `BOQ Billed Qty * Rate`.
- **Direct Costs**: Aggregated from `SUM(Expense)`, `SUM(Labour)`, `SUM(Consumption Movements * Weighted Avg Cost)`.
- *Implementation*: Twenty lacks complex reporting engines for cross-object delta math. V1 will utilize periodic (e.g., hourly or on-save) BIL syncs to update a cached `Profitability Summary` object attached to the Project for immediate dashboard reading.
