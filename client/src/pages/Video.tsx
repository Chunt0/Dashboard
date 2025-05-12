import React, { useState, DragEvent } from 'react';

function Video() {
	const [files, setFiles] = useState<File[]>([]);
	const [urlList, setUrlList] = useState<string>('');

	// Handle file input change (file picker)
	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			setFiles(Array.from(event.target.files));
		}
	};

	// Handle URL list change
	const handleUrlChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setUrlList(event.target.value);
	};

	// Process the uploaded files
	const handleUpload = async () => {
		if (files.length > 0) {
			for (const file of files) {
				const formData = new FormData();
				formData.append('file', file);
				await fetch('http://100.87.171.32:3003/upload', {
					method: 'POST',
					body: formData,
				});
			}
		}
		// Handle URLs if needed
		const urls = urlList.split('\n').filter(Boolean);
		for (const url of urls) {
			// Process each URL
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
			// Optionally, filter only videos
			const videoFiles = allFiles.filter(f => f.type.startsWith('video/'));
			setFiles(videoFiles);
		});
	};

	return (
		<div
			className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 to-blue-500 p-8"
			onDrop={handleDrop}
			onDragOver={handleDragOver}
		>
			<h2 className="text-4xl font-extrabold text-white mb-6 shadow-lg">Video Page</h2>

			{/* Drag & Drop Zone */}
			<div
				className="w-full max-w-md p-6 mb-6 border-4 border-white border-dashed rounded-lg bg-white/20 text-white text-center cursor-pointer hover:bg-white/30"
				onDrop={handleDrop}
				onDragOver={handleDragOver}
			>
				Drag and drop folders/files here
			</div>


			<textarea
				value={urlList}
				onChange={handleUrlChange}
				placeholder="Enter YouTube URLs (one per line)"
				className="mb-6 p-4 rounded-lg border-2 border-white bg-transparent text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white transition"
			/>

			<button
				onClick={handleUpload}
				className="bg-white text-purple-600 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-purple-600 hover:text-white transition"
			>
				Upload Videos
			</button>
		</div>
	);
}

export default Video;
