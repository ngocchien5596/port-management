# PLAN-standard-date-format.md

## Overview
Standardize all date and time representations across the platform to ensure a consistent, professional user experience in line with Vietnamese local standards.

## Project Type
**WEB** (Next.js + shadcn/ui + Tailwind CSS)

## Success Criteria
1.  All date displays show `dd/MM/yyyy` (e.g., 26/03/2026).
2.  All date-time displays show `HH:mm dd/MM/yyyy` (e.g., 15:30 26/03/2026) using 24h format.
3.  All date input fields (date pickers) force the `dd/MM/yyyy` display format regardless of browser locale.
4.  Chart x-axes remain concise using `dd/MM` for density management.
5.  Excel exports use the new standardized formats.

## Tech Stack
-   **Core**: `date-fns` (formatting)
-   **Picker**: `react-datepicker` (standardizing inputs)
-   **Utilities**: `lib/utils/date.ts` (centralized helpers)

## File Structure
-   `apps/web/src/lib/utils/date.ts`: Unified constants and helpers.
-   `apps/web/src/components/ui/date-picker.tsx` [NEW]: Standardized wrapper for `react-datepicker`.

## Task Breakdown

### Phase 1: Foundation & UI Components
| Task ID | Task Name | Agent | Skills | Priority | Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| T1-1 | Update `date.ts` with constants | `frontend-specialist` | `clean-code` | High | None |
| T1-2 | Create standardized `DatePicker` component | `frontend-specialist` | `frontend-design` | High | T1-1 |

**T1-2 INPUT→OUTPUT→VERIFY**:
-   **INPUT**: `react-datepicker` library and design requirements.
-   **OUTPUT**: A reusable component that enforces `dd/MM/yyyy` and matches the project's visual style.
-   **VERIFY**: Import into a test page and verify it displays `26/03/2026` even if browser language is English.

### Phase 2: Reports & Analytics Refactoring
| Task ID | Task Name | Agent | Skills | Priority | Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| T2-1 | Standardize Volume Report | `frontend-specialist` | `clean-code` | Medium | T1-2 |
| T2-2 | Standardize Port Productivity Report | `frontend-specialist` | `clean-code` | Medium | T1-2 |
| T2-3 | Standardize Equipment Productivity Report | `frontend-specialist` | `clean-code` | Medium | T1-2 |

### Phase 3: Logs & Forms Refactoring
| Task ID | Task Name | Agent | Skills | Priority | Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| T3-1 | Standardize Incident Log Page & Modals | `frontend-specialist` | `clean-code` | Medium | T1-2 |
| T3-2 | Standardize Voyage Progress Logs | `frontend-specialist` | `clean-code` | Medium | T1-2 |
| T3-3 | Standardize Equipment History Timeline | `frontend-specialist` | `clean-code` | Medium | T1-2 |

## Phase X: Verification
- [ ] Run `npm run build` to ensure no breaking changes in shared utilities.
- [ ] Manual Check: All tables (Voyages, Incidents, Reports) show `dd/MM/yyyy`.
- [ ] Manual Check: All time fields show 24h `HH:mm`.
- [ ] Manual Check: Date Pickers in all forms show `dd/MM/yyyy`.
- [ ] Verify Excel exports for Volume and Productivity reports.
