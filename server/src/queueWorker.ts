import fs from 'fs';
import path from 'path';
import TOML from '@iarna/toml';
import { getRedisClient } from './utils/redisClient';
import { spawn } from 'child_process';

interface FluxConfig {
        type: string;
        diffusers_path: string;
        transformer_path: string;
        dtype: string;
        transformer_dtype: string;
        flux_shift: boolean;
}
interface SDXLConfig {
        type: string;
        diffusers_path: string;
        transformer_path: string;
        dtype: string;
        transformer_dtype: string;
        flux_shift: boolean;
}
interface WanConfig {
        type: string;
        diffusers_path: string;
        transformer_path: string;
        dtype: string;
        transformer_dtype: string;
        flux_shift: boolean;
}
interface LTXConfig {
        type: string;
        diffusers_path: string;
        transformer_path: string;
        dtype: string;
        transformer_dtype: string;
        flux_shift: boolean;
}

interface AdapterConfig {
        type: string;
        rank: number;
        dtype: string;
}

interface OptimizerConfig {
        type: string;
        lr: number;
        betas: [number, number];
        weight_decay: number;
}

interface MonitoringConfig {
        enable_wandb: boolean;
        wandb_api_key: string;
        wandb_tracker_name: string;
        wandb_run_name: string;
}

interface BaseConfig {
        output_dir: string;
        dataset: string;
        epochs: number;
        micro_batch_size_per_gpu: number;
        pipeline_stages: number;
        gradient_accumulation_steps: number;
        gradient_clipping: number;
        warmup_steps: number;
        eval_every_n_epochs: number;
        eval_before_first_step: boolean;
        eval_micro_batch_size_per_gpu: number;
        eval_gradient_accumulation_steps: number;
        save_every_n_epochs: number;
        checkpoint_every_n_epochs: number;
        activation_checkpointing: boolean;
        partition_method: string;
        save_dtype: string;
        caching_batch_size: number;
        compile: boolean;
        steps_per_print: number;
        model: FluxConfig | SDXLConfig | WanConfig | LTXConfig;
        adapter: AdapterConfig;
        optimizer: OptimizerConfig;
        monitoring: MonitoringConfig;
}

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
                                const modelConfig = TOML.parse(modelTomlString) as unknown as BaseConfig;
                                const outputDir = path.resolve(datasetDir, job.dataset, 'output');
                                modelConfig.output_dir = outputDir;
                                modelConfig.dataset = datasetConfigOutPath;
                                const diffusersPath = path.resolve(modelsDir, 'flux');
                                modelConfig.model.diffusers_path = diffusersPath;
                                const transformerPath = path.resolve(diffusersPath, 'flux1-dev.safetensors');
                                modelConfig.model.transformer_path = transformerPath;
                                const modelConfigOutPath = path.resolve(tempDir, `${job.dataset}.toml`);
                                fs.writeFileSync(modelConfigOutPath, modelTomlString);
                                console.log(`Training ${job.dataset} for model: ${job.modelType}`);
                                const trainingScriptPath = path.resolve(diffusionPipeDir, 'train.py');
                                const child = spawn('deepspeed', [
                                        '--num_gpus=1',
                                        trainingScriptPath,
                                        '--deepspeed',
                                        '--config',
                                        modelConfigOutPath
                                ], { stdio: 'inherit' });

                                child.on('exit', (code) => {
                                        console.log(`Training process exited with code ${code}`);
                                });
                                fs.unlinkSync(datasetConfigOutPath);
                                fs.unlinkSync(modelConfigOutPath);
                                break;
                        default:
                                throw new Error(`Unknown modelType: ${job.modelType}`);
                }


        }
}

startWorker().catch(err => {
        console.error('Worker crashed:', err);
        process.exit(1);
});

