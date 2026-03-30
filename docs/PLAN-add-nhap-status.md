# Project Plan: Add 'Nháp' Status

## Goal Description
The objective is to introduce a new voyage status called "Nháp" (Draft). This status will be the default state for newly created voyages, replacing "THU_TUC". The "Nháp" status will be indicated by a light gray badge (`slate-50`). Additionally, a one-way workflow transition must be enforced: voyages can only move from "Nháp" to "THU_TUC" (Thủ tục), and this action must trigger a confirmation popup because the transition cannot be undone (i.e. a voyage cannot be reverted to "Nháp").

## User Review Required
None at this stage. 

## Proposed Changes

### Database & Backend
#### [MODIFY] schema.prisma
- Add `NHAP` to the `VoyageStatus` enum.
- Ensure the default value for the `status` field on the `Voyage` mode is changed to `NHAP`.

#### [MODIFY] api/src/services/voyage.service.ts
- Modify the `createVoyage` logic to set the initial status to `NHAP`.
- Consider adding validation logic when updating the status to ensure `NHAP` can only transition to `THU_TUC`.

### Frontend
#### [MODIFY] web/src/features/qltau/types.ts
- Update the `VoyageStatus` union/enum type to include `NHAP`.

#### [MODIFY] web/src/app/(app)/voyages/page.tsx
- Update the `getStatusBadge` function to handle the `NHAP` status and render it with the desired light gray coloring (e.g., `bg-slate-50 text-slate-700 border-slate-200`).
- Update the action button logic for voyages in the `NHAP` state so that the primary action is "Bắt đầu thủ tục" (or similar), leading to the `THU_TUC` state.
- Implement a confirmation dialog (e.g., using a Modal or browser `confirm`) when clicking the action button to transition from `NHAP` to `THU_TUC`.

#### [MODIFY] web/src/app/(app)/dashboard/page.tsx
- Ensure the `NHAP` status is appropriately handled/filtered in dashboard views if needed.

## Verification Plan

### Automated Tests
- Run Prisma migrations (`npx prisma migrate dev`).
- Ensure no TypeScript compilation errors (`npx tsc --noEmit`).

### Manual Verification
- Create a new Voyage through the Web UI and verify that its initial status is "Nháp" with a gray badge.
- Verify that the only available action for a "Nháp" voyage is to transition it to "Thủ tục".
- Click the transition action and verify that a confirmation popup appears warning the user that this action is irreversible.
- Confirm the transition and verify that the status successfully changes to "Thủ tục" and cannot be changed back to "Nháp" through the UI.
