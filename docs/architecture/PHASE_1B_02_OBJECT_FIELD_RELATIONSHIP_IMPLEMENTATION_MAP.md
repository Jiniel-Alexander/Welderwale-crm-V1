# PHASE 1B - 02: OBJECT, FIELD & RELATIONSHIP IMPLEMENTATION MAP

*All objects implemented as Twenty Custom Objects unless marked Native.*

## Core & People
- **Organization** (Native: `company`): Base entity.
- **Contact** (Native: `person`): Base person.
- **Organization Contact** (Custom): 
  - *Relations*: M2O Organization, M2O Contact.
  - *Fields*: Designation (Text), Department (Text), Primary (Bool).
- **Worksite** (Custom):
  - *Relations*: M2O Organization.
  - *Fields*: Address, City, GPS, Delivery Instructions.
- **Project** (Custom):
  - *Relations*: M2O Worksite. (Customer is derived strictly from Worksite).
  - *Fields*: Status (Picklist), Project Owner (M2O Workspace Member).
- **Project Team** (Custom):
  - *Relations*: M2O Project, M2O Contact/Member.
  - *Fields*: Role, Active From, Active To.

## Pre-Sales & Baseline
- **Quotation** (Header): M2O Worksite, M2O Project (Optional).
- **Quotation Revision** (Header): M2O Quotation, Revision No (Int).
- **Quotation Revision Line**: M2O Quotation Revision, Material, Qty (Dec), Rate (Int), Total (Int - BIL).
- **Commercial Scope / BOQ**: M2O Project, Approved Total (Int - BIL).
- **BOQ Line**: M2O BOQ, Item, Quoted Qty, Approved Qty, Billed Qty (Dec - BIL).
- **BOQ Change**: M2O BOQ, Type (ADD/REDUCE). **BOQ Change Line**: M2O Change.

## Commercial Transactions
- **Customer PO**, **Supplier PO**, **Contract**, **Supplier Bill**, **Delivery Challan** (Headers): M2O Project.
- **[Doc] Lines** (Children): M2O to respective Headers, Material, Qty, Rate, Total.

## Finance & Direct Costs
- **Invoice**: M2O Project, M2O Worksite, Gross Amount (Int), TDS (Int), Retention (Int), Net (Int).
- **Invoice Line**: M2O Invoice, Qty, Rate, Amount.
- **Payment**: M2O Organization, Amount (Int), Unallocated (Int - BIL).
- **Payment Allocation**: M2O Payment, M2O Invoice, Amount (Int).
- **Expense**: M2O Project, Category (Picklist), Amount (Int).
- **Labour**: M2O Project, Worker, Hours (Dec), Amount (Int).

## Operations & Governance
- **Material**: Name, Code, Stock Unit.
- **Inventory Movement**: M2O Material, M2O Source, M2O Dest, Qty (Dec), Type (Picklist).
- **Fabrication Job**: M2O Project, Status, Planned/Actual Qty.
- **Approval History**: Morphic Target, Action, Submitter, Approver.
- **AuditLog**: Append-only event tracking.
