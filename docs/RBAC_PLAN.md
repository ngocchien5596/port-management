# RBAC Implementation Plan (Port Management)

## 🎼 Orchestration Mode: Phase 1 (Planning)

### 1. Phân tích Hiện trạng
- Hệ thống đã chuyển đổi sang 2 enum: `MANAGER` và `STAFF`.
- Các API hiện tại đang sử dụng `authenticate` nhưng thiếu `authorize(role)` cho các thao tác ghi dữ liệu danh mục.
- UI chưa ẩn/hiện các nút điều khiển dựa trên Role.

### 2. Ma trận Phân quyền Đề xuất

| Module | Chức năng | STAFF | MANAGER |
| :--- | :--- | :---: | :---: |
| **Accounts** | View/Create/Update/Delete | ❌ | ✅ |
| **Vessels/Products/Lanes** | View | ✅ | ✅ |
| | Create/Update/Delete | ❌ | ✅ |
| **Voyages** | View/Create/Update Progress | ✅ | ✅ |
| | Delete/Override/Reorder | ❌ | ✅ |
| **Incidents** | View/Report | ✅ | ✅ |
| | Delete/Resolve | ❌ | ✅ |
| **System Config** | View | ✅ | ✅ |
| | Update | ❌ | ✅ |

### 3. Các bước triển khai (Phase 2)

#### Backend
1.  **`backend-specialist`**: Cập nhật `vessel.routes.ts`, `product.routes.ts`, `lane.routes.ts`, `config.routes.ts` để thêm middleware `authorize('MANAGER')` cho các phương thức POST, PUT, DELETE.
2.  **`backend-specialist`**: Cập nhật `voyage.routes.ts` để chặn `delete`, `reorder-queue`, `override-equipment` đối với STAFF.

#### Frontend
1.  **`frontend-specialist`**: Cập nhật Component Header/LeftMenu (Đã xong một phần, cần rà soát lại).
2.  **`frontend-specialist`**: Cập nhật các bảng Vessel, Voyage, Incident để ẩn nút "Sửa/Xóa" nếu role không phải MANAGER.
3.  **`security-auditor`**: Kiểm tra chéo (Cross-check) các route API để đảm bảo không bỏ sót lỗ hổng.

### 4. Câu hỏi cho User
1. Bạn có đồng ý với việc cho phép **STAFF** được quyền **Tạo mới Chuyến tàu (Voyage)** và **Cập nhật tiến độ** không? (Vì đây là nghiệp vụ hàng ngày của nhân viên ngoài cảng).
2. Quyền **Xóa Sự cố (Incident)**: Hiện tại tôi đang để chỉ Quản lý mới được xóa. Bạn có muốn Nhân viên được xóa sự cố do chính họ tạo không?
