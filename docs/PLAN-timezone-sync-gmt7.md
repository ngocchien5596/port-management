# PLAN: Timezone Synchronization (GMT+7)

Status: [DRAFT] Awaiting Socratic Gate approval.

## 1. Analysis
- Current issues: Discrepancy between frontend date input and backend storage/display leads to incorrect time offsets.
- Tech stack: React (Next.js), Node.js (Express), Prisma, date-fns.

## 2. Socratic Discovery (Questions for User)
1. Are the times off by exactly 7 hours?
2. Is the browser/OS set to GMT+7?
3. Should GMT+7 be hardcoded or dynamic based on browser?

## 3. Targeted Areas
- **Frontend Inputs**: `datetime-local` handling in `CreateVoyageModal.tsx` and `VoyageInfoCard.tsx`.
- **Frontend Display**: `format()` calls in `page.tsx`, `StatusHistoryTimeline.tsx`, and `CargoProgressLogTable.tsx`.
- **Backend Logic**: `new Date()` usage in `voyage.service.ts` (ETD calculations).

## 4. Proposed Fixes (TBD)
...
