# PLAN - UI/UX Pro Max Upgrade

**Task Slug:** `ui-ux-upgrade`
**Goal:** Elevate the visual quality of the "Create Voyage" and "Voyage Detail" screens, specifically highlighting the Automated Lane Assignment feature.

## 1. Design & Analysis

### Design Philosophy ("Pro Max")
-   **Visual Hierarchy**: Key actions and data (Lane Suggestions, Status) must pop.
-   **Interaction**: feedback on hover, selection, and loading states.
-   **Aesthetics**: Use of gradients, subtle shadows, rounded corners, and clear typography.

### 1.1 Create Voyage Modal
-   **Problem**: "Lane Suggestion" is functional but flat.
-   **Solution**:
    -   **Magic Button**: "Analyze & Suggest" button with a gradient/sparkle effect (if manual trigger) or just a premium loading state.
    -   **Suggestion Cards**:
        -   **Best Match**: Highlighted with a "Recommended" badge, Golden/Indigo gradient border, and shadow.
        -   **Details**: Show "Sequence No" and "Queue" visually (e.g., `[Ship] -> [Ship] -> [YOU]`).
    -   **Vessel Toggle**: Replace text link with a sleek Segmented Control (Toggle Group).

### 1.2 Voyage Detail Page
-   **Problem**: Standard dashboard look.
-   **Solution**:
    -   **Header**: Add Breadcrumbs. Make Title larger.
    -   **Status Stepper**: Upgrade to a "Chevron Pipeline" or "Glow Step" design.
    -   **Tabs**: Custom styled tabs (Pill shape with smooth transition).
    -   **Productivity Table**: Add zebra striping, hover rows, and better numeric alignment.

## 2. Implementation Steps

### Phase 1: Create Voyage Modal Refinement
-   [ ] **Vessel Section**: Implement `Tabs` or `ToggleGroup` for "Existing/New" vessel selection.
-   [ ] **Lane Suggestion UI**:
    -   Create `LaneCard` component.
    -   Apply "Winner" style to the top recommendation.
    -   Add "Queue Visualization" (Next Sequence #).

### Phase 2: Voyage Detail Polish
-   [ ] **Header area**: Add Breadcrumbs component.
-   [ ] **StatusStepper**: Refine CSS/Tailwind classes for a "Pro" look (connecting lines, active glow).
-   [ ] **General Layout**: Check spacing and card shadows (`shadow-sm` -> `shadow-md` or `shadow-lg` for active elements).

## 3. Verification Plan

### Manual Verification
1.  **Open "Create Voyage" Modal**:
    -   Select a Product.
    -   Check if Lane Suggestions load with a nice animation.
    -   Verify the "Recommended" lane is visually distinct.
2.  **View "Voyage Detail"**:
    -   Check Breadcrumb navigation.
    -   Verify Status Stepper looks premium.
    -   Check Tabs switching animation.

## 4. Agent Assignments
-   **frontend-specialist**: All UI/UX changes.
