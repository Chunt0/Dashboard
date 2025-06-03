import fs from 'fs';
import path from 'path';
import { Router, Request, Response } from 'express';

const router = Router();
const datasetDir = path.join(__dirname, '..', '..', '..', 'datasets'); // Define dataset directory

// Get the folder names contained in datasetDir
router.get('/folders', (req: Request, res: Response): void => {
	fs.readdir(datasetDir, { withFileTypes: true }, (err, files) => {
		if (err) {
			return res.status(500).json({ error: 'Failed to read directory' });
		}
		const folders = files
			.filter(file => file.isDirectory())
			.map(folder => folder.name);
		res.json(folders); // Return the list of folder names
	});
});

export default router;

