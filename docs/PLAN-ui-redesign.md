# UI Redesign Project Plan
**Project**: Port Management New
**Objective**: Tối giản, làm sạch giao diện và đồng nhất ngôn ngữ thiết kế (Minimal & Clean) với hệ thống chuẩn của Viettel.

---

## 1. Context Check (Phase -1)
- **Tình trạng hiện tại**: Giao diện Port Management New (Dashboard, LeftMenu, Vessels) đang lạm dụng quá nhiều màu sắc nổi bật (Xanh lá, Xanh dương, Cam, Đỏ, Tím) cho các trạng thái, icon và thẻ nền.
- **Yêu cầu của người dùng**: Đơn giản hoá thiết kế giống dự án Quản lý Suất ăn, và ĐẶC BIỆT chú trọng việc sử dụng hệ màu **Brand của Viettel** (`--vt-primary`, Đỏ Viettel `#E61E23`).

## 2. Agent Assignments
- **`@[frontend-specialist]`**: Chịu trách nhiệm chính trong việc áp dụng hệ thống màu Viettel và refactor component.
- **`@[ui-ux-pro-max]`**: Hỗ trợ quy tắc CSS, padding, margin chuẩn Minimal.

## 3. Task Breakdown

### Phase 1: CSS Variables & Configuration Standardizing
- [ ] Xác minh cấu hình màu trong `apps/web/src/app/globals.css`.
- [ ] Xoá các classes dư thừa từ Tailwind, ánh xạ màu nhấn chính sang `bg-brand` / `text-brand` hoặc `text-vt-primary`.

### Phase 2: Refactor Dashboard (`PortDashboardContent.tsx`)
- [ ] Thay thế các background màu sặc sỡ trên các ô Tàu, Thiết bị (ví dụ `bg-emerald-50`, `bg-amber-50`, logo màu `blue-500`, `indigo-500`) bằng các nền trung lập (`bg-white` hoặc `bg-slate-50`).
- [ ] Chuyển Icon chính trên từng khối Dashboard sang dùng viền/chữ màu Đỏ Viettel.
- [ ] Bảng luồng tàu: Gỡ bỏ `bg-slate-200/30`, chuyển về dạng viền mỏng Minimalist. Badge báo trạng thái cũng chuyển từ nền màu (Solid Backgrounds) sang Bordered Badges với text màu nhạt `slate-500` hoặc dot (chấm) trạng thái.

### Phase 3: Refactor Danh mục Tàu (`vessels/page.tsx`)
- [ ] Tiêu đề trang: Xóa icon lớn không cần thiết, làm tiêu đề đơn giản gọn gàng.
- [ ] Màu sắc bảng (Table): Tối giản thanh tìm kiếm, màu badge "Sức chứa" chuyền về màu Brand Viettel mềm (`vt-primary-soft`) hoặc thuần xám.
- [ ] Hover states: Làm nhạt màu hover của hàng (dùng `hover:bg-slate-50`).

### Phase 4: Refactor Left Menu (`LeftMenu.tsx`)
- [ ] Đảm bảo dải Menu bên trái hoàn toàn trung lập (Trắng/Xám). Item được focus sẽ dùng `bg-vt-primary-soft` và text `vt-primary` để nhận dạng chuẩn hệ phái Viettel.

## 4. Verification Checklist
- Tất cả các trang đều phải thống nhất một gam màu nhấn duy nhất là **Đỏ Viettel**.
- Mất hẳn các nền mờ (bg-opacity/soft) của Emerald, Amber, Indigo trong KPI Dashboard.
- Các bóng (shadow) mạnh được giảm hoặc thiết kế phẳng (flat/bordered design).
- Icon không còn mang nhiều màu khác nhau.
