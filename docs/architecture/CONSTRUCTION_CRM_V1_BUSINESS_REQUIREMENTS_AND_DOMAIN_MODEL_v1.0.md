# CONSTRUCTION CRM V1 — BUSINESS REQUIREMENTS & DOMAIN MODEL
## Version 1.0 — Business Baseline

**Status:** Business discovery complete  
**Purpose:** Authoritative business/domain baseline for revising Phase 1A architecture.  
**Implementation status:** No implementation is authorized by this document alone.

## 1. Business Context

This CRM is for the family metal-fabrication/construction business. It consolidates paper/book-based records into one system for customers, contacts, worksites, projects, quotations, contracts, POs, fabrication, materials, inventory, delivery challans, invoices, payments, expenses, labour, documents, reporting, and project profitability.

This is **not** the manpower/Kaamvali CRM.

## 2. Core Terminology

### Customer / Organization
The company, builder, developer, contractor, subcontractor, industrial/commercial organization, or individual that gives work and/or owes payment.

### Contact
An individual person associated with a customer/organization. Example: Anand at L&T. Contacts can have project-specific roles.

### Worksite
The physical location where work is executed or material is delivered.

**Fixed rule: one Worksite can have multiple Projects.**

A Project requires an existing Worksite before creation.

### Project
A specific commercial/business job undertaken for a Customer.

### Project Owner
Internal person responsible for managing/executing the Project. The Project Owner is not the customer's Contact.

### Supplier
Organization/person from whom materials, equipment or services are purchased. An organization may potentially be both Customer and Supplier.

### Labour / Worker
Person performing work, including employees, daily labour, contractors and other labour categories.

## 3. Customer / Contact

Customer classifications/types include Company, Individual, Builder/Developer, Industrial, Commercial, Contractor, Subcontractor, Residential and Other.

Customers can have multiple Contacts and Projects.

Contact fields include Name, Mobile, Email, Designation, Department, Company/Organization, WhatsApp, Address, Notes and Primary Contact.

Project contact roles may include Client Representative, Project Manager, Procurement, Accounts, Site Engineer, Site Supervisor, Decision Maker, Approver and Other.

A universal searchable people directory should cover customer contacts, supplier contacts, employees, labour, contractors, subcontractors and site contacts.

## 4. Worksite / Project Relationship

```text
Customer / Organization
    ├── Contacts
    └── Worksites
          ├── Project A
          ├── Project B
          └── Project C
```

A Worksite may contain multiple Projects. V1 treats each Project as belonging to one Worksite.

Worksite fields include Site Name, Address, City, State, Pincode, GPS/location, Site Contact, Site Engineer, Site Supervisor, Customer, Delivery Instructions, Working Hours, Site Photos and Site Documents.

## 5. Project

Supported project/work types include Metal Fabrication, Structural Fabrication, Industrial Fabrication, Residential Fabrication, Gate, Grill, Safety Door, Canopy, Shed, Installation, Labour-only, Per-KG Fabrication, Supply + Fabrication, Supply + Installation, Repair/Modification, Subcontract and Other.

A Project can contain multiple work types.

### Project Owner visibility

Project Owner can manage operational information including labour, progress, site notes, photos, tasks, material requests/receipts/consumption, wastage, scrap, installation and subcontractors.

Project Owner should see operational scope/quantities/BOQ but normally must not see sensitive financial values such as contract value, quotation rates, invoice values, payment values, project cost or profitability.

Where Twenty field-level permissions support this cleanly, they should be used.

## 6. Project Creation and Approval

V1 Project creation is allowed for Admin, Super Manager, Manager and Intern/Data Entry. Project Lead cannot initially create Projects.

Approval is required for New Project, Project Value, Contract Value, Project Owner, Customer, Worksite, Project Scope, Budget, Major Expense, Project Closure and other designated sensitive changes.

Admin and Super Manager may self-approve actions within their authority. This does **not** remove audit/history. Every approval retains initiator, approver, date/time, action, previous/new values, reason where applicable, status and related transaction/project.

Lower roles follow configured approval workflows.

## 7. Project Lifecycle

Candidate statuses:

- Draft
- Pending Approval
- Active
- On Hold
- Completed
- Closed
- Cancelled
- Archived

Historical status is separate from operational status. Example: `Historical = Yes` and `Status = Completed`.

## 8. Project Scope / BOQ

Project Scope/BOQ is a core V1 concept.

```text
Quoted → Approved → Fabricated → Delivered → Installed → Billed
```

