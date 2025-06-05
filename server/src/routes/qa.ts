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
        const textFilePath = textFile ? path.join(dataDir, textFile) : null;
        let label = null;
        if (textFilePath) {
                // Read the text file into a string synchronously
                label = fs.readFileSync(textFilePath, 'utf8');
        }

        res.json({ status: 'ok', label, mediaFile }); // Send only media file if text file doesn't exist

});

router.post('/load/:folderId/:mediaId', (req: Request, res: Response): void => {
    const { folderId, mediaId } = req.params;
    const mediaFilePath = path.join(datasetsDir, folderId, mediaId);

    if (!fs.existsSync(mediaFilePath)) {
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

    const stat = fs.statSync(mediaFilePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize || end >= fileSize) {
            res.status(416).send('Requested Range Not Satisfiable');
            return;
        }

        const chunksize = end - start + 1;
        const stream = fs.createReadStream(mediaFilePath, { start, end });
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': contentType,
        });
        stream.pipe(res);
    } else {
        // Send whole file
        res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': contentType,
        });
        fs.createReadStream(mediaFilePath).pipe(res);
    }
});

router.post('/upload', (req: Request, res: Response): void => {
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
                        } else {
                                console.log('File saved successfully at', destTextPath);
                        }
                });
                fs.rmSync(currentMediaPath);
                fs.rmSync(currentTextPath);
                res.json({ status: 'ok', message: 'Media and corresponding text file have been updated and moved to the completed folder.' })

        }
});

export default router;

