import fs from 'fs';
import path from 'path';
import { Router, Request, Response } from 'express';
import { getRedisClient } from '../utils/redisClient';

const router = Router();
const datasetDir = process.env.DATA_DIR || path.resolve(__dirname, '../../../datasets');

router.get('/datasets', async (req: Request, res: Response): Promise<void> => {
        try {
                const files = await fs.promises.readdir(datasetDir, { withFileTypes: true });
                const folders: string[] = [];

                for (const file of files) {
                        if (file.isDirectory()) {
                                try {
                                        const subFiles = await fs.promises.readdir(path.join(datasetDir, file.name), { withFileTypes: true });

                                        const hasFiles = subFiles.some(
                                                (f) =>
                                                        f.isFile()
                                        );
                                        if (hasFiles) continue;

                                        const hasCompletedFolder = subFiles.some(f => f.isDirectory() && f.name === 'completed');

                                        if (hasCompletedFolder) {
                                                folders.push(file.name);
                                        }
                                } catch (err) {
                                        console.error(`Error reading subdirectory ${file.name}:`, err);
                                }
                        }
                }

                res.json(folders);
        } catch (err) {
                console.error('Failed to read dataset directory:', err);
                res.status(500).json({ error: 'Failed to read directory' });
        }
});

const queueTrainingRequest = async (req: Request, res: Response, modelType: string): Promise<void> => {
        const client = await getRedisClient();
        const { dataset } = req.body;
        if (!dataset) {
                res.status(400).send({ status: 'You must select a dataset!' });
                return;
        }

        const trainingRequest = {
                dataset,
                modelType
        };

        try {
                await client.lPush('training_queue', JSON.stringify(trainingRequest));
                console.log('📦 Queued training request:', trainingRequest);
                res.send({ status: `Training for ${dataset} has been queued.` });
        } catch (error) {
                console.error('Redis error:', error);
                res.status(500).send({ status: 'Failed to queue training request.' });
        }
};

router.post('/sdxl', (req: Request, res: Response) => queueTrainingRequest(req, res, 'sdxl'));
router.post('/flux', (req: Request, res: Response) => queueTrainingRequest(req, res, 'flux'));
router.post('/wan', (req: Request, res: Response) => queueTrainingRequest(req, res, 'wan'));

export const processTrainingQueue = async (): Promise<void> => {
        console.log('Starting training queue processor...');
        const client = await getRedisClient();

        while (true) {
                try {
                        const result = await client.brPop('training_queue', 0);
                        if (result) {
                                const trainingRequest = JSON.parse(result.element);
                                console.log('Starting training for:', trainingRequest.dataset);

                                // Simulate a 60-second training time
                                await new Promise(resolve => setTimeout(resolve, 60000));

                                console.log('✅ Finished training for:', trainingRequest.dataset);
                        }
                } catch (error) {
                        console.error('Error processing training queue:', error);
                        // Add a delay before retrying to avoid spamming logs in case of persistent errors
                        await new Promise(resolve => setTimeout(resolve, 5000));
                }
        }
};

export default router;
