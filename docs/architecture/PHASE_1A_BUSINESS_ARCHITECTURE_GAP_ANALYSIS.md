I have completed the detailed Business Architecture Gap Analysis.

The analysis carefully compares the frozen Phase 0D constraints, the initial Phase 1A architecture, and the newly provided Construction CRM Business Requirements.

### Key Findings & Major Gaps

The current Phase 1A architecture is insufficient for a construction/fabrication business. The most critical gaps identified include:

1. **Reversed Hierarchy**: Phase 1A modeled Sites as children of Projects. The business requires `Customer → Worksite → Project`.
2. **Missing Line Items & BOQ**: Phase 1A lacked structured line-item architecture and a Commercial Scope/BOQ object, making Running Account (RA) billing and fabrication tracking impossible.
3. **Purchasing & AP Conflation**: Customer POs (Revenue) and Supplier POs (Expense) were incorrectly merged into a single generic object.
4. **Missing Direct Costs**: Objects for `Expense` and `Labour` are entirely missing, preventing accurate derivation of Actual Cost and Profitability.
5. **Billing Limitations**: No structure exists for Payment Allocations (splitting one payment across multiple invoices), TDS, or Retention tracking.
6. **Contradictions**: The strict `Submitter != Approver` rule from Phase 1A conflicts with the business requirement allowing Admins/Super Managers to self-approve.

### Artifact Generated

You can review the full, detailed gap analysis here: **PHASE_1A_BUSINESS_ARCHITECTURE_GAP_ANALYSIS.md**

### Final Recommendation

**Phase 1A requires structural revision.** The existing Phase 1A document must be substantially revised (Phase 1A Revision 1) to incorporate Worksites, BOQ, structured line items, separated POs, and financial/labour objects before any technical implementation begins.

*As instructed, I have NOT modified the architecture, created objects, or started Phase 1B. I have stopped execution and am awaiting your review and permission for the next phase.*

svg

svg

svg

svg

svg

svg

svg

svg

Phase 1a Business Architecture Gap Analysis

# Phase 1A: Business Architecture Gap Analysis

**Project**: CONSTRUCTION CRM V1 **Phase**: 1A — Gap Analysis **Date**: September 27, 2026

## 1. Executive Summary

The current Phase 1A Domain/Object Architecture provides a strong governance foundation (AuditLog, Inventory Ledger, Security controls) but **fails to represent several core structural realities of a construction and fabrication business**.

Major gaps exist in the fundamental operational hierarchy (reversing the Worksite → Project relationship), the omission of structural Line Items, the absence of a Commercial Scope/BOQ object, the merging of Customer vs. Supplier POs, and the lack of essential financial components (Expenses, Labour, Payment Allocations, RA Billing, TDS, and Retention).

**Conclusion**: Phase 1A is **NOT READY** for implementation and requires significant structural revision to correctly model the business domain.

---

## 2. Source Documents Reviewed

1. **PHASE_0D_V1_RISK_ACCEPTANCE_AND_IMPLEMENTATION_CONTROL_PLAN.md**: The frozen technical, security, and architecture baseline, establishing rules for immutability, reconciliation, and limits of the OSS platform.
2. **PHASE_1A_DOMAIN_OBJECT_ARCHITECTURE.md**: The initial object architecture draft that attempted to map Phase 0D constraints onto a basic CRM structure.
3. **CONSTRUCTION_CRM_V1_BUSINESS_REQUIREMENTS_AND_DOMAIN_MODEL_v1.0.md**: The authoritative business domain model specifying the precise operational, financial, and structural realities of the metal-fabrication/construction business.

---

## 3. Business Domain Coverage Matrix

