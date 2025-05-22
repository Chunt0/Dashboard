import express, { Request, Response } from 'express';
import { spawn } from 'child_process';
import cors from 'cors';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();

// Environment variables setup (optional)
const PORT = process.env.PORT || 3003;

// Setup upload directory
const uploadDir = path.resolve(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		cb(null, file.originalname);
	}
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
	const allowedTypes = ['video/mp4', 'image/png', 'image/jpeg', 'image/webp'];
	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

const upload = multer({ storage: storage });

interface UploadProgress {
	totalChunks: number;
	receivedChunks: number;
	fileName: string;
	folderPath: string;
}

const uploadsMap: Record<string, UploadProgress> = {};

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.get('/', (req: Request, res: Response): void => {
	res.send('Hello, TypeScript Express!');
});

app.get('/health', (req: Request, res: Response): void => {
	res.json({ status: 'ok' });
});

app.post(
	'/api/upload/video',
	upload.single('chunk'),
	(req: Request, res: Response): void => {
		const { fileId, chunkIndex, totalChunks, fileName, fileSize } = req.body;
		const chunkFile = req.file;

		if (!fileId || !chunkIndex || !fileName || !chunkFile) {
			return res.status(400).send(`request body:${req.body}`) as unknown as void;
		}

		const folderPath = path.join(__dirname, 'temp', fileId);
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
				folderPath
			}
		}

		uploadsMap[fileId].receivedChunks++;

		if (uploadsMap[fileId].receivedChunks === uploadsMap[fileId].totalChunks) {
			const finalPath = path.join(__dirname, 'uploads', fileName);
			const writeStream = fs.createWriteStream(finalPath);

			for (let i = 0; i < uploadsMap[fileId].totalChunks; i++) {
				const chunkPath = path.join(folderPath, `chunk_${i}`);
				const data = fs.readFileSync(chunkPath);
				writeStream.write(data);
			}
			writeStream.end();
			fs.rmSync(folderPath, { recursive: true, force: true });

			const pythonProcess = spawn('python', ['src/scripts/vid_prep.py']);

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
						error: errorOutput.trim(), // fix the syntax error
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

app.post(
	'/api/upload/image',
	upload.array('files', 1000),
	(req: Request, res: Response): void => {
		const files = req.files as Express.Multer.File[] | undefined;
		// allow for images and videos
		if (!files || files.length === 0 || !files[0].mimetype.startsWith('image/')) {
			res.status(400).json({ message: 'No files uploaded' });
			return;
		}
		const fileInfos = files.map(file => ({
			originalName: file.originalname,
			storedPath: file.path,
			mimeType: file.mimetype,
			size: file.size,
		}));

		const pythonProcess = spawn('python', ['src/scripts/img_prep.py']);

		let output = '';
		let errorOutput = '';

		pythonProcess.stdout.on('data', (data) => {
			output += data.toString();
		});

		pythonProcess.stderr.on('data', (data) => {
			errorOutput += data.toString();
		});

		pythonProcess.on('close', (code) => {
			if (code === 0) {
				res.json({
					message: `${files.length} files uploaded successfully\n${output.trim()}`,
					files: fileInfos,
				});
			} else {
				res.status(500).json({
					message: `${files.length} files uploaded successfully`,
					error: errorOutput.trim(), // fix the syntax error
				});
			}
		});
	}
);

app.listen(PORT, () => {
	console.log(`Server listening on https://0.0.0.0:${PORT}`);
});
