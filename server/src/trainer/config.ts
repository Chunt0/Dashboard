export interface FluxConfig {
        type: string;
        diffusers_path: string;
        transformer_path: string;
        dtype: string;
        transformer_dtype: string;
        flux_shift: boolean;
}

export interface SDXLConfig {
        type: string;
        checkpoint_path: string;
        dtype: string;
        min_snr_gamma: number;
        debiased_estimation_loss: boolean;
        //unet_lr: number; // ie. 4e-5 i don't know how typescript handles this number formatting
        //text_encoder_1_lr: number; // ie. 4e-5 i don't know how typescript handles this number formatting
        //text_encoder_2_lr: number; // ie. 4e-5 i don't know how typescript handles this number formatting
}

export interface WanConfig {
        type: string;
        ckpt_path: string;
        dtype: string;
        //transformer_dtype: string; // this is currently commented out in the example, not sure why gotta figure this one out
        timestep_sample_method: string;
}

export interface LTXConfig {
        type: string;
        diffusers_path: string;
        single_file_path: string;
        dtype: string;
        //transformer_dtype: string; // this is commented out in the example
        timestep_sample_method: string;
        //first_frame_conditioning_p : number;
}

export interface AdapterConfig {
        type: string;
        rank: number;
        dtype: string;
}

export interface OptimizerConfig {
        type: string;
        lr: number;
        betas: [number, number];
        weight_decay: number;
}

export interface MonitoringConfig {
        enable_wandb: boolean;
        wandb_api_key: string;
        wandb_tracker_name: string;
        wandb_run_name: string;
}

export interface BaseConfig<T> {
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
        model: T;
        adapter: AdapterConfig;
        optimizer: OptimizerConfig;
        monitoring: MonitoringConfig;
}

export interface DirectoryEntry {
        path: string;
        num_repeats: number;
}

export interface DatasetConfig {
        resolutions: [number];
        enable_ar_bucket: boolean;
        min_ar: number;
        max_ar: number;
        num_ar_buckets: number;
        directory: DirectoryEntry[];
}

