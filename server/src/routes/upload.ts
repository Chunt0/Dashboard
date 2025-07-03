import { Router, Response, Request } from "express";
import ffmpeg from 'fluent-ffmpeg';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';


const NODE_ENV = process.env.NODE_ENV || 'development';
const router = Router();

const uploadDir = process.env.UPLOADS_DIR || path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
        destination: (req, file, cb) => {
                cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
                cb(null, file.originalname);
        }
});

const upload = multer({ storage: storage });

interface UploadProgress {
        totalChunks: number;
        receivedChunks: number;
        fileName: string;
        folderPath: string;
        batchName: string;
}

const uploadsMap: Record<string, UploadProgress> = {};

async function prepVid(videoPath: string, batchName: string): Promise<void> {
        const outputRoot = NODE_ENV === "production" ? "/usr/src/app/datasets" : "../datasets";
        const tgtDir = path.join(outputRoot, batchName);
        const completedDir = path.join(tgtDir, 'completed');

        fs.mkdirSync(tgtDir, { recursive: true });
        fs.mkdirSync(completedDir, { recursive: true });

        const videoFileName = path.parse(videoPath).name;

        ffmpeg.ffprobe(videoPath, async (err, metadata) => {
                if (err) {
                        console.error('Error getting video metadata:', err);
                        return;
                }

                const duration = metadata.format.duration || 0;
                const clipDuration = 4;
                let startTime = 0;
                let clipIndex = 0;

                while (startTime < duration) {
                        const currentClipDuration = Math.min(clipDuration, duration - startTime);
                        const clipFileName = `${videoFileName}_clip_${clipIndex}.mp4`;
                        const clipPath = path.join(tgtDir, clipFileName);
                        const thumbnailFileName = `${videoFileName}_clip_${clipIndex}.png`;
                        const thumbnailPath = path.join(tgtDir, thumbnailFileName);

                        await new Promise<void>((resolve, reject) => {
                                ffmpeg(videoPath)
                                        .setStartTime(startTime)
                                        .setDuration(currentClipDuration)
                                        .outputOptions('-vf', 'scale=-2:720')
                                        .save(clipPath)
                                        .on('end', () => {
                                                console.log(`Clip ${clipIndex} created`);
                                                resolve();
                                        })
                                        .on('error', (clipErr) => {
                                                console.error(`Error creating clip ${clipIndex}:`, clipErr);
                                                reject(clipErr);
                                        });
                        });

                        await new Promise<void>((resolve, reject) => {
                                ffmpeg(clipPath)
                                        .screenshots({
                                                timestamps: ['50%'],
                                                filename: thumbnailFileName,
                                                folder: tgtDir,
                                        })
                                        .on('end', () => {
                                                console.log(`Thumbnail for clip ${clipIndex} created`);
                                                resolve();
                                        })
                                        .on('error', (thumbErr) => {
                                                console.error(`Error creating thumbnail for clip ${clipIndex}:`, thumbErr);
                                                reject(thumbErr);
                                        });
                        });

                        const buffer = fs.readFileSync(thumbnailPath);
                        const imgBase64 = buffer.toString('base64');
                        await createImageLabel(imgBase64, tgtDir, thumbnailPath);
                        fs.unlinkSync(thumbnailPath);

                        startTime += clipDuration;
                        clipIndex++;
                }
                fs.unlinkSync(videoPath);
        });
}

async function prepImg(batchName: string): Promise<void> {
        const imgDir = NODE_ENV === "production" ? "/usr/src/app/uploads" : "./uploads";
        const outputRoot = NODE_ENV === "production" ? "/usr/src/app/datasets" : "../datasets";
        const tgtDir = path.join(outputRoot, batchName);
        const completedDir = path.join(tgtDir, 'completed');

        fs.mkdirSync(tgtDir, { recursive: true });
        fs.mkdirSync(completedDir, { recursive: true });

        const files = fs.readdirSync(imgDir);

        for (const file of files) {
                const lowerFile = file.toLowerCase();
                if (!lowerFile.endsWith('.png') && !lowerFile.endsWith('.jpg') && !lowerFile.endsWith('.jpeg') && !lowerFile.endsWith('.webp')) {
                        continue;
                }

                const rootName = path.parse(file).name + '.png';
                const inpPath = path.join(imgDir, file);
                const tgtPath = path.join(tgtDir, rootName);

                const buffer = fs.readFileSync(inpPath);
                try {
                        let image = sharp(buffer);

                        const metadata = await image.metadata();

                        const width = metadata.width || 0;
                        const height = metadata.height || 0;

                        if (width < 512 || height < 512) {
                                fs.unlinkSync(inpPath);
                                continue;
                        }

                        if (width < height) {
                                if (height > 1300) {
                                        const newHeight = 1248;
                                        const newWidth = Math.round((1248 / height) * width);
                                        image = image.resize(newWidth, newHeight);
                                }
                        } else {
                                if (width > 1300) {
                                        const newWidth = 1248;
                                        const newHeight = Math.round((1248 / width) * height);
                                        image = image.resize(newWidth, newHeight);
                                }
                        }

                        await image.png().toFile(tgtPath);
                        fs.unlinkSync(inpPath);

                        const buf = fs.readFileSync(tgtPath);
                        const imgBase64 = buf.toString('base64');

                        await createImageLabel(imgBase64, tgtDir, tgtPath);
                } catch (err) {
                        console.error('Error: ', err);
                }
        }
}

