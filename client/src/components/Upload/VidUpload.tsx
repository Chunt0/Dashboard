import React, { useState, DragEvent } from 'react';

const CHUNK_SIZE = 1 * 1024 * 1024;

const UPLOAD_VIDEOS_ENDPOINT = import.meta.env.VITE_UPLOAD_VIDEOS_ENDPOINT;
const LABEL_VIDEOS_ENDPOINT = import.meta.env.VITE_LABEL_VIDEOS_ENDPOINT;

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
					await fetch(UPLOAD_VIDEOS_ENDPOINT, {
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
			setTimeout(() => { setIsLocked(false); }, 800);
		}
	};

	//const handleLabelFiles = async () => {
	//};

	const generateUniqueId = (): string => {
		return Math.random().toString(36).substr(2, 9);
	};

	// Handle drag over
	const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	// Handle drop
	const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();

		if (isLocked) return; // Prevent dropping if locked

		const items = e.dataTransfer.items;

		const filePromises: Promise<File>[] = [];

		for (let i = 0; i < items.length; i++) {
			const item = items[i];


			if (item.kind === 'file') {
				const entry = item.webkitGetAsEntry();

				if (entry) {
					// Recursively read directory entries
					const traverseFileTree = (entry: any, path = ''): Promise<File[]> => {
						return new Promise((resolve) => {
							if (entry.isFile) {
								(entry as any).file((file: File) => {
									// optional: set file.path or name with directory prefix
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
			setFiles(videoFiles);
			if (videoFiles.length > 0) {
				setIsLocked(true)
				console.log(`${videoFiles.length} video/mp4 files are ready to upload`);
				setLogMessage(`${videoFiles.length} video/mp4 files are ready to upload`);
			} else {
				setIsLocked(false);
				console.log("No files of type 'video/mp4'");
				setLogMessage("No files of type 'video/mp4'");
			}
		});
	};

	return (
		<div
			className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 to-blue-500 p-8"
			onDrop={handleDrop}
			onDragOver={handleDragOver}
		>
			<h2 className="animate-bounce text-4xl font-extrabold text-white mb-6">Video Upload</h2>

			{/* Drag & Drop Zone */}
			<div
				className={`w-full max-w-md p-6 mb-6 border-4 border-white border-dashed rounded-lg bg-white/20 text-white text-center cursor-pointer hover:bg-white/30 ${isLocked ? 'opacity-50' : 'animate-pulse'}`}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
			>
				{isLocked ? 'Folder Loaded' : 'Drag and drop folders/files here'}
			</div>

			{!isUploading && isLocked && (
				<button
					onClick={handleUpload}
					className="bg-white text-purple-600 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-purple-600 hover:text-white transition"
				>
					Click to Upload...
				</button>
			)}
			<br />

			<p className="text-4xl font-extrabold text-white mb-6">{isLocked ? logMessage : 'Drag and drop your mp4 files!'}</p>
			<br />
			{isUploading && (
				<div className="w-full bg-gray-200 rounded-full shadow-inner h-4 overflow-hidden">
					<div className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-300 ease-in-out rounded-full" style={{ width: `${uploadProgress}%` }} // Added '%' for proper width
					/>
				</div>
			)}
		</div>
	);
}

export default Video;
