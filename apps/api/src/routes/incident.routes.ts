import { Router } from 'express';
import { IncidentController } from '../controllers/incident.controller';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

router.get('/voyage/:voyageId', IncidentController.getActiveForVoyage);
router.get('/', IncidentController.getAll);
router.post('/', authenticate, IncidentController.create);
router.patch('/:id/resolve', authenticate, IncidentController.resolve);
router.delete('/:id', authenticate, IncidentController.delete);

export default router;
