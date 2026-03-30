# PLAN-config-procedure-time

**Status:** PLANNING (Socratic Gate)
**Goal:** Make "Thời gian thủ tục" (Procedure Time) configurable and integrate it into the Theoretical ETD calculation instead of hardcoding it to 0.

## 🔴 Phase 0: Socratic Gate & Clarification Questions
Before implementing any code, we need to clarify the following:

1. **Scope of Configuration (Phạm vi ảnh hưởng):** Thời gian thủ tục này là một tham số chung (Global) cho TOÀN BỘ cảng, hay nó sẽ thay đổi tùy thuộc vào Loại hàng (Product), Cầu bến (Berth) hoặc Tuyến luồng (Lane)?
2. **Configuration UI (Vị trí giao diện):** Giao diện cấu hình tham số này sẽ nằm ở đâu? (Ví dụ: Menu `Cấu hình` > `Thông số chung`, hay nằm trong cấu hình của từng Cầu bến?)
3. **Retroactive Updates (Tính hồi tố):** Khi người dùng thay đổi số giờ này, hệ thống có cần TÍNH LẠI ETD Lý thuyết cho toàn bộ các chuyến tàu ĐANG HOẠT ĐỘNG (chưa hoàn thành) không, hay chỉ áp dụng cho chuyến tàu mới?

---

## 🛠 Phase 1: Solution Design (Dự kiến)

### Database Layer
- Thêm table `SystemConfig` chứa các tham số hệ thống dạng key-value (như `key: PROCEDURE_TIME_HOURS`, `value: 2.5`), hoặc cấu hình vào bảng phụ tương ứng nếu phạm vi không phải toàn cầu.

### API Engine (`voyage.service.ts`)
- Sửa đổi hàm `attachTheoreticalEtd` để lấy giá trị `procedureTimeHours` từ cấu hình ở trên thay vì `= 0`.
- Công thức: `durationHours = (totalVolume / capacity) + procedureTimeHours`.

### Frontend Adjustments (`VoyageCoreInfo.tsx`)
- Tạo form cho admin chỉnh sửa giá trị `PROCEDURE_TIME_HOURS`.
- Cập nhật tooltip về công thức tính trong `VoyageCoreInfo.tsx` hiển thị giá trị thật (VD: "Thời gian thủ tục (2.5 giờ)").

---

## 📅 Phase 2: Implementation Breakdown
- [ ] Cập nhật Prisma Schema (`SystemConfig`) và chạy migrate.
- [ ] Viết API Controllers & Routes để CRUD cấu hình.
- [ ] Sửa đổi backend logic tính ETD Lý thuyết (`voyage.service.ts`).
- [ ] Tạo/Sửa Frontend trang cấu hình.
- [ ] Cập nhật hiển thị Tooltip các trang tàu.
- [ ] Chạy kiểm thử (`checklist.py`).
