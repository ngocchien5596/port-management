# PLAN-single-working-vessel

## Goal
Ngăn chặn việc có nhiều hơn 1 chuyến tàu ở trạng thái LÀM HÀNG (đang hoạt động) cùng một lúc (trên cùng một cầu bến - Lane / Cẩu - Equipment).

## Phase -1: Context Check
- Hiện tại hệ thống cho phép kéo thả/chuyển trạng thái nhiều tàu sang "LAM_HANG", dẫn đến việc số liệu có thể bị trùng lặp thời gian hoặc gây rối rắm trên báo cáo.
- Cần có cơ chế chặn (Validation) ở cả Backend (API `updateStatus`) và Frontend (giao diện kéo thả & modal chuyển trạng thái).

## Phase 0: Socratic Gate (Đã chốt)
1. **Phạm vi chặn là theo Cầu bến (Lane)**: Do hạn chế của bến, chỉ có 1 tàu làm hàng 1 lúc thôi. Kể cả luồng có 2 thiết bị thì 1 lúc cũng chỉ có 1 thiết bị hoạt động cho 1 tàu.
2. **Quyền ghi đè:** Chặn cứng (Hard Block).
   - Nếu tàu định kéo vào là tàu **Thường (NORMAL)**: Chỉ hiện cảnh báo "Đã có tàu đang làm hàng Bến này. Vui lòng cho Tạm Dừng tàu đó trước."
   - Nếu tàu định kéo vào là tàu **Khẩn cấp (EMERGENCY)**: Hiện cảnh báo "Đã có tàu đang làm hàng Bến này. Vui lòng dùng tính năng Nhường Cẩu Khẩn Cấp để lấy bến."

## Phase 1: Proposed Architecture & Implementation
### Backend (`voyage.service.ts`)
- Mở rộng hàm `updateStatus`:
  - Trạng thái truyền lên là `LAM_HANG`.
  - Tìm xem trên `laneId` của tàu này có `Voyage` nào khác (khác `id`) đang có `status === 'LAM_HANG'` không.
  - Nếu CÓ -> Kiểm tra `priority` của chuyến tàu đang được update:
    - Nếu là `EMERGENCY`: Ném lỗi `BadRequestException` với message: `Đã có tàu đang làm hàng tại bến này. Vui lòng sử dụng tính năng Nhường Cẩu Khẩn Cấp.`
    - Nếu là `NORMAL`: Ném lỗi `BadRequestException` với message: `Đã có tàu đang làm hàng tại bến này. Vui lòng Tạm Dừng tàu đó trước khi cho tàu mới vào làm hàng.`

### Frontend
- Tại `StatusTransitionModal.tsx` và `PortDashboardContent.tsx` (Drag & Drop):
  - Khi API trả về lỗi giới hạn này, hiển thị lỗi qua `toast.error` kèm theo hướng dẫn xử lý rõ ràng.
  - Giao diện kéo thả sẽ rollback (chạy lại về cột cũ) nhờ React Query bắt lỗi.
  - Người dùng khi đọc lỗi sẽ biết mình cần thao tác chuyển Tàu đang chiếm bến sang TẠM DỪNG, hoặc nếu là tàu Khẩn cấp thì dùng chức năng Nhường cẩu trực tiếp trên giao diện chứ không thể kéo thả thủ công hay xác nhận Modal.

## Agent Assignments
- `@[backend-specialist]`: Cập nhật logic API `updateStatus` trong `voyage.service.ts` để truy vấn và chặn.
- `@[frontend-specialist]`: Chăm chút UI/Toast để báo lỗi đẹp mắt, nội dung hướng dẫn tường minh.

## Verification Checklist
- [ ] Kéo chuyến Tàu A từ Đang Chờ sang Làm Hàng -> OK.
- [ ] Kéo tiếp chuyến Tàu B (cùng Lane) từ Đang Chờ sang Làm Hàng -> Lỗi Toast (Chặn cứng, hiện hướng dẫn).
- [ ] Đổi trạng thái từ Modal của Tàu B sang Làm Hàng -> Lỗi Toast (Chặn cứng, hiện hướng dẫn).
- [ ] Chuyển Tàu A sang Tạm Dừng -> Chuyển Tàu B sang Làm Hàng -> OK.
