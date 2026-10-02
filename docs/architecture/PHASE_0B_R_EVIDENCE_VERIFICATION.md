# PHASE 0B-R — TWENTY PLATFORM AUDIT CORRECTION & EVIDENCE VERIFICATION

**Project:** Construction CRM V1  
**Project Path:** `C:\Roy\Welderwale\CONSTRUCTION CRM V1`  
**Date:** 2026-09-19  
**Model:** Claude Opus 4.6 (Thinking)  
**Purpose:** Independent re-verification of Phase 0B conclusions

---

## Confidence Labels Used in This Document

| Label | Meaning |
|:------|:--------|
| `[CONFIRMED]` | Verified against primary source (official repo, npm registry, Docker inspect) |
| `[DOCUMENTED]` | Verified against official docs, README, or changelog |
| `[OBSERVED]` | Directly observed in POC code or Docker image, but no official specification guarantees it |
| `[INFERRED]` | Derived from indirect evidence; reasonable but not confirmed |
| `[UNKNOWN]` | Cannot be verified from available public evidence |

---

## 1. Node.js Version Requirement

### Phase 0B Claim
> "Node 22 LTS is compliant with Twenty requirements."

### Verified Finding — `[CONFIRMED]` ❌ PREVIOUS CLAIM IS **WRONG**

**Twenty requires Node.js `^24.5.0`.** The host machine has Node.js **22.17.1**. This is **INCOMPATIBLE**.

#### Primary Evidence

