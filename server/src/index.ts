import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";

dotenv.config();

const app = express();
//const PORT = parseInt(process.env.PORT || 3000, 10);
const HOST = process.env.HOST || "localhost";
const PORT = 3003

app.use(express.json());
app.use(cors({
	origin: "https://label.putty-ai.com",
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.get('/health', cors({ origin: 'https://label.putty-ai.com' }), (req, res) => {
	res.json({ status: 'ok', message: 'Server is healthy' });
});

app.get('/', (req, res) => {
	res.send('Server is running');
})
	;

app.listen(PORT, HOST, () => {
	console.log(`Server listening on http://${HOST}:${PORT}`);
});
