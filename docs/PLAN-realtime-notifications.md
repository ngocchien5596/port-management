# PLAN: Chuyển Notification sang Event-Driven + Socket.IO Push

> Chuyển hệ thống thông báo từ **Polling** sang **Event-Driven Push** sử dụng Socket.IO, giữ cron job cho các kịch bản dựa trên thời gian.

## Kiến trúc Hiện tại (Trước)

```
[Cron 5 phút] → Quét DB → Tạo notification
[FE Polling 30s] → GET /notifications → Re-render
```

**Vấn đề:** Chậm trễ lên đến 30 giây, tốn tài nguyên mạng liên tục, không real-time.

## Kiến trúc Mới (Sau)

```
┌─────────────────────────────────────────────────┐
│                    BACKEND                      │
│                                                 │
│  [Event-Driven Triggers]      [Cron Job 5 phút] │
│  ├─ addProgress() ───────┐   ├─ OVERDUE_ETA    │
│  ├─ updateStatus()───────┤   └─ OVERDUE_ETD    │
│  └─ emergencyOverride()──┤         │            │
│                          ▼         ▼            │
│            NotificationService.create()         │
│                          │                      │
│                   emitEvent('new-notification') │
│                          │                      │
└──────────────────────────│──────────────────────┘
                           │ Socket.IO
                           ▼
┌─────────────────────────────────────────────────┐
│                   FRONTEND                      │
│                                                 │
│  useSocket('new-notification') ──► setState()   │
│  ├─ Hiện badge đỏ trên chuông                  │
│  ├─ Append vào dropdown                        │
│  └─ BỎ polling 30 giây                         │
└─────────────────────────────────────────────────┘
```

---

## Ma trận Kịch bản vs Trigger

| # | Kịch bản | Trigger Type | Điểm hook code |
|---|----------|--------------|----------------|
| 1 | **Overdue ETA** (Tàu trễ cập bến) | ⏱️ Cron | `notification.cron.ts` — **giữ nguyên** |
| 2 | **Low Productivity** (Hụt năng suất) | ⚡ Event | `VoyageService.recalculateProgressAndEtd()` — **đã có** |
| 3 | **Overdue ETD** (Trễ giờ rời bến) | ⏱️ Cron | `notification.cron.ts` — **giữ nguyên** |
| 4 | **Emergency Override** (Tước cẩu khẩn) | ⚡ Event | `VoyageService.updateStatus('TAM_DUNG')` — **cần thêm** |
| 5 | **Pre-op Check** (Thiếu checklist) | ⚡ Event | `VoyageService.updateStatus('LAM_HANG')` — **đã có** |

---

## Proposed Changes

### Component 1: Backend — NotificationService (Core)

#### [MODIFY] [notification.service.ts](file:///g:/Source-code/port-management-new/apps/api/src/services/notification.service.ts)

Sau khi `prisma.notification.create()` thành công, gọi `emitEvent('new-notification', notification)` để push real-time cho FE.

```diff
+ import { emitEvent } from '../lib/socket';

  static async createNotification(data: {...}) {
      // ... dedup check ...
-     return prisma.notification.create({ data: {...} });
+     const notification = await prisma.notification.create({
+         data: {...},
+         include: { voyage: { select: { voyageCode: true, vessel: { select: { name: true } } } } }
+     });
+     // Push real-time to all connected clients
+     emitEvent('new-notification', notification);
+     return notification;
  }
```

> [!IMPORTANT]
> Đây là thay đổi duy nhất ở core — mọi nơi gọi `createNotification()` (cả cron lẫn event-driven) đều tự động được push real-time.

---

### Component 2: Backend — Cron Job

#### [MODIFY] [notification.cron.ts](file:///g:/Source-code/port-management-new/apps/api/src/jobs/notification.cron.ts)

**Giữ nguyên** cron job cho Kịch bản 1 (OVERDUE_ETA) và 3 (OVERDUE_ETD). Không cần sửa vì `createNotification()` đã tự emit socket.

---

### Component 3: Backend — Event-Driven Triggers

