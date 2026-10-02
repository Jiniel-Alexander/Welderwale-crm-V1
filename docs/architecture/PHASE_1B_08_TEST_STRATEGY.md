# PHASE 1B - 08: TEST STRATEGY

## 1. Functional Testing
- **Object & Relation Integrity**: Verify `Customer → Worksite → Project` cascading and correct association. Ensure Project Customer correctly syncs/derives from Worksite.
- **Header/Line Data Entry**: Verify line items can be created and linked to Quotations, POs, and Invoices cleanly in the UI.

## 2. Permissions & Field Security
- **Role Validation**: Login as Project Lead, Intern, Manager, and Admin.
- **Masking Check**: Verify Project Leads cannot read `Labour Rate`, `Invoice Total`, or `Margin`.
- **Append-Only Check**: Attempt to edit or delete an `Inventory Movement` and `AuditLog` record as Admin. Must fail natively.

## 3. Business Integrity Layer (BIL) Testing
- **Numbering Idempotency**: Simulate concurrent `ISSUED` state transitions for Invoices. Verify no duplicate numbers are assigned.
- **Rollup Latency & Accuracy**: Add 5 line items to an Invoice. Measure the time taken for the async BIL to update the Header Gross Total. Verify exact integer math.
- **Payment Allocation Cap**: Attempt to allocate ₹50,000 to Invoices from a ₹40,000 Payment. Verify BIL rejects/flags the transaction.
- **Self-Approval Exception**: As Admin, submit and approve a Project. Must succeed. As Manager, submit and approve own Project. Must trigger rejection/flag.

## 4. End-to-End Workflows
- Pre-Sales: Worksite → Quotation → Revision → Approval.
- Post-Award: Project → BOQ → Fabrication → DC → Inventory Ledger → RA Invoice → Payment Allocation → Profitability update.
