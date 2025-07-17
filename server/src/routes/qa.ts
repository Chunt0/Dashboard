import fs from 'fs';
import mime from 'mime-types';
import path from 'path';
import { Router, Request, Response } from 'express';

const router = Router();
const datasetsDir = process.env.DATA_DIR || path.resolve(__dirname, '../../../datasets'); // Define dataset directory

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
        const textFilePath = textFile ? path.join(dataDir, textFile) : null;
        let label = null;
        if (textFilePath) {
                // Read the text file into a string synchronously
                label = fs.readFileSync(textFilePath, 'utf8');
        }

        res.json({ status: 'ok', label, mediaFile }); // Send only media file if text file doesn't exist

});

router.get('/media/:folderId/:mediaId', async (req: Request, res: Response): Promise<void> => {
        const { folderId, mediaId } = req.params;
        const mediaFilePath = path.normalize(path.join(datasetsDir, folderId, mediaId));
        if (!mediaFilePath.startsWith(path.resolve(datasetsDir))) {
                res.status(403).send('Forbidden');
                return;
        }
        if (!fs.existsSync(mediaFilePath)) {
                res.status(404).send('Media Not Found');
                return;
        }

        let stat;
        try {
                stat = await fs.promises.stat(mediaFilePath);
        } catch (err) {
                res.status(404).send('Media Not Found');
                return;
        }


        // Determine content type
        let contentType = '';
        if (mediaId.endsWith('.mp4')) {
                contentType = 'video/mp4';
        } else {
                contentType = 'image/png';
        }

        const fileSize = stat.size;
        const mimeType = mime.lookup(mediaId) || 'application/octet-stream';
        const rangeHeader = req.headers.range;

        if (rangeHeader) {
                const parts = rangeHeader.replace(/bytes=/, '').split('-');
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + 1 * 1024 * 1024 - 1, fileSize - 1);

                if (start >= fileSize || end >= fileSize || start > end) {
                        res.status(416).send('Requested Range Not Satisfiable');
                        return;
                }

                const chunksize = end - start + 1;
                res.status(206)
                res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
                res.setHeader('Accept-Ranges', 'bytes');
                res.setHeader('Content-Length', chunksize);
                res.setHeader('Content-Type', mimeType);
                res.setHeader('Cacher-Control', 'public, max-age=86400');
                const stream = fs.createReadStream(mediaFilePath, { start, end });
                stream.pipe(res);
        } else {
                res.status(200)
                res.setHeader('Content-Length', fileSize);
                res.setHeader('Content-Type', contentType);
                res.setHeader('Cacher-Control', 'public, max-age=86400');
                fs.createReadStream(mediaFilePath).pipe(res);
        }
});

router.post('/submit', (req: Request, res: Response): void => {
        const { folder, mediaFile, label, removeMedia } = req.body;
        // construct current media path
        const currentMediaPath = path.join(datasetsDir, folder, mediaFile);
        const destMediaPath = path.join(datasetsDir, folder, 'completed', mediaFile);

        const textFile = mediaFile.replace(/\.(mp4|png)$/, '.txt');
        const currentTextPath = path.join(datasetsDir, folder, textFile);
        const destTextPath = path.join(datasetsDir, folder, 'completed', textFile);

        if (removeMedia) {
                fs.rmSync(currentMediaPath);
                fs.rmSync(currentTextPath);
                res.json({ status: 'ok', message: 'Media and corresponding text file has been deleted.' })
        } else {
                fs.cpSync(currentMediaPath, destMediaPath);
                fs.writeFile(destTextPath, label, (err) => {
                        if (err) {
                                console.error('Error writing file:', err);
                        }
                });
                fs.rmSync(currentMediaPath);
                fs.rmSync(currentTextPath);
                res.json({ status: 'ok', message: 'Media and corresponding text file have been updated and moved to the completed folder.' })

        }
});

router.get('/completion-status/:folder', (req: Request, res: Response): void => {
        const { folder } = req.params;
        const dataDir = path.join(datasetsDir, folder);
        const completedDir = path.join(dataDir, 'completed');

        if (!fs.existsSync(dataDir)) {
                res.status(404).json({ error: 'Folder not found' });
        }

        if (!fs.existsSync(completedDir)) {
                res.json({ allCompleted: false, remainingFiles: 0 });
        }

        const mainFiles = fs.readdirSync(dataDir).filter(file =>
                (file.endsWith('.mp4') || file.endsWith('.png')) &&
                !file.startsWith('.')
        );

        const completedFiles = fs.readdirSync(completedDir).filter(file =>
                (file.endsWith('.mp4') || file.endsWith('.png')) &&
                !file.startsWith('.')
        );

        const allCompleted = mainFiles.length === 0;
        const remainingFiles = mainFiles.length;

        res.json({ allCompleted, remainingFiles, totalCompleted: completedFiles.length });
});

// i don't need to write a label file. just move all files mp4, png, txt and place them into completed
router.post('/complete-all', async (req: Request, res: Response): Promise<void> => {
        const { folder } = req.body;
        if (!folder) {
                res.status(400).json({ status: 'error', message: 'Folder not specified.' });
                return;
        }

        const folderPath = path.join(datasetsDir, folder);
        const completedFolderPath = path.join(folderPath, 'completed');

        try {
                // Ensure the completed directory exists
                await fs.promises.mkdir(completedFolderPath, { recursive: true });

                const files = await fs.promises.readdir(folderPath);

                const movePromises = files
                        .filter(file => file !== 'completed' && /\.(mp4|png|txt)$/.test(file))
                        .map(async (file) => {
                                const currentPath = path.join(folderPath, file);
                                const destPath = path.join(completedFolderPath, file);
                                await fs.promises.copyFile(currentPath, destPath);
                                await fs.promises.unlink(currentPath);
                        });

                await Promise.all(movePromises);

                res.json({ status: 'ok', message: 'All files have been moved.' });
        } catch (err) {
                console.error('Error processing complete-all request:', err);
                res.status(500).json({ status: 'error', message: 'An error occurred while moving files.' });
        }
});

export default router;

