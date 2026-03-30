# ADR-002: Kiến trúc Hệ thống Cảnh báo (Notification System)

> Tài liệu này liệt kê chi tiết cơ chế lưu trữ và toàn bộ các kịch bản (scenarios) sẽ tự động trigger Cảnh báo (Alerts) trong quá trình vận hành Cảng. Bám sát phương án 2 (Đồng bộ theo User/Server).

## Trạng thái
Quy hoạch (Planning Phase) / Đề xuất chờ duyệt

## Quyết định Kỹ thuật (Technical Decisions)

### 1. Kiến trúc Database (`Notification` Table)
Hiện tại `schema.prisma` đã có sẵn bảng `Alert`, tuy nhiên cấu trúc này còn khá sơ sài (thiếu liên kết với Chuyến tàu để truy xuất nhanh). Đề xuất đổi tên thành `Notification` (hoặc nâng cấp trực tiếp bảng `Alert`) theo cấu trúc sau:

```prisma
model Notification {
  id          String   @id @default(uuid())
  type        String   // LATE_ETA, LOW_PRODUCTIVITY, EMERGENCY_OVERRIDE, LATE_ETD
  title       String   
  message     String
  severity    String   // INFO, WARNING, CRITICAL
  isRead      Boolean  @default(false)
  
  // Liên kết thực thể để click vào chuông thì nhảy thẳng đến trang chi tiết
  voyageId    String?
  voyage      Voyage?  @relation(fields: [voyageId], references: [id], onDelete: Cascade)
  
  // Phân quyền người nhận: Gửi cho 1 người cụ thể hoặc null (Global gửi cho mọi Admin/Operator)
  userId      String?
  employee    Employee? @relation(fields: [userId], references: [id])
  
  createdAt   DateTime @default(now())
}
```

---

## 2. Ma trận Phân luồng Sự kiện (Event Routing Matrix)
*Để đảm bảo Dữ liệu 2 bảng `Incident` và `Notification` **TUYỆT ĐỐI KHÔNG TRÙNG LẶP**, dưới đây là ma trận phân luồng chính xác từng loại sự kiện khi xảy ra:*

| Sự kiện thực tế (Event) | 🚨 Chèn vào bảng `Incident` (Sự cố) | 🔔 Chèn vào bảng `Notification` (Cảnh báo) |
|---|---|---|
| **Cẩu hư hỏng vật lý** (đứt cáp, kẹt thanh ngáng, cháy motor) | **CÓ** (Tạo equipment incident, lan truyền xuống các Voyage đang dùng cẩu). | **KHÔNG** (Đây là sự cố ngừng việc hoàn toàn). |
| **Tai nạn lao động / Tràn hóa chất** (User báo cáo khẩn) | **CÓ** (Tạo voyage incident mức CRITICAL). | **KHÔNG**. |
| **Mất điện toàn mỏ / Bão lớn** (Global Event) | **CÓ** (Tạo Global Incident). | **KHÔNG**. |
| **Tàu đến trễ ETA / đi muộn ETD** (Lệch lịch trình) | **KHÔNG** (Tàu vẫn hoạt động được, kẹt đâu đó trên biển/thủ tục). | **CÓ** (Gửi chuông nhắc nhở Operator). |
| **Năng suất bốc dỡ hụt / Yếu** (<80% thiết kế cẩu) | **KHÔNG** (Trong quá khứ chúng ta nhầm lẫn lưu vào Incident, hiện tại sẽ XÓA). | **CÓ** (Gửi Notification nhắc nhở yếu năng suất). |
| **Tước cẩu khẩn cấp** (Emergency Yielding làm kẹt tàu khác) | **KHÔNG** (Sự cố này mang tính gián đoạn lịch trình chứ không phải đứt gãy vật lý). | **CÓ** (Gửi còi báo động để Operator mau chóng tìm cẩu bù vào). |
| **Thiếu thủ tục hành chính** (Checklist chưa pass) | **KHÔNG**. | **CÓ**. |

---

## 3. Các kịch bản Kích hoạt Bảng `Notification` (Trigger Scenarios)

Dưới đây là **5 kịch bản tự động** sinh ra cảnh báo gửi tới người điều hành (Insert vào bảng `Notification` thay vì Incident):

### Kịch bản 1: Tàu trễ giờ cập bến (Overdue ETA)
- **Hoạt cảnh:** Tàu đã lên lịch nhưng quá giờ vẫn chưa thấy làm thủ tục cập bến.
- **Logic kích hoạt (Cronjob):**
  - `voyage.status` đang ở `NHAP` (Mới tạo) hoặc `THU_TUC` (Đang chờ).
  - VÀ thời gian hiện tại lớn hơn giờ dự định đến `NOW() > voyage.eta`.
- **Mức độ (Severity):** `WARNING` (Màu vàng).
- **Hành vi Hủy:** Khi trạng thái tàu chuyển sang `DO_MON_DAU_VAO` (Đã cập bến đo mớn).

### Kịch bản 2: Bốc dỡ chậm - Hụt năng suất (Low Productivity)
- **Hoạt cảnh:** Kỹ thuật viên nhập sản lượng từng ca, tính ra năng suất trung bình bị tuột dốc so với công suất thiết kế của cẩu.
- **Logic kích hoạt (Event-driven):**
  - Trigger ngay tại API `addProgress(...)` (Lúc nhấn nút lưu ca).
  - Nếu `voyage.status == 'LAM_HANG'` (Đang làm hàng).
  - VÀ `voyage.netProductivity < (voyage.equipment.capacity * 0.8)` (Năng suất thực tế < 80% công suất cẩu).
- **Mức độ (Severity):** `WARNING` (Màu cam).
- **Hành vi Hủy:** Khi ca sau nhập số liệu tốt kéo năng suất trung bình `> 80%`.

### Kịch bản 3: Tàu trễ giờ rời bến (Overdue ETD)
- **Hoạt cảnh:** Tàu bốc dỡ quá chậm dẫn đến lố khung thời gian trả bến, ảnh hưởng tàu sau.
- **Logic kích hoạt (Cronjob):**
  - `voyage.status == 'LAM_HANG'` (Vẫn đang bốc dỡ).
  - VÀ `NOW() > voyage.etd` (Đã quá giờ dự định đi).
- **Mức độ (Severity):** `CRITICAL` (Màu đỏ).
- **Hành vi Hủy:** Tàu chuyển sang trạng thái kết thúc bốc dỡ.

### Kịch bản 4: Bị tước cẩu khẩn cấp (Emergency Override)
- **Hoạt cảnh:** Một tàu đang làm hàng bình thường bị Điều hành tước mất cẩu để ưu tiên cho tàu VIP khác, dẫn tới trạng thái Treo.
- **Logic kích hoạt (Event-driven):**
  - Lắng nghe API đổi cẩu: Khi một Tàu bị chuyển sang trạng thái `TAM_DUNG` do mất cẩu.
- **Mức độ (Severity):** `CRITICAL` (Màu đỏ).

### Kịch bản 5: Cảnh báo An toàn Thời tiết / Hồ sơ (Pre-operation Check)
- **Hoạt cảnh:** Người điều hành chưa check đủ các điều khoản an toàn nhưng muốn vận hành.
- **Logic kích hoạt:**
  - Lắng nghe lúc chuyển status sang LAM_HANG mà checklist chưa đánh đủ.
- **Mức độ (Severity):** `INFO`.
