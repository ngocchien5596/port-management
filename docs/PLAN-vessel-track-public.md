# PLAN-vessel-track-public.md

Xây dựng bộ công cụ tra cứu trạng thái tàu dành cho khách hàng không cân đăng nhập, tích hợp mã QR định danh để truy cập nhanh.

## 🔴 CRITICAL RULES
- **Dữ liệu**: Trang công cộng chỉ hiển thị Thông tin cốt lõi (Core Info) và Nhật ký vận hành (Operation Log), không hiển thị dữ liệu tài chính hoặc nhạy cảm của cảng.
- **Bảo mật**: Tra cứu yêu cầu nhập đúng **Mã hiệu chuyến tàu** (Voyage Code) và **Số điện thoại liên hệ** (ghi nhận trong thông tin chuyến tàu).

## 1. Backend (API)
### [NEW] Endpoint `/api/public/vessel-track`
- **Phương thức**: GET
- **Tham số**: `voyageCode` (string), `phone` (string)
- **Xử lý**: 
  - Truy vấn chuyến tàu dựa trên `voyageCode` và `phone` của khách hàng (đi từ bảng Voyage -> Partner/Contact).
  - Trả về thông tin: 
    - `voyage`: Tên tàu, Cầu bến, Trạng thái (đã chuyển đổi sang ngôn ngữ thân thiện), ETA, ETD.
    - `logs`: Mảng lịch sử nhật ký vận hành (Cargo Progress/Log).
- **Phản hồi**: 200 (Success), 400 (Input error), 404 (Not found).

## 2. Frontend (Public Tracking UI)
### [NEW] Route `/track` (Search Entry)
- **Mục đích**: Trang tìm kiếm ban đầu.
- **Giao diện**: Ô nhập Mã tàu + SĐT.
- **Thiết kế**: Mobile-friendly, tối giản, chuyên nghiệp.

### [NEW] Route `/track/[id]` (Tracking Details)
- **Mục đích**: Trang hiển thị trạng thái tàu sau khi tra cứu thành công hoặc quét QR.
- **Giao diện**:
  - Thông báo trạng thái nổi bật (badge).
  - Biểu đồ tiến độ làm hàng (Progress circular gauge).
  - Lịch sử vận hành (Operation Logs Timeline).

## 3. Frontend (Login Page Integration)
### [MODIFY] Login Page
- **Thêm nút**: Thêm nút **"Tra cứu tàu"** bên cạnh hoặc bên dưới nút "Đăng nhập".
- **Hành động**: Khi nhấn sẽ chuyển sang trang `/track`.
- **Thiết kế**: Sử dụng phong cách khác biệt (ví dụ: `outline button`) để khách hàng dễ phân biệt với chức năng đăng nhập dành cho nhân viên.

## 4. Frontend (Admin - Voyage Details)
### [MODIFY] Voyage Header
- Thêm icon mã QR bên cạnh nút "Chuyển trạng thái".
- Khi Click: Mở `QRCodeModal`.

### [NEW] QRCodeModal
- **Tính năng**: Hiển thị QR Code chứa link tra cứu cho tàu đó.
- **Nút bấm**: 
  - Nút **Tải về** (Lưu dưới dạng ảnh .png).
  - Nút **X** để đóng modal.

## 5. Verification Checklist
- [ ] Nút "Tra cứu tàu" trên màn hình Login dẫn đúng về `/track`.
- [ ] API trả về đúng dữ liệu khi nhập đủ thông tin Voyage Code + Phone.
- [ ] QR Code tạo ra liên kết đúng với Voyage ID tương ứng.
- [ ] Nút tải QR hoạt động trên cả trình duyệt máy tính và di động.
- [ ] Giao diện trang tra cứu hiển thị đẹp mắt (Responsive) trên điện thoại.
