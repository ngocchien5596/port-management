# Project Plan: Split Reports into Sub-menus

## Objective
The user requested to replace the current tabbed interface in the `/reports` page with two distinct sub-menus in the sidebar:
1. **Báo cáo Sản lượng** (Volume Report)
2. **Báo cáo Năng suất** (Productivity Report)

All unused reporting features (e.g., general KPI cards, Safety Tab, Equipment Availability Tab) will be removed as requested ("xóa bỏ các phần k cần đi nhé").

## User Review Required
None. The requirement is clear to restructure the UI navigational flow based on existing API integrations.

## Proposed Changes

---

### Navigation
Update the sidebar to include a nested menu for reports.

#### [MODIFY] LeftMenu.tsx (file:///g:/Source-code/port-management-new/apps/web/src/components/layout/LeftMenu.tsx)
- Change the `reports` menu item from a direct link to a parent item enclosing two children:
  - `volume-report` (`/reports/volume`)
  - `productivity-report` (`/reports/productivity`)

---

### Report Pages
Delete the unified reports page and create two dedicated pages per the new sidebar links.

#### [DELETE] page.tsx (file:///g:/Source-code/port-management-new/apps/web/src/app/(app)/reports/page.tsx)
- Remove the existing unified tabbed dashboard.

#### [NEW] page.tsx (file:///g:/Source-code/port-management-new/apps/web/src/app/(app)/reports/volume/page.tsx)
- Create a new page solely for the **Volume Report (Sản Lượng)**.
- Implement the Date Range picker and Export button (exporting only volume data).
- Reuse the `useVolumeReport` hook.
- Render the Stacked Bar Chart for volume by shift.

#### [NEW] page.tsx (file:///g:/Source-code/port-management-new/apps/web/src/app/(app)/reports/productivity/page.tsx)
- Create a new page solely for the **Productivity Report (Năng Suất)**.
- Implement the Date Range picker and Export button (exporting only productivity data).
- Reuse the `useProductivityReport` hook.
- Render the Combo Chart for actual productivity vs rated capacity.

## Verification Plan

### Manual Verification
1. Start the frontend application using `pnpm run dev`.
2. Open the browser and log in as an ADMIN_SYSTEM or PORT_OPERATOR.
3. Verify that the Left Menu now has a collapsible "Báo cáo & KPI" section containing "Sản lượng" and "Năng suất".
4. Click on "Sản lượng" and ensure the Volume Stacked Bar Chart loads correctly without generic KPIs or other tabs.
5. Click on "Năng suất" and ensure the Productivity Combo Chart loads correctly.
6. Test the "Xuất Excel" button on both pages to confirm they export the respective targeted sheets.
