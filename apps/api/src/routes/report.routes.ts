import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';

const router: Router = Router();

router.get('/summary', ReportController.getSummary);
router.get('/aggregated', ReportController.getAggregatedStats);
router.get('/equipment-utilization', ReportController.getEquipmentUtilization);
router.get('/volume', ReportController.getVolumeReport);
router.get('/productivity', ReportController.getProductivityReport);
router.get('/productivity/equipment', ReportController.getEquipmentAnalytics);
router.get('/productivity/port', ReportController.getPortAnalytics);
router.get('/voyages/:id/slog', ReportController.getSlog);
router.get('/export', ReportController.exportExcel);

export default router;
