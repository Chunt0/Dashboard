import { Router, Response, Request } from "express";
import ffmpeg from 'fluent-ffmpeg';
import { spawn } from 'child_process';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';


const router = Router();

const uploadDir = process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads');

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

async function prepImg(batchName: string, imgDir: string = './uploads', outputRoot: string = '../datasets'): Promise<string> {
        const tgtDir = path.join(outputRoot, batchName);
        const completedDir = path.join(tgtDir, 'completed');

        fs.mkdirSync(tgtDir, { recursive: true });
        fs.mkdirSync(completedDir, { recursive: true });

        const files = fs.readdirSync(imgDir);

        console.log(files);
        for (const file of files) {
                const lowerFile = file.toLowerCase();
                if (!lowerFile.endsWith('.png') && !lowerFile.endsWith('.jpg') && !lowerFile.endsWith('.jpeg') && !lowerFile.endsWith('.webp')) {
                        continue;
                }

                const rootName = path.parse(file).name + '.png';
                const inpPath = path.join(imgDir, file);
                const tgtPath = path.join(tgtDir, rootName);

                const buffer = fs.readFileSync(inpPath);
                console.log(inpPath);
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
                        console.log('createdImageLabel');
                } catch (err) {
                        console.error('Error: ', err);
                        return "err";
                }
        }
        return "ok";
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
        console.log(tgtPath);

        try {
                const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                });

                const txtPath = tgtPath.replace('.png', '.txt');
                console.log(txtPath);

                if (response.ok) {
                        const resJson = await response.json();
                        const content = resJson.message?.content || '';
                        await fs.promises.writeFile(txtPath, content, 'utf8');
                } else {
                        await fs.promises.writeFile(txtPath, '', 'utf8');
                }
        } catch (err) {
                console.error('Ollama API request error:', err);
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
                        const tempPath = path.join(__dirname, '..', '..', 'uploads', `temp_${fileName}`)
                        const finalPath = path.join(__dirname, '..', '..', 'uploads', fileName);
                        const writeStream = fs.createWriteStream(tempPath);

                        for (let i = 0; i < uploadsMap[fileId].totalChunks; i++) {
                                const chunkPath = path.join(folderPath, `chunk_${i}`);
                                const data = fs.readFileSync(chunkPath);
                                writeStream.write(data);
                        }
                        writeStream.end();
                        fs.rmSync(folderPath, { recursive: true, force: true });

                        const resizeVideo = async (tempVidPath: string, finalVidPath: string): Promise<void> => {
                                await new Promise<void>((resolve, reject) => {
                                        ffmpeg(tempVidPath)
                                                .outputOptions('-vf', 'scale=-2:720') // Resize to 720px height, maintain aspect ratio
                                                .save(finalVidPath) // Output video at the same path as input
                                                .on('end', () => {
                                                        console.log('Video resized successfully');
                                                        resolve();
                                                })
                                                .on('error', (err) => {
                                                        console.error('Error resizing video', err);
                                                        reject(err);
                                                });
                                });
                        };

                        await resizeVideo(tempPath, finalPath);
                        fs.rmSync(tempPath);


                        const scriptPath = 'src/scripts/vid_prep.py';
                        const args = ['-dir', `${batchName}`];
                        const pythonProcess = spawn('python', [scriptPath, ...args]);

                        let output = '';
                        let errorOutput = '';

                        pythonProcess.stdout.on('data', (data) => {
                                output += data.toString();
                        });

                        pythonProcess.stderr.on('data', (data) => {
                                errorOutput += data.toString();
                        });

                        delete uploadsMap[fileId];

                        pythonProcess.on('close', (code) => {
                                if (code === 0) {
                                        res.json({
                                                message: `${output.trim()}`,
                                        });
                                } else {
                                        res.status(500).json({
                                                message: 'leaving blank for now!',
                                                error: errorOutput.trim(),
                                        });
                                }
                        });
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

                // Wrap the write operations in a Promise to ensure completion before calling prepImg
                if (uploadsMap[fileId].receivedChunks === uploadsMap[fileId].totalChunks) {
                        const finalPath = path.join(__dirname, '..', '..', 'uploads', fileName);
                        const writeStream = fs.createWriteStream(finalPath);

                        // Create a promise to handle stream completion
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

                        // Remove chunk folder after stream ends
                        await streamFinished;
                        fs.rmSync(folderPath, { recursive: true, force: true });

                        // Call prepImg after the write stream has finished
                        const val = await prepImg(batchName);

                        // Handle response based on prepImg result
                        if (val === "ok") {
                                delete uploadsMap[fileId];
                                res.json({ message: `File ${fileName} labeled` });
                        } else {
                                delete uploadsMap[fileId];
                                res.json({ message: `${fileName} failed because of: ${val}` });
                        }
                } else {
                        res.json({
                                message: `Chunk ${chunkIndex} received`,
                        });
                }
        }
);

export default router; 
