import express from 'express';
import cors from 'cors';
import routes from './routes';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

const corsOptions = {
        origin: 'https://dashboard.putty-ai.com', // your frontend URL
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // allowed methods
};
app.use(express.json());
app.use(cors(corsOptions));
app.use('/api', routes);

app.listen(PORT, () => {
        console.log(`Server listening on ${PORT}`);
});
