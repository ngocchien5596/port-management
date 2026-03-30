import { Router } from 'express';
import { ConfigController } from '../controllers/config.controller';

const router: Router = Router();

router.get('/server-time', ConfigController.getServerTime);
router.get('/shifts', ConfigController.getShiftConfigs);
router.put('/shifts', ConfigController.updateShiftConfigs);
router.get('/global', ConfigController.getGlobalConfigs);
router.put('/global/:key', ConfigController.updateGlobalConfig);

export default router;
