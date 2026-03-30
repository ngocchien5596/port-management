# PLAN: Nghiên cứu KPI Đa chiều cho Báo cáo Năng suất

Tài liệu này điều phối sự phối hợp giữa các Agent để xác định bộ chỉ số KPI (Key Performance Indicators) tối ưu nhất cho từng Tab (Thiết bị & Toàn Cảng).

## 🛑 Phase 0: Socratic Gate

**Câu hỏi cho các chuyên gia (Agents):**
1. **Frontend**: Làm sao để hiển thị 4-6 chỉ số mà không gây rối mắt (Cognitive Load)?
2. **Backend**: Dữ liệu `Incident` có được liên kết chặt chẽ với `Equipment` để tính chỉ số "Độ tin cậy" không?

---

## 🏗️ Orchestration Strategy

- **Mode**: ANALYSIS & SOLUTIONING
- **Agents Involved**:
    - `project-planner`: Điều phối và tổng hợp báo cáo.
    - `frontend-specialist`: Thiết kế trải nghiệm người dùng (UX) cho KPI.
    - `backend-specialist`: Xác thực khả năng tính toán từ Database.

## 📋 Task Breakdown

### Phase 1: Research & Brainstorming (P1)
- [ ] **Task 1.1**: Nghiên cứu bộ chỉ số KPI phù hợp cho góc nhìn **Toàn Cảng** (Tập trung vào throughput và tính ổn định).
- [ ] **Task 1.2**: Nghiên cứu bộ chỉ số KPI phù hợp cho góc nhìn **Thiết Bị** (Tập trung vào hiệu suất asset và độ bền).

### Phase 2: Feasibility & Design (P2)
- [ ] **Task 2.1**: Xác thực các công thức tính toán với `backend-specialist`.
- [ ] **Task 2.2**: Phác thảo layout hiển thị (KPI Cards) cho từng tab với `frontend-specialist`.

### Phase 3: Synthesis Report (P3)
- [ ] **Task 3.1**: Tổng hợp thành bảng đề xuất cuối cùng cho User.

## ✅ Success Criteria
- [ ] Đề xuất được bộ KPI riêng biệt cho 2 Tab, không bị trùng lặp ý nghĩa.
- [ ] Các chỉ số phải đo lường được từ dữ liệu hiện có trong hệ thống.
- [ ] Đảm bảo tính "Premium" và "Actionable" (Giúp sếp đưa ra quyết định ngay).
