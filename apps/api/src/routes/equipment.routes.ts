import { Router } from 'express';
import { EquipmentController } from '../controllers/equipment.controller';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

router.get('/', EquipmentController.getAll);
router.get('/:id/history', EquipmentController.getHistory);
router.get('/:id/kpi', EquipmentController.getKpi);
router.get('/:id', EquipmentController.getById as any);
router.post('/', authenticate, EquipmentController.create);
router.put('/:id', authenticate, EquipmentController.update);
router.put('/:id/status', authenticate, EquipmentController.updateStatus);
router.delete('/:id', authenticate, EquipmentController.delete);

export default router;
