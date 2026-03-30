# PLAN: Database Initialization & Container Setup

This plan outlines the steps to create a new, isolated PostgreSQL environment for the `port-management-new` project and initialize it with combined seed data from the Meal and Port management logic.

## 📋 Overview
- **Goal**: Setup a dedicated Docker container and initialize the database schema/data.
- **Project Type**: BACKEND / INFRASTRUCTURE
- **Success Criteria**:
  - Running PostgreSQL container named `port-mgmt-db` on port `5433`.
  - Schema successfully migrated to the new DB.
  - Seed data populated (Admin account, Departments, Positions, Sample Vessels).

## 🛠 Tech Stack
- **Database**: PostgreSQL 16 (Docker)
- **ORM**: Prisma
- **Environment**: Node.js / TypeScript

## 📁 Proposed File Structure
```text
port-management-new/
├── docker-compose.yml (NEW)      - Dedicated database & redis setup
├── apps/api/
│   ├── .env (UPDATE)             - New DB credentials
│   └── prisma/
│       └── seed.ts (NEW)         - Combined seed logic
```

## 📝 Task Breakdown

### Phase 1: Infrastructure Setup
| Task ID | Name | Agent | Skills | Priority | Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **P1-T1** | Create dedicated `docker-compose.yml` | `devops-engineer` | `docker-expert` | P0 | None |
| **P1-T2** | Update `apps/api/.env` credentials | `backend-specialist` | `nodejs-best-practices` | P0 | P1-T1 |
| **P1-T3** | Verify Docker Connectivity | `devops-engineer` | `bash-linux` | P0 | P1-T1 |

### Phase 2: Data & Schema Management
| Task ID | Name | Agent | Skills | Priority | Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **P2-T1** | Create `prisma/seed.ts` combining logic | `database-architect` | `prisma-expert` | P1 | P1-T2 |
| **P2-T2** | Run Prisma Migrate & Seed | `database-architect` | `prisma-expert` | P1 | P2-T1 |

## 🧪 Phase X: Verification Plan
- [ ] Run `docker ps` to verify container `port-mgmt-db` is UP.
- [ ] Run `npx prisma migrate status` in `apps/api`.
- [ ] Run `npx prisma studio` to verify seed data existence.
- [ ] Verify Admin login capability in the UI/API.

---
**Next Steps**:
1. Review this plan.
2. Run `/create` or approve to start implementation.
