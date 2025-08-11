import fs from 'fs';
import path from 'path';
import TOML from '@iarna/toml';
import { spawn } from 'child_process';
import { BaseConfig, DatasetConfig, WanConfig } from './config';

const datasetDir = process.env.DATA_DIR || path.resolve(__dirname, '../../../datasets/');
const modelsDir = process.env.MODEL_DIR || path.resolve(__dirname, '../../../models/');
const diffusionPipeDir = process.env.DIFFUSION_PIPE_DIR || path.resolve(__dirname, '../../../../diffusion-pipe/');
const tempDir = process.env.TEMP_DIR || path.resolve(__dirname, '../../temp/');
const datasetTomlTemplate = process.env.DATASET_TOML_TEMPLATE || path.resolve(__dirname, '../../examples/dataset.toml');
const wanTomlTemplate = process.env.WAN_TOML_TEMPLATE || path.resolve(__dirname, '../../examples/wan.toml');

export interface Job {
        dataset: string;
        modelType: string
}

export async function trainWan(job: Job) {
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
        // TODO: Update this so that it detects whether there are multiple GPUS or not and change the spawned command accordingly
        let modelTemplatePath: string;
        modelTemplatePath = wanTomlTemplate;
        const modelTomlString = fs.readFileSync(modelTemplatePath, 'utf-8');
        const modelConfig = TOML.parse(modelTomlString) as unknown as BaseConfig<WanConfig>;
        const outputDir = path.resolve(datasetDir, job.dataset, 'output');
        modelConfig.output_dir = outputDir;
        modelConfig.dataset = datasetConfigOutPath;
        // set specific model params:
        const checkpointPath = path.resolve(modelsDir, ''); // TODO: Need to figure out what the specific checkpoint needs to be. This will have to be tested out cuz i'm not even sure i cna handle training the big models. My guess is i need to move a copy of the repackaged model into the models/wan directory
        modelConfig.model.ckpt_path = checkpointPath;
        const modelConfigOutPath = path.resolve(tempDir, `${job.dataset}.toml`);
        const updatedModelTomlString = TOML.stringify(modelConfig as any);
        fs.writeFileSync(modelConfigOutPath, updatedModelTomlString);
        console.log(`Training ${job.dataset} for model: ${job.modelType}`);
        const trainingScriptPath = path.resolve(diffusionPipeDir, 'train.py');
        await new Promise<void>((resolve, reject) => {
                const child = spawn('deepspeed', [
                        '--num_gpus=1',
                        trainingScriptPath,
                        '--deepspeed',
                        '--config',
                        modelConfigOutPath
                ], { stdio: 'inherit' });

                let didFinish = false;

                function finish(label: string, code?: number | null, error?: Error) {
                        if (didFinish) return;
                        didFinish = true;

                        if (error) {
                                console.error(`[${label}] Subprocess error:`, error);
                        } else {
                                console.log(`[${label}] Subprocess exited with code:`, code);
                        }

                        // always resolve so the script continues
                        resolve();
                }

                child.on('error', (err) => finish('error', null, err));
                child.on('exit', (code) => finish('exit', code));
                child.on('close', (code) => finish('close', code));
        });
        fs.unlinkSync(datasetConfigOutPath);
        fs.unlinkSync(modelConfigOutPath);
};

