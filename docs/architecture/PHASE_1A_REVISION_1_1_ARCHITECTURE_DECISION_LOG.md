# PHASE 1A REVISION 1.1 — ARCHITECTURE DECISION LOG

**Project:** CONSTRUCTION CRM V1
**Phase:** 1A Revision 1.1
**Date:** September 29, 2026

This log captures the architectural refinements explicitly approved by the business, progressing the design from Phase 1A Revision 1 to Revision 1.1. 

---

## DECISION 1: Organization ↔ Contact Relationship (M:N)
- **Original Architecture:** `Customer` → `Contact` (1:N).
- **Problem Identified:** A single person (e.g., a contractor or consultant) could interact with multiple organizations, requiring duplicate contact entries.
- **Business Requirement:** Maintain one universal Contact directory supporting multiple organizations.
- **Revised Architecture:** Introduced a lightweight `Organization Contact` joining object to handle M:N cardinality between `Organization` and `Contact`.
- **Reason:** Preserves context (Designation, Department, Primary flag) per relationship without duplicating master records.
- **Integrity Implications:** Deleting a relationship does not delete the Contact or Organization.
- **Permission Implications:** Standard CRM contact visibility rules apply.
- **Technical Validation Required?:** No. Standard M:N relationship structure.
- **Future Impact:** Cleaner data master and improved reporting on multi-party stakeholders.

## DECISION 2: Worksite / Project Cardinality & Customer Derivation
- **Original Architecture:** `Customer` → `Project` and `Customer` → `Worksite`. Duplicate sources of truth.
- **Problem Identified:** Permitted an inconsistent state where a Project's Customer might differ from the Worksite's Customer.
- **Business Requirement:** `Customer` → `Worksite` → `Project`.
- **Revised Architecture:** `Project` relies on `Worksite` for its Customer relationship. The system prevents `Project.Customer != Project.Worksite.Customer` by deriving the Customer. 
- **Reason:** Enforces a single source of truth for the physical and commercial locus.
- **Integrity Implications:** WS-P-001, WS-P-002, WS-P-003 strictly enforced.
- **Permission Implications:** Must have access to the Worksite to create a Project.
- **Technical Validation Required?:** YES (Whether Twenty forces duplication of the `Customer` field on `Project` for API queries, and if so, how to sync it).
- **Future Impact:** Ironclad data integrity for site-based reporting.

## DECISION 3: BOQ Change Model
- **Original Architecture:** BOQ changes were ambiguously defined.
- **Problem Identified:** Changing BOQ lines directly would silently overwrite commercial history.
- **Business Requirement:** Must track additions/reductions over time against a baseline.
- **Revised Architecture:** `Project` → ONE Active `Commercial Scope / BOQ`. Introduced `BOQ Change` and `BOQ Change Lines` to record controlled amendments.
- **Reason:** Preserves the commercial evolution of the project.
- **Integrity Implications:** BOQ-002: Changes require history. BOQ-003: Approved BOQ quantity cannot fall below already billed quantity.
- **Permission Implications:** BOQ Changes require Project Manager / Admin approval.
- **Technical Validation Required?:** YES (Cumulative enforcement logic).
- **Future Impact:** Vital for accurate RA Billing and claim management.

## DECISION 4: Quotation Versioning Strictness
- **Original Architecture:** Ambiguous linkage between revisions and the current header.
- **Problem Identified:** Potential for competing sources of truth.
- **Business Requirement:** Quotation header remains static (identity); Revision represents the commercial state.
- **Revised Architecture:** `Quotation` (Header) → `Current Revision` → `Quotation Revision Lines`. New edits generate a new Revision.
- **Reason:** Preserves exact historical lines/rates. Prevents silent modifications.
- **Integrity Implications:** Q-V-001: Historical revisions are immutable. Q-P-002: Revisions do not create new Project relationships.
- **Permission Implications:** Revision history is read-only.
- **Technical Validation Required?:** YES (Snapshot/cloning mechanism to generate new revisions).
- **Future Impact:** Clear auditability for pre-sales negotiations.

