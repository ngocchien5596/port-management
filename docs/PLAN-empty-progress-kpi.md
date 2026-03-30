# Kế hoạch: Xử lý hiển thị KPI khi chưa có bản ghi sản lượng

## 1. Phân tích bối cảnh & Đề xuất (Context & Solutions)
Hiện tại, khi một chuyến tàu mới được tạo và chưa có bất kỳ bản ghi sản lượng nào (mảng `data` rỗng hoặc chỉ có 1 điểm khởi tạo gốc), các công thức tính hiệu suất và độ lệch dễ ra kết quả méo mó hoặc vô nghĩa (như báo Vượt tiến độ hoặc `512%` từ một mức trung bình bị nhiễu do chia cho số 0).

- **Tag Trạng thái Tiến độ (Progress Status Tag):**
  - **Vấn đề:** Đang tự động hiển thị "Vượt tiến độ", "Chậm tiến độ", hoặc "Đúng tiến độ", kể cả lúc số liệu hoàn toàn trống không.
  - **Đề xuất:** Khi chưa có bản ghi sản lượng thực tế (hoặc sản lượng 0), tag trạng thái nên đổi thành **"Chưa bắt đầu"** (Not Started) hoặc **"Chờ cập nhật"** (Awaiting Update). 
  - **Styling:** Dùng mảng màu xám trung tính (Nền `bg-slate-100`, Chữ `text-slate-600`) kèm icon Đồng hồ cát (`⏳`) hoặc Tròn xám (`CircleDashed`). Nó báo hiệu với người dùng rằng hệ thống đang ở trạng thái ngủ (Idle), đợi số liệu thực tế được điền.

## 2. Các thay đổi dự kiến (Task Breakdown)

### Phase 1: Tạo Logic Kiểm tra dữ liệu (Data Validity Check)
- **File:** `apps/web/src/app/(app)/voyages/[id]/(components)/VoyagePerformanceChart.tsx`
- **Action:** Kiểm tra điều kiện để phân định trạng thái `hasActualData` (có dữ liệu thực tế), ví dụ: `actualCumulative > 0` từ phần tử cuối cùng của nhật ký. 

### Phase 2: Cập nhật Tag Trạng thái (Progress Status Tag)
- **File:** `VoyagePerformanceChart.tsx`
- **Action:** 
  - Can thiệp vào hàm hoặc logic tính toán khối `<Badge>`.
  - Nếu `!hasActualData`, thì màu sắc khối chuyển sang `Xám` (`slate`), nội dung hiển thị chữ **"Chờ cập nhật"**.

### Phase 3: Cập nhật 3 Thẻ KPI (The 3 Metric Cards)
- **File:** `VoyagePerformanceChart.tsx`
- **Action:**
  - **Thẻ Hiệu suất (Efficiency):** Nếu `!hasActualData`, thay vì hiện `{efficiency.toFixed(1)}%`, hiển thị `N/A`.
  - **Thẻ Lệch sản lượng (Volume Gap):** Thay vì hiện `... T nhiều hơn/ít hơn`, hiển thị `N/A`.
  - **Thẻ Lệch thời gian (Time Delta):** Thay vì hiện `... giờ sớm/muộn`, thay bằng icon trung tính và báo `N/A`. 
  - Giữ lại tiêu đề thẻ, chỉ biến động dữ liệu to thành `N/A` giúp duy trì tính liền mạch của bố cục layout Dashboard.

## 3. Phân công Agent (Agent Assignments)
- **`@frontend-specialist`**: Thực thi toàn bộ thay đổi UI/UX đối với React component `VoyagePerformanceChart.tsx`.

## 4. Kiểm tra & Bàn giao (Verification Checklist)
- [ ] Chuyến tàu vừa tạo, lúc khởi tạo chưa thêm dòng sản lượng nào: Thấy giao diện hiển thị `N/A` rõ ràng ở 3 thẻ con.
- [ ] Ở bên góc, Tag trạng thái hiển thị: "Chờ cập nhật" nền xám (không nhảy đỏ/xanh lá).
- [ ] Chuyến tàu sau khi thêm 1 phiếu sản lượng đầu tiên (VD: Nhập 100 tấn): Lập tức tự đổi sang giao diện chỉ số thực, báo đỏ hoặc xanh lá dựa vào Công suất kỳ vọng.
- [ ] Nhìn màu UI không bị chói hoặc hỏng layout của 3 ô KPI.