Scope can increase or decrease and changes must be traceable.

Example:

```text
Original: 5,000 KG
Addition: +1,500 KG
Reduction: -500 KG
Current:  6,000 KG
```

Scope/BOQ connects commercial scope with fabrication, delivery, installation and billing.

## 9. Quotation

Both workflows are valid:

**Quotation first:** Worksite → Quotation → Approval → Project

**Project first:** Worksite → Project → Quotation created/updated in parallel

Therefore, neither Project nor Quotation is a mandatory prerequisite for the other. Both can reference the Worksite. Projects can select existing quotations and quotations can select existing projects.

Quotation line items support Description, Material, Quantity, Unit, Rate, Discount, GST, Labour, Installation, Other Charges and Total.

Quotation changes require version/snapshot history. Previous states must remain inspectable. Structured snapshots are preferred over image-only history. PDF snapshots may also be retained.

## 10. Contract / Work Order / Customer PO / Supplier PO

Customers may provide Work Orders, Customer Purchase Orders, Contracts, Letters of Award, Email confirmations and other commercial confirmations.

**Customer PO** = received from customer.

**Supplier PO** = created by the company and issued to a supplier.

They must be modeled as separate transaction/document concepts.

Multiple customer POs and Work Orders may be required; exact cardinality is an architecture decision.

## 11. Fabrication

V1 tracks:

```text
Raw Material → Fabrication → Finished Structure → Delivery → Installation
```

Track Material Requirement, Estimated Quantity/Weight, Actual Quantity/Weight, Labour, Fabrication Status, QC, Completion, Delivery, Installation, Photos and Measurements.

A separate Production Work Order/Fabrication Job object is **not yet frozen**. Avoid overengineering until architecture review determines whether it is needed.

## 12. Material Master

Material fields:

**Identity:** Material Name, Material Code, Category.

**Optional specifications:** Brand, Grade, Size, Thickness, Dimensions, Specification.

**Units:** Purchase Unit, Stock Unit, Consumption Unit, Standard Unit.

Supported units include KG, TON, NOS, Metre, Sq.ft., Sq.m, Litre, Piece, Set, Box, Carton and Other.

Commercial/inventory fields include Purchase Rate/Cost, Current Stock, Preferred Supplier and Stock Location.

Specifications are available but generally optional.

## 13. Unit Conversion

V1 should not introduce a complex universal conversion engine.

Standard mathematical conversions may be supported where safe. Product-specific conversions such as `1 Box = 20 Pieces` are optional because packaging varies by material.

No mandatory conversion is required for quotation/invoice V1.

## 14. Inventory / Material Movement

Supported movements:

- Supplier → Workshop
- Supplier → Worksite
- Workshop → Worksite
- Worksite → Workshop
- Worksite → Worksite
- Workshop → Workshop
- Return to Supplier
- Consumption
- Scrap
- Wastage
- Adjustment
- Reversal

Track Material, Quantity, Unit, Location, Supplier where applicable, Project, Worksite, Consumption, Wastage, Scrap, Scrap Value and Purchase Cost/Reference.

Batch/heat numbers are not required for V1.

Inventory corrections must be traceable. Posted movement history must not be silently deleted or overwritten.

## 15. Purchase / Supplier Bills

Supplier Bills support Supplier, Supplier Invoice, PO, Project, Worksite, Material, Payment relationship, Bill Photo, PDF, Material Receipt and other attachments.

The same organization can potentially exist as both Customer and Supplier.

## 16. Delivery Challan

Support Customer, Project, Worksite, Customer PO where applicable, Invoice where applicable, Vehicle, Driver where applicable, Material, Quantity, Unit, Weight, HSN where applicable, Receiver, Receiver Signature, Company Signature, Photos and Remarks.

## 17. Invoice / Billing

V1 supports Multiple Invoices per Project, Multiple Invoices per Customer, Partial Billing, Milestone Billing, RA Bills, Advance Adjustment, GST, TDS, Retention, Discount, Credit Notes and Debit Notes.

Invoice lines support Description, HSN/SAC, Quantity, Unit, Rate, Discount, GST and Amount.

Issued invoice corrections require revision/history. Previous state must remain recoverable/auditable.

## 18. RA Billing

RA means Running Account billing: periodic billing for work completed to date rather than waiting for full project completion.

Example:

```text
Approved Scope: 10,000 KG
RA Bill 1:       1,000 KG
RA Bill 2:       2,000 KG
RA Bill 3:       2,500 KG
Cumulative:      5,500 KG
Remaining:       4,500 KG
```

