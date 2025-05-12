import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

dotenv.config();


const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir);
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

app.get('/', (req, res) => {
	res.send('Server is running');
});

app.get('/health', (req, res) => {
	res.json({ status: 'ok', message: 'Server is healthy' });
});

app.post('/upload', upload.array('file'), (req, res) => {
	if (!req.files || !(req.files instanceof Array)) {
		return res.status(400).json({ message: 'No files uploaded' });
	}

	const uploadedFiles = req.files.map((file: Express.Multer.File) = > ({
		filename: file.filename,
		path: file.path,
		originalname: file.originalname,
	}));

	res.json({
		message: 'Files uploaded successfully',
		files: uploadedFiles,
	});
});

app.listen(PORT, HOST, () => {
	console.log(`Server listening on http://${HOST}:${PORT}`);
});
