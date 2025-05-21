import React, { useState, DragEvent } from 'react';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const UPLOAD_IMAGE_ENDPOINT = import.meta.env.VITE_UPLOAD_IMAGE_ENDPOINT;

const Image: React.FC = () => {
	const [files, setFiles] = useState<File[]>([]);
	const [isLocked, setIsLocked] = useState<boolean>(false); // State to lock the drop zone
	const [logMessage, setLogMessage] = useState<string>('');

	// Process the uploaded files
	const handleUpload = async () => {
		if (files.length > 0) {
			setIsLocked(true); // Lock the drop zone when uploading
			let counter = 1; // initialize counter
			for (const file of files) {
				if (file.size < MAX_FILE_SIZE) {
					const formData = new FormData();
					formData.append('files', file);
					await fetch(UPLOAD_IMAGE_ENDPOINT, {
						method: 'POST',
						body: formData,
					});
					console.log(`Uploading ${file.name}...`); // include counter in log
					setLogMessage(`Uploading ${file.name}...`); // include counter in log
				} else {
					console.log(`File ${file.name} was too large!`);
					setLogMessage(`File ${file.name} was too large!`);

				}
				counter++; // increment counter
			}
			setTimeout(() => {
				setIsLocked(false); // Unlock the drop zone after uploading
			}, 1000);
		}
	};

	// Handle drag over
	const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	// Handle drop
	const handleDrop = (e: DragEvent<HTMLDivElement>) => {
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

					filePromises.push(traverseFileTree(entry));
				}
			}
		}

		Promise.all(filePromises).then((filesArrays) => {
			const allFiles = filesArrays.flat();
			const imageFiles = allFiles.filter(f => f.type.startsWith('image/'));
			setFiles(imageFiles);
			if (imageFiles.length > 0) {
				setIsLocked(true)
				console.log(`${imageFiles.length} image files are ready to upload`);
				setLogMessage(`${imageFiles.length} image files are ready to upload`);
			} else {
				setIsLocked(false);
				console.log("No files of type 'image'");
				setLogMessage("No files of type 'image'");
			}
		});
	};

	return (
		<div
			className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 to-blue-500 p-8"
			onDrop={handleDrop}
			onDragOver={handleDragOver}
		>
			<h2 className="text-4xl font-extrabold text-white mb-6 shadow-lg">Image Upload</h2>

			{/* Drag & Drop Zone */}
			<div
				className={`w-full max-w-md p-6 mb-6 border-4 border-white border-dashed rounded-lg bg-white/20 text-white text-center cursor-pointer hover:bg-white/30 ${isLocked ? 'opacity-50' : ''}`}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
			>
				{isLocked ? 'Folder Loaded' : 'Drag and drop folders/files here'}
			</div>

			<button
				onClick={handleUpload}
				className="bg-white text-purple-600 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-purple-600 hover:text-white transition"
			>
				{isLocked ? 'Click to Upload...' : 'Upload Images'}
			</button>
			<br />
			<p className="text-4xl font-extrabold text-white mb-6 shadow-lg">{isLocked ? logMessage : 'Drag and drop your image files!'}</p>
		</div>
	);
}

export default Image;
