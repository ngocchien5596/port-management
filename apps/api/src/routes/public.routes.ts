import { Router } from 'express';
import { PublicController } from '../controllers/public.controller';

const router: Router = Router();

router.get('/voyage-track', PublicController.getVoyageStatus);

export default router;
