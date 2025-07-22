import fs from 'fs';
import path from 'path';
import TOML from '@iarna/toml';
import { getRedisClient } from './utils/redisClient';

interface DirectoryEntry {
        path: string;
        num_repeats: number;
}

interface DatasetConfig {
        enable_ar_bucket: boolean;
        min_ar: number;
        max_ar: number;
        num_ar_buckets: number;
        directory: DirectoryEntry[];
}

const datasetDir = process.env.DATA_DIR || path.resolve(__dirname, '../../datasets/');
const modelsDir = process.env.MODEL_DIR || path.resolve(__dirname, '../../models/');
const diffusionPipeDir = process.env.DIFFUSION_PIPE_DIR || path.resolve(__dirname, '../../../diffusion-pipe/');
const tempDir = process.env.TEMP_DIR || path.resolve(__dirname, '../temp/');
const datasetTomlTemplate = process.env.DATASET_TOML_TEMPLATE || path.resolve(__dirname, '../examples/dataset.toml');
const fluxTomlTemplate = process.env.FLUX_TOML_TEMPLATE || path.resolve(__dirname, '../examples/flux.toml');
const sdxlTomlTemplate = process.env.SDXL_TOML_TEMPLATE || path.resolve(__dirname, '../examples/sdxl.toml');
const wanTomlTemplate = process.env.WAN_TOML_TEMPLATE || path.resolve(__dirname, '../examples/wan.toml');
const ltxTomlTemplate = process.env.LTX_TOML_TEMPLATE || path.resolve(__dirname, '../examples/ltx.toml');

async function startWorker() {
        const redis = await getRedisClient();
        console.log('Queue worker started. Waiting for training jobs...');

        while (true) {
                const jobStr = await redis.rPop('training_queue');

                if (!jobStr) continue;

                console.log('Dequeued job:', jobStr);
                const job = JSON.parse(jobStr);
                const datasetPath = path.resolve(datasetDir, job.dataset, 'completed');

                // --- Dataset TOML ---
                const datasetTomlString = fs.readFileSync(datasetTomlTemplate, 'utf-8');
                const datasetConfig = TOML.parse(datasetTomlString) as unknown as DatasetConfig;

                if (!Array.isArray(datasetConfig.directory) || datasetConfig.directory.length === 0) {
                        throw new Error('No [[directory]] entries found in dataset TOML.');
                }
                datasetConfig.directory[0].path = datasetPath;

                const updatedDatasetToml = TOML.stringify(datasetConfig as any);
                const datasetConfigOutPath = path.resolve(tempDir, `${job.dataset}-dataset.toml`);
                fs.writeFileSync(datasetConfigOutPath, updatedDatasetToml);

                // --- Model TOML ---
                let modelTemplatePath: string;
                switch (job.modelType) {
                        case 'flux':
                                modelTemplatePath = fluxTomlTemplate;
                                const modelTomlString = fs.readFileSync(modelTemplatePath, 'utf-8');
                                const modelConfig = TOML.parse(modelTomlString)
                                const modelConfigOutPath = path.resolve(tempDir, `${job.dataset}.toml`);
                                fs.writeFileSync(modelConfigOutPath, modelTomlString);
                                break;
                        case 'sdxl':
                                //modelTemplatePath = sdxlTomlTemplate;
                                break;
                        case 'wan':
                                //modelTemplatePath = wanTomlTemplate;
                                break;
                        case 'ltx':
                                //modelTemplatePath = ltxTomlTemplate;
                                break;
                        default:
                                throw new Error(`Unknown modelType: ${job.modelType}`);
                }


                console.log(`Training ${job.dataset} for model: ${job.modelType}`);
        }
}

startWorker().catch(err => {
        console.error('Worker crashed:', err);
        process.exit(1);
});

