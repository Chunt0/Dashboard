import React, { useEffect, useState } from 'react';

const GET_FOLDERS_ENDPOINT = import.meta.env.VITE_GET_FOLDERS_ENDPOINT;
const LOAD_DATASET_ENDPOINT = import.meta.env.VITE_LOAD_DATASET_ENDPOINT;
const UPLOAD_COMPLETE_ENDPOINT = import.meta.env.VITE_UPLOAD_COMPLETE_ENDPOINT;

const QAInterface: React.FC = () => {
	const [folder, setFolder] = useState<string>(''); // Add logic to select a folder
	const [label, setLabel] = useState<string>('');
	const [notes, setNotes] = useState<string>('');
	const [items, setItems] = useState<{ media: string; text: string }[]>([]); // Hold media and text items
	const [currentIndex, setCurrentIndex] = useState<number>(0); // Track current item index
	const [folders, setFolders] = useState<string[]>([]); // Hold folder names

	useEffect(() => {
		const fetchFolders = async () => {
			const response = await fetch(GET_FOLDERS_ENDPOINT); // Fetch folder names from the endpoint
			const data = await response.json(); // Parse the JSON response
			setFolders(data); // Set folder names to state
		};
		fetchFolders();
	}, []);

	const handleFolderSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setFolder(e.target.value);
		setCurrentIndex(0); // Reset index
	};

	const handleLoadSelection = async () => {
		try {
			const response = await fetch(LOAD_DATASET_ENDPOINT, {
				method: 'POST', // Use POST to send data
				headers: {
					'Content-Type': 'application/json', // Set content type to JSON
				},
				body: JSON.stringify({ folder }), // Send the folder content
			});

			const data = await response.json();
			console.log(data);

			// Extract the first png or mp4 and corresponding txt file
			//const firstMedia = data.media.find(item => item.endsWith('.png') || item.endsWith('.mp4'));
			//const correspondingText = data.texts[0]; // Assuming the first text corresponds to the media

			// Display the media and text for QA
			//console.log('Media:', firstMedia);
			//console.log('Text:', correspondingText);
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};

	const handleNext = () => {
		// Logic to move to the next item
	};

	const handleSubmit = () => {
		// Logic for submitting the current item in QA
	};

	return (
		<div className="p-6 bg-white rounded-lg shadow-md flex left-0 top-0 h-full">
			<h4 className="animate-pulse text-xl font-bold mb-6 text-purple-800 shadow-lg p-2 rounded-lg bg-gradient-to-r from-purple-400 to-purple-600 text-white">Select dataset for QA</h4>
			<select className="p-2 border border-gray-300 rounded bg-grey text-purple-600 font-bold mb-4" onChange={handleFolderSelection}>
				{/* Populate with folders */}
				<option value="">Select Folder</option>
				{folders.map((folderName) => (
					<option key={folderName} value={folderName}>{folderName}</option>
				))}
			</select>
			<button
				onClick={handleLoadSelection}
				className="w-full px-4 bg-white text-purple-600 font-bold py-3 rounded-lg shadow-lg hover:bg-purple-600 hover:text-white transition"
			>
				<h2 className='animate-bounce'>	Load Dataset</h2>
			</button>
		</div>
	);

};

export default QAInterface;

