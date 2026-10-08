---
name: Construction CRM V1 System-Driven Standard Enforcement
description: Enforces the mandatory system-driven application rules for all current and future development.
---

# Construction CRM V1 - System-Driven Standard

This rule enforces the mandatory engineering standard for ALL current and future Construction CRM V1 development.

## Mandatory Standard File

The following specification document MUST be treated as a mandatory engineering standard for any implementation, logic changes, or feature additions:

**Target File:** `docs/architecture/CONSTRUCTION_CRM_V1_SYSTEM_DRIVEN_APPLICATION_STANDARD_AND_HISTORY_SPEC.md`

You must read, understand, and adhere to the guidelines established within this document before starting or modifying implementation logic.

## Mandatory Considerations During Development

Whenever you are working on data objects, workflows, APIs, interfaces, or metadata within Construction CRM V1, you MUST evaluate and account for the following before finalizing your design/implementation:

1.  **Source of Truth:** Where does the core data originate? Do not create duplicate authoritative sources.
2.  **Derived / Cache Data:** Identify if data is a derivative or caching pointer that requires backend synchronization, and implement the necessary triggers to keep it accurate.
3.  **Dependencies & Downstream Synchronization:** How does altering an entity or its state affect related entities down the chain? (e.g., updating a Worksite affects a Project's derived customer).
4.  **Workflows:** Does the change follow or break expected state machine/lifecycle rules for the object?
5.  **Logic Functions:** Are server-side Logic Functions properly used for derived, cascading, or automated tasks to prevent client-side desyncs?
6.  **Business Integrity Layer:** Where applicable, have you enforced invariants (e.g., no negative amounts, no status skips)?
7.  **Permissions / Security:** Are you enforcing Twenty's RBAC (`core.role`, `core.objectPermission`) correctly for the new structures? Ensure limitations of Twenty CE (e.g., UPDATE vs. CREATE) are safely mitigated and documented.
8.  **AuditLog / History:** Should this action or change trigger a historical record (e.g., `Approval History` insertion)?
9.  **Failure, Retry, and Idempotency:** Are the Logic Functions and mutations idempotent? What happens if they fail?
10. **UI / UX Impact:** Are you inadvertently modifying UI configurations in ways that confuse users or mask derived logic?
11. **Impact on Existing Modules:** Does this change break assumptions made by prior milestones?
12. **Testing & Regression:** Have you verified the changes physically against the application without assuming standard outputs?
13. **Unsupported Twenty Workarounds:** DO NOT invent unsupported security behaviors or override core Twenty functionality with fragile hacks. If Twenty natively limits something (like atomic synchronous cross-table RLS), you must document it and apply supported mitigations (like backend Logic Functions).

## Critical Implementation Requirement

**Isolation Warning:** Implementation should **never** happen in isolation when a change affects existing business data or modules. You must review the broader impact according to the `CONSTRUCTION_CRM_V1_SYSTEM_DRIVEN_APPLICATION_STANDARD_AND_HISTORY_SPEC.md` before proceeding.
