import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

dotenv.config();


const uploadDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		const ext = path.extname(file.originalname);
		cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
	},
});

const upload = multer({ storage });

const app = express();
//const PORT = parseInt(process.env.PORT || 3000, 10);
const HOST = process.env.HOST || "localhost";
const PORT = 3003

app.use(express.json());
app.use(cors());

app.get('/', (req: Request, res: Response) => {
	res.send('Server is running');
});

app.get('/health', (req: Request, res: Response) => {
	res.json({ status: 'ok', message: 'Server is healthy' });
});

app.post('/api/upload', upload.array('files', 100000), (req: Request, res: Response) => {
	const files = req.files as Express.Multer.File[] | undefined;

	if (!files || files.length === 0 {
		return res.status(400).json({ message: 'No files uploaded' });
	}

	const fileInfos = files.map((file) => ({
		originalName: file.originalname,
		storedPath: file.path,
		mimeType: file.mimetype,
		size: file.size,
	}));

	res.json({
		message: `${files.length} file(s) uploaded successfully.`,
		files: fileInfos,
	});
});

app.listen(PORT, HOST, () => {
	console.log(`Server listening on http://${HOST}:${PORT}`);
});
