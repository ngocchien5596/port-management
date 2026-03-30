# PLAN: Báo cáo Năng suất & KPI (Option B)

Dự án này sẽ nâng cấp trang Báo cáo Năng suất hiện tại thành một Dashboard đa chiều, bao gồm các thẻ KPI tổng quan và hệ thống phân tích theo 2 góc nhìn (Thiết Bị, Toàn Cảng).

---

## 🏗️ Project Overview

- **Project Type**: WEB (Next.js) + BACKEND (Node.js/Prisma)
- **Primary Goal**: Cung cấp cái nhìn toàn diện về hiệu quả khai thác cảng và thiết bị.

## ✅ Success Criteria
- [ ] 4 Thẻ KPI hiển thị thông tin chính xác.
- [ ] 3 Tab (Voyages, Equipment, Port Trend) hoạt động mượt mà.
- [ ] Biểu đồ phản ánh đúng dữ liệu từ `VoyageProgress`.
- [ ] Nút xuất Excel vẫn hoạt động đúng cho dữ liệu tổng hợp.

## 🛠️ Tech Stack
- **Frontend**: Next.js, Shadcn/UI (Tabs, Card), Lucide Icons.
- **Charts**: Recharts (BarChart, LineChart, ComposedChart).
- **Backend**: Node.js, Prisma ORM.

## 📋 Task Breakdown

### Phase 1: Foundation & Backend (P1 - @backend-specialist) [DONE]
- [x] **Task 1.1**: Cập nhật `ReportService` để tính toán 4 chỉ số KPI chính trong kỳ (StartDate - EndDate).
- [x] **Task 1.2**: Xây dựng logic aggregation cho Tab Thiết bị (Group by Crane).
- [x] **Task 1.3**: Xây dựng logic aggregation cho Tab Toàn Cảng (Group by Date/Time trend).

### Phase 2: UI/UX Refactoring (P2 - @frontend-specialist) [DONE]
- [x] **Task 2.1**: Cài đặt shadcn `tabs` và `card` components.
- [x] **Task 2.2**: Tái cấu trúc `productivity/page.tsx` thành layout 2-Tab.
- [x] **Task 2.3**: Triển khai hàng KPI Cards ở vị trí Top của trang.
- [x] **Task 2.4**: Tích hợp các biểu đồ mới cho 2 Tab chuyên biệt.

## 🏁 Phase X: Verification
- [ ] Kiểm tra logic tính toán trung bình năng suất (NMPH) đảm bảo không bị chia cho 0.
- [ ] Kiểm tra responsive trên màn hình laptop/tablet.
- [ ] Chạy `npx tsc` toàn dự án.
