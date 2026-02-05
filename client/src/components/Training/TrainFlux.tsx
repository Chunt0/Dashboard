import React, { useEffect, useState } from 'react';

const GET_COMPLETED_DATASETS_ENDPOINT = import.meta.env.VITE_GET_COMPLETED_DATASETS_ENDPOINT;

const TRAIN_FLUX_MODEL_ENDPOINT = import.meta.env.VITE_TRAIN_FLUX_MODEL_ENDPOINT;

const TrainFlux: React.FC = () => {
        // State for selected dataset
        const [logMessage, setLogMessage] = useState<string>('');
        const [dataset, setDataset] = useState('');
        const [datasets, setDatasets] = useState<string[]>([]);

        useEffect(() => {
                const fetchDatasets = async () => {
                        const response = await fetch(GET_COMPLETED_DATASETS_ENDPOINT);
                        const data = await response.json();
                        setDatasets(data);
                };
                fetchDatasets();
        }, []);

        const handleFolderSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
                setDataset(e.target.value);
        }

        const handleTrainFluxModel = async () => {
                try {
                        const response = await fetch(TRAIN_FLUX_MODEL_ENDPOINT, {
                                method: 'POST',
                                headers: {
                                        'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(({ dataset })),
                        });
                        const data = await response.json();
                        setLogMessage(data.status);
                } catch (error) {
                        console.error('Error fetching data:', error);
                }
        };

        return (
                <div className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center justify-center">
                        <div className="w-full rounded-3xl border border-slate-200/80 bg-white/80 p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">Flux Training</p>
                                <h2 className="display mt-3 text-3xl text-slate-900">Select a dataset to train.</h2>
                                <p className="mt-3 text-sm text-slate-600">Launch a Flux LoRA run from a completed dataset.</p>
                                <select
                                        className="mt-6 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                                        value={dataset}
                                        onChange={handleFolderSelection}
                                >
                                        <option value="" disabled>Select a dataset</option>
                                        {datasets.map((ds) => (
                                                <option key={ds} value={ds}>{ds}</option>
                                        ))}
                                </select>
                                <button
                                        onClick={handleTrainFluxModel}
                                        className="mt-4 w-full rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                                >
                                        Train Flux
                                </button>
                                {logMessage && (
                                        <p className="mt-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                                                {logMessage}
                                        </p>
                                )}
                        </div>
                </div>
        );
};

export default TrainFlux;
