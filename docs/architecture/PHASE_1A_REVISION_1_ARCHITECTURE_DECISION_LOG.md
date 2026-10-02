# PHASE 1A REVISION 1 — ARCHITECTURE DECISION LOG

**Project:** CONSTRUCTION CRM V1
**Phase:** 1A Revision 1
**Date:** September 27, 2026

This log captures all structural architectural revisions made between the initial Phase 1A Domain Object Architecture and Phase 1A Revision 1, driven by the Business Architecture Gap Analysis.

---

## DECISION 1: Worksite & Project Cardinality Inversion
- **Original Architecture:** `Project` was the parent. `Site/Location` was a child (1:N from Project).
- **Problem Identified:** Incorrect business reality. A customer establishes a physical worksite, and multiple projects (e.g., structural, canopy, gates) occur at that same site over time.
- **Business Requirement:** Worksite MUST exist before a Project. Worksite → Project (1:N).
- **Revised Architecture:** `Worksite` is a primary domain object owned by `Customer`. `Project` belongs to `Worksite`.
- **Reason:** To accurately track site-level deliveries and aggregate project data per physical location.
- **Integrity Implications:** WS-P-002: A Project cannot be created without a pre-existing Worksite.
- **Permission Implications:** Users need create/view permissions on Worksite prior to Project creation.
- **Technical Validation Required?:** No. Standard relational hierarchy.
- **Future Impact:** Enables site-wide inventory aggregation and unified delivery management.

## DECISION 2: Quotation & Project Independence
- **Original Architecture:** `Quotation` was strictly a child of `Project`.
- **Problem Identified:** Blocked "Workflow A" where a Quotation is created for a Worksite before a Project is formally awarded/created.
- **Business Requirement:** Quotation must optionally link to Worksite without a Project. Project must support multiple Quotations. One Quotation cannot link to multiple Projects.
- **Revised Architecture:** `Quotation` optionally links to `Project`. `Quotation` links to `Worksite`. Cardinality rules: Quotation → Project (0..1), Project → Quotation (0..N).
- **Reason:** To support pre-sales quoting before a commercial job (Project) is officially opened.
- **Integrity Implications:** Q-P-001: The system must enforce that a single quotation record cannot be claimed by a second project.
- **Permission Implications:** Pre-sales estimators need access to Quotations and Worksites without needing Project-level access.
- **Technical Validation Required?:** YES (Enforcement of Q-P-001 cardinality constraint via Twenty API/DB).
- **Future Impact:** Cleanly separates pre-sales pipeline from active project execution.

## DECISION 3: Quotation Revision Object
- **Original Architecture:** Relied on "application-level locking" and generic versioning fields.
- **Problem Identified:** Did not structurally preserve historical commercial snapshots.
- **Business Requirement:** Historical revisions must remain inspectable without being silently overwritten.
- **Revised Architecture:** Explicit `Quotation Revision` object containing `Quotation Revision Lines`.
- **Reason:** Preserves line items, rates, quantities, and totals exactly as they were proposed at a specific point in time.
- **Integrity Implications:** Revisions must be append-only or locked upon supersedence.
- **Permission Implications:** Read-only access to historical revisions for standard roles.
- **Technical Validation Required?:** YES (Cloning/snapshot mechanism to duplicate lines into a new revision).
- **Future Impact:** Enables accurate margin analysis against historical baselines.

## DECISION 4: Commercial Scope / BOQ Object
- **Original Architecture:** Missing.
- **Problem Identified:** No mechanism to track "Quoted → Approved → Fabricated → Billed" quantities.
- **Business Requirement:** A core object to manage additions, reductions, and running account (RA) measurements.
- **Revised Architecture:** `Commercial Scope / BOQ` object linked to `Project`, containing `BOQ Lines`.
- **Reason:** Centralizes the project's authorized deliverables and tracks progressive completion.
- **Integrity Implications:** BOQ lines must sync or reconcile with issued Quotations and Invoices.
- **Permission Implications:** Project Owners can view; financial rates may be masked.
- **Technical Validation Required?:** YES (Calculations of cumulative completion).
- **Future Impact:** Foundational for accurate RA billing and fabrication tracking.

