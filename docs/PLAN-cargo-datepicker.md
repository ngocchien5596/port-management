# Kế hoạch: Nâng cấp DatePicker cho thời gian làm hàng

## 1. Phân tích bối cảnh & Yêu cầu (Context & Requirements)
Người dùng yêu cầu nâng cấp trường "Bắt đầu" và "Kết thúc" trong bảng **Tiến độ làm hàng** (`CargoProgressLogTable.tsx`) từ thẻ `<input type="datetime-local">` mặc định của HTML sang một component **DatePicker** chuyên nghiệp, thân thiện và hỗ trợ đầy đủ chức năng chọn Ngày, Tháng, Giờ, Phút chuẩn xác.

**Tại sao cần nâng cấp?**
- `datetime-local` mặc định của trình duyệt thường có giao diện khác nhau (Chrome khác Safari, iOS khác Windows), thiếu tính đồng bộ và thẩm mỹ.
- Cần một UI đồng nhất, gọn gàng, phù hợp với phong cách thẻ Card và Badge hiện tại của hệ thống.

## 2. Giải pháp kỹ thuật (Technical Solution)

Bởi vì dự án hiện tại không tích hợp sẵn Component DateTime Picker trong thư mục `components/ui`, tôi xin đề xuất giải pháp sau:
Sử dụng thư viện **React Datepicker** (một thư viện phổ biến và nhẹ nhàng) kết hợp với **Date-fns** để xử lý format thời gian.

**Công việc cụ thể (Task Breakdown):**

### Phase 1: Cài đặt thư viện
- Chạy lệnh cài đặt `react-datepicker` và `@types/react-datepicker` trong ứng dụng `web`.
- Mặc định React Datepicker hỗ trợ chọn cả Giờ (Time) rất tốt thông qua Props `showTimeSelect`.

### Phase 2: Refactor `CargoProgressLogTable.tsx`
- **File:** `apps/web/src/app/(app)/voyages/[id]/(components)/CargoProgressLogTable.tsx`
- **Action:**
  - Import `DatePicker` xử lý giao diện từ thư viện.
  - Sửa lại trường nhập liệu (Input field) của cả phần **Thêm mới (Add)** và phần **Chỉnh sửa (Edit)**.
  - Truyền các thuộc tính quan trọng: 
    - `showTimeSelect` (Cho phép chọn giờ).
    - `timeFormat="HH:mm"` (Định dạng 24h).
    - `timeIntervals={15}` (Bước nhảy thời gian là 15 phút, phù hợp với làm hàng).
    - `dateFormat="dd/MM/yyyy HH:mm"` (Hiển thị Chuẩn Việt Nam).
  - Tùy chỉnh CSS `className` cho Input DatePicker trông giống với thẻ `<Input>` hệ thống đang sử dụng (Viền mỏng, Bo góc tròn, focus đổi màu thương hiệu).

## 3. Phân công Agent
- **`@frontend-specialist`**: Triển khai cài đặt thư viện và bổ sung UI Component DatePicker.

## 4. Kiểm tra & Bàn giao (Verification Checklist)
- [ ] Mở tab Thêm Tiến độ làm hàng: Thấy 2 ô Bắt đầu và Kết thúc click vào sẽ hiện ra Popup Lịch (Calendar) chuyên nghiệp.
- [ ] Popup lịch cho phép chọn cả thẻ Ngày và List thời gian (Giờ/Phút).
- [ ] Chọn xong hiển thị đúng định dạng `dd/MM/yyyy HH:mm`.
- [ ] Giao diện Responsive tốt, không bị tràn trên màn hình nhỏ. 
- [ ] Logic xác thực: Giờ kết thúc không được nhỏ hơn giờ Bắt đầu.
