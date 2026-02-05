import React, { useEffect, useRef, useState } from 'react';

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
                        const response = await fetch(GET_FOLDERS_ENDPOINT);
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
                        const response = await fetch(`${COMPLETION_STATUS_ENDPOINT}/${folderName}`);
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
                        checkCompletionStatus(folder);
                        handleLoadSelection();
                } catch (error) {
                        console.error('Error fetching data:', error);
                }

        };

        const handleCompleteAll = async () => {
                if (!folder) return;

                try {
                        const response = await fetch(COMPLETE_ALL_ENDPOINT, {
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
                        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-8">
                                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                                        <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Quality Assurance</p>
                                                <h2 className="display mt-3 text-3xl text-slate-900 sm:text-4xl">Review labels with confidence.</h2>
                                                <p className="mt-2 max-w-xl text-sm text-slate-600">
                                                        Select a dataset to begin auditing labels and keeping your training data clean.
                                                </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                                <select
                                                        value={folder}
                                                        className="min-w-[220px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
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
                                                        className="rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                        Load Dataset
                                                </button>
                                        </div>
                                </div>
                        </div>

                        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
                                <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm">
                                        {allCompleted ? (
                                                <div className="flex flex-col items-center justify-center gap-3 text-center">
                                                        <div className="rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-700">
                                                                All files completed
                                                        </div>
                                                        <h3 className="display text-2xl text-slate-900">Great work!</h3>
                                                        <p className="text-sm text-slate-600">All media files have been processed.</p>
                                                </div>
                                        ) : (
                                                <div className="flex flex-col gap-5">
                                                        <div>
                                                                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Label</label>
                                                                <textarea
                                                                        ref={textareaRef}
                                                                        onKeyDown={handleKeyDown}
                                                                        value={label}
                                                                        onChange={(e) => setLabel(e.target.value)}
                                                                        placeholder="Describe the scene or action"
                                                                        className="mt-2 min-h-[140px] w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                                                                />
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                                                                <input
                                                                        type="checkbox"
                                                                        id="removeCheckbox"
                                                                        className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500/40"
                                                                        checked={removeMedia}
                                                                        onChange={handleCheckboxChange}
                                                                />
                                                                <label htmlFor="removeCheckbox">Mark for removal</label>
                                                        </div>
                                                        <div className="flex flex-col gap-3">
                                                                <button
                                                                        ref={buttonRef}
                                                                        onClick={handleSubmit}
                                                                        className="w-full rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                                                                >
                                                                        Next item
                                                                </button>
                                                                <button
                                                                        onClick={handleCompleteAll}
                                                                        disabled={!folder}
                                                                        className="w-full rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                        Accept all labels
                                                                </button>
                                                        </div>
                                                        {remainingFiles > 0 && (
                                                                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
                                                                        {remainingFiles} file{remainingFiles !== 1 ? 's' : ''} remaining
                                                                </div>
                                                        )}
                                                </div>
                                        )}
                                </div>

                                <div className="rounded-3xl border border-slate-200/80 bg-slate-900/90 p-4 text-white shadow-sm">
                                        {!allCompleted && mediaSrc && mediaType === 'video' && (
                                                <video controls className="w-full rounded-2xl" key={mediaSrc}>
                                                        <source src={mediaSrc} type="video/mp4" />
                                                </video>
                                        )}
                                        {!allCompleted && mediaSrc && mediaType === 'image' && (
                                                <img key={mediaSrc} src={mediaSrc} alt="Loaded media" className="w-full rounded-2xl" />
                                        )}
                                        {!allCompleted && !mediaSrc && (
                                                <div className="flex h-full min-h-[320px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-slate-200">
                                                        Media preview will appear here.
                                                </div>
                                        )}
                                </div>
                        </div>
                </div>
        );

};

export default QAInterface;
