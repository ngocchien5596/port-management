import { Router } from 'express';
import { ConfigController } from '../controllers/config.controller';
import { authenticate, authorize } from '../middleware/auth';

const router: Router = Router();

router.get('/server-time', ConfigController.getServerTime);
router.get('/shifts', authenticate, ConfigController.getShiftConfigs);
router.put('/shifts', authenticate, authorize('MANAGER'), ConfigController.updateShiftConfigs);
router.get('/global', authenticate, ConfigController.getGlobalConfigs);
router.put('/global/:key', authenticate, authorize('MANAGER'), ConfigController.updateGlobalConfig);

export default router;
