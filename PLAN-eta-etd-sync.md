# PLAN: ETA/ETD Synchronization (Vietnam Timezone)

## Overview
Status: [ ] Pending Socratic Gate
Goal: Ensure consistent and accurate time display (GMT+7) for ETA and ETD across the Dashboard and Voyage Management screens, using the `server-time` offset to mitigate client-side clock drift.

## Socratic Gate (Clarifying Questions)
- **Q1**: Besides the Dashboard and Voyage Detail page, are there other specific "Quản lý chuyến tàu" screens (like a main list view) where ETA/ETD must be updated?
- **Q2**: Should we apply the `server-time` offset to *all* absolute time displays (ETA/ETD), or should ETA/ETD reflect the absolute wall-clock time stored in the DB, while only relative calculations (like "Waiting Time") use the offset?
- **Q3**: For calculations like "Tàu chờ > 2h" in KPIs, do we need to account for both the `server-time` offset AND the 7-hour timezone shift?

## Project Type: WEB

## Success Criteria
- [ ] ETA/ETD on Dashboard matches Voyage Details and History exactly.
- [ ] Displays are consistent regardless of the browser's local timezone (Always GMT+7).
- [ ] "Waiting Time" calculation resolves accurately (no 7-hour or 14-hour jumps).

## Tech Stack
- **Next.js/React**: Core frontend.
- **Intl.DateTimeFormat**: Used for hard-locking the `Asia/Ho_Chi_Minh` timezone.
- **server-time API**: Synchronizing client clock with server intent.

## File Structure
- `apps/web/src/lib/utils/date.ts`: Core utility updates.
- `apps/web/src/components/dashboard/PortDashboardContent.tsx`: Dashboard sync.
- `apps/web/src/app/(app)/voyages/[id]/page.tsx`: Details Header sync.
- `apps/web/src/app/(app)/voyages/[id]/(components)/VoyageInfoCard.tsx`: Details Card sync.
- `apps/web/src/components/voyage/ActivityTimeline.tsx`: History sync.

## Task Breakdown

### Phase 1: Core Utility Refinement
| task_id | name | agent | priority | dependencies |
|---------|------|-------|----------|--------------|
| T1 | Standardize `formatTime` and `formatDateTime` to use `Asia/Ho_Chi_Minh` | `backend-specialist` | High | None |
| **INPUT** | `date.ts` | **OUTPUT** | Pure `Intl` based formatting | **VERIFY** | Console diagnostic log shows correct +7h regardless of locale |

### Phase 2: Global UI Synchronization
| task_id | name | agent | priority | dependencies |
|---------|------|-------|----------|--------------|
| T2 | Sync Dashboard cards and KPI calculations | `frontend-specialist` | High | T1 |
| T3 | Sync Voyage Details header and info card | `frontend-specialist` | High | T1 |
| T4 | Sync Activity Timeline (Operational History) | `frontend-specialist` | Medium | T1 |

## Phase X: Verification
- [ ] No purple/violet hex codes used.
- [ ] Verified via Console Diagnostic: `__DEBUG_TIME__` shows consistent Asia/Ho_Chi_Minh output.
- [ ] Manual check: Voyage card ETA matches "NHAP" history event exactly.
- [ ] `npx tsc --noEmit` returns no errors.
