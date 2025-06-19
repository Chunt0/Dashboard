import fs from 'fs';
import path from 'path';
import { Router, Request, Response } from 'express';

const router = Router()
const datasetDir = path.join(__dirname, '..', '..', '..', 'datasets');

router.get('/folders/', async (req: Request, res: Response): Promise<void> => {
        try {
                // Get all directories in datasetDir
                const files = await fs.promises.readdir(datasetDir, { withFileTypes: true });

                // Filter directories and check for 'completed' subdirectory
                const folders: string[] = [];

                for (const file of files) {
                        if (file.isDirectory()) {
                                try {
                                        const subFiles = await fs.promises.readdir(
                                                path.join(datasetDir, file.name),
                                                { withFileTypes: true }
                                        );

                                        // Only add if directory contains just 'completed' subdirectory
                                        if (subFiles.length === 1 &&
                                                subFiles[0].isDirectory() &&
                                                subFiles[0].name === 'completed') {
                                                folders.push(file.name);
                                        }
                                } catch (err) {
                                        console.error(`Error reading subdirectory ${file.name}:`, err);
                                }
                        }
                }

                res.json(folders);
        } catch (err) {
                res.status(500).json({ error: 'Failed to read directory' });
        }
});

// Send response with message "training sdxl" after validation
router.post('/sdxl', (req: Request, res: Response): void => {
        const { dataset } = req.body;
        if (dataset === '') {
                res.status(400).send(`request body:${JSON.stringify(req.body)}`);
                return;
        }
        res.send({ status: 'training sdxl' });
});

// Send response with message "training sdxl" after validation
router.post('/flux', (req: Request, res: Response): void => {
        const { dataset } = req.body;
        if (dataset === '') {
                res.status(400).send(`request body:${JSON.stringify(req.body)}`);
                return;
        }
        res.send({ status: 'training flux' });
});

// Send response with message "training sdxl" after validation
router.post('/wan', (req: Request, res: Response): void => {
        const { dataset } = req.body;
        if (dataset === '') {
                res.status(400).send(`request body:${JSON.stringify(req.body)}`);
                return;
        }
        res.send({ status: 'training wan2.1' });
});

export default router;
