# PLAN-date-picker-clipping.md

## Problem Statement
The `DatePicker` component (based on `react-datepicker`) currently renders its calendar dropdown inline. This causes the calendar to be clipped or completely hidden when used within containers that have `overflow: hidden`, `overflow: auto`, or limited height (e.g., Modals, Cards, and small Data Tables).

## Proposed Solution
We will implement a **React Portal** strategy for the `DatePicker` component. By rendering the calendar dropdown at the root of the DOM (inside `<body>`), it will escape all parent layout constraints and always appear on top of other elements.

## Proposed Changes

### 1. Global Layout
#### [MODIFY] [layout.tsx](file:///g:/Source-code/port-management-new/apps/web/src/app/layout.tsx)
- Add a portal target div: `<div id="datepicker-portal" />`.

### 2. UI Component
#### [MODIFY] [date-picker.tsx](file:///g:/Source-code/port-management-new/apps/web/src/components/ui/date-picker.tsx)
- Add `portalId="datepicker-portal"` to the `ReactDatePicker` component.
- Add `popperPlacement="auto"` to allow the calendar to intelligently flip up or down based on available screen space.
- Add `popperModifiers` to ensure it stays within the viewport.

## Verification Checklist

### Phase 1: Local Fix Verification
- [ ] Check `CargoProgressLogTable` (Voyage Details) with 0-1 rows.
- [ ] Check `AddShiftProgressModal` in Voyage List.

### Phase 2: Global Audit
- [ ] **Incidents Page**: Open incident creation/edit modal.
- [ ] **Reports Pages**: Check date filters in Port/Equipment productivity.
- [ ] **Emergency Override**: Check the override modal on the dashboard.

## Phase 3: Build & Deploy
- [ ] Run `npm run build` to ensure no regressions.
