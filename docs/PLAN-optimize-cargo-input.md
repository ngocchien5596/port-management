# Kế hoạch: Tối ưu Giao diện Nhập Tiến độ Làm hàng

## 1. Phân tích bối cảnh & Yêu cầu (Context & Requirements)
Người dùng đánh giá giao diện của hàng nhập liệu (Input row) trong bảng **Tiến độ làm hàng** (`CargoProgressLogTable.tsx`) đang bị "chật chội" (cramped/cluttered) sau khi bổ sung thêm 2 trường DatePicker (Bắt đầu & Kết thúc).
Yêu cầu: Thiết kế lại độ rộng (width) của các cột/ô nhập liệu sao cho hợp lý. Các ô nhập ít ký tự nên thu hẹp lại để nhường không gian cho các ô cần nhiều chỗ (như Ghi chú hoặc Thời gian).

## 2. Giải pháp kỹ thuật (Technical Solution)

Hiện tại, tất cả các ô có thể đang dùng chia đều không gian `grid-cols-*` hoặc `flex-1` dẫn đến việc phân bổ không cân xứng với nội dung.

**Đề xuất độ rộng (Width Distribution):**
Hàng nhập liệu sẽ sử dụng `grid` với cấu trúc `grid-cols-12` (chuẩn web) để chia tỷ lệ linh hoạt, hoặc dùng flexbox với fixed width/percentage:

*   **Ca làm (Shift):** Ngắn nhất (vd: "Ca 1", "Ca 2"). => Cấp ~10-15% không gian (VD: `w-32` hoặc `col-span-2`).
*   **Bắt đầu (Start):** Cần khoảng trống đủ cho Date + Time (vd: `15/03/2026 14:30`). => Cấp ~20% không gian (VD: `col-span-2` hoặc `col-span-3`).
*   **Kết thúc (End):** Cần khoảng trống như Bắt đầu. => Cấp ~20% không gian (VD: `col-span-2` hoặc `col-span-3`).
*   **Sản lượng (Amount):** Dạng số, tối đa khoảng 6-7 chữ số (vd: `150,000` tấn). => Cấp ~15% không gian (VD: `w-32` hoặc `col-span-2`).
*   **Ghi chú (Notes):** Nhập text tự do, có thể dài (vd: "Cẩu hỏng mất 10 phút..."). => **Cấp tối đa không gian còn lại** (Thâm hụt rộng nhất: `flex-1` hoặc `col-span-3/4`).
*   **Actions (Thêm/Hủy):** Cố định dạng Icon Button. => Phân bổ khoảng `w-24`.

**Công việc cụ thể (Task Breakdown):**

### Phase 1: Áp dụng Layout Grid / Flexbox mới (Table Header & Row)
- **File:** `apps/web/src/app/(app)/voyages/[id]/(components)/CargoProgressLogTable.tsx`
- **Action:**
  - Đồng bộ tỷ lệ CSS độ rộng giữa phần `<TableHead>` (Tiêu đề cột) và `<TableCell>` (Dòng nhập liệu & Dòng dữ liệu).
  - Tinh chỉnh các classes Tailwind CSS cho hợp lý:
    - Ca: `w-[100px]`
    - Bắt đầu & Kết thúc: `w-[160px]`
    - Sản lượng: `w-[120px]`
    - Ghi chú: `min-w-[200px] flex-1`
    - Actions: `w-[100px]`

### Phase 2: Chỉnh lại Spacing & Padding
- Giảm padding ngang (`px`) hoặc thu gọn icon ở các button để tiết kiệm diện tích.
- Tối ưu UI của thẻ `<Input>` khi thu hẹp bề ngang (ví dụ: cắt bớt ellipsis cho Ghi chú nếu quá dài thay vì bị tràn ra ngoài).

## 3. Phân công Agent
- **`@frontend-specialist`**: Triển khai tối ưu lại layout TailwindCSS cho Table và Responsive design.

## 4. Kiểm tra & Bàn giao (Verification Checklist)
- [ ] Giao diện nhập liệu hàng ngang (Inline Edit / Add row) không bị tràn, đè chữ.
- [ ] Ô "Ghi chú" rộng rãi và dễ nhìn hơn, trong khi ô "Ca làm", "Sản lượng" được thu gọn diện tích thừa.
- [ ] Các dòng dữ liệu có sẵn (Data rows) phải gióng thẳng hàng (align) hoàn hảo với các ô Input phía trên.
