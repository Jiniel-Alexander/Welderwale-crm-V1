# PHASE 0C-4 — TWENTY BASELINE VALIDATION REPORT

**Project:** Construction CRM V1  
**Date:** 2026-09-24  

---

### 1. Objective
Establish a clean, reproducible Twenty v2.41.0 development baseline strictly within the native WSL2 Linux filesystem, bypassing the WSL 9p cross-os file system performance penalty while leaving the Windows host untouched.

### 2. Original workspace path
`/mnt/c/Roy/Welderwale/CONSTRUCTION CRM V1`

### 3. Reason for relocation
Executing file-intensive operations (`yarn install` for 4,478 packages generating over 100k files) across the OS boundary incurred extreme latency, completely blocking dependency resolution and hanging the environment indefinitely.

### 4. New native WSL workspace path
`/home/roy/construction-crm-v1`

### 5. Initial environment state
* **Windows Host Node/Yarn:** Untouched.
* **WSL Directory:** Original `/mnt/c/...` path was active.
* **Legacy Docker State:** Legacy Phase 0A `twenty-app-dev` container (exited) and associated volumes were present.

### 6. Final environment state
* **WSL Directory:** The new `/home/roy/construction-crm-v1` is the active development directory.
* **Toolchain:** WSL Node `24.21.0` and Yarn `4.13.0` are active.
* **Docker:** New dev-specific `twenty-dev_db` and `twenty-dev_redis` running cleanly.

### 7. Twenty source verification
Source downloaded cleanly using the official GitHub API tarball directly into the native Linux filesystem.

### 8. Twenty tag/version
`v2.41.0`

### 9. Commit SHA
`d1bb92d`

### 10. package.json verification
Verified requirements via file inspection:
* `"node": "^24.5.0"`
* `"packageManager": "yarn@4.13.0"`

### 11. Node verification
* **Version:** `v24.21.0` (Active path: `/home/roy/.nvm/versions/node/v24.21.0/bin/node`)

### 12. Yarn verification
* **Version:** `4.13.0` (Active path: `/home/roy/.nvm/versions/node/v24.21.0/bin/yarn`)

### 13. Corepack verification
* **Version:** `0.36.0`

### 14. Path isolation verification
Verified that both `node` and `yarn` are executing exclusively from `/home/roy/.nvm/...` entirely isolating the toolchain from any Windows binaries.

### 15. Dependency installation result
Executed `yarn install --immutable` from `/home/roy/construction-crm-v1/twenty`. Thanks to native `ext4` performance, it completed successfully with all 4,478 packages linked in 4 minutes and 17 seconds.

### 16. Docker configuration
Used the official baseline configuration located at `packages/twenty-docker/docker-compose.dev.yml` to spin up independent infrastructure.

### 17. Docker runtime result
Services instantiated successfully on isolated ports `5432` and `6379`.

### 18. PostgreSQL configuration
* **Image:** `postgres:16`
* **Volume:** `twenty-dev_dev-db-data`

### 19. PostgreSQL runtime verification
* **Container:** `twenty-dev-db-1`
* **Verified Runtime Version:** `PostgreSQL 16.15` (Checked natively via `docker exec`)

### 20. Redis configuration
* **Image:** `redis:7`

### 21. Redis runtime verification
* **Container:** `twenty-dev-redis-1`
* **Verified Runtime Version:** `redis_version:7.4.11` (Checked natively via `docker exec`)

### 22. Database connectivity
Verified Twenty's ability to connect to PostgreSQL during `yarn nx run twenty-server:database:init`.

### 23. Redis connectivity
Verified Twenty's ability to connect to Redis during the NestJS backend boot sequence.

### 24. Twenty application startup
Executed `yarn nx run twenty-server:start`. The backend compiled successfully (8,905 files in 332ms using SWC) and began listening on `localhost:3000`.

### 25. Migration result
Executed `yarn nx run twenty-server:database:init`. TypeORM migrations and core schema creation completed successfully against the new `twenty-dev_db`.

### 26. Health/readiness result
A REST HTTP query to `http://localhost:3000` returned Express HTTP headers, confirming the Node process is healthy, responsive, and handling requests.

### 27. Existing legacy Docker resources left untouched
The legacy `twenty-app-dev` container, `twenty-app-dev-data`, and `twenty-app-dev-storage` volumes were explicitly identified and LEFT UNTOUCHED.

### 28. Files/configuration changed
* The Windows project folder (`C:\Roy\Welderwale\CONSTRUCTION CRM V1`) was left entirely untouched.
* Created `/home/roy/construction-crm-v1`.
* Replicated `.env.example` to `.env` for `twenty-server` and `twenty-front` to ensure DB connection strings operated correctly out of the box.

### 29. Commands executed
* `curl -sL https://api.github.com/repos/twentyhq/twenty/tarball/twenty/v2.41.0 -o twenty.tar.gz`
* `yarn install --immutable`
* `docker compose -f packages/twenty-docker/docker-compose.dev.yml up -d`
* `cp packages/twenty-server/.env.example packages/twenty-server/.env`
* `yarn nx run twenty-server:database:init`
* `yarn nx run twenty-server:start`

### 30. Warnings/errors
* `database:init` initially failed due to the absence of the `twenty-server/.env` file. This was identified, `.env.example` was copied, the partial dev database was cleanly reset (`down -v`), and initialization succeeded perfectly on retry.

### 31. Deviations
* The active development workspace for Phase 1+ must permanently remain `/home/roy/construction-crm-v1`. The Windows path (`C:\Roy\Welderwale\CONSTRUCTION CRM V1`) will no longer be used for Twenty execution.

### 32. Reproducibility procedure
1. Ensure Node 24.21.0 and Yarn 4.13.0 are installed inside the WSL home directory.
2. Establish workspace inside the Linux filesystem (e.g., `~/workspace`).
3. Download Twenty v2.41.0.
4. Run `yarn install --immutable`.
5. Start dev DB services: `docker compose -f packages/twenty-docker/docker-compose.dev.yml up -d`.
6. Copy `.env.example` to `.env` inside `packages/twenty-server`.
7. Initialize DB: `yarn nx run twenty-server:database:init`.
8. Start backend: `yarn nx run twenty-server:start`.

### 33. Remaining risks
* The codebase consumes over 10GB natively. Developer machines must allocate enough internal `ext4.vhdx` disk space.

### 34. Recommended next phase
Proceed with Phase 0C-5 (Permission & Security Validation) to begin mapping Row-Level Security and object permissions.

### 35. Final Phase 0C-4 status
**PASS**
