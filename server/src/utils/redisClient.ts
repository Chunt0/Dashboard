import { createClient, RedisClientType } from 'redis';

const redisClient: RedisClientType = createClient({
        url: 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
});

let isConnected = false;

export async function getRedisClient(): Promise<RedisClientType> {
        if (!isConnected) {
                try {
                        await redisClient.connect();
                        isConnected = true;
                } catch (err) {
                        console.error('Failed to connect to Redis:', err);
                        throw err;
                }
        }
        return redisClient;
}
