# Implementation Plan - Late Arrival Warning Refinement (30 min)

This plan refines the "Trễ giờ cập cảng" (Late Arrival) warning logic to be more accurate and less intrusive.

## User Review Required

> [!IMPORTANT]
> - **Buffer Change**: Warning triggers at **30 minutes** past ETA (was 120 minutes).
> - **Status Restriction**: Warning ONLY applies to **`NHAP` (Draft)** status.
> - **Arrival Check**: Warning is suppressed if `actualArrival` is set.
> - **Tooltip Update**: Tooltip text will inform users of the 30-minute threshold.

## Proposed Changes

### 1. 🎨 Frontend: Dashboard Warning Logic
#### [MODIFY] [PortDashboardContent.tsx](file:///g:/Source-code/port-management-new/apps/web/src/components/dashboard/PortDashboardContent.tsx)
-   Update `isWarning` calculation:
    ```typescript
    // New Logic
    let isWarning = false;
    if (trip.status === 'NHAP' && !trip.actualArrival && trip.eta) {
        const diffMs = getServerDate().getTime() - new Date(trip.eta).getTime();
        isWarning = diffMs > 30 * 60 * 1000; // 30 minutes
    }
    ```
-   Update the ETA display to include a tooltip or indicator for the 30-minute delay.
-   Ensure that moving a ship to "Làm thủ tục" (`THU_TUC`) immediately clears the warning.

### 2. 📝 Frontend: Constants/Utils Cleanup
#### [MODIFY] [dashboard-utils.tsx](file:///g:/Source-code/port-management-new/apps/web/src/components/dashboard/dashboard-utils.tsx)
-   Check if `mapStatus` or other helpers need adjustment to support this specific logic (though the dashboard change handles it locally).

## Verification Plan

### Automated Tests
-   Not applicable for this UI logic change, but will verify via browser subagent.

### Manual Verification (using Browser Subagent)
1.  **Scenario A**: Vessel in `NHAP`, ETA 40 mins ago, no `actualArrival` -> **Red Warning visible**.
2.  **Scenario B**: Vessel in `NHAP`, ETA 40 mins ago, with `actualArrival` -> **Warning hidden**.
3.  **Scenario C**: Vessel in `THU_TUC`, ETA 1 hour ago -> **Warning hidden**.
4.  **Scenario D**: Vessel in `NHAP`, ETA 10 mins ago -> **Warning hidden**.
