import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();

const PORT = process.env.PORT || 3003;

const uploadDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination(req, file, callback) => { callback(null, uploadDir); },
filename(req, file, callback) => {
	const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
	const ext = path.extname(file.originalname);
	const basename = path.basename(file.originalname, ext)
	const new_filename = `${basename}-${uniqueSuffix}${ext}`;
	callback(null, new_filename)
}
});

const upload = multer({ storage });

app.use(express.json());
app.use(cors());

app.get('/', (req: Request, res: Response) => {
	res.send('Hello!');
});

app.post('/api/upload', upload.array('files', 10000), (req: Request, res: Response) => {
	const files = req.files as Express.Multer.File[] | undefined;

	if (!files || files.length === 0) {
		return res.status(400).json({ message: 'No files uploaded' });
	}
	const fileInfos = files.map(file => ({
		originalName: file.originalname,
		storedPath: file.path,
		mimeType: file.mimetype,
		size: file.size,
	}));
	res.json({

	})
}
