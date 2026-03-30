# Project Plan: Edit and Delete Voyage Actions

## Goal Description
Implement "Edit" and "Delete" functionality for voyages directly from the Voyage List page. The Edit action will open a popup modal (similar to the Create modal) initialized with the voyage details. The Delete action will trigger a confirmation popup and will only be accessible/allowed when the voyage is in the "Nháp" (`NHAP`) status.

## User Review Required
No items require immediate review before implementation.

## Proposed Changes

### Backend & API
#### [NEW] `apps/api/src/controllers/voyage.controller.ts` (or update existing)
- Add a `deleteVoyage` controller endpoint that accepts a voyage ID.
- Add an `updateVoyage` controller endpoint that accepts a voyage ID and partial voyage data.

#### [NEW] `apps/api/src/routes/voyage.routes.ts` (or update existing)
- Map `DELETE /api/voyages/:id` to the `deleteVoyage` controller.
- Map `PUT /api/voyages/:id` to the `updateVoyage` controller.

#### [MODIFY] `apps/api/src/services/voyage.service.ts`
- Implement robust `delete(id: string)` logic. It must verify that the voyage status is `NHAP` before deleting. It may also need to handle related records depending on Prisma schema cascade settings (though `NHAP` voyages likely have no progress/events yet).
- Implement `update(id: string, data: any)` logic to handle updating voyage details (e.g., vessel info, lane, product, ETA).

### Frontend
#### [MODIFY] `apps/web/src/features/qltau/hooks.ts`
- Add a `useDeleteVoyage` mutation hook mapping to `DELETE /api/voyages/:id`.
- Add a `useUpdateVoyage` mutation hook mapping to `PUT /api/voyages/:id`.

#### [NEW] `apps/web/src/app/(app)/voyages/EditVoyageModal.tsx` 
- Create a new modal component (potentially derived/refactored from `CreateVoyageModal`) that takes an existing `voyage` object as a prop and pre-fills the form. Upon submission, it calls the `useUpdateVoyage` mutation.

#### [NEW] `apps/web/src/components/ui/ConfirmDeleteModal.tsx` (If not already existing)
- Create or reuse a generic confirmation modal for the delete action.

#### [MODIFY] `apps/web/src/app/(app)/voyages/page.tsx`
- Add state variables `editModalVoyage` and `deleteModalVoyage` (similar to `createModalOpen`).
- Render the `EditVoyageModal` and `ConfirmDeleteModal`.
- Update the `Edit2` and `Trash2` icon buttons in the table rows:
  - The Edit button should set `editModalVoyage`.
  - The Delete button should set `deleteModalVoyage`.
  - Disable or hide the Delete button if `voyage.status !== 'NHAP'`.

## Verification Plan

### Automated Tests
- Run TypeScript compiler (`npx tsc --noEmit`) to ensure types are correct.

### Manual Verification
- **Delete Functionality**:
    - Verify the "Trash" icon is only active/visible for voyages with the "Nháp" status.
    - Click the Delete icon, ensure the confirmation popup appears.
    - Confirm deletion, verify the voyage is removed from the list and database.
- **Edit Functionality**:
    - Click the "Edit" icon on a voyage, verify the modal opens with the correct pre-filled data.
    - Change some values (e.g., Priority, ETA, Product) and save.
    - Verify the list updates correctly with the new values.
