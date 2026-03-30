# PLAN-report-date-filter.md

## Problem Statement
Reports (Volume, Equipment Analytics, Port Analytics, etc.) show no data when the user selects the same date for both Start and End. This happens because the backend `ReportController` parses `yyyy-MM-dd` strings into `Date` objects at midnight (T00:00:00.000Z), and Prisma queries use these as literal bounds (`>= 00:00 AND <= 00:00`), which only matches records created at exactly midnight.

## Proposed Changes
We will normalize the date range in the backend `ReportController` before passing them to the `ReportService`.

### [Component] Backend API
#### [MODIFY] [report.controller.ts](file:///g:/Source-code/port-management-new/apps/api/src/controllers/report.controller.ts)
- Implement a `normalizeDateRange` helper function.
- `startDate` should be set to `00:00:00.000` (Local/UTC depending on requirement).
- `endDate` should be set to `23:59:59.999`.
- Apply this normalization to all report methods: `getAggregatedStats`, `getEquipmentUtilization`, `getVolumeReport`, `getEquipmentAnalytics`, `getPortAnalytics`.

## Verification Plan

### Manual Verification
1. Open any report (e.g., Năng suất Toàn Cảng).
2. Select the same date for both Start and End (e.g., today).
3. Verify that data for that specific day is displayed correctly.
4. Verify that selecting a range (e.g., Monday to Wednesday) still includes all three days' data.

### Automated Verification
1. Run `npm run test` (if applicable) in `apps/api`.
2. Perform an API call via Postman/Curl: `GET /api/reports/volume?start=2026-03-26&end=2026-03-26` and check the response data.
