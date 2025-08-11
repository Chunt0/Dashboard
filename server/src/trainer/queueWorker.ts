import { getRedisClient } from '../utils/redisClient';
import { trainFlux, Job } from './flux';
import { trainSdxl } from './sdxl';

async function startWorker() {
        const redis = await getRedisClient();
        console.log('Queue worker started. Waiting for training jobs...');

        while (true) {
                try {
                        // Block until a job is available
                        const result = await redis.blPop('training_queue', 0); // 0 = block forever

                        if (!result || !result.element) {
                                continue;
                        }

                        const jobStr = result.element;
                        console.log('Dequeued job:', jobStr);

                        let job: Job;
                        try {
                                job = JSON.parse(jobStr) as Job;
                        } catch (err) {
                                console.error('Failed to parse job:', jobStr);
                                continue;
                        }

                        switch (job.modelType) {
                                case 'flux':
                                        await trainFlux(job);
                                        break;
                                case 'sdxl':
                                        await trainSdxl(job);
                                        break;
                                case 'wan':
                                        // TODO: handle WAN jobs
                                        break;
                                case 'ltx':
                                        // TODO: handle LTX jobs
                                        break;
                                default:
                                        console.error(`Unknown modelType: ${job.modelType}`);
                        }
                } catch (err) {
                        console.error('Worker error:', err);
                }
        }
}

startWorker().catch((err) => {
        console.error('Worker crashed:', err);
        process.exit(1);
});
