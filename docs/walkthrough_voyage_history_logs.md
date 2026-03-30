# Walkthrough - Voyage History & Productivity Logs

**Task Slug:** `voyage-history-logs`
**Goal:** Visualize the complete history of voyage events and detailed productivity logs.

## 1. Feature Overview

We have enhanced the Voyage Detail page to include a comprehensive audit trail and productivity reporting system.

### Key Components
-   **Tabbed Interface**: Separated "Tổng quan" (Overview) and "Lịch sử & Nhật ký" (History & Logs) for better data organization.
-   **Activity Timeline**: Vertical stream showing every status change, incident, and key system event (Audit Log).
-   **Productivity Table**: Detailed table showing every shift input (Amount, Hours, Productivity, User, Notes), with a summary footer.

## 2. Implementation Details

### Backend (`apps/api`)
-   **`VoyageService.getById`**: Updated to fetch `events` and `progress` relations, ordered by `createdAt desc`.
-   **API**: Added `GET /voyages/:id` endpoint (was previously missing at router level).

### Frontend (`apps/web`)
-   **Structure**: Refactored `VoyageDetailPage` to use `Tabs`.
-   **New Components**:
    -   `ActivityTimeline.tsx`: Visualizes `VoyageEvent`s.
    -   `ProductivityTable.tsx`: Tabular view of `VoyageProgress`.
    -   `Tabs` (UI): Added generic Tabs components from `shadcn/ui`.

## 3. User Guide (How to Verify)

1.  **Navigate to a Voyage**: Open any voyage detail page.
2.  **Switch Tabs**:
    -   Click on **"Lịch sử & Nhật ký"** tab.
3.  **Check Timeline**:
    -   Verify you see the history of status changes (e.g., "Chuyển trạng thái sang: LAM_HANG").
    -   Check timestamps and user attribution.
4.  **Check Productivity**:
    -   If you have entered progress, verify the rows in the **"Nhật ký Sản lượng"** table.
    -   Check the **"TỔNG CỘNG"** footer row for accuracy.
    -   Verify that "Công suất (TB)" matches the header calculation.

## 4. Next Steps
-   **Export Report**: Feature to export this log to Excel/PDF for billing specific shifts.
