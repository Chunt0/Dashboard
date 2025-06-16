import fs from 'fs';
import path from 'path';
import { Router, Request, Response } from 'express';

const router = Router()
const datasetDir = path.join(__dirname, '..', '..', '..', 'datasets');

// Get all directories in datasetDir and check if each contains only a 'completed' directory
router.get('/folders/', (req: Request, res: Response): void => {
        fs.readdir(datasetDir, { withFileTypes: true }, (err, files) => {
                if (err) {
                        return res.status(500).json({ error: 'Failed to read directory' });
                }
                const validFolders: string[] = [];
                // Filter only directories
                const directories = files.filter(file => file.isDirectory());
                // Iterate through each directory
                directories.forEach(dir => {
                        const dirPath = path.join(datasetDir, dir.name);
                        // Read contents of each directory
                        fs.readdir(dirPath, { withFileTypes: true }, (err, subFiles) => {
                                if (err) {
                                        // Skip on error
                                        return;
                                }
                                // Check if only 'completed' directory exists
                                const subDirs = subFiles.filter(subFile => subFile.isDirectory()).map(subDir => subDir.name);
                                if (subDirs.length === 1 && subDirs[0] === 'completed') {
                                        validFolders.push(dir.name);
                                }
                        });
                });
                // Wait for all async checks to complete before responding
                // Since fs.readdir is asynchronous, use Promise.all
                const checkDirectories = directories.map(dir => {
                        const dirPath = path.join(datasetDir, dir.name);
                        return new Promise<void>((resolve) => {
                                fs.readdir(dirPath, { withFileTypes: true }, (err, subFiles) => {
                                        if (err) {
                                                resolve();
                                                return;
                                        }
                                        const subDirs = subFiles.filter(subFile => subFile.isDirectory()).map(subDir => subDir.name);
                                        if (subDirs.length === 1 && subDirs[0] === 'completed') {
                                                validFolders.push(dir.name);
                                        }
                                        resolve();
                                });
                        });
                });
                Promise.all(checkDirectories).then(() => {
                        res.json(validFolders);
                });
        });
});

router.post('/train-sdxl', (req: Request, res: Response): void => {
        const { folder } = req.body;
        if (folder === '') {
                return res.status(400).send(`request body:${req.body}`) as unknown as void;
        }
})
