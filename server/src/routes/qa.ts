import fs from 'fs';
import path from 'path';
import { Router, Request, Response } from 'express';
import { text } from 'stream/consumers';

const router = Router();
const datasetsDir = path.join(__dirname, '..', '..', '..', 'datasets'); // Define dataset directory

// Get the folder names contained in datasetDir
router.get('/folders', (req: Request, res: Response): void => {
        fs.readdir(datasetsDir, { withFileTypes: true }, (err, files) => {
                if (err) {
                        return res.status(500).json({ error: 'Failed to read directory' });
                }
                const folders = files
                        .filter(file => file.isDirectory())
                        .map(folder => folder.name);
                res.json(folders);
        });
});


router.post('/load', (req: Request, res: Response): void => {
        const { folder } = req.body;
        if (folder === '') {
                return res.status(400).send(`request body:${req.body}`) as unknown as void;

        }
        const dataDir = path.join(datasetsDir, folder);

        const files = fs.readdirSync(dataDir);
        const mediaFile = files.find(file => file.endsWith('.mp4') || file.endsWith('.png'));
        const textFile = mediaFile ? mediaFile.replace(/\.(mp4|png)$/, '.txt') : null;
        const mediaFilePath = mediaFile ? path.join(dataDir, mediaFile) : null;
        const textFilePath = textFile ? path.join(dataDir, textFile) : null;

        if (mediaFilePath) {
                res.download(mediaFilePath); // Send media file
        }

        if (textFilePath) {
                res.download(textFilePath); // Send text file, if it exists
        } else {
                res.json({ status: 'ok', mediaFile, textFile: null }); // Send only media file if text file doesn't exist
        }

});

router.post('/upload', (req: Request, res: Response): void => {
        res.json({ status: 'ok' });
});

export default router;