| **Domain**         | **Business Requirement**               | **Current Phase 1A Coverage**   | **Status**        | **Gap**                                                          |
| :----------------- | :------------------------------------- | :------------------------------ | :---------------- | :--------------------------------------------------------------- |
| **Core Hierarchy** | Customer → Worksite → Project          | Project → Site (One-to-Many)    | **Contradiction** | Reversed cardinality; Worksite must precede and own Projects.    |
| **Pre-Sales**      | Quotation ↔ Worksite (without Project) | Quotation is a child of Project | **Missing**       | Quotations must exist independently of Projects.                 |
| **Commercial**     | Commercial Scope / BOQ tracking        | Not present                     | **Missing**       | Core baseline for RA billing and fabrication tracking is absent. |
| **Line Items**     | Structured transaction line items      | Not present                     | **Missing**       | Relying on text fields or single values for Quotations/Invoices. |
| **Purchasing**     | Customer PO vs Supplier PO             | Merged into single "PO" object  | **Missing**       | Distinct workflows and directions are conflated.                 |
| **Billing**        | RA Billing, TDS, Retention             | Basic "Invoice" only            | **Missing**       | No mechanisms for cumulative billing or customer deductions.     |
| **Payments**       | Payment Allocation across invoices     | Basic "Payment" object          | **Missing**       | Cannot split one payment across multiple invoices.               |
| **Direct Costs**   | Labour & Expenses                      | Not present                     | **Missing**       | Actual cost derivation is impossible without these objects.      |
| **Approvals**      | Configurable, allow Admin self-approve | Strict `Submitter != Approver`  | **Contradiction** | Admins/Super Managers explicitly permitted to self-approve.      |
| **Inventory**      | Immutable Movement Ledger              | Included                        | **Covered**       | Compliant with Phase 0D constraints.                             |
| **Governance**     | AuditLog & Approval History            | Included                        | **Covered**       | Compliant with Phase 0D constraints.                             |

---

## 4. Object-by-Object Gap Analysis

- **Customer / Organization**: Exists. Needs linking to Worksites, not just Projects.
- **Contact / Person**: Exists. Definition is sufficient.
- **Worksite**: Exists, but incorrectly defined as a child of Project instead of a parent.
- **Project**: Exists. Missing fields for RA billing baselines and links to Scope/BOQ.
- **Project Owner**: Exists as a relation. Visibility restrictions need updating (can view scope, hide rates).
- **Project Team**: Explicitly rejected in Phase 1A. **Gap**: Business requires evaluating operational participation without conflating it with RLS.
- **Quotation**: Exists. Requires independence from Project.
- **Quotation Revision**: **Missing**. Currently relying on simple application locking; needs explicit versioning structure.
- **Commercial Scope / BOQ**: **Missing**. Crucial for tracking Quoted → Approved → Fabricated → Billed.
- **Customer PO**: **Missing** (merged into generic PO).
- **Supplier PO**: **Missing** (merged into generic PO).
- **Contract**: Exists. Needs line items and BOQ linking.
- **Material**: Exists. Needs comprehensive unit support (Stock, Purchase, Standard).
- **Inventory Movement**: Exists. Compliant.
- **Fabrication / Production**: **Missing**. No object tracks Raw Material → Fabrication → Finished Structure.
- **Delivery Challan**: Exists. Needs line items.
- **Invoice**: Exists. Missing TDS, Retention, Advance Adjustment, and RA cumulative tracking fields.
- **RA Billing**: **Missing**. Requires calculation mechanism for cumulative completion.
- **Payment**: Exists.
- **Payment Allocation**: **Missing**. Required to distribute one payment across multiple invoices.
- **Expense**: **Missing**. Required for Workshop and Project Actual Cost derivation.
- **Labour**: **Missing**. Required for employee/contractor allocation, rates, and OT calculation.
- **Approval / Approval History**: Exists.
- **AuditLog**: Exists.
- **Activity Timeline**: Exists.
- **Documents**: Exists.
- **Notifications**: Exists.
- **Reporting / derived views**: Defined conceptually, but underlying data objects (Labour, Expense) are missing to support profitability reports.

---

## 5. Relationship & Cardinality Analysis

**Identified Cardinality Problems:**

