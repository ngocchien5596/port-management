# PLAN - Voyage History & Productivity Logs

**Task Slug:** `voyage-history-logs`
**Goal:** Visualize the complete history of voyage events (status changes, user actions) and detail the productivity inputs for each shift.

## 1. Analysis & Requirements

### User Needs
1.  **Status History**: Who changed the status? When? (Audit Logic).
2.  **Productivity Logs**: Detailed record of "Shift Inputs" (Tấn, Giờ, Ghi chú). This is critical for billing and performance analysis.

### Current Architecture
-   **Backend**:
    -   `VoyageEvent` model exists (stores status changes).
    -   `VoyageProgress` model exists (stores amount, hours, productivity).
    -   *Gap*: `VoyageService.getOne` might not be including `events` and `progress` with user details.
-   **Frontend**:
    -   `VoyageDetailPage` currently shows a simple "Nhật ký Tiến độ" list.
    -   *Gap*: Needs a robust "Activity Timeline" and a comprehensive "Productivity Table".

## 2. Technical Stack

-   **Backend**:
    -   Update `VoyageService.getById` to include:
        -   `events`: ordered by `createdAt desc`.
        -   `progress`: ordered by `createdAt desc`.
        -   *Note*: Ensure `userId` is resolved to a Name (or mock it if User service isn't fully linked).

-   **Frontend**:
    -   **Tabs Component**: Split Detail View into:
        -   "Tổng quan" (Current Dashboard).
        -   "Lịch sử & Nhật ký" (New).
    -   **Productivity Table**:
        -   Columns: Thời gian, Ca, Sản lượng (Tấn), Thời gian (Giờ), Công suất, Người nhập, Ghi chú.
        -   Footer: Tổng cộng.
    -   **Activity Timeline**:
        -   Vertical list of events (Status changes, Incidents, Readiness checks).

## 3. Task Breakdown

### Phase 1: Backend Data Enrichment
-   [ ] **Update Service**: Ensure `VoyageService.getById` returns `events` and `progress`.
-   [ ] **Mock User Resolution**: If real User Auth isn't providing names, map `userId` to "Admin" or "Staff" for display.

### Phase 2: Frontend Implementation
-   [ ] **Refactor VoyageDetail**: Introduce `Tabs` (Overview vs. History).
-   [ ] **Create `ProductivityTable` Component**:
    -   Table layout with summation footer.
-   [ ] **Create `ActivityTimeline` Component**:
    -   Visual stream of `VoyageEvent`.
-   [ ] **Integrate**: Connect to `useVoyage` data.

## 4. Verification Checklist

-   [ ] View a Voyage.
-   [ ] Switch to "Lịch sử" tab.
-   [ ] Verify Status Changes appear in Timeline with Timestamp.
-   [ ] Add new Progress -> Verify it appears in Productivity Table immediately.
-   [ ] Verify "Tổng cộng" in table matches "Tổng lượng" in header.

## 5. Agent Assignments

-   **backend-specialist**: API Data shaping.
-   **frontend-specialist**: UI Components (Tabs, Table, Timeline).
