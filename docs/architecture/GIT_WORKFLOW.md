# Construction CRM V1 - Git Workflow

## 1. Repository Purpose
This repository serves as the authoritative source of truth for the Construction CRM V1 business architecture, project planning, and implementation configuration documentation.

## 2. Main Branch
The default branch is `main`. It represents the approved, stable state of the project architecture and documentation.

## 3. Commit Convention
Use conventional commits (e.g., `feat:`, `fix:`, `docs:`, `chore:`).
Milestone commits should represent fully tested and completed checkpoints.

## 4. Feature / Milestone Branches
For major phases (e.g., Phase 1B, Phase 2), utilize short-lived feature branches if parallel work is occurring, merging back to `main` via pull requests. For sequential milestone implementations in the dev instance, direct commits to `main` at tested checkpoints are acceptable.

## 5. Secret Management
**NEVER COMMIT SECRETS.** 
API keys, database credentials, `.env` files, JWT secrets, and any sensitive tokens are explicitly excluded via `.gitignore`. Always verify `git status` before committing.

## 6. Architecture Versioning
Architecture documents (Phase 0/1 plans, schemas, gap analyses, capability matrices) are strictly version-controlled. They must not be deleted or drastically rewritten without a corresponding change log entry explaining the architectural shift.

## 7. GitHub Repository 
When connected to GitHub, the remote repository must remain **PRIVATE**.

## 8. Twenty Source Separation
The Twenty v2.41.0 source code and build environment (`/home/roy/construction-crm-v1`) is managed natively in WSL and is kept logically separate from this Windows-hosted project documentation repository to prevent tracking gigabytes of unneeded application source and build artifacts.