- **Worksite → Project**: Phase 1A proposed `Project -> Site (1:N)`. The business requires `Worksite -> Project (1:N)`. A Worksite is the physical location established by a Customer, under which multiple fabrication/installation projects occur.
- **Customer → Worksite**: Missing. Customer must own the Worksite.
- **Quotation ↔ Project**: Phase 1A rigidly tied Quotations to Projects. The business requires Quotations to optionally link to a Worksite *before* a Project exists.
- **Invoice → Payment**: Phase 1A proposed `Invoice -> Payment (1:N)`. The business requires a Many-to-Many resolution via a `Payment Allocation` object, as one Payment can cover multiple Invoices.
- **Customer PO vs Supplier PO**: Phase 1A used a single PO object linking to Customer/Vendor. This fails to separate inbound revenue commitments from outbound expense commitments.

---

## 6. Transaction / Line Item Architecture Gap Analysis

Phase 1A entirely omitted structured Line Items. The following objects **require** header + line-item architecture to support accurate financial, inventory, and BOQ tracking:

- **Quotation** → `Quotation Lines` (Material, Qty, Rate, GST, Total)
- **Customer PO** → `Customer PO Lines`
- **Supplier PO** → `Supplier PO Lines`
- **Contract** → `Contract Lines`
- **Delivery Challan** → `DC Lines` (links to Inventory Movements)
- **Invoice** → `Invoice Lines` (handles RA Billing incremental quantities)

---

## 7. Commercial Scope / BOQ Analysis

**Gap**: The concept of tracking `Quoted → Approved → Fabricated → Delivered → Installed → Billed` is entirely unrepresented. Without a `Scope / BOQ` object (or structurally rich line items mapping to operational states), the CRM cannot track partial deliveries or Running Account (RA) billing against an approved baseline. It is impossible to know what remains to be fabricated or billed.

---

## 8. Financial Architecture Gap Analysis

**Missing Structures**:

- **Actual Cost Derivation**: Phase 1A listed `Internal Cost (Currency Integer)` as a restricted field on Project. The business requires this to be *derived* from actual `Material Cost`, `Labour Cost`, and `Expenses`. The base objects to record Labour and Expenses do not exist in Phase 1A.
- **TDS & Retention**: Invoices lack deductions. Retention is a customer-withheld receivable, not a company payment, and requires explicit tracking.
- **RA Billing**: No structure exists to calculate `Cumulative Billed` vs `Approved BOQ`.

---

## 9. Inventory Architecture Gap Analysis

**Covered**: The Immutable Inventory Movement Ledger principle is correctly applied. **Gaps**:

- `Supplier Bill` (distinct from Supplier PO) is missing, which is required to link received inventory to accounts payable.
- `Worksite` allocation requires the corrected `Worksite` object relationship.

---

## 10. Revision / History Architecture

**Gaps**:

- **Quotation Revisions**: Phase 1A relies on generic "versioning," but the business requires historical states to remain inspectable. A structural `Quotation Revision` object (or cloning mechanism retaining older locked records) is required.
- **Invoice/Document Corrections**: If an invoice is issued and needs correction, the architecture dictates VOID + Reissue, which is correct. However, Credit/Debit notes are missing from the architecture to handle minor adjustments without full voiding.

---

## 11. Permissions & Security Gap Analysis

- **Project Owner Visibility**: Phase 1A masks financial fields globally for Project Leads. The business specifies Project Owners *should* see scope/BOQ, but rates/values may need hiding. This requires granular field-level permission mapping.
- **Admin/Super Manager Approvals**: Phase 1A enforced a strict `Submitter != Approver` rule. The business explicitly requires Admin/Super Manager to self-approve within their authority.

---

## 12. Reporting & Profitability Gap Analysis

Current Phase 1A objects **cannot** generate the required Profitability reporting because:

- `Labour Cost` cannot be calculated (no Labour/Timesheet object).
- `Expenses` cannot be calculated (no Expense object).
- `Earned Value` cannot be calculated (no BOQ/Scope object).
- `Outstanding Receivables` cannot be accurately calculated (missing TDS/Retention tracking).

---

## 13. Technical Validation Gaps

