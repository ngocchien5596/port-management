import { Router } from 'express';
import { PublicController } from '../controllers/public.controller';

const router: Router = Router();

router.get('/voyage-track', PublicController.searchVoyage);
router.get('/voyage-track/:id', PublicController.getVoyageDetail);

export default router;