async function createImageLabel(imgBase64: string, tgtDir: string, tgtPath: string) {
        const payload = {
                model: 'gemma3:27b',
                messages: [
                        {
                                role: 'user',
                                content: 'Create a comma separated image label describing this picture. The label keywords should be ordered by relevancy. Only return this label, no extra commentary, no quotation marks, and no redundant words.',
                                images: [imgBase64]
                        }
                ],
                stream: false
        };


        const url = 'http://localhost:11434/api/chat';


        try {
                const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                });

                const txtPath = tgtPath.replace('.png', '.txt');

                if (response.ok) {
                        const resJson = await response.json();
                        const content = resJson.message?.content || '';
                        await fs.promises.writeFile(txtPath, content, 'utf8');
                } else {
                        await fs.promises.writeFile(txtPath, '', 'utf8');
                }
        } catch (err) {
                console.error('Ollama API request error: ', err);
        }
}

router.post(
        '/videos',
        upload.single('chunk'),
        async (req: Request, res: Response): Promise<void> => {
                const { fileId, chunkIndex, totalChunks, fileName, fileSize, batchName } = req.body;
                const chunkFile = req.file;

                if (!fileId || !chunkIndex || !fileName || !chunkFile || batchName === '') {
                        return res.status(400).send(`request body:${req.body}`) as unknown as void;
                }

                const folderPath = path.join(__dirname, '..', '..', 'uploads', 'temp', fileId);
                if (!fs.existsSync(folderPath)) {
                        fs.mkdirSync(folderPath, { recursive: true });
                }
                const chunkPath = path.join(folderPath, `chunk_${chunkIndex}`);
                fs.renameSync(chunkFile.path, chunkPath);

                if (!uploadsMap[fileId]) {
                        uploadsMap[fileId] = {
                                totalChunks: parseInt(totalChunks),
                                receivedChunks: 0,
                                fileName,
                                folderPath,
                                batchName
                        }
                }

                uploadsMap[fileId].receivedChunks++;

                if (uploadsMap[fileId].receivedChunks === uploadsMap[fileId].totalChunks) {
                        const tempPath = path.join(__dirname, '..', '..', 'uploads', `${fileName}`)
                        const finalPath = path.join(__dirname, '..', '..', 'uploads', fileName);
                        const writeStream = fs.createWriteStream(tempPath);

                        const streamFinished = new Promise<void>((resolve, reject) => {
                                writeStream.on('finish', () => resolve());
                                writeStream.on('error', reject);
                        });

                        for (let i = 0; i < uploadsMap[fileId].totalChunks; i++) {
                                const chunkPath = path.join(folderPath, `chunk_${i}`);
                                const data = fs.readFileSync(chunkPath);
                                writeStream.write(data);
                        }

                        writeStream.end();

                        await streamFinished;
                        fs.rmSync(folderPath, { recursive: true, force: true });

                        await prepVid(finalPath, batchName);

                        delete uploadsMap[fileId];
                        res.json({ message: `File ${fileName} labeled` });
                } else {
                        res.json({
                                message: `Chunk ${chunkIndex} received`,
                        });
                }
        }
);

router.post(
        '/images',
        upload.single('chunk'),
        async (req: Request, res: Response): Promise<void> => {
                const { fileId, chunkIndex, totalChunks, fileName, fileSize, batchName } = req.body;
                const chunkFile = req.file;

                if (!fileId || !chunkIndex || !fileName || !chunkFile || batchName === '') {
                        return res.status(400).send(`request body:${req.body}`) as unknown as void;
                }

                const folderPath = path.join(__dirname, '..', '..', 'uploads', 'temp', fileId);
                if (!fs.existsSync(folderPath)) {
                        fs.mkdirSync(folderPath, { recursive: true });
                }
                const chunkPath = path.join(folderPath, `chunk_${chunkIndex}`);
                fs.renameSync(chunkFile.path, chunkPath);

                if (!uploadsMap[fileId]) {
                        uploadsMap[fileId] = {
                                totalChunks: parseInt(totalChunks),
                                receivedChunks: 0,
                                fileName,
                                folderPath,
                                batchName
                        }
                }

                uploadsMap[fileId].receivedChunks++;

                if (uploadsMap[fileId].receivedChunks === uploadsMap[fileId].totalChunks) {
                        const finalPath = path.join(__dirname, '..', '..', 'uploads', fileName);
                        const writeStream = fs.createWriteStream(finalPath);

                        const streamFinished = new Promise<void>((resolve, reject) => {
                                writeStream.on('finish', () => resolve());
                                writeStream.on('error', reject);
                        });

                        for (let i = 0; i < uploadsMap[fileId].totalChunks; i++) {
                                const chunkPath = path.join(folderPath, `chunk_${i}`);
                                const data = fs.readFileSync(chunkPath);
                                writeStream.write(data);
                        }

                        writeStream.end();

                        await streamFinished;
                        fs.rmSync(folderPath, { recursive: true, force: true });

                        await prepImg(batchName);

                        delete uploadsMap[fileId];
                        res.json({ message: `File ${fileName} labeled` });
                } else {
                        res.json({
                                message: `Chunk ${chunkIndex} received`,
                        });
                }
        }
);

export default router; 
