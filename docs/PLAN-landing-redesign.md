# Project Plan: Landing Page Redesign (Viettel Style)

This plan outlines the redesign of the landing page ("Giới thiệu") for the Port Management system, shifting the focus to public tracking and applying the **Viettel 2.0** brand identity.

## 🔴 User Review Required

> [!IMPORTANT]
> - **Visual Shift**: We are removing all background images for a cleaner, high-contrast "Enterprise" look.
> - **Priority**: The "TRA CỨU" button will be the largest and most prominent element, while "ĐĂNG NHẬP" will become secondary.
> - **Brand**: Switching from Blue to **Viettel Red** (`#EE0033`).

## Phase 1: Structural Redesign

### [MODIFY] [page.tsx](file:///g:/Source-code/port-management-new/apps/web/src/app/(public)/page.tsx)
-   **Hero Section**:
    -   Use a clean `bg-slate-50` or `bg-white` backdrop.
    -   Implement a bold, centered layout with a strong value proposition: "Hệ thống quản lý cảng tập trung".
    -   Increase the size and weight of the main title.
-   **Functionality Hierarchy**:
    -   **Primary Action**: "TRA CỨU" button with solid red background, white bold text, and a sophisticated shadow.
    -   **Secondary Action**: "ĐĂNG NHẬP HỆ THỐNG" with an outline style or subtle gray background.
-   **Feature Cards Re-skin**:
    -   Update all icons (Ship, Crane, Reports) to use red accents.
    -   Improve card spacing and use `rounded-3xl` for a modern feel.

## Phase 2: Design Tokens & Detail

-   **Typography**: Ensure **Roboto** is applied throughout with a clear hierarchy (H1, H2, Body).
-   **Animations**: Add a subtle "Staggered Fade In" for elements when the page loads.
-   **Interactivity**: Ensure all buttons have smooth transition states (150ms).

## Phase 3: Global Branding Alignment

### [MODIFY] [layout.tsx](file:///g:/Source-code/port-management-new/apps/web/src/app/(public)/layout.tsx)
-   Ensure the public header uses the correct brand colors.
-   Replace any remaining generic icons with relevant SVG assets.

## Verification Plan

### Manual Verification
- [ ] Confirm "TRA CỨU" is the most prominent element.
- [ ] Verify Viettel Red (#EE0033) usage across all buttons/icons.
- [ ] Test mobile responsiveness (stacked buttons look good).
- [ ] Ensure the clean, no-background look feels professional and not empty.

### Next Steps:
1.  **Approval**: Wait for user review of this plan.
2.  **Execution**: Once approved, run the `/create` process to implement.
