import { Router } from "express";
import healthRoutes from './health';
import uploadRoutes from './upload';
import qaRoutes from './qa';
import trainRoutes from './train';
import generateRoutes from './generate';

const router = Router();

router.use('/health', healthRoutes);
router.use('/upload', uploadRoutes);
router.use('/qa', qaRoutes);
router.use('/train', trainRoutes);
router.use('/generate', generateRoutes);

export default router;
