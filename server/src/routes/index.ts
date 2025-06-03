import { Router } from "express";
import healthRoutes from './health';
import uploadRoutes from './upload';
import qaRoutes from './qa';

const router = Router();

router.use('/health', healthRoutes);
router.use('/upload', uploadRoutes);
router.use('/qa', qaRoutes);

export default router;