RA billing should connect Project Scope/BOQ → completed/measured work → current billing → cumulative billing → Invoice.

Detailed RA measurement mechanics remain an architecture/detail-design item.

## 19. TDS / Retention

TDS and retention are customer-side deductions from amounts payable to the company, where applicable. They are optional, not mandatory on every invoice.

Example:

```text
Gross Invoice       ₹10,00,000
TDS Deducted            ₹20,000
Retention Withheld      ₹50,000
Net Payment             ₹9,30,000
```

Retention is an amount **withheld by the customer**, not an amount paid by the company. It can later be released by the customer and recorded separately.

The system should distinguish Gross Invoice, TDS, Retention, Advance Adjustment, Other Adjustments, Net Payable, Payment Received, Retention Outstanding and relevant TDS information.

## 20. Customer Payments

Support Advance, Partial, Full, Multiple Payments per Invoice, One Payment across Multiple Invoices, Bank Transfer, Cheque, Cash, UPI and Other.

A Payment Allocation concept is required:

```text
Payment
  └── Payment Allocations
        ├── Invoice A
        ├── Invoice B
        └── Invoice C
```

Payments cannot be deleted. Posted payments cannot be silently modified. Corrections use auditable correction/reversal while retaining the original.

## 21. Credit / Debit Notes

Credit/Debit Notes should reference the original financial transaction where applicable.

Customer-side:

```text
Customer → Invoice → Credit/Debit Note → Adjusted Receivable
```

Supplier-side may similarly be supported:

```text
Supplier → Supplier Bill → Credit/Debit Note → Adjusted Payable
```

Exact V1 depth remains an architecture decision.

## 22. Expenses

V1 only needs expense recording, not a complex expense-payable subsystem.

Workshop/general expenses include Electricity, Water, Rent, Equipment Repair, Workshop Repair, New Equipment, Tools, Consumables, Maintenance, Transport, Labour and Other.

Project expenses include Transport, Labour, Food, Accommodation, Tools, Equipment, Site Expenses, Miscellaneous and Other.

Project expenses contribute to Actual Project Cost and profitability.

## 23. Labour

Worker/Labour Master is required.

Example:

```text
Worker: Ramesh
Daily Rate:    ₹800
Hourly Rate:   ₹100
OT Rate:       ₹120/hour
```

Supported models:

- Employee labour
- Daily labour
- Contractor labour
- Per-day
- Per-KG
- Per-unit
- Lump sum
- Hourly
- Attendance
- Project allocation

Overtime should be calculated from configurable standard hours/threshold and overtime rate.

Example:

```text
Normal Hours: 8
Actual Hours: 10
OT Hours:     2
Daily Labour: ₹800
OT:           2 × ₹120 = ₹240
Total:        ₹1,040
```

## 24. Project Profitability

Project profitability is a V1 requirement and should be calculated from underlying transactions rather than manually entered.

Project financial view should show:

- Contract Value
- Earned / Completed Value
- Invoiced Amount
- Collected Amount
- Outstanding
- Material Cost
- Labour Cost
- Project Expenses
- Other Direct Costs
- Actual Project Cost
- Gross Profit
- Gross Margin

Conceptually:

`Earned / Completed Value - Actual Project Cost = Gross Profit`

The exact accounting treatment of earned value and cost recognition must be finalized during financial architecture.

## 25. Documents

Each Project should have a central document area for:

- Quotations
- Contracts
- Customer POs
- Supplier POs
- Work Orders
- DCs
- Invoices
- Payment proofs
- Supplier bills
- Measurement sheets
- Work completion certificates
- Site photos
- Drawings
- Blueprints
- Other business/project/worksite documents

Documents should be classifiable by Customer, Worksite, Project and transaction.

## 26. Import / Export

Import:

- Customers
- Contacts
- Suppliers
- Projects
- Worksites
- Materials
- Quotations
- Invoices
- Payments
- Expenses
- Historical records

Formats: Excel and CSV.

Export should be available across relevant modules. Major transactions/documents require unique identifiers so exported data can be related across modules.

## 27. Historical Records

Historical information is primarily in paper/books.

V1 approach:

```text
Paper / Books
    ↓
Human Data Entry
    ↓
CRM Historical Record
```

Historical records can be flagged separately from operational status.

OCR is not a V1 dependency.

## 28. Future OCR / AI

Future OCR may extract supplier, bill number, date, line items, quantity, rate, GST and total from photographs/handwritten bills, create a draft and require human verification before posting.

