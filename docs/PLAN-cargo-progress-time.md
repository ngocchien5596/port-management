# Kế hoạch: Nâng cấp nhập liệu Tiến độ làm hàng (Thời gian Bắt đầu / Kết thúc)

## 1. Mục tiêu (Goal)
Thay đổi cách nhập liệu "Số giờ làm hàng" trong Cập nhật Tiến độ làm hàng (`CargoProgressLogTable`). Từ việc nhập số giờ thủ công (ví dụ: 8h), người dùng sẽ nhập **Thời gian bắt đầu** và **Thời gian kết thúc**. Hệ thống sẽ tự động tự tính toán ra **Số giờ làm hàng** dựa trên khoảng thời gian này để đảm bảo dữ liệu chân thực và logic nhất.

## 2. Các thay đổi dự kiến (Task Breakdown)

### Phase 1: Cập nhật Database Profile 
- **File:** `apps/api/prisma/schema.prisma`
- **Action:** Thêm 2 trường lưu trữ vào model `VoyageProgress`:
  ```prisma
  startTime DateTime?
  endTime   DateTime?
  ```
- **Action:** Chạy lệnh `npx prisma db push` để đồng bộ CSDL.

### Phase 2: Điều chỉnh Luồng xử lý dữ liệu (Backend)
- **File Types:** `apps/web/src/features/qltau/types.ts`
  - Bổ sung `startTime` và `endTime` kiểu chuỗi ISO String vào interface `VoyageProgress` và Payload Gửi đi.
- **File Service:** `apps/api/src/services/voyage.service.ts`
  - Sửa đổi 2 hàm `addProgress` và `updateProgress` để cho phép ghi nhận `startTime`, `endTime`.
  - Giữ nguyên logic tính `productivity` (Công suất) do Frontend vẫn gửi kèm `hours` (hoặc Backend tự tính lại hiệu số `endTime - startTime`).

### Phase 3: Nâng cấp Giao diện hiển thị (Frontend)
- **File Template:** `apps/web/src/app/(app)/voyages/[id]/(components)/CargoProgressLogTable.tsx`
  - **Form Thêm mới:**
    - Gỡ bỏ ô input "Số giờ làm" thông thường.
    - Thêm 2 bộ Time picker / Date-time Input cho: "Bắt đầu" và "Kết thúc".
    - Tính toán theo thời gian thực (real-time) để hiển thị mờ cho người dùng: `=> 2.5 giờ`.
  - **Form Chỉnh sửa (Inline Edit):**
    - Áp dụng 2 ô Input time thay cho ô editHours.
  - **Giao diện bảng:**
    - Cột hiển thị "Thời gian" (đang dùng `createdAt`) sẽ được thay thế bằng chuỗi trực quan: `{Giờ bắt đầu} - {Giờ kết thúc}`.
  - **Validation:** Bắt lỗi "Thời gian kết thúc phải lớn hơn Thời gian bắt đầu".

## 3. Phân công Agent (Agent Assignments)
- **`@backend-specialist`**: Cập nhật Prisma Schema, DB Push, và sửa đổi service `voyage.service.ts`.
- **`@frontend-specialist`**: Cập nhật Input Datetime, xử lý UI validation và Date-math logic tại `CargoProgressLogTable.tsx`.

## 4. Kiểm tra & Bàn giao (Verification Checklist)
- [ ] Cơ sở dữ liệu nhận thông tin `startTime` & `endTime` đầy đủ mà không hỏng bản ghi cũ.
- [ ] Giao diện Thêm bản ghi: Nhập Bắt đầu 10:00, Kết thúc 12:30 -> Phải ra đúng 2.5 giờ.
- [ ] Chỉnh sửa bản ghi trong bảng hiển thị popup/inline chính xác 2 timestamp.
- [ ] Đảm bảo các chỉ số đo lường hiệu suất (Chart) và tính ETD tự động vẫn nhận đủ biến `hours` để hoạt động mượt mà.
