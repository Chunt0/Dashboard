import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import routes from './routes';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(express.json());
app.use(cors());
app.use('/api', routes);

if (NODE_ENV === 'production') {
        app.use(express.static(path.join(__dirname, '../client/dist')));
        app.get('/', (req: Request, res: Response) => {
                res.sendFile(path.resolve(__dirname, '../client/dist/index.html'));
        });
}


app.listen(PORT, () => {
        console.log(`Server listening on ${PORT}`);
});
