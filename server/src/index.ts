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
		const uploadPath = (file: Express.Multer.File): string => { // explicitly define return type as string
			const mimeType = file.mimetype; // use mimetype property
			if (mimeType === 'video/mp4') {
				return `${uploadDir}/video`; // upload to video directory
			} else if (mimeType.startsWith('image/')) {
				return `${uploadDir}/image`; // upload to image directory
			}
			return uploadDir; // default upload path
		};
		const path: string = uploadPath(file);
		cb(null, path);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		const basename = path.basename(file.originalname, ext);
		cb(null, `${basename}-${uniqueSuffix}${ext}`);
	}
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
	const allowedTypes = ['video/mp4', 'image/png', 'image/jpeg']; // allow png and jpeg
	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

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
	upload.array('files', 10),
	(req: Request, res: Response): void => {
		const files = req.files as Express.Multer.File[] | undefined;
		// allow for images and videos
		if (!files || files.length === 0 || (!files[0].mimetype.includes('video/mp4'))) {
			res.status(400).json({ message: 'No files uploaded' });
			return;
		}
		const fileInfos = files.map(file => ({
			originalName: file.originalname,
			storedPath: file.path,
			mimeType: file.mimetype,
			size: file.size,
		}));

		const pythonProcess = spawn('python', ['src/scripts/vid_prep.py']);

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