## DECISION 5: Line-Item Architecture
- **Original Architecture:** Only document headers were proposed (e.g., `Invoice`, `PO`).
- **Problem Identified:** Impossible to track quantities, unit rates, taxes, or BOQ deductions without line items.
- **Business Requirement:** Explicit header + line-item modeling for all commercial transactions.
- **Revised Architecture:** Introduced `Quotation Lines`, `Customer PO Lines`, `Supplier PO Lines`, `Contract Lines`, `DC Lines`, `Invoice Lines`, and `BOQ Lines`.
- **Reason:** Standard financial modeling required for precise accounting and inventory deduction.
- **Integrity Implications:** Document totals must strictly equal the sum of their line items.
- **Permission Implications:** Field-level masking of rates/amounts applies to line items as well as headers.
- **Technical Validation Required?:** YES (Server-side rollup/aggregation scripts to calculate header totals).
- **Future Impact:** Enables granular profitability reporting and item-level inventory deduction.

## DECISION 6: Customer PO vs Supplier PO Separation
- **Original Architecture:** Single generic `Purchase Order` object.
- **Problem Identified:** Conflated inbound revenue commitments (Customer PO) with outbound expenses (Supplier PO).
- **Business Requirement:** Distinct workflows, directions, and meanings.
- **Revised Architecture:** Two separate objects: `Customer PO` and `Supplier PO`.
- **Reason:** Resolves fundamental accounting and workflow conflicts.
- **Integrity Implications:** Customer PO links to revenue pipeline; Supplier PO links to accounts payable.
- **Permission Implications:** Procurement roles access Supplier POs; Sales/Project Leads access Customer POs.
- **Technical Validation Required?:** No.
- **Future Impact:** Simplifies downstream AP/AR modules.

## DECISION 7: Payment Allocation & RA Billing
- **Original Architecture:** Basic 1:N Invoice → Payment relationship. No RA billing or TDS/Retention structures.
- **Problem Identified:** Cannot handle advance adjustments, one payment clearing multiple invoices, or customer-withheld retention.
- **Business Requirement:** Support partial/multiple allocations, TDS, and Retention as withheld receivables.
- **Revised Architecture:** Introduced `Payment Allocation` object. Added TDS and Retention fields to `Invoice`.
- **Reason:** Accurately reflects construction cash flow realities.
- **Integrity Implications:** Sum of Payment Allocations cannot exceed Payment total or Invoice outstanding.
- **Permission Implications:** Accountant role manages allocations.
- **Technical Validation Required?:** YES (Validation logic ensuring allocations don't exceed balances).
- **Future Impact:** Accurate Outstanding and Cash Flow reporting.

## DECISION 8: Direct Costs (Expense & Labour)
- **Original Architecture:** Relied on a derived `Actual Cost` without underlying objects.
- **Problem Identified:** Impossible to derive actual cost without tracking the raw inputs.
- **Business Requirement:** Must track workshop/project expenses and labour (employee/contractor).
- **Revised Architecture:** Introduced `Expense` and `Labour` objects linked to `Project`.
- **Reason:** Project Profitability is structurally derived from these inputs + Material Cost.
- **Integrity Implications:** Ensures no "magic" manual cost fields exist.
- **Permission Implications:** Project Owners can log these, but cost-rates may be masked based on role.
- **Technical Validation Required?:** No.
- **Future Impact:** Provides true, granular gross margin analysis.

## DECISION 9: Project Team Relationship
- **Original Architecture:** Rejected Project Team to avoid RLS confusion.
- **Problem Identified:** Ignored the operational need to track which contacts/employees are working on a site.
- **Business Requirement:** Need operational participation tracking.
- **Revised Architecture:** Added `Project Team` relationship.
- **Reason:** To allow assignment of Site Supervisors, Engineers, etc.
- **Integrity Implications:** Explicitly defined as an operational relationship, NOT a technical Row-Level Security (RLS) boundary.
- **Permission Implications:** None at the DB level; strictly for UX/filtering.
- **Technical Validation Required?:** No.
- **Future Impact:** Facilitates operational notifications and task assignments.

## DECISION 10: Approval Authority Rules
- **Original Architecture:** Universally enforced `Submitter != Approver`.
- **Problem Identified:** Blocked Admins and Super Managers from approving their own legitimate actions.
- **Business Requirement:** Admin and Super Manager may self-approve within their authority.
- **Revised Architecture:** Exception added to the approval rule for top-tier roles.
- **Reason:** Removes unnecessary friction for business owners while preserving audit trails.
- **Integrity Implications:** Self-approvals are still rigidly recorded in `Approval History`.
- **Permission Implications:** Logic checks must evaluate User Role before enforcing separation of duties.
- **Technical Validation Required?:** YES (Conditional server-side or integrity layer validation logic).
- **Future Impact:** Faster workflow execution for executives without sacrificing governance.
