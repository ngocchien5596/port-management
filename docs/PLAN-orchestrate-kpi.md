# Kế hoạch & Báo cáo Orchestration: Nâng cấp Công thức KPIs Hiệu suất Cảng biển

## 🎼 Orchestration Report

### 1. Phân tích bài toán
**Vấn đề hiện tại:** Công thức "Hiệu suất = Thực tế / Lý thuyết" hiện đang bị giới hạn (cap) bởi lệnh `Math.min(Tổng sản lượng, ...)`. Do đó, khi làm hàng xong, Thực tế = Tổng sản lượng, và Lý thuyết cũng chạm mức Tổng sản lượng dẫn đến kết quả luôn là 100% một cách ảo tưởng, dù tàu làm chậm hay nhanh.
**Mục tiêu:** Xây dựng hệ thống KPIs chuẩn theo ngành khai thác cảng chuyên dụng để đánh giá đúng chất lượng khai thác.

### 2. Các Agents tham gia (Phase 1: Planning)

| # | Agent | Focus Area | Status |
|---|-------|------------|--------|
| 1 | `domain-expert` | Nghiên cứu đo lường hàng hải (GMPH, NMPH) | ✅ |
| 2 | `backend-specialist` | Chỉnh sửa logic `voyage.service.ts` | ✅ |
| 3 | `frontend-specialist` | Thiết kế lại UI hiển thị thông số KPIs | ✅ |

---

### 3. Đề xuất Công thức Tối ưu (Từ `domain-expert`)

Dựa trên chuẩn thông lệ Cảng biển, chúng tôi đề xuất 3 chỉ số sau để làm mới giao diện và biểu đồ hiện tại:

1. **Hiệu suất Thiết bị (Equipment Operating Efficiency - EOE)** *(thay thế cho Tỷ lệ % hiện tại)*
   - **Tác dụng:** Đánh giá xem thiết bị làm việc được bao nhiêu % công suất thiết kế trong thời gian nó chạy thực.
   - **Công thức:** `(Tổng khối lượng làm được) / (Tổng giờ đã chạy * Công suất thiết bị)` * 100%
   - **Lợi ích:** Không bao giờ bị khóa ở 100%. Nếu ca đó nhập 90 tấn, cẩu công suất 100 tấn/h, làm trong 1h thì hiệu suất luôn là **90%**. Việc làm xong tàu cũng sẽ giữ mức **90%** này chứ không nhảy lên 100%.

2. **Công suất Tịnh (Net Productivity / Net Moves Per Hour - NMPH)**
   - **Tác dụng:** Tốc độ làm hàng thực tế trên giờ.
   - **Công thức:** `Tổng sản lượng / Tổng giờ làm hàng thực tế (có trừ giờ nghỉ)` = Tấn/giờ.
   
3. **Tiến độ hoàn thành chuyến (Completion Rate)**
   - **Tác dụng:** Đơn giản là tỷ lệ khối lượng hợp đồng đã xong.
   - **Công thức:** `Tổng sản lượng đạt được / Tổng khối lượng chuyến`. Đây mới là thứ sẽ về 100% khi xong tàu.

---

### 4. Phương án Triển khai (Phase 2 - Implementation)

#### 🛠️ Chỉnh sửa Backend API (`voyage.service.ts`)
1. **Bỏ giới hạn Sản lượng Lý thuyết:** Xóa hàm `Math.min(totalVolume, ...)` với đường lý thuyết trong dữ liệu của `performanceTrendData`. Cứ chạy 1 giờ, lý thuyết phải cộng dồn thêm bằng Định Mức (vd 100 tấn). Nếu làm thực tế quá chậm, Mốc lý thuyết sẽ vụt thẳng lên cao bỏ xa Mốc thực tế qua thời gian.
2. **Thêm Metadata KPI:** Cung cấp API trả thẳng `equipmentEfficiency` (%) và `netProductivity` (tấn/giờ) của toàn chuyến.

#### 🎨 Thiết kế Frontend UI (`CargoProgressLogTable` & `VoyagePerformanceChart`)
1. Thay **3 thẻ (Cards) Header hiện tại** bằng:
   - Thẻ 1: Khối lượng (vd: 190 / 200 Tấn) -> Tiến độ 95%
   - Thẻ 2: Công suất thực tế (vd: 95 Tấn/giờ)
   - Thẻ 3: Hiệu suất thiết bị (vd: 95% - Đỏ nếu < 100%)
2. **Biểu đồ Line:** Đường Lý thuyết (Đứt nét) giờ được giải phóng tự do. Nhìn chênh lệch (Gap) giữa đường Xanh và đường Nét đứt, sếp/quản lý sẽ biết các ca đang làm việc bù đắp tốt hay kém, chứ không chập vào nhau ở đỉnh 100% cuối tàu nữa.

---
