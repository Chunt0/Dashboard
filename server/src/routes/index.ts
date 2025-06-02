import { Router } from "express";
import healthRoutes from './health';
import uploadRoutes from './upload';

const router = Router();

router.use('/health', healthRoutes);
router.use('/upload', uploadRoutes);

export default router;
