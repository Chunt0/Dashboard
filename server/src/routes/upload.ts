import { Router, Response, Request } from "express";
import ffmpeg from 'fluent-ffmpeg';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import {
	isSafeFileName,
	isSafePathSegment,
	isSafeToken,
	parsePositiveInt
} from '../utils/validation';


const router = Router();

const uploadDir = process.env.UPLOADS_DIR || path.resolve(__dirname, '../../uploads');
const datasetsRoot = process.env.DATA_DIR || path.resolve(__dirname, '../../../datasets');
const ollamaBaseUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
const ollamaChatUrl = `${ollamaBaseUrl.replace(/\/$/, '')}/api/chat`;

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

function ffprobePromise(videoPath: string): Promise<ffmpeg.FfprobeData> {
        return new Promise((resolve, reject) => {
                ffmpeg.ffprobe(videoPath, (err, data) => {
                        if (err) {
                                return reject(err);
                        }
                        return resolve(data);
                });
        });
}

async function prepVid(videoPath: string, batchName: string): Promise<void> {
	const outputRoot = datasetsRoot;
	const tgtDir = path.join(outputRoot, batchName);
        const completedDir = path.join(tgtDir, 'completed');

        fs.mkdirSync(tgtDir, { recursive: true });
        fs.mkdirSync(completedDir, { recursive: true });

        const videoFileName = path.parse(videoPath).name;

        try {
                const metadata = await ffprobePromise(videoPath);
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
			await createLabelVideo(imgBase64, tgtDir, thumbnailPath, batchName);
			await safeUnlink(thumbnailPath);

                        startTime += clipDuration;
                        clipIndex++;
                }
		await safeUnlink(videoPath);
        } catch (err) {
                console.error('Error processing video:', err);
        }
}

async function prepImg(imagePath: string, batchName: string): Promise<void> {
	const outputRoot = datasetsRoot;
	const tgtDir = path.join(outputRoot, batchName);
        const completedDir = path.join(tgtDir, 'completed');

        fs.mkdirSync(tgtDir, { recursive: true });
        fs.mkdirSync(completedDir, { recursive: true });

        const file = path.basename(imagePath);
        const lowerFile = file.toLowerCase();

        if (!lowerFile.endsWith('.png') && !lowerFile.endsWith('.jpg') && !lowerFile.endsWith('.jpeg') && !lowerFile.endsWith('.webp')) {
                return;
        }

        const rootName = path.parse(file).name + '.png';
        const tgtPath = path.join(tgtDir, rootName);

        const buffer = fs.readFileSync(imagePath);
        try {
                let image = sharp(buffer);

                const metadata = await image.metadata();

                const width = metadata.width || 0;
                const height = metadata.height || 0;

		if (width < 512 || height < 512) {
			await safeUnlink(imagePath);
			return;
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
		await safeUnlink(imagePath);

                const buf = fs.readFileSync(tgtPath);
                const imgBase64 = buf.toString('base64');

                await createLabelImage(imgBase64, tgtDir, tgtPath, batchName);
        } catch (err) {
                console.error('Error: ', err);
        }
}

async function createLabelImage(imgBase64: string, tgtDir: string, tgtPath: string, batchName: string) {
        const payload = {
                model: 'gemma3:27b',
                messages: [
                        {
                                role: 'user',
                                content: 'Create a comma separated label describing this picture. The label should follow this general template "the general description of the whole scene with whatever details are critical to the image, other important thing, style, style, object, noun, type, quality, feeling, style". Only return this label, no extra commentary, no quotation marks, and no redundant words.',
                                images: [imgBase64]
                        }
                ],
                stream: false
        };


	const url = ollamaChatUrl;


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
                        const label = `in the style of ${batchName}, ${content}`;
                        await fs.promises.writeFile(txtPath, label, 'utf8');
                } else {
                        await fs.promises.writeFile(txtPath, '', 'utf8');
                }
        } catch (err) {
                console.error('Ollama API request error: ', err);
        }
}

