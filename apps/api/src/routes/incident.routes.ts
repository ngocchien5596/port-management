import { Router } from 'express';
import { IncidentController } from '../controllers/incident.controller';

const router: Router = Router();

router.get('/voyage/:voyageId', IncidentController.getActiveForVoyage);
router.get('/', IncidentController.getAll);
router.post('/', IncidentController.create);
router.patch('/:id/resolve', IncidentController.resolve);
router.delete('/:id', IncidentController.delete);

export default router;
