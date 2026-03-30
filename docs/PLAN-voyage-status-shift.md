# Project Plan - Voyage Status Workflow, Shift Production & Operational Guardrails

## Context
Standardize the voyage lifecycle with specific operational statuses and enable shift-based production tracking. Enhance operational reliability through guardrails and visibility into real-time progress.

## Task Breakdown

### Phase 1: Database & Schema
- **Status Enum Update**: Align `VoyageStatus` with: `THU_TUC`, `DO_MON_DAU_VAO`, `LAY_MAU`, `LAM_HANG`, `DO_MON_DAU_RA`, `HOAN_THANH`, `TAM_DUNG`, `HUY_BO`.
- **Cancellation Reason**: Ensure `Voyage` stores `cancelReason`.
- **Shift Progress**: Ensure `VoyageProgress` has `shiftId`.

### Phase 2: Backend Logic & Guardrails (`VoyageService`)
- **Status Transition Logic**:
    - **Guard**: Cannot move to `LAM_HANG` if `readinessChecklist` is incomplete.
    - **Validation**: Cannot move to `DA_CAP_CAU` if the assigned `Berth` is already `OCCUPIED`.
    - **Sequence**: Enforce the logical order while allowing global `TAM_DUNG`/`HUY_BO`.
- **Production Logic**:
    - `addProgress` restricted to `LAM_HANG`.
    - **Auto-ETC**: Recalculate `etd` based on the latest shift's productivity.

### Phase 3: Frontend UI/UX (Pro Max)
- **Visibility Improvements**:
    - **Progress Bar**: Display at list level (Actual Volume / Total Volume).
    - **Color Coding**: Highlight rows with `TAM_DUNG` or significant delays.
- **Enhanced Interactions**:
    - **Status Transition Modal**: Guided UI with checklist verification and cancellation reason field.
    - **Shift Production Modal**: Restricted to `LAM_HANG`.
- **Operational Timeline**: Add a tab in Voyage Detail showing a history of status changes and sampling.

### Phase 4: Integration & Events
- **Socket.io**: Real-time updates for status and progress.
- **Berth Sync**: Automatically update `Berth` status to `OCCUPIED` upon arrival at berth.

## Verification Checklist
- [ ] Verify checklist enforcement: Try "Làm hàng" without finishing checklist -> Should show warning/error.
- [ ] Verify berth conflict: Try "Đã cập cầu" to an occupied berth -> Should show conflict error.
- [ ] Verify Progress Bar: Input 500/1000 tons -> Progress bar should show 50%.
- [ ] Verify Timeline: Record 3 status changes -> Verify they appear in order in the detail page.
- [ ] Verify Auto-ETC: Input a slow shift -> Verify ETD moves further into the future.

