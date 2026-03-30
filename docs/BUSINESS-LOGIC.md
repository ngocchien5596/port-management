# TÀI LIỆU NGHIỆP VỤ & CÔNG THỨC TÍNH TOÁN
> **Dành cho:** Quản đốc cảng (Stakeholder)  
> **Mục tiêu:** Giải thích các quy tắc logic, cách tính toán số liệu và các cảnh báo tự động trên hệ thống quản lý cảng.

---

## 1. Bảng điều khiển (Dashboard)

Hệ thống cung cấp các chỉ số đo lường hiệu quả khai thác cảng theo thời gian thực.

### 📊 Tổng sản lượng (Total Volume)
*   **Ý nghĩa:** Tổng khối lượng hàng hóa đã xếp dỡ hoàn thành trong một khoảng thời gian nhất định.
*   **Cách tính:** Cộng dồn tất cả giá trị `Tổng sản lượng` của các chuyến tàu có trạng thái **Hoàn thành**.
*   **Nguồn dữ liệu:** Lấy từ thông tin chuyến tàu khi kết thúc thủ tục rời cảng.

### ⚡ Hiệu suất vận hành (Efficiency Index)
*   **Ý nghĩa:** Đo lường mức độ tận dụng công suất thiết kế của thiết bị (cẩu).
*   **Công thức:** 
    > `Hiệu suất (%) = (Năng suất thực tế / Công suất thiết kế) x 100`
*   **Thành phần:**
    - **Năng suất thực tế:** Số tấn hàng xếp dỡ được trong 1 giờ làm việc thực tế (không tính thời gian dừng chờ).
    - **Công suất thiết kế:** Định mức năng suất tối đa của cẩu (tấn/giờ) được cấu hình trong hệ thống.

### 🛠️ Thời gian xử lý sự cố (MTTR)
*   **Ý nghĩa:** Tốc độ phản ứng và khắc phục các sự cố kỹ thuật của đội ngũ bảo trì.
*   **Cách tính:** Trung bình cộng thời gian từ lúc phát sinh sự cố đến lúc sự cố được xác nhận là "Đã khắc phục".
*   **Lưu ý:** Chỉ tính các sự cố có mức độ **Nghiêm trọng (ĐỎ)** gây dừng máy.

---

## 2. Quản lý chuyến tàu (Voyage Management)

Logic quản lý thứ tự ưu tiên và dự báo thời gian hoàn thành.

### 🚢 Hàng đợi & Thứ tự (Priority Queue)
*   **Logic:** Tàu được sắp xếp theo số thứ tự (Lốt). Tàu đến trước làm trước.
*   **Trường hợp Khẩn cấp:** Nếu một tàu được đánh dấu là **KHẨN CẤP**, hệ thống sẽ tự động chèn tàu đó lên đầu hàng đợi và đẩy các tàu bình thường xuống phía sau.
*   **Nhường cẩu:** Khi có tàu Khẩn cấp cập cảng, Quản đốc có thể sử dụng tính năng "Nhường cẩu" để tước quyền sử dụng thiết bị của tàu đang làm hàng và chuyển ngay sang phục vụ tàu Khẩn cấp.

### ⏳ Dự kiến rời cảng (ETD)
Hệ thống sử dụng hai loại dự báo để người vận hành dễ so sánh:

1.  **Dự kiến Lý thuyết:**
    - Tính bằng: `(Tổng khối lượng hàng / Công suất cẩu) + Thời gian làm thủ tục`.
    - *Mục đích:* Dùng để đặt mục tiêu thời gian ban đầu.
2.  **Dự kiến Thực tế (Tự động cập nhật):**
    - Hệ thống dựa trên **Tốc độ làm hàng thực tế** của 1-2 ca làm việc gần nhất để tính thời gian còn lại.
    - Cộng thêm: **Thời gian dừng do sự cố** đang diễn ra và **Thời gian làm thủ tục**.
    - *Mục đích:* Cung cấp thời gian rời cảng chính xác nhất theo đúng thực tế hiện trường.

---

## 3. Nhật ký sự cố & Hiệu suất

Đo lường các yếu tố ảnh hưởng đến tiến độ tàu.

### 🔴 Thời gian dừng (Downtime)
*   **Logic:** Hệ thống chỉ tính Downtime cho một chuyến tàu nếu sự cố xảy ra **trong lúc tàu đang ở cầu cảng** và sự cố đó thuộc mức độ **ĐỎ (Dừng máy hoàn toàn)**.
*   **Tác động:** Downtime sẽ trực tiếp làm kéo dài thời gian rời cảng dự kiến (ETD) và làm giảm chỉ số Hiệu suất vận hành.

### 📈 Năng suất thực tế (NMPH)
*   **Viết tắt của:** Net Material Per Hour (Sản lượng thực trên mỗi giờ máy chạy).
*   **Cách tính:** 
    > `NMPH = Sản lượng nhập / Số giờ làm việc hữu hiệu`
*   **Giờ làm việc hữu hiệu:** Là tổng thời gian thực tế cẩu chạy, đã trừ đi các khoảng thời gian dừng do sự cố hoặc nghỉ ca.

---

## 4. Hệ thống cảnh báo tự động (Notifications)

Cảnh báo được gửi theo thời gian thực để Quản đốc xử lý kịp thời.

| Cảnh báo | Điều kiện kích hoạt | Mức độ |
|----------|----------------------|---------|
| **Trễ giờ cập cảng (ETA)** | Đã quá giờ dự kiến cập cảng mà tàu chưa bắt đầu làm thủ tục. | Cảnh báo |
| **Trễ giờ rời cảng (ETD)** | Tàu đang làm hàng nhưng thời gian hiện tại đã vượt quá giờ dự kiến rời cảng. | Nghiêm trọng |
| **Năng suất thấp** | Tốc độ làm hàng thực tế trung bình thấp hơn **80%** so với công suất thiết kế của cẩu. | Cảnh báo |
| **Bị tước cẩu** | Một tàu đang làm hàng bị hệ thống/người dùng rút cẩu để nhường cho tàu khẩn cấp. | Nghiêm trọng |
| **Lỗi sẵn sàng** | Cố gắng bắt đầu làm hàng khi chưa hoàn thành **Checklist sẵn sàng** (draft, mẫu, thủ tục...). | Cảnh báo |

---

*Tài liệu này được cập nhật tự động dựa trên cấu hình logic hiện tại của hệ thống QLTau.*