| **Requirement**                | **Proposed Mechanism**                        | **Validation Status**     | **Architecture Risk**                                                                                                                                     |
| :----------------------------- | :-------------------------------------------- | :------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auto-Numbering Concurrency     | Native DB `UNIQUE` constraints + retry on 409 | **Unverified Assumption** | Twenty's GraphQL API handles constraints, but safe idempotent retry logic requires external BI Layer implementation.                                      |
| Append-only AuditLog           | `canUpdate` / `canDestroy` = false            | **Validated** (Phase 0D)  | Low. Native RBAC supports disabling updates.                                                                                                              |
| Line-item rollups (Totals)     | Server-side deterministic scripts             | **Unverified Assumption** | Twenty native rollups (aggregations) are limited. Complex tax/discount rollups require custom Webhook/Logic Function scripting or external BI Layer sync. |
| RA Billing / Cumulative totals | Derived views                                 | **Unverified Assumption** | Highly unlikely Twenty natively supports cross-invoice cumulative completion logic without heavy BI Layer orchestration.                                  |

---

## 14. Contradictions / Decisions Required

| **#** | **Issue**          | **Source A (Phase 1A / 0D)**    | **Source B (Biz Reqs)**                 | **Conflict**                       | **Decision Needed**                                                                     |
| :---- | :----------------- | :------------------------------ | :-------------------------------------- | :--------------------------------- | :-------------------------------------------------------------------------------------- |
| 1     | **Hierarchy**      | Project owns Site (1\:N)        | Worksite owns Projects (1\:N)           | Cardinality is exactly backward.   | Adopt Worksite as parent object.                                                        |
| 2     | **Self-Approval**  | Strict `Submitter != Approver`  | Admin/Super Manager MAY self-approve    | Phase 1A blocked valid authority.  | Update validation rules to respect top-tier roles.                                      |
| 3     | **Quotation Link** | Quotation requires Project      | Quotation precedes Project              | Pre-sales workflow blocked.        | Make Project optional on Quotations; link to Worksite.                                  |
| 4     | **Actual Cost**    | Manual/Derived field on Project | Derived from Expenses, Labour, Material | Required base objects are missing. | Approve creation of Expense/Labour objects.                                             |
| 5     | **Project Team**   | Rejected to avoid RLS confusion | Desired for operational tracking        | Accountability vs Visibility.      | Decide if "Project Team" relation should be built purely for UX/Assignment without RLS. |

---

## 15. Recommended Phase 1A Revision Areas

Phase 1A must be structurally revised in the following specific areas:

1. **Core Hierarchy**: Implement `Customer → Worksite → Project`.
2. **Pre-sales Workflow**: Decouple `Quotation` from `Project`; link `Quotation` to `Worksite`. Implement explicit `Quotation Revision` architecture.
3. **Purchasing & AP**: Split generic "PO" into `Customer PO` and `Supplier PO`. Add `Supplier Bill`.
4. **Line-Item Architecture**: Mandate header/line-item structures for all commercial documents.
5. **Commercial Scope / BOQ**: Design the BOQ object to track Quoted → Fabricated → Billed states.
6. **Billing & Receivables**: Add `Payment Allocation` object. Add TDS and Retention fields to Invoices.
7. **Direct Costs**: Add `Expense` and `Labour/Timesheet` objects to support actual cost derivations.
8. **Approvals**: Revise the `Submitter != Approver` rule to allow Super Manager / Admin self-approval.
9. **Project Team**: Formally specify a `Project Team` relationship for operational assignment (explicitly noting it is not RLS).

---

## 16. Phase 1B Readiness Assessment

**Status**: **NOT READY**

**Reasoning**: Proceeding to implementation (Phase 1B) with the current Phase 1A architecture would result in a generic CRM that fails to manage the physical realities of metal fabrication. The lack of Worksites as parent entities, the absence of line items, the inability to track RA billing against a BOQ, and the missing Labour/Expense objects mean the system could not calculate project profitability or manage site operations.

---

## FINAL RECOMMENDATION

**Phase 1A requires structural revision.**

The frozen technical baseline (Phase 0D) remains sound, but the Domain/Object mapping (Phase 1A) must be redrafted to incorporate the deep operational requirements of the newly provided business baseline. I recommend generating *Phase 1A Revision 1* strictly addressing the gaps identified above before any code or schema is implemented.

svg