async function createLabelVideo(imgBase64: string, tgtDir: string, tgtPath: string, batchName: string) {
        const payload = {
                model: 'gemma3:27b',
                messages: [
                        {
                                role: 'user',
                                content: 'Create a comma separated label describing this picture. Ensure the label gives guidance such as subjects, actions, and style cues to prompt a video generation model. Describe who/what and where - the main elements and setting of your video. Specify the movement or activity that should occur during the video. Include camera directions like "camera follows," "smooth pan," or "close-up." Set the mood with lighting, atmosphere, and artistic style descriptors. Only return this label, no extra commentary, no quotation marks, and no redundant words.',
                                images: [imgBase64]
                        }
                ],
                stream: false
        };


	const url = ollamaChatUrl;


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
                        const label = `in the style of ${batchName}, ${content}`;
                        await fs.promises.writeFile(txtPath, label, 'utf8');
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
		const { fileId, chunkIndex, totalChunks, fileName, batchName } = req.body;
		const chunkFile = req.file;
		const parsedChunkIndex = parsePositiveInt(chunkIndex);
		const parsedTotalChunks = parsePositiveInt(totalChunks);

		if (!isSafeToken(fileId) || !isSafeFileName(fileName) || !isSafePathSegment(batchName)) {
			res.status(400).json({ error: 'Invalid upload request.' });
			return;
		}

		if (!chunkFile || parsedChunkIndex === null || parsedTotalChunks === null) {
			res.status(400).json({ error: 'Invalid upload request.' });
			return;
		}

		const normalizedBatchName = batchName.trim();

                const folderPath = path.join(__dirname, '..', '..', 'uploads', 'temp', fileId);
                if (!fs.existsSync(folderPath)) {
                        fs.mkdirSync(folderPath, { recursive: true });
                }
                const chunkPath = path.join(folderPath, `chunk_${chunkIndex}`);
                fs.renameSync(chunkFile.path, chunkPath);

		if (!uploadsMap[fileId]) {
			uploadsMap[fileId] = {
				totalChunks: parsedTotalChunks,
				receivedChunks: 0,
				fileName,
				folderPath,
				batchName: normalizedBatchName
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

			try {
				for (let i = 0; i < uploadsMap[fileId].totalChunks; i++) {
					const chunkPath = path.join(folderPath, `chunk_${i}`);
					const data = fs.readFileSync(chunkPath);
					writeStream.write(data);
				}

				writeStream.end();
				await streamFinished;
				fs.rmSync(folderPath, { recursive: true, force: true });

				await prepVid(finalPath, normalizedBatchName);
			} catch (err) {
				console.error('Error reassembling video upload:', err);
				res.status(500).json({ error: 'Failed to process upload.' });
				return;
			}

                        delete uploadsMap[fileId];
                        console.log(`Receive and prepped full file ${fileName} at ${new Date().toISOString()}`);
                        res.set('Connection', 'close');
                        res.json({ message: `File ${fileName} labeled` });
                } else {
                        console.log(`Received chunk ${chunkIndex} at ${new Date().toISOString()}`);
                        res.set('Connection', 'close');
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
		const { fileId, chunkIndex, totalChunks, fileName, batchName } = req.body;
		const chunkFile = req.file;
		const parsedChunkIndex = parsePositiveInt(chunkIndex);
		const parsedTotalChunks = parsePositiveInt(totalChunks);

		if (!isSafeToken(fileId) || !isSafeFileName(fileName) || !isSafePathSegment(batchName)) {
			res.status(400).json({ error: 'Invalid upload request.' });
			return;
		}

		if (!chunkFile || parsedChunkIndex === null || parsedTotalChunks === null) {
			res.status(400).json({ error: 'Invalid upload request.' });
			return;
		}

		const normalizedBatchName = batchName.trim();

                const folderPath = path.join(__dirname, '..', '..', 'uploads', 'temp', fileId);
                if (!fs.existsSync(folderPath)) {
                        fs.mkdirSync(folderPath, { recursive: true });
                }
                const chunkPath = path.join(folderPath, `chunk_${chunkIndex}`);
                fs.renameSync(chunkFile.path, chunkPath);

		if (!uploadsMap[fileId]) {
			uploadsMap[fileId] = {
				totalChunks: parsedTotalChunks,
				receivedChunks: 0,
				fileName,
				folderPath,
				batchName: normalizedBatchName
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

			try {
				for (let i = 0; i < uploadsMap[fileId].totalChunks; i++) {
					const chunkPath = path.join(folderPath, `chunk_${i}`);
					const data = fs.readFileSync(chunkPath);
					writeStream.write(data);
				}

				writeStream.end();
				await streamFinished;
				fs.rmSync(folderPath, { recursive: true, force: true });

				await prepImg(finalPath, normalizedBatchName);
			} catch (err) {
				console.error('Error reassembling image upload:', err);
				res.status(500).json({ error: 'Failed to process upload.' });
				return;
			}

                        delete uploadsMap[fileId];
                        res.set('Connection', 'close');
                        res.json({ message: `File ${fileName} labeled` });
                } else {
                        res.set('Connection', 'close');
                        res.json({
                                message: `Chunk ${chunkIndex} received`,
                        });
                }
	}
);

async function safeUnlink(filePath: string): Promise<void> {
	try {
		await fs.promises.unlink(filePath);
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
			console.error(`Failed to remove file ${filePath}:`, err);
		}
	}
}

export default router;