## DECISION 5: Standard Transaction Line-Item Architecture
- **Original Architecture:** Line items were proposed but lacked strict calculation rules.
- **Problem Identified:** Risk of manual total entries mismatching line item sums.
- **Business Requirement:** Strict HEADER → LINE ITEMS architecture for Quotations, POs, Contracts, Bills, DCs, Invoices, and Credit/Debit notes.
- **Revised Architecture:** The machine strictly calculates Line Amount, Tax, Discount, and Document Total.
- **Reason:** Eliminates manual calculation errors.
- **Integrity Implications:** LINE-001: Document total must equal deterministic line sums.
- **Permission Implications:** Users cannot manually override authoritative calculated totals.
- **Technical Validation Required?:** YES (Server-side line-item auto-rollups).
- **Future Impact:** Rock-solid financial reporting.

## DECISION 6: Invoice, TDS, Retention, and Corrections
- **Original Architecture:** Basic invoice with no corrections other than "Void".
- **Problem Identified:** Construction requires Retention (withheld receivables) and Credit/Debit notes.
- **Business Requirement:** Support RA Billing, TDS, Retention (as receivable), and post-issue corrections via Credit/Debit Notes.
- **Revised Architecture:** `Invoice` expanded to track `Gross`, `TDS`, `Retention Outstanding`. `Credit Note` and `Debit Note` introduced with Line Items.
- **Reason:** Accurately reflects construction cash flow and accounting standards.
- **Integrity Implications:** Retention Release payments must link to the original retention balance.
- **Permission Implications:** Accountant/Manager driven.
- **Technical Validation Required?:** YES (Validation of outstanding balances).
- **Future Impact:** Precise AR aging reports.

## DECISION 7: Payment Allocation Strictness
- **Original Architecture:** `Payment Allocation` introduced, but lacked strict integrity rules.
- **Problem Identified:** Allocations could exceed the actual payment received.
- **Business Requirement:** Allocations must be mathematically constrained.
- **Revised Architecture:** `Payment` → `Payment Allocation` → `Invoice`. Types include NORMAL, ADVANCE, RETENTION_RELEASE.
- **Reason:** Prevents phantom payments.
- **Integrity Implications:** PAY-001: Sum of Allocations ≤ Payment Amount. PAY-002: Allocations ≤ Invoice Outstanding. Payment deletion prohibited.
- **Permission Implications:** Accountant restricted.
- **Technical Validation Required?:** YES (Server-side constraint checks during allocation).
- **Future Impact:** Foolproof cash reconciliation.

## DECISION 8: Derived Project Profitability
- **Original Architecture:** Not fully constrained against manual entry.
- **Problem Identified:** Users might manually overwrite "Profit" fields.
- **Business Requirement:** Profitability must be 100% derived from underlying transactions.
- **Revised Architecture:** Gross Profit = Earned Value - Actual Direct Project Cost (Material + Labour + Expenses).
- **Reason:** Ensures financial truth.
- **Integrity Implications:** PROF-001: Authoritative project profitability is derived, never manually entered.
- **Permission Implications:** Profitability visibility restricted by role.
- **Technical Validation Required?:** YES (Dynamic derivation/caching mechanisms).
- **Future Impact:** Real-time, accurate project health monitoring.

## DECISION 9: Weighted-Average Material Costing
- **Original Architecture:** Unspecified costing methodology.
- **Problem Identified:** Complex costing (FIFO/LIFO) would overcomplicate V1.
- **Business Requirement:** Simple weighted-average material costing.
- **Revised Architecture:** Cost derived from purchase receipts + direct costs. Recalculated on receipt/adjustment.
- **Reason:** Standard, easy to understand, fits V1 scale.
- **Integrity Implications:** Cost values must update deterministically.
- **Permission Implications:** Hidden from standard operational roles.
- **Technical Validation Required?:** YES (Webhook/trigger to recalculate average cost on receipt).
- **Future Impact:** Stable inventory valuation.

