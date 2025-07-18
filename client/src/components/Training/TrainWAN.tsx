import React, { useEffect, useState } from 'react';

const GET_COMPLETED_DATASETS_ENDPOINT = import.meta.env.VITE_GET_COMPLETED_DATASETS_ENDPOINT;

const TRAIN_WAN_MODEL_ENDPOINT = import.meta.env.VITE_TRAIN_WAN_MODEL_ENDPOINT;

const TrainWAN: React.FC = () => {
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

        const handleTrainWANModel = async () => {
                try {
                        const response = await fetch(TRAIN_WAN_MODEL_ENDPOINT, {
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
                // Full page with colorful gradient background
                <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-yellow-300 flex items-center justify-center p-4">
                        {/* Container for centered content */}
                        <div className="text-center max-w-md w-full space-y-6">
                                {/* Bouncing animated text */}
                                <div className="animate-bounce text-2xl font-bold text-white">
                                        Select a Dataset To Train a WAN2.1 LoRA!
                                </div>
                                {/* Selection box */}
                                <select
                                        className="w-full p-3 bg-white rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        value={dataset}
                                        onChange={handleFolderSelection}
                                >
                                        <option value="" disabled>Select a dataset</option>
                                        {datasets.map((ds) => (
                                                <option key={ds} value={ds}>{ds}</option>
                                        ))}
                                </select>
                                {/* Train button */}
                                <button
                                        onClick={handleTrainWANModel}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
                                >
                                        Train!
                                </button>
                                <br />
                                <p className="text-4xl font-extrabold text-white mb-6">{logMessage}</p>
                        </div>
                </div>
        );
};

export default TrainWAN;

