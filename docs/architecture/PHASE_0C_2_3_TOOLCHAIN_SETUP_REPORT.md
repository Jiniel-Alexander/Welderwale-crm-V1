# PHASE 0C-2 / 0C-3 — TOOLCHAIN SETUP REPORT

**Project:** Construction CRM V1  
**Project Path:** `C:\Roy\Welderwale\CONSTRUCTION CRM V1`  
**Date:** 2026-09-23  
**Status:** **PASS WITH WARNINGS**

---

## A. Initial State
* **Windows Node:** `v22.17.1` (Incompatible with Twenty)
* **Windows Yarn:** `1.22.22` (Incompatible with Twenty)
* **WSL2 Ubuntu-24.04:** Empty toolchain (No Node, no Yarn).
* **Docker Desktop:** Daemon stopped initially, but confirmed running as `v29.8.0` before installation.

## B. Docker Status Before/After
* **Before:** Stopped.
* **After:** Running on Windows host (`v29.8.0`).
* **Warning:** Docker Desktop WSL Integration is **NOT** enabled for `Ubuntu-24.04`.

## C. WSL2 Status
* `Ubuntu-24.04` is running and accessible.
* The project directory `/mnt/c/Roy/Welderwale/CONSTRUCTION\ CRM\ V1` is properly mounted and accessible.

## D & E. NVM and Node Installation (WSL)
* Installed Node Version Manager (NVM) `v0.40.1` cleanly into `/home/roy/.nvm`.
* Installed **Node 24.21.0** via NVM.
* Set Node `24.21.0` as the default NVM alias.

## F. Node Version Verification (WSL)
* `node --version` output: `v24.21.0`
* `npm --version` output: `11.19.0`
* **Twenty baseline requirement satisfied.**

## G & H. Corepack and Yarn Configuration (WSL)
* Ran `corepack enable`.
* Ran `corepack prepare yarn@4.13.0 --activate`.
* `yarn --version` output: `4.13.0`
* **Twenty baseline requirement satisfied.**

## I. Yarn & Node Path Verification (Path Isolation)
Ensured commands execute strictly within the WSL context without falling back to Windows paths:
* `which node` output: `/home/roy/.nvm/versions/node/v24.21.0/bin/node`
* `which yarn` output: `/home/roy/.nvm/versions/node/v24.21.0/bin/yarn`
* **Success:** Complete path isolation achieved.

## J. Windows Node/Yarn Confirmation
* Re-verified on the Windows host (`cmd/powershell` context):
  * `node -v` → `v22.17.1`
  * `yarn -v` → `1.22.22`
* **Success:** Host environment is completely untouched. No destructive changes were made.

## K. Docker ↔ WSL Verification
* Executed `docker info` inside WSL2 (`Ubuntu-24.04`).
* **Result:** `The command 'docker' could not be found in this WSL 2 distro.`
* **Diagnosis:** Docker Desktop is running on Windows, but the "WSL Integration" feature is not activated for this specific Ubuntu distribution.

## L. Commands Executed
```bash
# In Windows PowerShell:
docker info --format '{{.ServerVersion}}'
node -v
yarn -v

# In WSL2 (via setup script):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 24.21.0
nvm alias default 24.21.0
nvm use 24.21.0
corepack enable
corepack prepare yarn@4.13.0 --activate
```

## M. Files/Configuration Changed
* Modified `/home/roy/.bashrc` (added NVM source strings automatically).
* Created `/home/roy/.nvm` directory.
* Created `scratch/setup-wsl-tools.sh` inside the agent workspace for automated provisioning.
* **No Windows files, global variables, or project codebase files were modified.**

## N. Warnings/Errors Encountered
* **WARNING: Docker WSL Integration Missing.** 
  The WSL instance cannot invoke `docker` commands. Twenty's dev environment requires Docker to spawn PostgreSQL and Redis containers from within the WSL context.

## O. Unresolved Issues
* Docker Desktop settings must be updated manually by the user to allow WSL2 integration for `Ubuntu-24.04`.

## P. Exact Version Evidence
* **Node (WSL):** `v24.21.0`
* **Yarn (WSL):** `4.13.0`
* **Corepack (WSL):** `0.36.0`
* **Docker (Host):** `29.8.0`

## Q. Phase 0C-2/0C-3 Status
**PASS WITH WARNINGS**

The toolchain is perfectly isolated, pinned, and compliant with the Twenty v2.41.0 baseline. However, the Docker WSL integration prevents proceeding to Phase 0C-4.

---

### REQUIRED MANUAL ACTION BEFORE PROCEEDING

1. Open **Docker Desktop** on Windows.
2. Go to **Settings (Gear icon)** > **Resources** > **WSL Integration**.
3. Toggle the switch ON for `Ubuntu-24.04`.
4. Click **Apply & restart**.
5. Once complete, notify me so I can verify Docker connectivity from inside WSL before we begin Phase 0C-4 (Twenty Baseline).
