import { Router } from 'express';
import vesselRoutes from './vessel.routes';
import publicRoutes from './public.routes';
import productRoutes from './product.routes';
import voyageRoutes from './voyage.routes';
import reportRoutes from './report.routes';
import equipmentRoutes from './equipment.routes';
import laneRoutes from './lane.routes';
import configRoutes from './config.routes';
import incidentRoutes from './incident.routes';
import authRoutes from './auth';
import accountRoutes from './accounts';
import notificationRoutes from './notification.routes';

const router: Router = Router();

router.use('/public', publicRoutes);
router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes);
router.use('/incidents', incidentRoutes);
router.use('/vessels', vesselRoutes);
router.use('/products', productRoutes);
router.use('/lanes', laneRoutes);
router.use('/config', configRoutes);
router.use('/reports', reportRoutes);
router.use('/equipments', equipmentRoutes);
router.use('/voyages', voyageRoutes);
router.use('/notifications', notificationRoutes);
export default router;
