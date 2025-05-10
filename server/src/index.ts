import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3003;

app.use(express.json());
app.use(cors());

app.get('/health', (req, res) => {
	res.json({ status: 'ok', message: 'Server is healthy' });
});

app.get('/', (req, res) => {
	res.send('Server is running');
})
	;

app.listen(PORT, "0.0.0.0", () => {
	console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
