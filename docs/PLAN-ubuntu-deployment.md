# Kế hoạch dự án: Triển khai Cloud Ubuntu (Docker + Postgres cục bộ)

**Mục tiêu**: Triển khai ứng dụng Quản lý cảng (Port Management) lên Server Cloud Ubuntu riêng biệt, sử dụng Docker cho các container ứng dụng và cài đặt PostgreSQL trực tiếp trên máy chủ để lưu trữ dữ liệu.

---

## 1. Kiểm tra bối cảnh (Giai đoạn -1)
- **Công nghệ**: Next.js (Frontend), Node.js (API/Backend), Prisma ORM, PNPM Monorepo.
- **Môi trường Server**: Ubuntu đã cài đặt sẵn Docker.
- **Chiến lược hạ tầng**: 
    - **Cơ sở dữ liệu**: PostgreSQL cài đặt trực tiếp trên host Ubuntu.
    - **Ứng dụng**: Đóng gói container qua Docker (các container Web và API).
    - **Reverse Proxy**: Nginx (cài đặt trên host) để quản lý SSL và điều hướng tên miền.
- **Bảo mật**: Đã xác minh quyền truy cập SSH, tên miền có sẵn.

---

## 2. Phân công Agent
- **`@[backend-specialist]`**: Tập trung vào việc Docker hóa API, cấu hình migrate Prisma môi trường production và các biến môi trường phía server.
- **`@[frontend-specialist]`**: Tập trung vào việc Docker hóa ứng dụng Next.js và đảm bảo cấu hình URL API chính xác cho production.
- **`@[orchestrator]`**: Hướng dẫn người dùng thực hiện các lệnh terminal từng bước trên server Ubuntu.

---

## 3. Phân rã nhiệm vụ

### Giai đoạn 1: Chuẩn bị Server (Postgres & Nginx)
- [ ] Cài đặt và cấu hình PostgreSQL trên máy chủ Ubuntu.
- [ ] Tạo cơ sở dữ liệu và người dùng production với các quyền phù hợp.
- [ ] Cài đặt Nginx và chuẩn bị cấu hình cho tên miền.
- [ ] Cấu hình `ufw` (tường lửa) để cho phép các cổng 80, 443 và 22.

### Giai đoạn 2: Đóng gói ứng dụng (Docker)
- [ ] Tạo `Dockerfile` cho API/Backend.
- [ ] Tạo `Dockerfile` cho Web/Frontend.
- [ ] Tạo `docker-compose.prod.yml` để điều phối các dịch vụ (ngoại trừ DB).
- [ ] Đảm bảo thêm logic `healthcheck` vào các container.

### Giai đoạn 3: Cấu hình môi trường
- [ ] Chuẩn bị các file `.env` production cho cả API và Web.
- [ ] Cấu hình host PostgreSQL là `host.docker.internal` (để cho phép Docker kết nối với DB trên máy chủ).
- [ ] Thiết lập `NEXT_PUBLIC_API_URL` trỏ về tên miền production.

### Giai đoạn 4: CI/CD & Thực thi triển khai
- [ ] Chuyển mã nguồn lên server (Git Clone hoặc SCP).
- [ ] Chạy lệnh `docker-compose up -d --build`.
- [ ] Thực thi migrate Prisma trong môi trường production.
- [ ] Thiết lập chứng chỉ SSL bằng Let's Encrypt (Certbot).

---

## 4. Danh sách kiểm tra xác minh
- [ ] Xác minh endpoint kiểm tra sức khỏe của API trả về 200 qua tên miền.
- [ ] Xác minh cổng Web tải chính xác và có thể đăng nhập.
- [ ] Xác minh dữ liệu PostgreSQL vẫn tồn tại sau khi khởi động lại container.
- [ ] Xác minh chứng chỉ SSL đang hoạt động và tự động gia hạn.
- [ ] Xác minh log của Nginx hiển thị đúng định tuyến lưu lượng.

---

## Các bước tiếp theo:
- Xem lại kế hoạch tại [PLAN-ubuntu-deployment.md](file:///g:/Source-code/port-management-new/docs/PLAN-ubuntu-deployment.md)
- Sau khi được phê duyệt, chúng ta sẽ bắt đầu Giai đoạn 1 (Cấu hình Postgres & Docker).
