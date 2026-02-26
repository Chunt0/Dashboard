import React, { useState } from 'react';
import type { DragEvent } from 'react';
import { fetchWithAuth } from '../../utils/api';

const CHUNK_SIZE = 1 * 1024 * 1024;
const UPLOAD_VIDEOS_ENDPOINT = import.meta.env.VITE_UPLOAD_VIDEOS_ENDPOINT;

const Video: React.FC = () => {
        const [files, setFiles] = useState<File[]>([]);
        const [isLocked, setIsLocked] = useState<boolean>(false); // State to lock the drop zone
        const [logMessage, setLogMessage] = useState<string>('');
        const [uploadProgress, setUploadProgress] = useState<number>(0);
        const [isUploading, setIsUploading] = useState<boolean>(false);
        const [batchName, setBatchName] = useState<string>('');

        const handleUpload = async () => {
                if (files.length > 0) {
                        setIsUploading(true);
                        setIsLocked(true);
                        let fileCount = 0;
                        for (const file of files) {
                                const progressPercent = Math.round((fileCount / files.length) * 100);
                                setUploadProgress(progressPercent);
                                const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
                                const fileId = generateUniqueId();
                                for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                                        const start = chunkIndex * CHUNK_SIZE;
                                        const end = Math.min(start + CHUNK_SIZE, file.size);
                                        const chunk = file.slice(start, end);

                                        const formData = new FormData();
                                        formData.append('fileId', fileId);
                                        formData.append('chunk', new Blob([chunk]), file.name);
                                        formData.append('chunkIndex', String(chunkIndex));
                                        formData.append('totalChunks', String(totalChunks));
                                        formData.append('fileName', file.name);
                                        formData.append('fileSize', String(file.size));
                                        formData.append('batchName', batchName);
					await fetchWithAuth(UPLOAD_VIDEOS_ENDPOINT, {
						method: 'POST',
						body: formData,
					});

                                        setLogMessage(`Uploading and labeling ${file.name}... this may take some time`);

                                }
                                fileCount++;
                        }
                        setIsUploading(false);
                        setUploadProgress(0);
                        //setFilesUploaded(true);
                        setBatchName('');
                        setIsLocked(false);
                }
        };

        const generateUniqueId = (): string => {
                return Math.random().toString(36).substr(2, 9);
        };

        const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                e.stopPropagation();
        };

        const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                e.stopPropagation();

                if (isLocked) return; // Prevent dropping if locked

                const items = e.dataTransfer.items;

                const filePromises: Promise<File[]>[] = [];

                for (let i = 0; i < items.length; i++) {
                        const item = items[i];


                        if (item.kind === 'file') {
                                const entry = item.webkitGetAsEntry();

                                if (entry) {
                                        const traverseFileTree = (entry: any, path = ''): Promise<File[]> => {
                                                return new Promise((resolve) => {
                                                        if (entry.isFile) {
                                                                (entry as any).file((file: File) => {
                                                                        Object.defineProperty(file, 'relativePath', {
                                                                                value: path + file.name,
                                                                        });
                                                                        resolve([file]);
                                                                });
                                                        } else if (entry.isDirectory) {
                                                                if (batchName === '') {
                                                                        setBatchName(entry.name);
                                                                }
                                                                const dirReader = (entry as any).createReader();
                                                                dirReader.readEntries((entries: any[]) => {
                                                                        const filesInDir: Promise<File[]>[] = entries.map((ent) =>
                                                                                traverseFileTree(ent, path + entry.name + '/')
                                                                        );
                                                                        Promise.all(filesInDir).then((nestedFiles) => {
                                                                                resolve(nestedFiles.flat());
                                                                        });
                                                                });
                                                        } else {
                                                                resolve([]);
                                                        }
                                                });
                                        };

                                        await filePromises.push(traverseFileTree(entry));
                                }
                        }
                }

                Promise.all(filePromises).then((filesArrays) => {
                        const allFiles = filesArrays.flat();
                        const videoFiles = allFiles.filter(f => f.type.startsWith('video/mp4'));
                        setFiles(videoFiles)
                        if (videoFiles.length > 0) {
                                setIsLocked(true);
                                console.log(`${videoFiles.length} image files are ready to upload`);
                                setLogMessage(`${videoFiles.length} image files are ready to upload`);
                        } else {
                                setIsLocked(false);
                                console.log("No files of type 'mp4'");
                                setLogMessage("No files of type 'mp4'");
                        }
                });
        };

	return (
		<div
			className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col items-center justify-center border border-slate-800 bg-slate-950 p-8 text-center"
			onDrop={handleDrop}
			onDragOver={handleDragOver}
		>
			<p className="text-xs font-medium text-slate-400">Video Upload</p>
			<h2 className="mt-3 text-2xl font-semibold text-slate-100 sm:text-3xl">Drop mp4 folders to begin.</h2>
			<p className="mt-3 max-w-xl text-sm text-slate-300">
				Keep original folder structure and move videos into the labeling queue.
			</p>

                        {/* Drag & Drop Zone */}
			<div
				className={`mt-6 w-full max-w-2xl border-2 border-dashed border-slate-700 bg-slate-900 px-6 py-10 text-sm font-medium text-slate-300 transition hover:border-slate-500 ${
					isLocked ? 'opacity-60' : ''
				}`}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
			>
                                {isLocked ? 'Folder loaded and ready to upload.' : 'Drag and drop folders/files here'}
                        </div>

                        {!isUploading && isLocked && (
				<button
					onClick={handleUpload}
					className="border border-slate-700 bg-slate-900 px-6 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
				>
                                        Start upload
                                </button>
                        )}
			<p className="mt-6 text-sm font-medium text-slate-400">
				{isLocked ? logMessage : 'Drag and drop your mp4 files to begin.'}
			</p>
			{isUploading && (
				<div className="mt-6 w-full border border-slate-800 bg-slate-900">
					<div
						className="h-2 bg-slate-300 transition-all duration-300 ease-in-out"
						style={{ width: `${uploadProgress}%` }}
					/>
				</div>
			)}
		</div>
	);
}

export default Video;
