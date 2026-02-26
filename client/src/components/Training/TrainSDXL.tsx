import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../utils/api';

const GET_COMPLETED_DATASETS_ENDPOINT = import.meta.env.VITE_GET_COMPLETED_DATASETS_ENDPOINT;

const TRAIN_SDXL_MODEL_ENDPOINT = import.meta.env.VITE_TRAIN_SDXL_MODEL_ENDPOINT;

const TrainSDXL: React.FC = () => {
        // State for selected dataset
        const [logMessage, setLogMessage] = useState<string>('');
        const [dataset, setDataset] = useState('');
        const [datasets, setDatasets] = useState<string[]>([]);

        useEffect(() => {
                const fetchDatasets = async () => {
			const response = await fetchWithAuth(GET_COMPLETED_DATASETS_ENDPOINT);
                        const data = await response.json();
                        setDatasets(data);
                };
                fetchDatasets();
        }, []);

        const handleFolderSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
                setDataset(e.target.value);
        }

        const handleTrainSDXLModel = async () => {
                try {
			const response = await fetchWithAuth(TRAIN_SDXL_MODEL_ENDPOINT, {
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
			<div className="w-full border border-slate-800 bg-slate-950 p-8 text-center">
				<p className="text-xs font-medium text-slate-400">SDXL Training</p>
				<h2 className="mt-3 text-2xl font-semibold text-slate-100">Select a dataset to train.</h2>
				<p className="mt-3 text-sm text-slate-300">Launch an SDXL LoRA run from a completed dataset.</p>
                                <select
					className="mt-6 w-full border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-500"
                                        value={dataset}
                                        onChange={handleFolderSelection}
                                >
                                        <option value="" disabled>Select a dataset</option>
                                        {datasets.map((ds) => (
                                                <option key={ds} value={ds}>{ds}</option>
                                        ))}
                                </select>
                                <button
                                        onClick={handleTrainSDXLModel}
					className="mt-4 w-full border border-slate-700 bg-slate-900 px-6 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
                                >
                                        Train SDXL
                                </button>
                                {logMessage && (
					<p className="mt-6 border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200">
                                                {logMessage}
                                        </p>
                                )}
                        </div>
                </div>
        );
};

export default TrainSDXL;
