# Kế hoạch Triển khai Chi tiết: Tách biệt Alerts và Incidents (V2 - Có Tích hợp DB)

## 📌 Tổng quan (Overview)
Từ bản ADR-001 và yêu cầu bổ sung tính năng **"Đánh dấu đã đọc" (Mark as Read / Acknowledge đồng bộ toàn hệ thống)**, kế hoạch này đã chuyển đổi kiến trúc sang phương án **Lý tưởng & Bài bản hơn**. Thay vì chỉ tính toán on-the-fly và mất khi F5, cảnh báo (Alert) sẽ được sinh ra dưới dạng bản ghi trong bảng `Notification` của Database.

## 🏗️ Technical Stack & Scope
- **Dữ liệu (`database-architect`):** Tạo thêm model `Notification` trong `schema.prisma`.
- **Backend (`backend-specialist`):** Viết job/trigger tạo Notification khi Tàu vi phạm KPI/Trễ ETA. Xây dựng API list, đọc, xóa Notification.
- **Frontend (`frontend-specialist`):** Xây dựng Component `NotificationCenter` thả xuống ở Header, có nút "Đánh dấu đã đọc". Tích hợp Banner vào chi tiết chuyến tàu. Làm sạch module Incident.

---

## 📋 Phân rã Công việc Chi tiết (Task Breakdown)

| Khối lượng | Tác vụ | Đầu Vào (Input) | Đầu Ra (Output) | Tiêu chí Nghiệm thu (Verify) |
|---|---|---|---|---|
| **P0** <br> `database-architect` | **Task 1: Cập nhật CSDL (`schema.prisma`)** <br>Tạo mô hình `Notification` gồm: `id`, `title`, `message`, `type` (INFO, WARNING, CRITICAL), `isRead` (boolean), `voyageId` (optional), `createdAt`. | Yêu cầu tạo DB lưu cảnh báo. | Bảng mới `Notification` được migrate vào PostgreSQL. | Lệnh `npx prisma db push` chạy mượt mà, DB có bảng mới. |
| **P1** <br> `backend-specialist` | **Task 2: Xây RESTful API cho Notification** <br>Tạo Controller & Service quản lý `Notification` (`GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`). | Schema `Notification`. | Các đầu API chuẩn RESTful cho thao tác với cảnh báo. | Postman test gọi API trả về 200 OK. Đánh dấu `isRead = true` thành công. |
| **P1** <br> `backend-specialist` | **Task 3: Viết Logic Trigger Sinh Cảnh Báo** <br>Trong `VoyageService` (hoặc Cron/Middleware), khi hệ thống thấy một chiếc tàu đổi sang `ĐANG_LÀM_HÀNG` mà tiến độ tụt thê thảm hoặc trễ ETA, tự động insert 1 dòng vào bảng `Notification` (nếu chưa có). | Dữ liệu tính toán ETA, ETD, KPI trong Voyage. | DB có thêm record ở bảng `Notification` ứng với sự chậm trễ của tàu. | API sinh ra đúng cảnh báo, không bị lặp record (Upsert logic). |
| **P2** <br> `frontend-specialist` | **Task 4: Thiết kế `NotificationCenter` (Phễu tin)** <br>Thêm biểu tượng Chuông ở Header kèm Red-dot báo số lượng cảnh báo `unread`. Cho phép click hiển thị Menu Dropdown liệt kê tin, và icon (✔) để "Mark as read". | Các API từ Task 2. | Dropdown UI giống Facebook/Slack. Click vào xem hoặc ẩn cảnh báo. | Số lượng unread nhảy real-time hoặc load lại đúng sau khi click. |
| **P2** <br> `frontend-specialist` | **Task 5: Tích hợp Banner Cảnh báo vào Trang Chi tiết Chuyến Tàu (`[id]/page.tsx`)** <br>Chỉ lấy các `Notification` thuộc về riêng chuyến tàu này (isRead = false) để thả 1 cái Banner màu Cảnh Báo (Vàng/Cam) lên đầu màn hình. | Danh sách `Notification` dạng WARNING. | Banner trượt xuống thông báo lỗi tiến độ; có nút "Đã rõ" (Acknowledge) ngay trên banner để giấu đi. | UX Non-blocking, người dùng vẫn điều khiển được hệ thống bốc dỡ bình thường. |
| **P3** <br> `test-engineer` | **Task 6: Dọn dẹp Luồng Sự Cố Cũ (Incident Refactoring)** <br>Xóa bỏ các cảnh báo bằng "chữ đỏ/chữ vàng" đang hiển thị lộn xộn trong ProductivityTable hoặc Modal Hỏng Cẩu hiện có do đã được quy hoạch về Chuông/Banner. | File UI cũ. | Trả lại module Sự cố nguyên bản chỉ dùng khi lỗi phần cứng (hỏng cẩu). | Bảng Sự cố sạch sẽ rạch ròi, không còn trùng lặp với Cảnh báo. |

---

## ✅ Phase X: Checklist Nghiệm thu (Verification Checklist)

- [ ] `prisma schema` được deploy thành công, tạo bảng không gây ảnh hưởng data cũ.
- [ ] API `GET /api/notifications` trả về phân trang và trạng thái read/unread.
- [ ] Tính năng Notification Banner bật ra khi hệ thống phát hiện tàu có `netProductivity < capacity` hoặc quá giờ ETA. Bấm "✔ Đã đọc" thì chuông mất số, bảng DB lưu lại.
- [ ] Bảng `Incident` trên DB Không còn các ticket rác của cảnh báo tiến độ (chỉ dùng cho hỏng cẩu/thiết bị).
- [ ] Chạy `ux_audit.py` cho Notification Center để chặn lỗi Contrast (Vàng/Trắng gây lóa mắt).

---
> Kế hoạch này giúp hệ thống lưu vết (Audit Trail) được việc "Ai đã đọc, đọc lúc nào, vì sao bỏ qua", đáp ứng tiêu chuẩn phần mềm quy mô xí nghiệp (Enterprise TOS) cần accountability.