Future AI may answer project questions, search documents, summarize projects, find outstanding payments, find material at site, draft quotations/invoices and extract document data.

AI must never independently post authoritative financial transactions.

## 29. Audit / Correction Principles

Mandatory principles:

- No silent deletion of authoritative financial history.
- Payments cannot be deleted.
- Posted payments cannot be silently edited.
- Inventory movements cannot be silently deleted/overwritten.
- Issued document corrections require history.
- Project Owner changes require audit.
- Financial value changes require audit.
- Document number changes require controlled history.
- Duplicate document numbers must not occur.
- Unauthorized financial access must not occur.
- Unauthorized role changes must not occur.
- Approval history must be retained.
- Admin and Super Manager self-approval is permitted within authority but remains fully audited.

## 30. Reporting

Customer reports:
- Outstanding
- Payment History
- Projects
- Revenue
- Quotation History

Project reports:
- Contract/Project Value
- Earned Value
- Revenue/Invoicing
- Cost
- Profitability
- Outstanding
- Material Consumed
- Material Cost
- Labour Cost
- Expenses
- Invoice Status
- Payment Status

Supplier reports:
- Purchases
- Outstanding
- Payments
- History

Inventory reports:
- Current Stock
- Stock by Location
- Stock by Project
- Consumption
- Wastage
- Scrap
- Material Cost

## 31. Future / V2

Future capabilities include OCR, AI assistant, advanced document extraction, AI drafting, advanced production planning, advanced inventory costing and more sophisticated labour allocation.

## 32. Open Architecture Decisions

The following are now **design/technical decisions**, not unresolved business discovery:

1. Exact Twenty object model.
2. Exact relationships/cardinalities.
3. Line-item architecture for quotations, POs, DCs and invoices.
4. Scope/BOQ object and versioning.
5. RA billing/measurement implementation.
6. Invoice revision/correction implementation.
7. Customer PO vs Supplier PO implementation.
8. Credit/Debit Note implementation.
9. Payment Allocation implementation.
10. TDS/Retention storage/calculation.
11. Project profitability calculation engine.
12. Material cost methodology.
13. Inventory balance/reconciliation mechanism.
14. Numbering/sequence architecture.
15. Approval workflow implementation.
16. AuditLog and Approval History implementation.
17. Field-level financial visibility.
18. Export relational identifiers.
19. Fabrication object/job depth.
20. Technical enforcement limitations of Twenty OSS.

## 33. Current Domain Model

```text
CUSTOMER / ORGANIZATION
│
├── CONTACTS
│
├── WORKSITES
│      │
│      ├── PROJECT A
│      │     ├── PROJECT OWNER
│      │     ├── SCOPE / BOQ
│      │     ├── QUOTATIONS
│      │     ├── CONTRACT / CUSTOMER PO
│      │     ├── FABRICATION
│      │     ├── MATERIAL
│      │     ├── INVENTORY MOVEMENTS
│      │     ├── LABOUR
│      │     ├── EXPENSES
│      │     ├── DELIVERY CHALLANS
│      │     ├── INSTALLATION
│      │     ├── INVOICES
│      │     │      ├── TDS
│      │     │      ├── RETENTION
│      │     │      ├── ADVANCE ADJUSTMENT
│      │     │      └── CREDIT/DEBIT ADJUSTMENTS
│      │     ├── PAYMENTS
│      │     │      └── PAYMENT ALLOCATIONS
│      │     └── PROFITABILITY
│      │
│      ├── PROJECT B
│      └── PROJECT C
│
└── SUPPLIER RELATIONSHIP

SUPPLIER
├── SUPPLIER POs
├── SUPPLIER BILLS
├── MATERIAL PURCHASES
└── SUPPLIER PAYMENTS

GOVERNANCE
├── APPROVAL HISTORY
├── AUDIT LOG
├── NOTIFICATIONS
└── RECONCILIATION / INTEGRITY EXCEPTIONS
```

## 34. Next Controlled Step

Business discovery is complete.

The next activity is:

1. Compare this business baseline with the existing Phase 1A architecture.
2. Identify missing objects, relationships, contradictions and unsafe assumptions.
3. Produce a controlled **Phase 1A Revision 1** architecture prompt.
4. Give that prompt to Antigravity.
5. Antigravity revises architecture only; no implementation.
6. Review the revised Phase 1A report.
7. Approve the architecture before Phase 1B implementation.

**Implementation remains blocked until the revised Phase 1A architecture is reviewed and approved.**
