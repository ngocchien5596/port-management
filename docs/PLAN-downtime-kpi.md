# Kế hoạch Triển khai: Thẻ KPI Thời gian Downtime

## 1. Mục tiêu (Objective)
Thêm một thẻ hiển thị thông số (KPI Card) đo lường **Thời gian Downtime (Dừng hoạt động)** vào giao diện hệ thống Quản lý Cảng.

## 2. Thông tin làm rõ (Socratic Gate)
*Đang chờ người dùng xác nhận các thông tin sau trước khi chốt phương án kỹ thuật thiết kế Database và API:*

1. Màn hình nào sẽ hiển thị thẻ KPI này?
   - Màn hỉnh Quản lý Cảng chung (Dashboard)? hay Chi tiết từng Thiết bị (Equipment Details)? hay Nhật ký Sự cố (Incident Log)?
2. Công thức tính "Downtime" được quy định thế nào trong hệ thống?
   - Tổng thời gian thiết bị ở trạng thái `SỬA CHỮA` và `BẢO TRÌ`?
   - Hay là tổng thời lượng (`endTime - startTime`) của tất cả các **Nhật ký Sự cố** (Incidents) có mức độ nghiêm trọng tác động tới việc dừng máy?
3. Khung thời gian (Time range) dùng để tính toán KPI hiển thị là gì?
   - Downtime của **nguyên cả tháng nay/tuần nay**? 
   - Hay Downtime tính từ lúc bắt đầu chuyến tàu hiện tại?

## 3. Kiến trúc Đề xuất (Proposed Architecture) - Dự thảo
- **Frontend:** Thêm component Card vào Grid tương ứng (Ví dụ `EquipmentKpiCards.tsx`). Dùng icon `TimerOff` hoặc `Wrench`.
- **Backend:** Cập nhật Endpoint (Ví dụ `getKpi` trong `equipment.service.ts` hoặc `incident.service.ts`) để tổng hợp các khoảng thời gian bị gián đoạn và trả về số giờ (Hours) hoặc phút (Minutes).

## 4. Các bước Thực hiện (Task Breakdown)
*Sẽ được cập nhật sau khi giải quyết xong Socratic Gate ở Mục 2.*
- [ ] Xác nhận yêu cầu chi tiết với người dùng.
- [ ] Chỉnh sửa Backend Service logic tính tổng thời gian Downtime.
- [ ] Bổ sung trường trả về `downtimeHours` qua API.
- [ ] Chỉnh sửa Frontend Component (UI thẻ KPI).

## 5. Xác minh (Verification)
QA Checklist:
- KPI Card load không bị lỗi Fetch.
- Hiển thị đúng số giờ dừng máy thay vì `NaN` hoặc `undefined`.
- Màu đỏ/cam hiển thị cảnh báo hợp lý.
