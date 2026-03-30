import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

// Apply auth middleware if your app uses it
router.use(authenticate);

router.get('/', NotificationController.getNotifications);
router.put('/mark-all-read', NotificationController.markAllAsRead);
router.put('/:id/read', NotificationController.markAsRead);

export default router;
