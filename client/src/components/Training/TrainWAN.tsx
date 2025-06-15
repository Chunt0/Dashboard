import React, { useState } from 'react';

const TrainWAN: React.FC = () => {
        // State for selected dataset
        const [dataset, setDataset] = useState('');

        // List of datasets for selection
        const datasets = ['Dataset 1', 'Dataset 2', 'Dataset 3'];

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
                                        onChange={(e) => setDataset(e.target.value)}
                                >
                                        <option value="" disabled>Select a dataset</option>
                                        {datasets.map((ds) => (
                                                <option key={ds} value={ds}>{ds}</option>
                                        ))}
                                </select>
                                {/* Train button */}
                                <button
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
                                >
                                        Train!
                                </button>
                        </div>
                </div>
        );
};

export default TrainWAN;
