# Tóm tắt Yêu cầu (Context Check)
Người dùng muốn chỉnh sửa trang Chi tiết Thiết bị Cẩu (`/config/equipment/[id]`). Cụ thể:
1. Chuyển form sửa thông tin thành dạng Inline Edit (các trường mở sẵn để nhập liệu), có thêm nút "Hủy bỏ" và "Lưu thay đổi" nằm ở cuối trang giống như trang Chi tiết Tài khoản.
2. Thay đổi bố cục (Layout): Phần "Lịch sử đổi trạng thái" chuyển xuống phía dưới, và phần "Thông tin thiết bị" hiển thị phía trên.

# Socratic Gate (Phase 0)
- Mục đích: Nâng cao trải nghiệm người dùng, giúp thao tác sửa chữa nhanh hơn và bố cục dễ nhìn hơn trên tất cả kích thước màn hình.
- Đối tượng sử dụng: Quản trị viên hệ thống hoặc người quản lý thiết bị.
- Rủi ro/Edge cases: Nếu người dùng thay đổi dữ liệu mà vô tình quên bấm "Lưu thay đổi" rồi chuyển trang, chưa có logic cảnh báo (hiện tại sẽ bỏ qua, có thể làm sau nếu cần).

# Kế hoạch Triển khai (Phase 1 - Task Breakdown)

## 1. Thay đổi Layout
- Trong `apps/web/src/app/(app)/config/equipment/[id]/page.tsx`, thay đổi `grid-cols-1 lg:grid-cols-3` thành dạng xếp luồng (stack) từ trên xuống dưới.
- Bố cục theo thứ tự: 
  - Header (Tên cẩu, trạng thái, nút Cập nhật trạng thái thủ công). (Lưu ý: nút Edit hiện tại sẽ bỏ đi vì form đã mở sẵn).
  - Khối **Thông tin thiết bị (Form chỉnh sửa)**.
  - Khối **Lịch sử đổi trạng thái**.

## 2. Nâng cấp Form "Inline Edit"
- Thay thế card "Thông số thiết bị" hiện tại bằng một thẻ `<form>` có viền/background đẹp.
- Biến các thông tin "Công suất", "Luồng gán" thành thẻ `<Input>` và `<select>` giống hệt modal bên danh sách (hoặc layout edit của accounts).
- Danh sách "Hàng nhập" và "Hàng xuất" chuyển thành danh sách dạng nút chọn nhiều (selectable chips) hiển thị sẵn trạng thái tích xanh/trắng.
- Thêm **Divider** ở cuối Form, và thêm 2 nút **Hủy bỏ** và **Lưu thay đổi** ở phía dưới cùng form.

## 3. Cập nhật State & Hooks
- Khởi tạo giá trị ban đầu cho form trong `useEffect` khi có dữ liệu `equipment` lần đầu (để tránh mất dữ liệu nếu nhập nửa chừng).
- Hàm `handleUpdate` sẽ xử lý gọi mutation `updateMutation`, hiện toast thành công và có thể reload. 
- Hàm Hủy bỏ (`handleCancel`) sẽ reset formData về lại giá trị gốc ban đầu của thiết bị.

# Xác minh (Verification Checklist)
- [ ] Bố cục giao diện xếp từ trên xuống: Title -> Form Thông tin -> Lịch sử.
- [ ] Form hiển thị mặc định bằng chế độ edit (Input, Select, Toggle Hàng hóa).
- [ ] Xóa thành phần Modal cũ dư thừa.
- [ ] Chỉnh sửa một vài tham số và bấm "Lưu thay đổi", trang báo thành công và dữ liệu được cập nhật lại vào API.
- [ ] Thay đổi thông số và bấm "Hủy bỏ", form khôi phục lại giá trị gốc lúc ban đầu.
