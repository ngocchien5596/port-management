import { Router } from 'express';
import { VesselController } from '../controllers/vessel.controller';

const router: Router = Router();

router.get('/', VesselController.getAll);
router.post('/', VesselController.create);
router.put('/:id', VesselController.update);
router.patch('/:id', VesselController.update);
router.delete('/:id', VesselController.delete);

export default router;
