# Kế hoạch: Khắc phục lỗi lặp Thông báo Cảnh báo Trễ giờ Cập/Rời cảng (ETD/ETA)

## 1. Triệu chứng & Nguyên nhân Cốt lõi
- **Triệu chứng**: Hệ thống liên tục tạo ra các bản sao của "Cảnh báo Trễ giờ rời cảng dự kiến (ETD)" và "Cảnh báo Trễ giờ cập cảng (ETA)". Người dùng nhận được cùng một thông báo lặp đi lặp lại cho cùng một chuyến tàu.
- **Nguyên nhân**: Cron job `notification.cron.ts` chạy mỗi 5 phút một lần. Nó truy vấn tất cả các chuyến tàu đang bị trễ giờ. Sau đó, nó gọi hàm `NotificationService.createNotification`. Hàm này cố gắng ngăn chặn spam bằng cách chỉ kiểm tra xem có thông báo nào **CHƯA ĐỌC** (`isRead: false`) của cùng một loại cho chuyến tàu đó hay không. Tuy nhiên, nếu người dùng đã đọc thông báo (`isRead: true`), truy vấn sẽ trả về `null`, và hệ thống tưởng là chưa có cảnh báo, từ đó tạo ra một thông báo hoàn toàn MỚI cho cùng một sự kiện trễ giờ đó. Điều này dẫn đến một vòng lặp vô tận các thông báo mới mỗi 5 phút miễn là người dùng đã trót ấn nút đánh dấu "Đã đọc" và chuyến tàu vẫn chưa được xử lý thay đổi trạng thái.

## 2. Giải pháp Đề xuất
Cập nhật hàm `NotificationService.createNotification` (trong tệp `apps/api/src/services/notification.service.ts`) để xử lý việc trùng lặp thông báo một cách hợp lý và triệt để hơn:
1. **Loại bỏ bộ lọc `isRead: false`** khi kiểm tra xem đã có thông báo cùng loại nào được sinh ra cho chuyến tàu này chưa.
2. **Nếu thông báo cùng loại đã tồn tại (dù đã đọc hay chưa)**:
   - Nếu thông báo đang ở trạng thái `isRead: false` (chưa đọc): Đẩy thời gian `createdAt` lên hiện tại (bump time) để nó lại được ưu tiên nổi lên trên đầu danh sách (giữ nguyên logic vốn có hiện tại).
   - Nếu thông báo đang ở trạng thái `isRead: true` (đã đọc): **KHÔNG CẦN CHẾ TẠO** một thông báo mới và **CŨNG KHÔNG** đẩy thời gian nữa. Chúng ta mặc định rằng người dùng đã tiếp nhận thông tin và tình huống đó đã được ghi nhận. Việc bỏ qua không spam tiếp sẽ giúp trải nghiệm người dùng không bị làm phiền.

## 3. Các File Ảnh Hưởng (Affected Files)
- Trang Service: `apps/api/src/services/notification.service.ts`

## 4. Các Bước Thực Hiện (Task Breakdown)
- [ ] Chỉnh sửa logic trong `NotificationService.createNotification` để tìm kiếm biến `existing` mà không phụ thuộc vào `isRead: false`.
- [ ] Bổ sung đoạn mã xử lý sau khi tìm thấy `existing`:
  ```typescript
  if (existing) {
      if (!existing.isRead) {
          // Chỉ đẩy timestamp lên và bump notification khi người dùng chưa đọc
          const updatedExisting = await prisma.notification.update({ ... });
          emitEvent('new-notification', updatedExisting);
          return updatedExisting;
      } else {
          // Thông báo đã đọc, tức là user đã nắm tình hình. Bỏ qua không báo lại để tránh rác hệ thống.
          return existing; // Hoặc nén xử lý trả về null
      }
  }
  ```
- [ ] Khởi động lại API server sau khi sửa lỗi để áp dụng thay đổi.

## 5. Phân Ký Agent
- **Antigravity Developer Agent**: Sẽ trực tiếp viết mã thay đổi ở trên và biên dịch, xác minh lại tính nhất quán.

## 6. Danh Mục Kiểm Tra (Verification Checklist)
- [ ] Thao tác giả lập đổi giờ tạo ra 1 chuyến tàu bị quá hạn ETD.
- [ ] Nhìn thấy thông báo ETD đầu tiên hiện lên.
- [ ] Ấn đánh dấu là Đã Đọc thông báo đó.
- [ ] Đợi Cron job chạy lại ở chu kỳ 5 phút tiếp theo (hoặc chạy test ngay lập tức bằng API ẩn) và xác nhận rằng hệ thống **KHÔNG CÒN** tự động sinh ra "Cảnh báo Trễ ETD" tương tự đè lên.
- [ ] Cùng lúc, kiểm tra nếu mình KHÔNG BẤM ĐỌC thông báo, thì sau 5 phút nó chỉ tiến hành đổi lại giờ gửi (bump timestamps) thay vì phát sinh ID thông báo mới trong Database.
