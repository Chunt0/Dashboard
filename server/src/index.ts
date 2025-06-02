import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use(cors());
app.use('/api', routes);

app.listen(PORT, () => {
	console.log(`Server listening on https://0.0.0.0:${PORT}`);
});
