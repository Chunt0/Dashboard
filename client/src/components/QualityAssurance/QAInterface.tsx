import React, { useEffect, useRef, useState } from 'react';
import { appendApiKey, fetchWithAuth } from '../../utils/api';

const GET_FOLDERS_ENDPOINT = import.meta.env.VITE_GET_FOLDERS_ENDPOINT;
const LOAD_DATASET_ENDPOINT = import.meta.env.VITE_LOAD_DATASET_ENDPOINT;
const SUBMIT_ENDPOINT = import.meta.env.VITE_SUBMIT_ENDPOINT;
const MEDIA_ENDPOINT = import.meta.env.VITE_MEDIA_ENDPOINT;
const COMPLETION_STATUS_ENDPOINT = import.meta.env.VITE_COMPLETION_STATUS_ENDPOINT;
const COMPLETE_ALL_ENDPOINT = import.meta.env.VITE_COMPLETE_ALL_ENDPOINT;

const QAInterface: React.FC = () => {
        const [mediaType, setMediaType] = useState<string>('');
        const [mediaSrc, setMediaSrc] = useState('');
        const [mediaFile, setMediaFile] = useState('');
        const [folder, setFolder] = useState<string>('');
        const [label, setLabel] = useState<string>('');
        const [folders, setFolders] = useState<string[]>([]);
        const [removeMedia, setRemoveMedia] = useState<boolean>(false);
        const [allCompleted, setAllCompleted] = useState<boolean>(false);
        const [remainingFiles, setRemainingFiles] = useState<number>(0);
        const textareaRef = useRef<HTMLTextAreaElement>(null);
        const buttonRef = useRef<HTMLButtonElement>(null);

        useEffect(() => {
                const fetchFolders = async () => {
			const response = await fetchWithAuth(GET_FOLDERS_ENDPOINT);
                        const data = await response.json();
                        setFolders(data);
                };
                fetchFolders();
        }, []);


        const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter') {
                        e.preventDefault();
                        if (buttonRef.current) {
                                buttonRef.current.click();
                        }
                }
        };

        const checkCompletionStatus = async (folderName: string) => {
                if (!folderName) return;
                try {
			const response = await fetchWithAuth(`${COMPLETION_STATUS_ENDPOINT}/${folderName}`);
                        const data = await response.json();
                        setAllCompleted(data.allCompleted);
                        setRemainingFiles(data.remainingFiles);
                } catch (error) {
                        console.error('Error checking completion status:', error);
                }
        };

        const handleFolderSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
                const selectedFolder = e.target.value;
                setFolder(selectedFolder);
                checkCompletionStatus(selectedFolder);
        };

        const handleLoadSelection = async () => {
                try {
                        setRemoveMedia(false);
			const response = await fetchWithAuth(LOAD_DATASET_ENDPOINT, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ folder }),
			});

			const data = await response.json();
			setLabel(data.label || '');
			setMediaFile(data.mediaFile || '');
			if (!data.mediaFile) {
				setMediaSrc('');
				return;
			}
			if (data.mediaFile.endsWith('.mp4')) {
				setMediaType('video');
			} else {
				setMediaType('image');
			}
			const src = MEDIA_ENDPOINT + '/' + folder + '/' + data.mediaFile;
			setMediaSrc(appendApiKey(src));
                        if (textareaRef.current) {
                                textareaRef.current.focus();
                        }

                } catch (error) {
                        console.error('Error fetching data:', error);
                }
        };

        const handleSubmit = async () => {
                try {
			const response = await fetchWithAuth(SUBMIT_ENDPOINT, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ folder, mediaFile, label, removeMedia }),
			});
                        await response.json();
                        checkCompletionStatus(folder);
                        handleLoadSelection();
                } catch (error) {
                        console.error('Error fetching data:', error);
                }

        };

        const handleCompleteAll = async () => {
                if (!folder) return;

                try {
			const response = await fetchWithAuth(COMPLETE_ALL_ENDPOINT, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ folder }),
			});

                        if (response.ok) {
                                setAllCompleted(true);
                                setMediaSrc(''); // Clear the media view
                                setRemainingFiles(0);
                        } else {
                                console.error('Failed to complete all files.');
                        }
                } catch (error) {
                        console.error('Error completing all files:', error);
                }
        };

        const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                setRemoveMedia(e.target.checked);
        };

		return (
			<div className="mx-auto w-full max-w-6xl">
				<div className="border border-slate-800 bg-slate-950 p-6 sm:p-8">
					<div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
						<div>
							<p className="text-xs font-medium text-slate-400">Quality Assurance</p>
							<h2 className="mt-3 text-2xl font-semibold text-slate-100 sm:text-3xl">Review labels.</h2>
							<p className="mt-2 max-w-xl text-sm text-slate-300">
								Select a dataset to audit labels and keep training data clean.
							</p>
						</div>
						<div className="flex flex-wrap items-center gap-3">
							<select
								value={folder}
								className="min-w-[220px] border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-500"
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
								disabled={!folder}
								className="border border-slate-700 bg-slate-900 px-5 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
							>
								Load Dataset
							</button>
						</div>
					</div>
				</div>

				<div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
					<div className="border border-slate-800 bg-slate-950 p-6">
						{allCompleted ? (
							<div className="flex flex-col items-center justify-center gap-3 text-center">
								<div className="border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200">
									All files completed
								</div>
								<h3 className="text-xl font-semibold text-slate-100">Great work.</h3>
								<p className="text-sm text-slate-300">All media files have been processed.</p>
							</div>
						) : (
							<div className="flex flex-col gap-5">
								<div>
									<label className="text-xs font-medium text-slate-400">Label</label>
									<textarea
										ref={textareaRef}
										onKeyDown={handleKeyDown}
										value={label}
										onChange={(e) => setLabel(e.target.value)}
										placeholder="Describe the scene or action"
										className="mt-2 min-h-[140px] w-full border border-slate-700 bg-slate-900 p-4 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-500"
									/>
								</div>
								<div className="flex items-center gap-3 text-sm font-medium text-slate-300">
									<input
										type="checkbox"
										id="removeCheckbox"
										className="h-4 w-4 border-slate-600 bg-slate-900 text-slate-200 focus:ring-slate-500"
										checked={removeMedia}
										onChange={handleCheckboxChange}
									/>
									<label htmlFor="removeCheckbox">Mark for removal</label>
								</div>
								<div className="flex flex-col gap-3">
									<button
										ref={buttonRef}
										onClick={handleSubmit}
										className="w-full border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
									>
										Next item
									</button>
									<button
										onClick={handleCompleteAll}
										disabled={!folder}
										className="w-full border border-slate-700 bg-slate-950 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
									>
										Accept all labels
									</button>
								</div>
								{remainingFiles > 0 && (
									<div className="border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-300">
										{remainingFiles} file{remainingFiles !== 1 ? 's' : ''} remaining
									</div>
								)}
							</div>
						)}
					</div>

					<div className="border border-slate-800 bg-slate-950 p-4 text-slate-100">
						{!allCompleted && mediaSrc && mediaType === 'video' && (
							<video controls className="w-full" key={mediaSrc}>
								<source src={mediaSrc} type="video/mp4" />
							</video>
						)}
						{!allCompleted && mediaSrc && mediaType === 'image' && (
							<img key={mediaSrc} src={mediaSrc} alt="Loaded media" className="w-full" />
						)}
						{!allCompleted && !mediaSrc && (
							<div className="flex h-full min-h-[320px] items-center justify-center border border-slate-800 bg-slate-950 text-sm text-slate-400">
								Media preview will appear here.
							</div>
						)}
                                </div>
                        </div>
                </div>
        );

};

export default QAInterface;
