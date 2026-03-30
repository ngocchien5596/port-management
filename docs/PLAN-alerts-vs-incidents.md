# ADR-001: Tách biệt Cảnh báo (Alerts) và Sự cố (Incidents)

> Bản thiết kế phân định ranh giới giữa Cảnh báo và Sự cố trong hệ thống quản lý cảng biển nhằm tránh nhiễu cảnh báo (Alert Fatigue) và tối ưu hóa luồng làm việc.

## Mức độ / Trạng thái
Quy hoạch (Planning Phase) / Đề xuất (Phase 1 Complete)

## Bối cảnh (Context)
Trong thực tế vận hành cảng biển (Terminal Operating System - TOS), hiện tượng "Alert Fatigue" (Nhiễu Cảnh báo) thường xuyên xảy ra khi hệ thống gộp chung các cảnh báo vận hành thông thường với các sự cố chí mạng. Điều này khiến cho nhân viên điều hành bị chìm nghỉm trong hàng trăm cảnh báo thông thường và bỏ lỡ các sự cố nghiêm trọng. Để giải quyết, việc **TÁCH BIỆT HOÀN TOÀN** hai khái niệm này là **Bắt buộc (MANDATORY)**.

## Quyết định (Decision)
Thực hiện tách biệt rạch ròi giữa 🚦 Cảnh báo (Alerts / Warnings) và 🚨 Sự cố (Incidents / Breakdowns).

### 1. Phân loại Lĩnh vực (Domain Classification)

| Tiêu chí | 🚦 Cảnh báo (Alerts / Warnings) | 🚨 Sự cố (Incidents / Breakdowns) |
|----------|---------------------------------|-----------------------------------|
| **Bản chất** | Sự **sai lệch (deviations)** so với kế hoạch hoặc KPI vận hành thông thường. Chưa gây đình trệ hoàn toàn. | Các sự kiện **vật lý hoặc phần mềm** gây gián đoạn cục bộ hoặc thảm họa, yêu cầu xử lý ngay lập tức. |
| **Vòng đời** | **Auto-resolve:** Thường tự biến mất khi dữ liệu trở lại bình thường (ví dụ: Năng suất cẩu tăng trở lại > 80%). | **Manual resolve:** Đòi hỏi phải có người xác nhận (Acknowledge) và bấm nút "Hoàn tất/Đã khắc phục". |
| **Phân loại** | - **Tiến độ:** Tàu đến trễ ETA, bốc dỡ chậm.<br>- **Năng suất:** Tốc độ < KPI <br>- **Mức chứa:** Bãi đầy 90%.<br>- **An toàn:** Sức gió đang tăng dần. | - **Thiết bị:** Cẩu gãy cáp, đứt điện.<br>- **Hạ tầng:** Sập cần cẩu, mất điện bến lệnh.<br>- **Hàng hóa:** Rơi rớt container, rò rỉ hóa chất.<br>- **IT System:** Mất kết nối mạng cục bộ. |
| **Tính lưu trữ**| Dữ liệu dạng **Timeseries / Ephemeral** (chỉ lưu log ngắn hạn hoặc tính toán on-the-fly). Tắt alert khi hết điều kiện. | Dữ liệu dạng **Ticket/Record** (lưu vĩnh viễn trong Database để audit/làm báo cáo). |
| **Tác động** | Góp ý cho Điều hành viên (có thể phớt lờ nếu có việc gấp hơn). | Kéo theo Hiệu ứng dây chuyền (Bắt buộc Dừng tàu / Đổi cẩu). |

### 2. Kiến trúc Hệ thống (Architecture Separation)
*(Dự án: Port Management System - Đánh giá từ `database-architect` và `frontend-specialist`)*

#### Thiết kế Dữ liệu
- **Sự cố (Incident):** Giữ nguyên bảng `Incident` hiện hành. Đây là các "Trouble Tickets" cứng. Phải có ID Cẩu, ID Tàu, Thời gian bắt đầu, Thời gian kết thúc.
- **Cảnh báo (Alert):** Không cần tạo bảng cứng chứa Alert (tránh rác DB). 
  - *Option 1:* Tính toán On-the-fly trên code Backend và trả về mảng `alerts: []` trong cục JSON khi get chi tiết tàu. 
  - *Option 2:* Lưu log cảnh báo tại Redis hoặc một bảng `Notification` nhỏ (tự động xóa sau 7 ngày).

#### Thiết kế Giao diện
Chia làm 2 luồng UI rõ rệt:
1. **Notifications Center (Quả chuông Cảnh báo):** Nằm gọn ở góc phải trên cùng Header. Hiển thị "Tàu ABC trễ 2h". Khi bấm vào sẽ Toast Notification ra, không cản trở màn hình. UI dạng Banner vàng hoặc Notification Tray (Non-blocking).
2. **Incident Management (Quản lý Sự cố):** Một Tab / Module to tướng như hiện tại. Khi Tàu / Cẩu bị Sự cố thì nháy đỏ toàn màn hình (Modal chặn ngang hoặc Red Border) buộc người dùng phải thừa nhận (Acknowledge) thì mới cho làm tiếp. UI dạng Blocking / Critical.

### 3. Phân rã Công việc (Task Breakdown)
*Nếu chính thức triển khai việc Tách biệt này, danh sách các tính năng bao gồm:*
- **Task 1:** Bổ sung Cảnh báo "Tàu sắp đến hạn ETA / Đã trễ ETA" (Tính toán ngầm realtime trả về UI, cảnh báo chuông).
- **Task 2:** Tách Cảnh báo "Năng suất kém" ra khỏi mục Incident, đưa vào mục "Alerts" của Dashboard Phân tích độ lệch.
- **Task 3:** Thiết kế Notification Center Dropdown phía trên thanh Header để gom toàn bộ các Cảnh báo (vàng) thay vì nhét chung với báo cáo hỏng hóc Cẩu (đỏ).
- **Task 4:** Giữ lại logic `Incident` khi Cẩu hỏng -> Cascade xuống các Tàu. Nhưng nếu Tàu chỉ bị trễ tiến độ bốc dỡ -> Không sinh Incident, chỉ Alert về màn hình Tổng giám đốc.

## Hệ quả (Consequences)
- Bản thiết kế này giúp hệ thống trở nên Chuyên nghiệp, đúng chuẩn TOS (Terminal Operating System) của các Cảng biển lớn.
- Khắc phục nguy cơ tràn cơ sở dữ liệu với những cảnh báo tức thời.
- Nhấn mạnh được tầm quan trọng của các sự cố kỹ thuật nghiêm trọng thông qua giao diện Blocking.
