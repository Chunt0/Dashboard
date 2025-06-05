import React, { useEffect, useState } from 'react';

const GET_FOLDERS_ENDPOINT = import.meta.env.VITE_GET_FOLDERS_ENDPOINT;
const LOAD_DATASET_ENDPOINT = import.meta.env.VITE_LOAD_DATASET_ENDPOINT;
const UPLOAD_COMPLETE_ENDPOINT = import.meta.env.VITE_UPLOAD_COMPLETE_ENDPOINT;

const QAInterface: React.FC = () => {
        const [mediaType, setMediaType] = useState<string>('');
        const [mediaSrc, setMediaSrc] = useState('');
        const [mediaFile, setMediaFile] = useState('');
        const [folder, setFolder] = useState<string>('');
        const [label, setLabel] = useState<string>('');
        const [folders, setFolders] = useState<string[]>([]);
        const [removeMedia, setRemoveMedia] = useState<boolean>(false);

        useEffect(() => {
                const fetchFolders = async () => {
                        const response = await fetch(GET_FOLDERS_ENDPOINT);
                        const data = await response.json();
                        setFolders(data);
                };
                fetchFolders();
        }, []);

        const handleFolderSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
                setFolder(e.target.value);
        };

        const handleLoadSelection = async () => {
                try {
                        setRemoveMedia(false);
                        const response = await fetch(LOAD_DATASET_ENDPOINT, {
                                method: 'POST',
                                headers: {
                                        'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ folder }),
                        });

                        const data = await response.json();
                        setLabel(data.label);
                        setMediaFile(data.mediaFile);
                        if (mediaFile.endsWith('.mp4')) {
                                setMediaType('video');
                        } else {
                                setMediaType('img');
                        }
                        const src = LOAD_DATASET_ENDPOINT + '/' + folder + '/' + mediaFile;
                        setMediaSrc(src);

                } catch (error) {
                        console.error('Error fetching data:', error);
                }
        };

        const handleSubmit = async () => {
                try {
                        const response = await fetch(UPLOAD_COMPLETE_ENDPOINT, {
                                method: 'POST',
                                headers: {
                                        'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ folder, mediaFile, label, removeMedia }),
                        });
                        const data = await response.json();
                        console.log(data);
                        handleLoadSelection();
                } catch (error) {
                        console.error('Error fetching data:', error);
                }

        };

        const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                setRemoveMedia(e.target.checked);
        };

        return (
                <>
                        <div className="p-6 bg-white rounded-lg flex space-y-4">
                                <h4 className="animate-pulse text-xl font-bold mb-6 text-purple-800 shadow-lg p-2 rounded-lg bg-gradient-to-r from-green-400 to-purple-600 text-white">
                                        Select dataset for QA
                                </h4>
                                <select
                                        className="p-2 border border-gray-300 rounded bg-gray-100 text-purple-600 font-bold mb-4"
                                        onChange={handleFolderSelection}
                                >
                                        <option value="">Select Folder</option>
                                        {folders.map((folderName) => (
                                                <option key={folderName} value={folderName}>
                                                        {folderName}
                                                </option>
                                        ))}
                                </select>
                                <button
                                        onClick={handleLoadSelection}
                                        className="w-full px-4 bg-white text-purple-600 font-bold py-3 rounded-lg shadow-lg hover:bg-gradient-to-r from-purple-600 to-green-400 hover:text-white transition"
                                >
                                        <h2 className="animate-bounce">Load Dataset</h2>
                                </button>
                        </div>
                        <div className="flex flex-col mt-4 space-y-4 items-center">
                                <div>
                                        {mediaSrc && mediaType === 'video' && (
                                                <video controls width='1280' key={mediaSrc}>
                                                        <source src={mediaSrc} type="video/mp4" />
                                                </video>
                                        )}
                                        {mediaSrc && mediaType === 'image' && (
                                                <img src={mediaSrc} alt="Loaded media" width="1280" />
                                        )}
                                </div>
                                <input
                                        type="text"
                                        value={label}
                                        onChange={(e) => setLabel(e.target.value)}
                                        placeholder="Label"
                                        className="p-2 border border-gray-300 rounded w-[1280px]"
                                />
                                <div className="flex items-center space-x-2">
                                        <h2> Remove? </h2>
                                        <input
                                                type="checkbox"
                                                id="removeCheckbox"
                                                className="form-checkbox"
                                                checked={removeMedia}
                                                onChange={handleCheckboxChange}
                                        />
                                </div>
                                <button
                                        onClick={handleSubmit}
                                        className="w-[1280px] px-4 bg-white text-purple-600 font-bold py-3 rounded-lg shadow-lg hover:bg-gradient-to-r from-purple-600 to-green-400 hover:text-white transition"
                                >
                                        <h2>Next</h2>
                                </button>
                        </div >
                </>
        );

};

export default QAInterface;

