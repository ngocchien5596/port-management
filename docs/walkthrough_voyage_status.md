# Walkthrough - Voyage Status & Progress Tracking

**Task Slug:** `voyage-status`
**Goal:** Implement comprehensive status tracking and real-time progress calculation for voyages.

## 1. Feature Overview

We have implemented a complete lifecycle management system for voyages, allowing operators to track status changes and input handling progress to dynamically update the Estimated Time of Departure (ETD).

### Key Components
-   **Status Stepper**: Visual timeline showing the 6-step voyage process.
-   **Action Bar**: Context-aware buttons that change based on the current status.
-   **Progress Modal**: Input form for recording "Handling" progress (Tons/Hours).
-   **Dynamic ETD**: System automatically recalculates ETD based on real-time productivity.

## 2. Implementation Details

### Backend (`apps/api`)
-   **Schema**: Added `VoyageStatus` enum and `VoyageProgress` model.
-   **Service**:
    -   `updateStatus`: Handles transitions and logs events.
    -   `addProgress`: Calculates weighted average productivity and updates `Voyage.etd`.
-   **API**: Exposed endpoints `PATCH /voyages/:id/status` and `POST /voyages/:id/progress`.

### Frontend (`apps/web`)
-   **Page**: Created `app/(app)/voyages/[id]/page.tsx` as the main detail view.
-   **Components**:
    -   `StatusStepper.tsx`: Visualizes the workflow.
    -   `ProgressInputModal.tsx`: Smart form that calculates productivity as you type.
-   **Integration**: Connected to `qltauApi` via React Query hooks.

## 3. User Guide (How to Verify)

1.  **Navigate to a Voyage**: Click on any voyage in the list to open the Detail Page.
2.  **Check Status Workflow**:
    -   If status is `THU_TUC`, click **"Bắt đầu Đo mớn"**.
    -   Verify status updates in the Stepper.
3.  **Record Progress**:
    -   Advance status to `LAM_HANG` (Handling).
    -   Click **"+ Nhập Tiến độ"**.
    -   Enter `Amount` (e.g., 500) and `Hours` (e.g., 4).
    -   Click **"Lưu và Tính lại ETD"**.
4.  **Verify Calculation**:
    -   Check the "Nhật ký Tiến độ" section for the new entry.
    -   Check the **ETD** field in "Thông tin chung" - it should have updated based on the remaining volume and your new productivity.
5.  **Pause Voyage**:
    -   Click **"Tạm dừng"**.
    -   Verify status changes to Amber color.
    -   Click **"Tiếp tục"** to resume.

## 4. Next Steps
-   Integrate `LaneService` to use this new dynamic ETD for even smarter lane suggestions.
