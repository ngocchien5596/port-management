# Nguồn gốc Cảnh báo & Sự cố (Incident Triggers) trong Hệ thống

Tài liệu này tổng hợp toàn bộ các trường hợp và sự kiện dẫn đến việc hệ thống Port Management khởi tạo **Sự cố (Incident)** được lưu trữ trong Database, cũng như các **Cảnh báo (Warnings)** hiện diện trên giao diện UI tính đến hiện tại.

## 1. Sự kiện lưu thành Database Record (Bảng `Incident`)

Đây là những sự cố quan trọng được lưu cứng vào hệ thống (DB Tracking), có mã sự cố, phân loại mức độ nghiêm trọng (Severity) và có thể gây ảnh hưởng dây chuyền.

### A. Sự cố Thiết bị (Cẩu/Tài sản)
- **Kích hoạt tự động khi:** Người điều hành Cảng (hoặc Admin) chuyển trạng thái của một thiết bị sang **`Sửa chữa` (REPAIR)** hoặc **`Bảo trì` (MAINTENANCE)**.
- **Loại sự cố sinh ra:**
  - **Sửa chữa:** Mức độ `RED` (Nghiêm trọng đỏ).
  - **Bảo trì:** Mức độ `YELLOW` (Cảnh báo vàng).
- **Hiệu ứng dây chuyền (Cascading Incidents):** Ngay lập tức, hệ thống sẽ tự động quét toàn bộ các Chuyến tàu đang làm hàng (`status = LAM_HANG`) sử dụng chiếc cẩu này, và **tự động phân rã (tạo thêm) Child Incidents (Sự cố con)** gắn trực tiếp cho từng Chuyến tàu đó, kéo theo việc Tàu cũng bị dính cảnh báo đỏ/vàng trên hệ thống.

### B. Sự cố Chuyến tàu (Voyage Incident)
- **Kích hoạt thủ công khi:** Kỹ thuật viên / Điều hành chủ động khai báo sự cố trực tiếp trong module thông tin chuyến tàu (`POST /api/voyages/:id/incidents`).
- **Phạm vi tác động:** Chỉ dính trên chuyến tàu bị báo cáo, có thể là do đứt cáp, rơi hàng, tàu hỏng... Mức độ do người nhập tự quyết định.

### C. Sự cố Toàn cục (Global/Lane Incident)
- **Kích hoạt thủ công khi:** Tạo từ Bảng điều khiển Sự cố chung của Hệ thống (`POST /api/incidents`).
- **Phạm vi tác động:** Có thể là thời tiết xấu trên toàn Cảng (GLOBAL), hoặc mất điện một Bến lệnh (LANE), kéo theo đình trệ toàn bộ các tàu thuộc Bến lệnh đó.

---

## 2. Hệ thống Cảnh báo Hành vi & Khai thác (Soft Warnings - Phân tích UI)

Đây là những sự cố/cảnh báo **không sinh ra dòng Record** nào trong bảng Incident, nhưng hệ thống backend hoặc frontend tự động tính toán từ Data hiện thời để cảnh báo bằng hình ảnh (Yellow/Red badges, Alerts).

1. **Cảnh báo Năng suất thấp (KPI Deviation)**
   - **Kích hoạt khi:** `Năng suất thực tế (netProductivity)  <  Công suất cẩu (capacity)`.
   - **Cảnh báo trên UI:** Các dashboard và biểu đồ sẽ đánh dấu màu ĐỎ/VÀNG để đội vận hành biết tiến độ của ca làm việc đang bị hụt so với chuẩn.

2. **Cảnh báo đình chỉ / Nhường Cẩu khẩn cấp (Emergency Override Warning)**
   - **Kích hoạt khi:** Một tàu đang làm hàng bị ép "Dừng" để nhường cẩu cho một chuyến tàu `EMERGENCY`.
   - **Cảnh báo trên UI:** Tàu bị nhường cẩu chuyển sang `TAM_DUNG`, cẩu bị tước (`equipmentId = null`). UI liên tục báo động đỏ bắt người dùng giải phóng cẩu/chọn cẩu mới để tiếp tục.

3. **Cảnh báo An toàn & Điều kiện Môi trường (Checklist Readiness)**
   - **Kích hoạt khi:** Khi chuyển tàu từ Trạng thái X sang `Đang làm hàng`, các checkbox "Thời tiết đảm bảo an toàn", "Báo cáo mớn", "Hồ sơ thủ tục" bị thiếu.
   - **Cảnh báo trên UI:** Chặn không cho khai thác (Validation Blocking). Hệ thống chặn việc bắt đầu khai thác nếu cảnh báo này chưa được Clear.

---
**Tổng kết:** Hiện tại Incident Core tự động sinh ra khi **Cẩu bị báo hỏng**, có hiệu ứng dây chuyền 1-nhiều tới các chuyến tàu. Còn lại đa phần các Incident khác đều cần sự khai báo Chủ động từ con người.
