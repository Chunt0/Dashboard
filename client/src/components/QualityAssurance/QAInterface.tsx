import React, { useEffect, useRef, useState } from 'react';

const GET_FOLDERS_ENDPOINT = import.meta.env.VITE_GET_FOLDERS_ENDPOINT;
const LOAD_DATASET_ENDPOINT = import.meta.env.VITE_LOAD_DATASET_ENDPOINT;
const SUBMIT_ENDPOINT = import.meta.env.VITE_SUBMIT_ENDPOINT;
const MEDIA_ENDPOINT = import.meta.env.VITE_MEDIA_ENDPOINT;

const QAInterface: React.FC = () => {
        const [mediaType, setMediaType] = useState<string>('');
        const [mediaSrc, setMediaSrc] = useState('');
        const [mediaFile, setMediaFile] = useState('');
        const [folder, setFolder] = useState<string>('');
        const [label, setLabel] = useState<string>('');
        const [folders, setFolders] = useState<string[]>([]);
        const [removeMedia, setRemoveMedia] = useState<boolean>(false);
        const textareaRef = useRef(null);
        const buttonRef = useRef(null);

        useEffect(() => {
                const fetchFolders = async () => {
                        const response = await fetch(GET_FOLDERS_ENDPOINT);
                        const data = await response.json();
                        setFolders(data);
                };
                fetchFolders();
        }, []);


        const handleKeyDown = (e: React.ChangeEvent<HTMLButtonElement>) => {
                if (e.key === 'Enter') {
                        e.preventDefault();
                        if (buttonRef.current) {
                                buttonRef.current.click();
                        }
                }
        };

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
                        if (data.mediaFile.endsWith('.mp4')) {
                                setMediaType('video');
                        } else {
                                setMediaType('image');
                        }
                        const src = MEDIA_ENDPOINT + '/' + folder + '/' + data.mediaFile;
                        setMediaSrc(src);
                        if (textareaRef.current) {
                                textareaRef.current.focus();
                        }

                } catch (error) {
                        console.error('Error fetching data:', error);
                }
        };

        const handleSubmit = async () => {
                try {
                        const response = await fetch(SUBMIT_ENDPOINT, {
                                method: 'POST',
                                headers: {
                                        'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ folder, mediaFile, label, removeMedia }),
                        });
                        await response.json();
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
                        <div className="p-6 bg-gradient-to-r from-red-800 to-amber-800 flex">
                                <h4 className="animate-pulse text-xl font-bold text-purple-800 shadow-lg p-2 rounded-lg bg-gradient-to-r from-green-400 to-purple-600 text-white">
                                        Select dataset for QA
                                </h4>
                                <select
                                        className="p-2 m-2 border border-gray-300 rounded bg-gray-100 text-purple-600 font-bold"
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
                        <div className="flex bg-gradient-to-r from-red-800 to-amber-800 space-y-40 items-center">
                                <div className="flex flex-col items-center">
                                        <textarea
                                                ref={textareaRef}
                                                onKeyDown={handleKeyDown}
                                                value={label}
                                                onChange={(e) => setLabel(e.target.value)}
                                                placeholder="Label"
                                                className="p-2 m-5 border bg-white border-gray-300 rounded w-200 h-24 resize-none font-bold px-4" // Multi-line box with fixed size
                                        ></textarea>
                                        <div className="flex items-center space-x-2 text-xl">
                                                <h1 className='font-extrabold'> Remove? </h1>
                                                <input
                                                        type="checkbox"
                                                        id="removeCheckbox"
                                                        className="form-checkbox m-5"
                                                        checked={removeMedia}
                                                        onChange={handleCheckboxChange}
                                                />
                                        </div>
                                        <button
                                                ref={buttonRef}
                                                onClick={handleSubmit}
                                                className="w-[600px] px-4 bg-white text-purple-600 font-bold py-3 rounded-lg shadow-lg hover:bg-gradient-to-r from-purple-600 to-green-400 hover:text-white transition"
                                        >
                                                <h2>Next</h2>
                                        </button>
                                </div>
                                <div className="m-10">
                                        {mediaSrc && mediaType === 'video' && (
                                                <video controls width='1280' key={mediaSrc}>
                                                        <source src={mediaSrc} type="video/mp4" />
                                                </video>
                                        )}
                                        {mediaSrc && mediaType === 'image' && (
                                                <img key={mediaSrc} src={mediaSrc} alt="Loaded media" width="800" />
                                        )}
                                </div>
                        </div >
                </>
        );

};

export default QAInterface;

