# PLAN - Add Voyage Functionality

**Task Slug:** `add-voyage`
**Goal:** Implement the "Add New Voyage" modal with **Quick Vessel Creation**, **Lane Suggestion**, and **Queue Ordering**.

## 1. Analysis & Requirements

### Context
- **Add Voyage**: Modal form.
- **Quick Create**: Inline vessel creation.
- **Smart Suggestion**: Suggest Lane based on Capability & Strict Occupancy.
- **Queue Logic**:
    - Voyage must store `queueNo` (Order in Queue).
    - If BUSY, `queueNo` = Max + 1. If FREE, `queueNo` = 1.
    - **Concurrency**: Handled via Transaction.

### Data Requirements
| Field Pattern | Field Name | Type | Source | Logic |
| :--- | :--- | :--- | :--- | :--- |
| **Vessel** | `vesselId` | Select/Creatable | API `/vessels` | Select or Create |
| **Lane** | `laneId` | Select | API `/lanes` | Auto-suggested |
| **Voyage** | `laneId` | String | Relation | **Index: [laneId, status]** |
| **Voyage** | `queueNo` | Number | Auto | Calculated in Transaction |

## 2. Technical Stack

- **Backend**:
    - **Schema**: Add `laneId` to Voyage. Add `@@index([laneId, status])`.
    - **API**: `LaneController.suggest` (Returns `laneId`, `reason`, `queueEstimate`).
    - **Service**: `VoyageService.create` wrapped in `$transaction`.

- **Suggestion Logic**:
    1.  **Filter**: `Equipment` -> `CargoTypes`.
    2.  **Occupancy**: Check `Voyage` count where `laneId` & `status` is active.
    3.  **Score**: FREE > BUSY (Earliest).

## 3. Task Breakdown

### Phase 1: Database Schema (Priority)
- [ ] **Migration**: Add `laneId` to `Voyage`. Add Index.
    - Run `prisma migrate dev`.
- [ ] **Data Seed**: Ensure Lanes and Equipment exist for testing.

### Phase 2: API Logic
- [ ] **Suggestion API**: Implement "Strict Free vs Busy". Return `reason` string.
- [ ] **Creation API**: Transactional Create.
    - `await prisma.$transaction(async (tx) => { ... })`

### Phase 3: UI Implementation
- [ ] **Modal**: Add `LaneSelect` (Luồng).
- [ ] **Reactive Suggestion**: Show "Gợi ý: Luồng A (Rảnh)" based on API reason.
- [ ] **Dynamic Queue**: If user manually selects Lane, calc/show "Xếp hàng #X".

## 4. Verification Checklist

- [ ] Two simultaneous requests -> Unique queue numbers (Manual verification tricky, code review critical).
- [ ] Select Free Lane -> UI shows "Luồng Rảnh".
- [ ] Select Busy Lane -> UI shows "Cảnh báo chờ".

## 5. Agent Assignments

- **database-architect**: Schema & Indexing.
- **backend-specialist**: Transactional Logic.
- **frontend-specialist**: Reactive UI.