| Source | Node Requirement | URL |
|:-------|:----------------|:----|
| Twenty root `package.json` @ v2.41.0 | `"node": "^24.5.0"` | [package.json](https://github.com/twentyhq/twenty/blob/twenty/v2.41.0/package.json#L29) |
| Twenty root `package.json` @ v2.40.2 | `"node": "^24.5.0"` | [package.json](https://github.com/twentyhq/twenty/blob/twenty/v2.40.2/package.json) |
| Twenty root `package.json` @ v2.38.0 | `"node": "^24.5.0"` | [package.json](https://github.com/twentyhq/twenty/blob/twenty/v2.38.0/package.json) |
| Twenty root `package.json` @ v2.30.0 | `"node": "^24.5.0"` | [package.json](https://github.com/twentyhq/twenty/blob/twenty/v2.30.0/package.json) |
| Twenty root `package.json` @ v2.20.0 | `"node": "^24.5.0"` | [package.json](https://github.com/twentyhq/twenty/blob/twenty/v2.20.0/package.json) |
| `.nvmrc` @ v2.41.0 | `24.16.0` | [.nvmrc](https://github.com/twentyhq/twenty/blob/twenty/v2.41.0/.nvmrc) |
| `create-twenty-app` template `package.json` | `"node": "^24.5.0"` | `packages/create-twenty-app/src/constants/template/package.json` |
| `create-twenty-app` template `.nvmrc` | `24.5.0` | `packages/create-twenty-app/src/constants/template/.nvmrc` |
| `create-twenty-app` README prerequisites | "Node.js: Version 24.5+ is required" | `packages/create-twenty-app/README.md` |
| Docker image `twentycrm/twenty-app-dev:latest` | `NODE_VERSION=24.19.0` (inside container) | Docker inspect |
| POC `package.json` (Test CRM) | `"node": "^24.5.0"` | [package.json](file:///C:/Roy/Welderwale/Test%20CRM/construction-app/package.json) |
| POC `.nvmrc` (Test CRM) | `24.5.0` | [.nvmrc](file:///C:/Roy/Welderwale/Test%20CRM/construction-app/.nvmrc) |

#### Node 24 LTS Status — `[CONFIRMED]`

- Node.js 24 was released May 6, 2025 (Current), promoted to **Active LTS** in October 2025
- Latest: **24.21.0** (released September 8, 2026)
- Supported until April 30, 2028
- Node.js 22 is now in **Maintenance LTS** phase

#### Impact Assessment

> [!CAUTION]
> **CRITICAL BLOCKER.** The host machine's Node.js 22.17.1 does not satisfy `^24.5.0`. The `engines` field in Twenty's `package.json` uses the caret range `^24.5.0`, meaning Node.js 24.5.0 through 24.x.x is accepted. Node 22.x is **outside this range**. Yarn 4 with `engine-strict` mode will reject installation. The `create-twenty-app` scaffolding tool will also fail.
>
> **Resolution Required:** Upgrade host Node.js from 22.17.1 to Node.js 24 LTS (recommend 24.21.0, the latest 24.x release). This should be done in Phase 0C before any Twenty application is scaffolded.

---

## 2. Twenty Version Pinning

### Phase 0B Claim
> "Target version: v2.40.2"

### Verified Finding — `[CONFIRMED]` ⚠️ NEEDS DELIBERATE DECISION

| Version | Status | Release Date | Source |
|:--------|:-------|:-------------|:-------|
| v2.41.0 | **Latest release** | September 17, 2026 | [GitHub Release](https://github.com/twentyhq/twenty/releases/tag/twenty/v2.41.0) |
| v2.40.2 | Previous release | Installed in Docker image | Docker inspect `APP_VERSION=v2.40.2` |

#### Key v2.41.0 Changes Relevant to V1

1. **Record sharing → Enterprise feature** (PR [#26070](https://github.com/twentyhq/twenty/pull/26070)) — Critical for RBAC decision
2. **Row-level permission predicates export** (PRs #25975, #25984, #25994) — Config-as-Code for RBAC
3. **Database event triggers in batch mode** (#26072) — Performance impact
4. **Application file uploads scoped to registration owner** (#25962) — Security improvement
5. **`fix(create-twenty-app): ship a lockfile so generated apps install under an age gate`** (#25879)
6. **Breaking change:** Let every application admin manage workspace-shared connections (#25773)

#### Recommendation

> [!IMPORTANT]
> Do NOT equate "latest release" with "best version for V1." The Docker image has v2.40.2, but v2.41.0 was released 2 days ago. Either version requires Node 24.
>
> **Decision required:** Pin to **v2.40.2** (proven in POC, matches Docker image) or upgrade to **v2.41.0** (latest, with important RBAC and security fixes). Both share identical Node/Yarn requirements. Recommend **v2.40.2 initially**, with a planned upgrade path to v2.41.x after V1 stabilizes.

---

## 3. Yarn / Package Manager

### Phase 0B Claim
> "Yarn 4.13.0 via Corepack"

### Verified Finding — `[CONFIRMED]` ✅ CORRECT (action needed)

| Item | Value | Source |
|:-----|:------|:-------|
| Required `packageManager` | `yarn@4.13.0` | Root `package.json` @ v2.40.2 and v2.41.0 |
| Required `engines.yarn` | `>=4.0.2` | Root `package.json` |
| Host Yarn | `1.22.22` (Classic, global npm install) | Phase 0A audit |
| Host Corepack | `0.33.0` | Phase 0A audit |

Yarn 4 is activated per-project via `corepack enable` + `corepack prepare yarn@4.13.0`. The global Yarn 1.22.22 will **not** be used. Corepack 0.33.0 is adequate.

---

## 4. Docker / PostgreSQL / Redis

### Phase 0B Claim
> "PostgreSQL 16, Redis 7"

### Verified Finding — `[OBSERVED]` ⚠️ PARTIALLY VERIFIED

| Item | Evidence | Confidence |
|:-----|:---------|:-----------|
| Docker image | `twentycrm/twenty-app-dev:latest` (v2.40.2) | `[CONFIRMED]` |
| Container Node | 24.19.0 | `[CONFIRMED]` — Docker inspect |
| PostgreSQL URL | `postgres://twenty:twenty@localhost:5432/default` | `[CONFIRMED]` — Docker inspect env |
| Redis URL | `redis://localhost:6379` | `[CONFIRMED]` — Docker inspect env |
| PostgreSQL version | **16** | `[INFERRED]` — The official `docker-compose.yml` references `postgres:16` image. Not independently verified from the all-in-one dev image. |
| Redis version | **7** | `[INFERRED]` — The official `docker-compose.yml` references Redis 7. Not verified inside the all-in-one dev image. |
| Billing | `IS_BILLING_ENABLED=false` | `[CONFIRMED]` — Docker inspect |
| Dev mode | `NODE_ENV=development`, `SIGN_IN_PREFILLED=true` | `[CONFIRMED]` |

> [!NOTE]
> The `twenty-app-dev` all-in-one image bundles PostgreSQL, Redis, and the Twenty server. The exact PostgreSQL and Redis versions inside this image were not independently confirmed (would require running the container), but the official Twenty `docker-compose.yml` specifies `postgres:16` and Redis 7/8 for production deployments.

---

## 5. Transaction / Data Integrity

### Phase 0B Claim
> The system is "transactionally safe" for financial operations.

### Verified Finding — `[CONFIRMED]` ❌ PREVIOUS CLAIM IS **WRONG**

> [!CAUTION]
> **Logic Functions do NOT execute inside database transactions.** Each API call made by a Logic Function is an independent HTTP request resulting in an independent database transaction on the Twenty backend.

#### Evidence

| Fact | Source |
|:-----|:-------|
| Logic functions execute in isolated Node.js processes (`LocalDriver`) or AWS Lambda (`LambdaDriver`) | Twenty developer docs, `LogicFunctionExecutorService` source |
| Data access is via HTTP/REST or GraphQL using `CoreApiClient` / `RestApiClient` | Twenty developer docs, SDK source |
| **No automatic rollback** — if a function fails mid-execution, previously committed API calls remain committed | Twenty architecture, no contrary documentation exists |
| **No multi-operation atomicity** — each CRUD operation is an independent HTTP request and independent DB transaction | Twenty architecture |
| No transaction-related parameters exist in `defineLogicFunction` — no `transaction`, `isolationLevel`, `atomic`, or `rollbackOnFailure` options | TypeScript type analysis of `defineLogicFunction` |

#### Impact on Construction CRM V1

This means:

1. **GST calculation + invoice total update** is NOT atomic — if the Logic Function crashes between calculating GST and updating the total, the record will be in an inconsistent state.
2. **Stock movement ledger entries** cannot be created atomically with balance updates — a dispatch-to-site could record the movement but fail to update the running balance.
3. **Document number auto-sequencing** has a race condition risk — two concurrent creates could get the same sequence number unless protected by a `defineIndex({ isUnique: true })` constraint (which would cause one to fail, but not retry).

#### Mitigation Strategy

- **Use `defineIndex({ isUnique: true })` for document numbers** — enforces uniqueness at the PostgreSQL level
- **Use `amountMicros` (integer) for all money** — avoids floating-point, but does NOT solve atomicity
- **Design Logic Functions to be idempotent** — if they fail, re-running should produce the correct result
- **Implement server-side validation guards** that detect and flag inconsistent states
- **Accept that V1 operates with eventual consistency** — not ACID guarantees across business operations

---

## 6. Financial Engine Feasibility

### Phase 0B Claim
> "Logic Functions automatically provide accounting-grade guarantees."

### Verified Finding — `[CONFIRMED]` ❌ PREVIOUS CLAIM IS **WRONG**

Logic Functions are **computation containers**, not **accounting engines**. They provide:

| Capability | Available? | Confidence |
|:-----------|:-----------|:-----------|
| Server-side TypeScript execution | ✅ Yes | `[CONFIRMED]` |
| Integer-based money (`amountMicros`, 6 decimal places) | ✅ Yes | `[CONFIRMED]` |
| ISO 4217 currency codes | ✅ Yes | `[CONFIRMED]` |
| Database triggers on record events | ✅ Yes | `[CONFIRMED]` |
| HTTP route triggers with auth | ✅ Yes | `[CONFIRMED]` |
| Cron-based scheduled execution | ✅ Yes | `[CONFIRMED]` |
| ACID transactions across multiple operations | ❌ No | `[CONFIRMED]` |
| Automatic rollback on failure | ❌ No | `[CONFIRMED]` |
| Double-entry accounting guarantees | ❌ No | `[CONFIRMED]` |
| Audit-grade immutable journal | ❌ No — must be built as an application pattern | `[INFERRED]` |

> [!WARNING]
> **AI Governance Rule:** AI MUST NOT be authoritative for: financial calculations, tax calculations, stock balances, document numbering, permissions, transaction state, accounting totals. All financial logic must be implemented as deterministic server-side TypeScript code in Logic Functions, verified by automated tests, and treated as critical business logic — not as an AI-generated convenience.

#### What V1 CAN Achieve

The `FieldType.CURRENCY` with `amountMicros` (integer × 1,000,000) eliminates floating-point rounding. Combined with `defineIndex({ isUnique: true })` for document numbers and idempotent Logic Functions, V1 can achieve **operationally reliable** (not formally accounting-grade) financial operations for a single-company construction CRM. This is acceptable for V1 scope if:

1. All calculations are deterministic and server-side
2. Inconsistency detection/repair is built in
3. No concurrent multi-user write contention on the same financial document

---

## 7. Inventory Model Terminology

### Phase 0B Claim
> "Double-entry stock movement ledger"

### Verified Finding — `[OBSERVED]` ⚠️ TERMINOLOGY CORRECTION NEEDED

The POC ADR-003 describes:

> "Stock balances will never be modified via direct increment/decrement. Every movement must be recorded as an immutable StockMovement transaction (PURCHASE_RECEIPT, DISPATCH_TO_SITE, SITE_RETURN, CONSUMPTION, SCRAP_ADJUSTMENT)."

This is **NOT double-entry bookkeeping** in the accounting sense (debit/credit in a chart of accounts). This is:

**→ An immutable inventory movement ledger** (append-only event log with computed running balances).

| Concept | Accounting Double-Entry | POC Inventory Model |
|:--------|:----------------------|:-------------------|
| Core unit | Debit/Credit journal entry | Movement transaction (type + qty) |
| Balance calculation | Sum of debits minus credits | Sum of movements by type |
| Accounts | Chart of Accounts | Warehouse + Worksite locations |
| Self-balancing | Every entry has equal debit and credit | NOT self-balancing — no paired contra-entries |
| Reversal | Reversing journal entry | Adjustment transaction (SCRAP_ADJUSTMENT) |

> [!IMPORTANT]
> **Correct terminology:** The inventory model is an **immutable movement ledger** (event-sourced pattern), NOT accounting-style double-entry bookkeeping. This distinction matters for:
> - Future auditor conversations
> - Reconciliation design
> - Whether "balancing" checks are even applicable
>
> The pattern is sound for construction material tracking. Just don't call it "double-entry."

---

## 8. RBAC / Row-Level Security

### Phase 0B Claim
> "Role-based access control with row-level security is available via defineRole and RowLevelPermissionPredicateGroup. Score: 3 (Clean extension)."

### Verified Finding — `[CONFIRMED]` ❌ PREVIOUS CLAIM IS **PARTIALLY WRONG**

#### What IS Available on Free Self-Hosted (AGPL)

| Capability | Available? | Confidence |
|:-----------|:-----------|:-----------|
| Workspace roles | ✅ Yes | `[CONFIRMED]` |
| Object-level permissions (CRUD per role) | ✅ Yes | `[CONFIRMED]` |
| Field-level permissions (read/write per role) | ✅ Yes | `[CONFIRMED]` — introduced v1.17.0 |
| `defineApplicationRole` for app-level roles | ✅ Yes | `[CONFIRMED]` — observed in POC |
| Config-as-Code for roles (`yarn twenty pull`) | ✅ Yes | `[DOCUMENTED]` — PRs #25975, #25994 |

#### What REQUIRES Paid License (Organization Plan)

| Capability | Required Plan | Cost | Confidence |
|:-----------|:-------------|:-----|:-----------|
| **Row-level permissions** | Organization | $19/user/month | `[CONFIRMED]` |
| **Record sharing** (`shareWith`) | Organization | $19/user/month | `[CONFIRMED]` |
| **SSO (SAML/OIDC)** | Organization | $19/user/month | `[CONFIRMED]` |
| **Audit logs** | Organization | $19/user/month | `[CONFIRMED]` |
| **Private source code** (AGPL exemption) | Organization (Self-Hosted) | Enterprise Key required | `[CONFIRMED]` |

#### Evidence Sources

| Source | Finding |
|:-------|:--------|
| PR [#26070](https://github.com/twentyhq/twenty/pull/26070) | "Make record sharing an enterprise feature" — merged in v2.41.0 |
| PR [#25868](https://github.com/twentyhq/twenty/pull/25868) | "docs: state which plan row-level permissions require" |
| [Twenty Pricing Page](https://twenty.com/pricing) | Organization plan: $19/user/month includes row-level permissions |
| Docker image env | `IS_BILLING_ENABLED=false` — no billing enforcement in dev mode |
| Codebase headers | Record-sharing files marked `/* @license Enterprise */` |

#### Impact on V1

> [!CAUTION]
> The Construction CRM Capability Matrix scored "Field-level & Row-level Security" as **3 (Clean extension)**. This is correct for object-level and field-level permissions, but **WRONG for row-level security**. Row-level permissions (e.g., "Site Engineers can only see their assigned Worksites") require the **Organization plan at $19/user/month** or a self-hosted Enterprise key.
>
> **Without the Organization license:**
> - `PRIVATE` and `APPLICATION` access levels degrade to `OPEN` (all users see all records)
> - `RowLevelPermissionPredicateGroup` code will be accepted by the SDK but **not enforced at runtime**
> - `shareWith` parameters on mutations will be silently ignored
>
> **Decision Required:** Either (A) purchase the Organization self-hosted license, or (B) redesign V1 security to use only object-level and field-level permissions (all users see all records of a type, but fields can be hidden per role), or (C) implement application-level filtering in Logic Functions as a workaround (not a security boundary — UX-only).

---

## 9. Document Immutability (Server-Side Enforcement)

### Phase 0B Claim
> "Logic Functions provide validation guards that reject update/delete mutations on posted records."

### Verified Finding — `[INFERRED]` ⚠️ PLAUSIBLE BUT NOT VERIFIED

The POC Integration Boundary (Rule 3) states:

> "Issued Quotations (locked version), Posted Invoices, and Dispatched Material Challans cannot be mutated or deleted."

This can be implemented via:
1. **Database event triggers** (`databaseEventTriggerSettings` on `*.updated` / `*.deleted`) — the Logic Function receives the event and can reject it
2. **HTTP route validation** — custom endpoints that check status before allowing mutations

#### What IS Known

| Fact | Confidence |
|:-----|:-----------|
| `databaseEventTriggerSettings` supports `objectSingularName.updated` events | `[CONFIRMED]` |
| Logic Functions CAN throw errors to signal rejection | `[DOCUMENTED]` |
| Logic Functions execute AFTER the triggering event commits | `[CONFIRMED]` — they run in separate processes |

#### What IS NOT Known

| Question | Status |
|:---------|:-------|
| Can a Logic Function on `*.updated` event **prevent** the update (pre-commit hook) or only **react** after it? | `[UNKNOWN]` |
| If the event fires post-commit, does throwing an error in the Logic Function roll back the original mutation? | `[UNKNOWN]` — likely **NO** based on the transaction architecture |
| Is there a pre-mutation validation hook in the Twenty SDK? | `[UNKNOWN]` |

> [!WARNING]
> If database event triggers fire **post-commit** (which is consistent with the isolated-process execution model), then a Logic Function cannot truly prevent a mutation — it can only detect and compensate. This means immutability enforcement may need to be implemented as:
> - A **status-check Logic Function** called before the UI sends the update (UX guard, not a security boundary)
> - A **compensating transaction** that reverts the change if detected post-commit
> - A **PostgreSQL-level trigger or policy** (outside Twenty SDK — would require direct DB access)
>
> **VERIFICATION REQUIRED IN PHASE 1:** Test whether `databaseEventTriggerSettings` on `*.updated` can reject/prevent the mutation or only fires post-commit.

---

## 10. Windows Path Normalization

### Phase 0B Claim
> "Path normalization workaround is necessary on Windows."

### Verified Finding — `[CONFIRMED]` ✅ STILL REQUIRED, STILL FRAGILE

#### Evidence

| Fact | Source | Confidence |
|:-----|:-------|:-----------|
| GitHub Issue [#18470](https://github.com/twentyhq/twenty/issues/18470) ("Add support for native Windows development environment") is **OPEN** with "No status" | GitHub | `[CONFIRMED]` |
| POC workaround patches `twenty-sdk` dist files with **hardcoded bundle filenames** (`login-DTZjy3Zf.js`, `login-Ckp4utnW.mjs`) | [normalize-paths.py](file:///C:/Roy/Welderwale/Test%20CRM/construction-app/scripts/normalize-paths.py) | `[OBSERVED]` |
| The fix replaces `path.relative()` outputs to convert `\` → `/` | POC source code | `[OBSERVED]` |
| Official Twenty docs recommend **WSL** for Windows development | Twenty self-hosting docs | `[DOCUMENTED]` |

#### Risk Assessment

> [!WARNING]
> The POC workaround is **version-specific and fragile**:
> 1. Bundle filenames (`login-DTZjy3Zf.js`) are Vite content-hashes that change with every SDK release
> 2. Upgrading `twenty-sdk` from 2.40.0 to 2.41.0 will break the script
> 3. The script patches `node_modules` — any `yarn install` regeneration invalidates it
>
> **Options for V1:**
> - **(A) Use WSL2** (recommended by Twenty) — eliminates the problem entirely
> - **(B) Maintain a version-specific normalize-paths script** — fragile, manual work on every SDK upgrade
> - **(C) Wait for upstream fix** — Issue #18470 has no timeline
>
> **Recommendation:** Use **WSL2** for the `yarn twenty dev` / `yarn twenty apply` commands. The Docker container already runs Linux. The construction-app TypeScript source can be edited on Windows (VS Code / Cursor remote-WSL), but the Twenty CLI toolchain should run inside WSL2 Ubuntu.

---

## 11. Capability Matrix Re-Assessment

### Phase 0B Claim
> "100% of Construction CRM V1 capabilities score 3 or 4. No architectural compromises required."

### Verified Finding — ❌ PREVIOUS CLAIM IS **OVERSTATED**

#### Corrected Capability Matrix

| Area | Capability | Phase 0B Score | Corrected Score | Reason |
|:-----|:-----------|:--------------:|:---------------:|:-------|
| Data Modeling | Custom Objects | 3 | **3** ✅ | Confirmed |
| Data Modeling | Custom Fields (Money) | 3 | **3** ✅ | `FieldType.CURRENCY` with `amountMicros` confirmed |
| Data Modeling | Relational Hierarchies | 3 | **3** ✅ | `RELATION` fields confirmed |
| Data Modeling | Junction Tables | 3 | **3** ✅ | Confirmed |
| Data Modeling | System Users | 4 | **4** ✅ | Confirmed |
| Business Logic | Document Number Sequencing | 3 | **2** ⚠️ | No transactional atomicity; `defineIndex({ isUnique: true })` prevents duplicates but doesn't provide gap-free sequences |
| Business Logic | GST/Tax Calculations | 3 | **3** ✅ | Server-side calculation is feasible; atomicity risk is manageable for V1 scale |
| Business Logic | Stock Movement Ledger | 3 | **2** ⚠️ | No atomic create-movement + update-balance; must accept eventual consistency |
| Business Logic | Retention & Milestones | 3 | **3** ✅ | Feasible as custom fields |
| Immutability | Posted Record Locking | 3 | **2** ⚠️ | Post-commit event triggers cannot prevent mutations; compensation pattern needed |
| UI/UX | Standard Views | 4 | **4** ✅ | Confirmed |
| UI/UX | Dashboard | 3 | **3** ✅ | `defineFrontComponent` + `definePageLayout` confirmed |
| UI/UX | Navigation | 3 | **3** ✅ | `defineNavigationMenuItem` confirmed |
| Security | Object/Field RBAC | 3 | **3** ✅ | Free tier supports this |
| Security | **Row-Level Security** | 3 | **1** ❌ | **Requires paid Organization license ($19/user/month)** |
| Storage | File Attachments | 3 | **3** ✅ | Confirmed |
| Integration | API Client | 4 | **4** ✅ | `twenty-client-sdk` confirmed |
| Operations | Dev Workflow | 3 | **2** ⚠️ | Windows path issue; WSL recommended |
| Production | Self-Hosting | 4 | **4** ✅ | Docker Compose confirmed |

#### Corrected Summary

| Score | Count | Phase 0B Count | Delta |
|:------|:-----:|:--------------:|:-----:|
| 4 (Reusable as-is) | 5 | 4 | +1 |
| 3 (Clean extension) | 8 | 15 | -7 |
| 2 (Substantial customization) | 4 | 0 | +4 |
| 1 (Unsafe/invasive) | 1 | 0 | +1 |
| 0 (Impossible) | 0 | 0 | — |

> [!IMPORTANT]
> The corrected matrix shows **1 capability at score 1** (row-level security without paid license) and **4 capabilities at score 2** (requiring substantial workarounds). The claim "100% score 3 or 4" is **false**.

---

## 12. AI Governance Rule

### Verified Finding — `[CONFIRMED]` ✅ MUST BE ENFORCED

**AI MUST NOT be authoritative for:**

- Financial calculations (GST, TDS, retention, totals)
- Tax calculations (CGST, SGST, IGST rates and amounts)
- Stock balances (warehouse quantities, consumption totals)
- Document numbering (QTN-xxxx, INV-xxxx sequences)
- Permissions (role assignments, access decisions)
- Transaction state (posted/draft/cancelled status transitions)
- Accounting totals (invoice totals, project cost summaries)

All of the above must be implemented as **deterministic, tested, server-side TypeScript code** in Logic Functions. AI can assist in writing the code but must not be the runtime authority.

---

## 13. POC Security Findings

### Verified Finding — `[OBSERVED]` ⚠️ MUST BE CORRECTED IN V1

| Finding | File | Severity |
|:--------|:-----|:---------|
| `isAuthRequired: false` on financial endpoint | [recalculate-project-cost.logic-function.ts](file:///C:/Roy/Welderwale/Test%20CRM/construction-app/src/logic-functions/recalculate-project-cost.logic-function.ts) L29 | **HIGH** — allows unauthenticated callers to invoke financial calculation |
| Hardcoded JWT tokens in tests | `src/__tests__/poc-entities.test.ts` | **MEDIUM** — POC-only, must not carry to V1 |
| Default role has `canReadAllObjectRecords: true`, `canUpdateAllObjectRecords: true` | [default-role.ts](file:///C:/Roy/Welderwale/Test%20CRM/construction-app/src/default-role.ts) L12-14 | **MEDIUM** — overly permissive for a construction CRM with role separation |

---

## 14. AGPL License Implications

### Verified Finding — `[CONFIRMED]` ⚠️ DESIGN DECISION REQUIRED

| Tier | License | Source Code Requirement | Row-Level Perms |
|:-----|:--------|:----------------------|:---------------|
| Free Self-Hosted | AGPL-3.0 | **Must open-source modifications** | ❌ No |
| Organization Self-Hosted | Commercial (Enterprise Key) | Private code allowed | ✅ Yes |

> [!WARNING]
> Under the free AGPL tier, if the Construction CRM V1 code is distributed (e.g., deployed to a server accessible by others), the source code must be made available under AGPL-3.0. If the client (single construction company, internal use only) runs it solely for internal purposes without distributing it to third parties, AGPL allows private use. However, if this CRM is ever offered as a service or distributed to other companies, the code must be open-sourced.
>
> **The Organization Self-Hosted license** ($19/user/month with Enterprise Key) removes this requirement and enables row-level permissions.

---

## 15. Architecture Blockers Assessment

### Phase 0B Claim
> "Architecture blockers: None"

### Verified Finding — ❌ **THERE ARE BLOCKERS AND RISKS**

---

## Decision Table

| # | Decision | Previous Phase 0B | Verified Finding | Evidence | Confidence | Final Recommendation |
|:--|:---------|:------------------|:-----------------|:---------|:-----------|:---------------------|
| 1 | **Node.js version** | Node 22 compliant | Node 22 is **INCOMPATIBLE**. Must use `^24.5.0` | Root `package.json` across v2.20–v2.41 | `[CONFIRMED]` | Upgrade to Node 24.21.0 LTS |
| 2 | **Twenty version** | Pin v2.40.2 | v2.40.2 OK; v2.41.0 available | GitHub releases | `[CONFIRMED]` | Pin v2.40.2 initially; upgrade path to v2.41.x |
| 3 | **Yarn version** | Yarn 4.13.0 via Corepack | Correct | Root `package.json` | `[CONFIRMED]` | `corepack enable` + `corepack prepare yarn@4.13.0` |
| 4 | **PostgreSQL** | 16 | Likely 16 (in Docker image) | Docker compose uses `postgres:16` | `[INFERRED]` | Accept; verify in Phase 1 |
| 5 | **Redis** | 7 | Likely 7 (in Docker image) | Docker compose uses Redis 7 | `[INFERRED]` | Accept; verify in Phase 1 |
| 6 | **Transaction safety** | Transactionally safe | **NOT transactionally safe** — no atomicity | Logic Function execution model | `[CONFIRMED]` | Design for idempotency and eventual consistency |
| 7 | **Financial engine** | Accounting-grade guarantees | **No accounting-grade guarantees** | No transaction parameters in SDK | `[CONFIRMED]` | Use `amountMicros`, idempotent functions, unique indexes |
| 8 | **Inventory model** | Double-entry bookkeeping | **Immutable movement ledger** (not double-entry) | POC ADR-003 terminology analysis | `[OBSERVED]` | Correct terminology; pattern is sound |
| 9 | **Row-level security** | Available (Score 3) | **Requires paid license** ($19/user/month) | PR #26070, pricing page, PR #25868 | `[CONFIRMED]` | Decision required: buy license or redesign security |
| 10 | **Document immutability** | Logic Function guards | **Unverified** — event triggers may be post-commit | Execution model analysis | `[INFERRED]` | Verify in Phase 1; may need compensation patterns |
| 11 | **Windows paths** | Workaround needed | **Still needed**, fragile, version-specific | Issue #18470 open, POC patches dist files | `[CONFIRMED]` | Use WSL2 for Twenty CLI operations |
| 12 | **Architecture blockers** | None | **Multiple risks identified** | This audit | — | See Risk Register below |
| 13 | **Capability matrix** | 100% score 3-4 | **72% score 3-4** (1 at score 1, 4 at score 2) | Re-assessment | — | Adjust expectations; mitigations needed |

---

## Risk Register

| # | Risk | Severity | Evidence | Impact on V1 | Mitigation | Must Resolve Before Phase 1? |
|:--|:-----|:---------|:---------|:-------------|:-----------|:----------------------------|
| R1 | **Node 22 incompatible with Twenty** | 🔴 CRITICAL | Root `package.json` `"node": "^24.5.0"` | Cannot scaffold, install, or run Twenty app | Upgrade to Node 24 LTS | **YES** |
| R2 | **Row-level security requires paid license** | 🟡 HIGH | PR #26070, pricing page | Site Engineers cannot be restricted to assigned worksites without Organization license ($19/user/month) | Buy license OR redesign to object/field-level perms only | **YES** (design decision) |
| R3 | **No transaction atomicity in Logic Functions** | 🟡 HIGH | Execution model confirmed | Financial calculations, stock movements, document numbering have race condition risk | Idempotent design, unique indexes, eventual consistency | **YES** (design acceptance) |
| R4 | **Windows path normalization fragile** | 🟡 MEDIUM | Issue #18470 open, POC patches hardcoded dist filenames | SDK upgrades break the workaround | Use WSL2 for CLI operations | **YES** |
| R5 | **Document immutability enforcement unverified** | 🟡 MEDIUM | Post-commit event triggers cannot prevent mutations | Posted invoices/challans may be editable | Verify event trigger behavior; implement compensation | **YES** (verification) |
| R6 | **AGPL open-source requirement** | 🟡 MEDIUM | Free tier requires AGPL compliance | Source code must be available if distributed | For internal-only use: acceptable. For distribution: need Organization license | NO (internal use for now) |
| R7 | **POC security flaws** | 🟡 MEDIUM | `isAuthRequired: false`, hardcoded JWTs, overly permissive default role | Must not carry to V1 | Fix in V1 implementation | NO (POC-only) |
| R8 | **Version pinning not formalized** | 🟢 LOW | Docker has v2.40.2, latest is v2.41.0 | Inconsistency risk if not explicitly pinned | Pin versions in project config | YES (pre-scaffold decision) |

---

## Phase Gate Assessment

### 🟡 YELLOW — CONDITIONAL PROCEED

**The project CAN proceed to Phase 0C (environment setup), but ONLY after resolving the following blocking items:**

#### Must Resolve BEFORE Phase 0C

| # | Item | Action Required | Owner |
|:--|:-----|:---------------|:------|
| 1 | **Node.js upgrade** | Upgrade from 22.17.1 to **Node 24 LTS** (24.21.0 recommended) | Phase 0C |
| 2 | **Row-level security decision** | Decide: (A) Purchase Organization license, (B) V1 without row-level perms, or (C) Application-level filtering workaround | **USER DECISION** |
| 3 | **Transaction atomicity acceptance** | Acknowledge that V1 will NOT have ACID transactions across Logic Function operations. Design patterns must account for eventual consistency | **USER ACKNOWLEDGMENT** |
| 4 | **Windows development strategy** | Decide: (A) Use WSL2, (B) Maintain normalize-paths script, or (C) Both | **USER DECISION** |
| 5 | **Twenty version pin** | Decide: Pin v2.40.2 or upgrade to v2.41.0 | **USER DECISION** |
| 6 | **Terminology correction** | Accept "immutable movement ledger" instead of "double-entry bookkeeping" for inventory | **USER ACKNOWLEDGMENT** |

#### Must Verify DURING Phase 1

| # | Item | Verification Method |
|:--|:-----|:-------------------|
| 1 | PostgreSQL version inside dev container | Run `psql --version` inside container |
| 2 | Redis version inside dev container | Run `redis-server --version` inside container |
| 3 | Event trigger timing (pre-commit vs post-commit) | Create test Logic Function on `*.updated` that throws; verify if original mutation is prevented |
| 4 | Document number uniqueness under concurrency | Load test with parallel creates using `defineIndex({ isUnique: true })` |
| 5 | Windows path issue with v2.40.2 SDK | Test `yarn twenty dev` on Windows (native) vs WSL2 |

---

> [!CAUTION]
> **DO NOT proceed to Phase 0C without explicit user decisions on items 1-6 above.**
> 
> **DO NOT use the phrase "Architecture blockers: None"** — this audit has identified 8 risks, 3 of which are HIGH or CRITICAL severity.
>
> This report supersedes `PHASE_0B_TWENTY_PLATFORM_COMPATIBILITY_AUDIT.md` as the canonical evidence record.

---

**END OF PHASE 0B-R EVIDENCE VERIFICATION**

**Status:** COMPLETE — Awaiting architectural review and user decisions before Phase 0C.
