import { Router } from "express";
import healthRoutes from './health';
import uploadRoutes from './upload';
import qaRoutes from './qa';
import trainRoutes from './train';

const router = Router();

router.use('/health', healthRoutes);
router.use('/upload', uploadRoutes);
router.use('/qa', qaRoutes);
router.use('/train', trainRoutes);

export default router;