## DECISION 10: Inventory Movement Types
- **Original Architecture:** Open-ended movement types.
- **Problem Identified:** Too many types create UX confusion.
- **Business Requirement:** Keep types intentionally small.
- **Revised Architecture:** Limited to: PURCHASE_RECEIPT, TRANSFER, RETURN_TO_SUPPLIER, CONSUMPTION, SCRAP, WASTAGE, ADJUSTMENT, REVERSAL. Uses Source/Destination combos to infer context.
- **Reason:** Simplifies user workflow.
- **Integrity Implications:** INV-001, INV-002: Ledger is append-only; balance is strictly derived.
- **Permission Implications:** Adjustments require Manager approval.
- **Technical Validation Required?:** No.
- **Future Impact:** Highly scalable and clean inventory ledger.

## DECISION 11: Financial Precision & Units
- **Original Architecture:** Integer (cents) was proposed.
- **Problem Identified:** Mixed representations (decimals for quantity vs integers for money) were not formally defined.
- **Business Requirement:** Money = Integer paise; Qty/Wt = Decimal (3 places); Rate/Pct = Decimal (2 places).
- **Revised Architecture:** Explicit calculation sequence: `Base Qty * Rate -> Gross Line -> Discount -> Taxable -> GST -> Final Line`.
- **Reason:** Eliminates rounding anomalies.
- **Integrity Implications:** Deterministic math required across all platforms.
- **Permission Implications:** N/A.
- **Technical Validation Required?:** YES (Precision support in Twenty DB schema).
- **Future Impact:** Audit-compliant financial math.

## DECISION 12: Idempotent & Concurrency-Safe Numbering
- **Original Architecture:** "Generate at issue" was proposed.
- **Problem Identified:** Needed clear rules on failure and idempotency.
- **Business Requirement:** Official numbers never change, never get reused. "Zero gaps" is NOT required.
- **Revised Architecture:** Numbers generated on ISSUED transition. If generation fails, number is consumed and left blank/failed, ensuring no duplicates.
- **Reason:** Safety over sequential perfection.
- **Integrity Implications:** NUM-001, NUM-002, NUM-003.
- **Permission Implications:** System-level generation only.
- **Technical Validation Required?:** YES (Implementation of a safe sequence generator).
- **Future Impact:** Eliminates compliance risks around duplicated invoices.

## DECISION 13: Governance / Audit / Approval / Team
- **Original Architecture:** Mixed operational and RLS concepts.
- **Problem Identified:** Needed clear boundaries between AuditLog, Approvals, and Project Teams.
- **Business Requirement:** AuditLog (System events), Approval History (Workflow events), Project Team (Operational, non-RLS).
- **Revised Architecture:** Explicitly separated objects. Project Team tracks `Operational Role` and `Active Dates`.
- **Reason:** Clarifies responsibilities and system boundaries.
- **Integrity Implications:** AUD-001, APP-001. Project Owner remains solely accountable.
- **Permission Implications:** Project Team grants no extra DB-level row access, merely UX filtering.
- **Technical Validation Required?:** No.
- **Future Impact:** Scalable operational assignment without fighting the CRM's native security model.

## DECISION 14: Minimal Fabrication Job
- **Original Architecture:** Minimal approach proposed.
- **Problem Identified:** Needed formal boundary definition to prevent ERP scope creep.
- **Business Requirement:** Support Project, BOQ Line, Qty Planned/Actual, Status (Planned → In Progress → QC → Completed). No routing.
- **Revised Architecture:** `Fabrication Job` strictly tracks gross progress, not individual workstation routing.
- **Reason:** Fits the scale of the V1 business without overwhelming users.
- **Integrity Implications:** Fabrication quantities feed into Earned Value.
- **Permission Implications:** Operational update access required.
- **Technical Validation Required?:** No.
- **Future Impact:** Forms the basis for a future MES (Manufacturing Execution System) module in V2.
