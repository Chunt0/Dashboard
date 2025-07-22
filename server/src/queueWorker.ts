import { getRedisClient } from './utils/redisClient';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function startWorker() {
        const redis = await getRedisClient();

        console.log('Queue worker started. Waiting for training jobs...');

        while (true) {
                const jobStr = await redis.rPop('training_queue');

                if (jobStr) {
                        console.log('Dequeued job:', jobStr);
                        const job = JSON.parse(jobStr);

                        console.log(`Simulating training for model: ${job.modelType}`);
                        await sleep(60 * 1000); // simulate 1 minute training time
                        console.log(`Finished simulated training for: ${job.modelType}`);
                }
        }
}

startWorker().catch(err => {
        console.error('Worker crashed:', err);
        process.exit(1);
});

