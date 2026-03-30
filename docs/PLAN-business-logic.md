# PLAN: Documenting Business Logic for Port Manager

This plan outlines the creation of a comprehensive, non-technical document (`docs/BUSINESS-LOGIC.md`) that explains the core calculations, rules, and logic used in the Port Management system.

---

## 🏗️ Project Overview

- **Audience**: Port Manager (Non-technical stakeholder).
- **Primary Goal**: Translate complex code logic into clear, natural language descriptions of formulas and business rules.
- **Scope**: Dashboard KPIs, Voyage Management (Queue/ETD), Incident Impact (Downtime), and Notification triggers.

## ✅ Success Criteria
- [ ] Document `docs/BUSINESS-LOGIC.md` is created.
- [ ] No technical jargon (Prisma, API, etc.) in the final descriptions.
- [ ] All formulas are explained with their source data components.
- [ ] Notification triggers (WARNING/CRITICAL) are clearly defined.

## 📋 Task Breakdown

### Phase 1: Core Formulas & KPIs (Dashboard)
- **Task 1.1**: Document "Tổng sản lượng" (Total Volume) and "Sản lượng lũy kế" (Cumulative Progress).
- **Task 1.2**: Define "Hiệu suất vận hành" (Efficiency) using Actual vs Rated NMPH.
- **Task 1.3**: Explain "Thời gian xử lý sự cố" (MTTR) calculation.

### Phase 2: Voyage & Queue Logic
- **Task 2.1**: Explain "Số thứ tự hàng đợi" (Queue No) and how Emergency ships impact the line.
- **Task 2.2**: Break down the "Dự kiến rời cảng" (ETD) logic:
    - Theoretical vs. Actual (Self-adjusting based on real speed).
    - Impact of "Thời gian thủ tục" (Procedure Time).

### Phase 3: Incidents & Warnings
- **Task 3.1**: Define "Thời gian dừng" (Downtime) based on Red severity overlaps.
- **Task 3.2**: Document all Notification types and their specific conditions:
    - Overdue ETA/ETD (Time + Status).
    - Low Productivity (Percentage of capacity).
    - Readiness errors (Checklist requirements).

## 🏁 Phase X: Verification
- [ ] Cross-check all manual descriptions with `ReportService.ts` and `VoyageService.ts`.
- [ ] Verify that each formula clearly states "Lấy dữ liệu từ đâu".

---

[OK] Plan created: docs/PLAN-business-logic.md

Next steps:
- Review the plan
- Run `/create` or ask me to implement the documentation.