#### [MODIFY] [voyage.service.ts](file:///g:/Source-code/port-management-new/apps/api/src/services/voyage.service.ts)

**Kịch bản 4 — Emergency Override:** Thêm trigger notification khi một tàu bị chuyển sang `TAM_DUNG` do tước cẩu. Kiểm tra trong `updateStatus()`, khi `status === 'TAM_DUNG'` và có `reason` chứa keyword liên quan đến emergency/tước cẩu.

```diff
  // Trong updateStatus(), sau khi update DB thành công:
+ if (status === 'TAM_DUNG') {
+     await NotificationService.createNotification({
+         type: 'EMERGENCY_OVERRIDE',
+         title: 'Tước cẩu khẩn cấp',
+         message: `Chuyến tàu ${currentVoyage.vessel?.name || currentVoyage.voyageCode} bị tạm dừng do tước cẩu khẩn cấp.${reason ? ` Lý do: ${reason}` : ''}`,
+         severity: 'CRITICAL',
+         voyageId: id,
+     });
+ }
```

Kịch bản 2 (LOW_PRODUCTIVITY) và 5 (READINESS_ERROR) đã có sẵn trong code — không cần thêm.

---

### Component 4: Frontend — Socket.IO Client Hook

#### [NEW] [useSocket.ts](file:///g:/Source-code/port-management-new/apps/web/src/lib/hooks/useSocket.ts)

Tạo custom hook kết nối Socket.IO tới BE:

```typescript
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function useSocket(event: string, callback: (data: any) => void) {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
        socketRef.current.on(event, callback);

        return () => {
            socketRef.current?.off(event, callback);
            socketRef.current?.disconnect();
        };
    }, [event]);
}
```

---

### Component 5: Frontend — NotificationCenter Refactor

#### [MODIFY] [NotificationCenter.tsx](file:///g:/Source-code/port-management-new/apps/web/src/components/layout/NotificationCenter.tsx)

Thay polling 30s bằng Socket.IO listener:

```diff
+ import { useSocket } from '@/lib/hooks/useSocket';

  // BỎ: setInterval(fetchNotifications, 30000)
  // THÊM:
+ useSocket('new-notification', (notification: Notification) => {
+     setNotifications(prev => [notification, ...prev]);
+     setUnreadCount(prev => prev + 1);
+ });
```

Vẫn giữ `fetchNotifications()` lần đầu khi mount component để load notifications đã tồn tại.

---

## Tóm tắt File Changes

| File | Action | Mô tả |
|------|--------|-------|
| `notification.service.ts` | MODIFY | Thêm `emitEvent` sau create |
| `notification.cron.ts` | KHÔNG SỬA | Cron giữ nguyên, tự được push qua service |
| `voyage.service.ts` | MODIFY | Thêm trigger Kịch bản 4 (TAM_DUNG) |
| `useSocket.ts` | NEW | Custom hook Socket.IO client |
| `NotificationCenter.tsx` | MODIFY | Bỏ polling, dùng useSocket |

---

## Verification Plan

### Manual Testing (trong browser)

1. **Mở 2 tab browser** — cả 2 đều đăng nhập vào Dashboard
2. **Test Kịch bản 2 (Low Productivity):** Vào chi tiết 1 chuyến tàu đang LAM_HANG → nhập sản lượng thấp (ví dụ 1 tấn / 1 giờ) → kiểm tra chuông báo ở **cả 2 tab** xuất hiện notification ngay lập tức, không cần chờ 30 giây
3. **Test Kịch bản 4 (Emergency Override):** Tạm dừng một tàu đang LAM_HANG → kiểm tra notification "Tước cẩu khẩn cấp" xuất hiện real-time
4. **Test Kịch bản 5 (Readiness):** Thử chuyển status sang LAM_HANG khi chưa pass checklist → kiểm tra notification xuất hiện
5. **Test Cron (Kịch bản 1, 3):** Chờ 5 phút hoặc trigger cron thủ công → kiểm tra notification vẫn push qua socket
