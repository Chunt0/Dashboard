import express from 'express';
import cors from 'cors';
import routes, { processTrainingQueue } from './routes';
import dotenv from 'dotenv';
import { getRedisClient } from './utils/redisClient';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use(cors({
        origin: 'https://dashboard.putty-ai.com',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
}));

app.use('/api', routes);

let server: ReturnType<typeof app.listen>;

async function startServer() {
        try {
                const redis = await getRedisClient();
                await redis.ping();

                server = app.listen(PORT, () => {
                        console.log(`Server listening on ${PORT}`);
                });

                // Start the training queue processor
                processTrainingQueue();

                process.on('SIGINT', shutdown);
                process.on('SIGTERM', shutdown);
        } catch (err) {
                console.error('Fatal startup error:', err);
                process.exit(1);
        }
}

async function shutdown() {
        console.log('Shutting down gracefully...');
        if (server) server.close();
        try {
                const redis = await getRedisClient();
                await redis.quit();
                console.log('Redis connection closed.');
        } catch (err) {
                console.error('Error during Redis shutdown:', err);
        } finally {
                process.exit(0);
        }
}

startServer();
