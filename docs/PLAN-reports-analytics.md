# Kế Hoạch Triển Khai: Hệ thống Báo cáo Sản lượng & Năng suất (Analytics Dashboard)

Bản kế hoạch này mô tả kiến trúc kỹ thuật và giao diện để triển khai phân hệ Báo cáo (Reports) cho phần mềm quản lý cảng, bao gồm báo cáo sản lượng theo ca/ngày/tháng và đo lường năng suất thiết bị. Quyết định được đưa ra dựa trên 피드백 của Người quản trị hệ thống.

---

## 🏗️ Kiến Trúc Dữ Liệu & Backend (`apps/api/`)

### 1. Quản lý Cấu hình Ca làm việc (Shift Configuration)
* **Storage:** Sử dụng bảng `SystemConfig` hiện có để lưu trữ mốc thời gian bắt đầu của các Ca. **Mặc định chia 3 ca:**
  * **Ca 1:** 06:00 - 14:00 (`SHIFT_1_START="06:00"`)
  * **Ca 2:** 14:00 - 22:00 (`SHIFT_2_START="14:00"`)
  * **Ca 3:** 22:00 - 06:00 hôm sau (`SHIFT_3_START="22:00"`)
* **API:** Mở rộng các API `GET/PUT /api/config` để Frontend có thể lấy và cấu hình các giá trị này.
* **Master Data Update:** Model `VoyageProgress` (Tiến độ làm hàng) sẽ cần thêm trường `shiftCode` (ví dụ: "CA_1", "CA_2", "CA_3") để lưu thẳng ca làm việc lúc nhân viên nhập liệu.

### 2. Định mức Năng suất Thiết bị
* **Sử dụng Dữ liệu Cũ:** Trường Công suất (`capacity`) đã có sẵn trong bảng `Equipment` của màn hình *Quản lý Thiết bị* sẽ được tận dụng làm **Năng suất Định mức (Rated Capacity)**. 
* Khi tính toán biểu đồ năng suất thực tế so với định mức, backend sẽ query trường này từ relationship của Chuyến tàu -> Luồng -> Thiết bị.

### 3. Logic Nhóm Thời gian (Time Bucketing)
* Mọi biểu đồ báo cáo và tính toán tổng sản lượng sẽ dựa vào mốc **thời gian kết thúc mẻ cẩu (`endTime`)** của mỗi bản ghi `VoyageProgress` thay vì mốc ngày tạo `createdAt`.

### 4. Báo cáo API Endpoints
* `GET /api/reports/volume` (Báo cáo Sản lượng)
  * Nhóm theo Ca, Ngày, Tháng, hiển thị bóc tách chi tiết khối lượng thực hiện.
* `GET /api/reports/productivity` (Báo cáo Năng suất thực tế vs Định mức)
  * Lấy tổng sản lượng `amount` chia cho tổng thời gian làm hàng (trừ đi thời gian Downtime sự cố).
  * Load dữ liệu `capacity` từ thiết bị tương ứng để đối chiếu (Reference Line).

---

## 🎨 Trải Nghiệm Người Dùng & Frontend (`apps/web/`)

### 1. Cập nhật Modal "Cập nhật Tiến độ Làm hàng"
* Sửa đổi form `UpdateProgressModal.tsx` trên Frontend.
* Bắt buộc người dùng phải chọn dropdown **Ca làm việc (Ca 1 / Ca 2)** dựa theo biến hệ thống khi điền số lượng tấn làm được. Auto-select (Tự động chọn ca) dựa trên giờ hiện tại `new Date()` để giảm thao tác.

### 2. Cấu hình Ca làm việc (Menu riêng)
* **Sub-menu mới:** Thêm một menu con có tên `Cấu hình ca làm việc` nằm dưới menu cha `Cấu hình hệ thống` ở thanh Sidebar trái (`src/components/layout/LeftMenu.tsx`).
* **Route mới:** `src/app/(app)/config/shifts/page.tsx`. Giao diện này sẽ chứa form thiết lập mốc thời gian Ca 1, Ca 2, Ca 3.

### 3. Nâng cấp Giao diện Menu "Báo cáo & KPI" hiện tại (`/reports`)
Thay vì tạo menu mới làm loãng hệ thống, chúng ta sẽ **làm mới toàn diện (Remake)** chức năng "Báo cáo & KPI" đang có sẵn tại luồng `src/app/(app)/reports/page.tsx`.

Giao diện mới sẽ chia làm 2 Tabs hoặc 2 Sub-routes chính:
* **Tab 1 - Báo Cáo Sản Lượng:** 
  * Thanh công cụ Lọc (FilterBar): Từ ngày - Đến ngày. Dropdown chọn Mức độ (Tất cả / Theo Ngày / Theo Ca). Select Lọc theo Tàu/Loại hàng hóa.
  * Component Biểu đồ (Recharts): Biểu đồ Cột chồng (Stacked Bar Chart) hiển thị Tấn/Sản phẩm qua thời gian.
  * Data Table: Danh sách thô hiển thị chi tiết để đối chiếu.
* **Tab 2 - Báo Cáo Năng Suất (Cầu/Luồng):** 
  * Combo Chart: Cột hiển thị số Sản lượng (Tấn) và Đường hiển thị Năng suất thực tế (Tấn/h) của từng ca.
  * Đường nét đứt (Định mức): Hiển thị mốc Capacity của thiết bị để so sánh.
* *(Các Tab cũ như An Toàn & Sự Cố sẽ được giữ lại hoặc tính hợp nhẹ nhàng sang các tab mới nếu cần thiết).*

### 5. Tính năng Xuất Báo Cáo (`Export Excel`)
* Tích hợp thư viện xử lý `.xlsx` trên trình duyệt để khi click, hệ thống tự động đổ JSON từ lưới dữ liệu vào form File có các Header chuẩn. Khách hàng bấm lưu là xong, không gọi thêm API load từ máy chủ.

---

## ✅ Checklist Kiểm thử (Verification Plan)
1. **[Core]** Kiểm thử toàn diện module Cấu hình Ca làm việc mới (`/config/shifts`). Đảm bảo lưu đúng giờ, khi thay đổi giờ thì hệ thống vận hành trơn tru.
2. **[Integration]** Kiểm tra kỹ mảng liên kết dữ liệu nhập liệu: Khi nhân viên Submit form *Cập nhật Sản lượng* ở màn Dashboard/Tiến độ, hệ thống phải lưu đúng `shiftCode` tương ứng với giờ thực tế, không làm hỏng chức năng nhập sản lượng cũ.
3. **[Report - Volume]** Load lại trang `/reports`, kiểm tra Tab *Sản lượng*. Đối chiếu số liệu hiển thị trên biểu đồ xem có khớp với số liệu nhập liệu thực tế của một Chuyến tàu (Cộng tay hoặc kiểm tra các bản ghi VoyageProgress).
4. **[Report - Productivity]** Cập nhật thử Công suất của Cẩu từ 800 lên 1200T/h trong màn Quản lý thiết bị -> Check xem Đường Định Mức (Nét đứt) của Biểu đồ Năng suất ở `/reports` có giật nhảy lên mốc 1200 không. Mọi liên kết chéo phải mượt mà.
5. **[Export]** Thử Export ra Excel, đảm bảo logic tách sheet/tách cột hoạt động ổn định và font Tiếng Việt hiển thị chuẩn.
