import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
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
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		const basename = path.basename(file.originalname, ext);
		cb(null, `${basename}-${uniqueSuffix}${ext}`);
	}
});
const upload = multer({ storage });

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
	'/api/upload',
	upload.array('files', 100000),
	(req: Request, res: Response): void => {
		const files = req.files as Express.Multer.File[] | undefined;
		if (!files || files.length === 0) {
			res.status(400).json({ message: 'No files uploaded' });
			return;
		}
		const fileInfos = files.map(file => ({
			originalName: file.originalname,
			storedPath: file.path,
			mimeType: file.mimetype,
			size: file.size,
		}));
		res.json({
			message: `${files.length} files uploaded successfully`,
			files: fileInfos,
		});
	}
);

// Start server
app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
