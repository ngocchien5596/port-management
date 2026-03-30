# PLAN - Flatten API Structure

The objective is to remove the `/qltau` prefix from API routes, making them accessible directly under `/api`.

## Phase 0: Socratic Gate (Context Check)

> [!IMPORTANT]
> I need clarification on the following points before proceeding to the full breakdown:

1. **Scope of Flattening**: Should *every* endpoint currently under `/qltau` (vessels, voyages, berths, zones, cargo-types, lanes, equipment) be moved to `/api/{module}`?
2. **Existing Prefixes**: Should `/api/auth` and `/api/accounts` remain as they are, or should they also be evaluated for changes?
3. **Collision Risk**: Flattening routes increases the risk of name collisions (e.g., if a new module 'reports' is added to both 'qltau' and another domain). Is the current project scope small enough that we don't expect such collisions?

## Proposed Execution Strategy (Draft)

### Backend Changes
- Modify `apps/api/src/index.ts` to mount `qltauRoutes` at `/api` instead of `/api/qltau`.
- Review `apps/api/src/routes/index.ts` for any potential path overlaps.

### Frontend Changes
- Global search and replace (or targeted refactor) in `apps/web/src/features/**/api.ts` to remove `/qltau` from path strings.
- Verify `api-client` configuration.

## Verification
- Perform a full build of both `api` and `web` workspaces.
- Test primary workflows (login, vessel list, config pages).
