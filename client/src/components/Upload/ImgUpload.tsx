import React, { useState } from 'react';
import type { DragEvent } from 'react';
import { fetchWithAuth } from '../../utils/api';

const CHUNK_SIZE = 1 * 1024 * 1024;
const UPLOAD_IMAGES_ENDPOINT = import.meta.env.VITE_UPLOAD_IMAGES_ENDPOINT;

const Image: React.FC = () => {
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
                                        formData.append('batchName', String(batchName));

					await fetchWithAuth(UPLOAD_IMAGES_ENDPOINT, {
						method: 'POST',
						body: formData,
					});

                                        setLogMessage(`Uploading and labeling ${file.name}... this may take some time`);


                                }
                                fileCount++;
                        }
                        setIsUploading(false);
                        setUploadProgress(0);
                        setBatchName('');
                        setIsLocked(false);
                }
        };

        const generateUniqueId = (): string => {
                return Math.random().toString(36).substr(2, 9);
        }

        const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                e.stopPropagation();
        };

        const readAllEntries = (dirReader: any): Promise<any[]> => {
                return new Promise((resolve) => {
                        const entries: any[] = [];
                        const readBatch = () => {
                                dirReader.readEntries((batch: any[]) => {
                                        if (batch.length === 0) {
                                                resolve(entries);
                                        } else {
                                                entries.push(...batch);
                                                readBatch();
                                        }
                                });
                        };
                        readBatch();
                });
        };

        const traverseFileTree = async (entry: any, path = ''): Promise<File[]> => {
                if (entry.isFile) {
                        return new Promise((resolve) => {
                                (entry as any).file((file: File) => {
                                        Object.defineProperty(file, 'relativePath', { value: path + file.name });
                                        resolve([file]);
                                });
                        });
                } else if (entry.isDirectory) {
                        if (batchName === '') setBatchName(entry.name);

                        const dirReader = (entry as any).createReader();
                        const entries = await readAllEntries(dirReader);

                        const nestedFiles = await Promise.all(
                                entries.map((ent: any) => traverseFileTree(ent, path + entry.name + '/'))
                        );

                        return nestedFiles.flat();
                } else {
                        return [];
                }
        };

        const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                e.stopPropagation();

                if (isLocked) return;

                const items = e.dataTransfer.items;
                const filePromises: Promise<File[]>[] = [];

                for (let i = 0; i < items.length; i++) {
                        const item = items[i];
                        if (item.kind === 'file') {
                                const entry = item.webkitGetAsEntry();
                                if (entry) {
                                        filePromises.push(traverseFileTree(entry));
                                }
                        }
                }

                const filesArrays = await Promise.all(filePromises);
                const allFiles = filesArrays.flat();
                const imageFiles = allFiles.filter(f => f.type.startsWith('image/'));

                setFiles(imageFiles);
                if (imageFiles.length > 0) {
                        setIsLocked(true);
                        console.log(`${imageFiles.length} image files are ready to upload`);
                        setLogMessage(`${imageFiles.length} image files are ready to upload`);
                } else {
                        setIsLocked(false);
                        console.log("No files of type 'image'");
                        setLogMessage("No files of type 'image'");
                }
        };

	return (
		<div
			className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col items-center justify-center border border-slate-800 bg-slate-950 p-8 text-center"
			onDrop={handleDrop}
			onDragOver={handleDragOver}
		>
			<p className="text-xs font-medium text-slate-400">Image Upload</p>
			<h2 className="mt-3 text-2xl font-semibold text-slate-100 sm:text-3xl">Drop folders to start labeling.</h2>
			<p className="mt-3 max-w-xl text-sm text-slate-300">
				Keep folder structure intact and send image batches for automatic preparation.
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
				{isLocked ? logMessage : 'Drag and drop your image files to begin.'}
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

export default Image;
