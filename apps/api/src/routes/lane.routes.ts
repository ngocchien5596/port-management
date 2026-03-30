import { Router } from 'express';
import { LaneController } from '../controllers/lane.controller';

const router: Router = Router();

router.get('/', LaneController.getAll);
router.post('/suggest', LaneController.suggest);
router.post('/', LaneController.create);
router.put('/:id', LaneController.update);
router.delete('/:id', LaneController.delete);

export default router;
