# BẢN KẾ HOẠCH TÍNH TOÁN VÀ HIỂN THỊ KPI MỚI (EOE & NMPH)

## 1. Mục tiêu Cập nhật
Tính toán lại các chỉ số hiệu suất dựa trên bộ KPI Cảng (Port Operations KPIs), cụ thể:
1. **Tiến độ hoàn thành (Completion Rate):** 100% khi xong tàu (hiện tại đã có, giữ nguyên trên bảng Table).
2. **Công suất Tịnh (Net Productivity):** Tốc độ giải phóng hàng trung bình khi hệ thống làm việc. (Tấn/giờ)
3. **Hiệu suất Thiết bị (Equipment Operating Efficiency - EOE):** Thể hiện % công suất thiết kế mà cẩu đạt được. Nếu cẩu 100 tấn/giờ, thực tế làm 90 tấn/giờ thì EOE = 90%.

> **Chú ý quan trọng từ người dùng:** KHÔNG SỬA hệ thống thẻ (Cards) tại file `CargoProgressLogTable` vì người dùng đánh giá nó đã ổn. **Chỉ sửa đổi ở thẻ hiển thị bên dưới Biểu đồ Performance `VoyagePerformanceChart`**.

## 2. Các Bước Triển khai (Mô-đun)

### Bước 1: Backend `voyage.service.ts`
1. Sửa hàm `attachTheoreticalEtd`: Xóa bỏ việc áp giá trần định mức khối lượng (`Math.min(totalVolume)`) để biểu đồ đường lý thuyết vọt tự do khi tàu làm vắt ca quá lâu.
2. Thêm logic tính 2 chỉ số cho toàn chuyến:
   - `netHours` = Tổng số giờ của các bản ghi sản lượng (`endTime - startTime`).
   - `netProductivity` = Tổng khối lượng làm được (`currentTotal`) / `netHours`.
   - `equipmentEfficiency` (EOE) = `(currentTotal) / (netHours * capacity) * 100`.
3. Nhét `netProductivity` và `equipmentEfficiency` (EOE) vào Payload API trả về client.

### Bước 2: Frontend API Types (`api.ts`, `hooks.ts`)
1. Cập nhật Interface `Voyage` (hoặc interface payload tương đương), bổ sung thêm `netProductivity?: number` và `equipmentEfficiency?: number`.

### Bước 3: Frontend Biểu đồ `VoyagePerformanceChart.tsx`
1. Dưới đáy biểu đồ này hiện đang có giao diện Cards: "Công suất bình quân" và "Tỷ lệ hoàn thành". Ta sẽ sửa logic UI ở đây.
   - Thay "Tỷ lệ hoàn thành" bằng "Hiệu suất Thiết bị (EOE)": Gọi biến `equipmentEfficiency` ra, format `< 100%` thành màu Đỏ cảnh báo.
   - Đổi "Công suất bình quân" lấy trực tiếp từ trường `netProductivity` trả về để tính Tấn/Giờ.

## 3. Danh sách File Bị Ảnh Hưởng (Affected Files)
1. `apps/api/src/services/voyage.service.ts`
2. `apps/web/src/features/qltau/api.ts`
3. `apps/web/src/app/(app)/voyages/[id]/(components)/VoyagePerformanceChart.tsx`

---
*Thời gian chạy dự kiến: ~10 phút*
