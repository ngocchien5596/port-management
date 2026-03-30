import { Router } from 'express';
import { VoyageController } from '../controllers/voyage.controller';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

router.get('/', VoyageController.getAll);
router.post('/', authenticate, VoyageController.create);
router.post('/reorder-queue', authenticate, VoyageController.reorderQueue);
router.post('/override-equipment', authenticate, VoyageController.overrideEquipment);

// Progress routes (Specific)
router.post('/:id/progress', authenticate, VoyageController.addProgress);
router.put('/:id/progress/:progressId', authenticate, VoyageController.updateProgress as any);
router.delete('/:id/progress/:progressId', authenticate, VoyageController.deleteProgress as any);

// ID-based routes (General)
router.get('/:id', VoyageController.getById as any);
router.put('/:id', authenticate, VoyageController.update as any);
router.delete('/:id', authenticate, VoyageController.delete as any);
router.patch('/:id/status', authenticate, VoyageController.updateStatus);
router.patch('/:id/readiness', authenticate, VoyageController.updateReadiness);
router.post('/:id/incidents', authenticate, VoyageController.addIncident);

export default router;
