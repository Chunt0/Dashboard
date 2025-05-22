import React, { useState } from 'react';

const QAInterface: React.FC = () => {
	const [folder, setFolder] = useState<string>(''); // Add logic to select a folder
	const [label, setLabel] = useState<string>('');
	const [notes, setNotes] = useState<string>('');
	const [items, setItems] = useState<{ media: string; text: string }[]>([]); // Hold media and text items
	const [currentIndex, setCurrentIndex] = useState<number>(0); // Track current item index

	const handleFolderSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setFolder(e.target.value);
		// Load folder contents for QA
		const loadedItems = loadItemsFromFolder(e.target.value); // Function to load items
		setItems(loadedItems);
		setCurrentIndex(0); // Reset index
	};

	const handleNext = () => {
		if (currentIndex < items.length - 1) {
			setCurrentIndex(currentIndex + 1);
		}
	};

	const handleSubmit = () => {
		// Submit label and notes for the current item in QA
		console.log('Label:', label);
		console.log('Notes:', notes);
	};

	return (
		<div className="p-6 max-w-xl mx-auto bg-white rounded-lg shadow-md">
			<h4 className="text-xl font-semibold mb-4">Select Folder for QA</h4>
			<select className="mb-4 p-2 border border-gray-300 rounded" onChange={handleFolderSelection}>
				{/* Populate with folders */}
				<option value="">Select Folder</option>
			</select>

			{items.length > 0 && (
				<div>
					<h4 className="text-xl font-semibold mb-2">Media</h4>
					{/* Display media based on type */}
					<div className="mb-4">
						{items[currentIndex].media.endsWith('.mp4') ? (
							<video className="w-full rounded" src={items[currentIndex].media} controls />
						) : (
							<img className="w-full rounded" src={items[currentIndex].media} alt="current" />
						)}
					</div>

					<h4 className="text-xl font-semibold mb-2">Label</h4>
					<input
						type="text"
						className="mb-4 p-2 border border-gray-300 rounded w-full"
						value={label}
						onChange={(e) => setLabel(e.target.value)}
					/>

					<h4 className="text-xl font-semibold mb-2">Notes</h4>
					<textarea
						className="mb-4 p-2 border border-gray-300 rounded w-full"
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
					/>

					<div className="flex justify-between">
						<button className="bg-blue-500 text-white p-2 rounded" onClick={handleSubmit}>Submit QA</button>
						<button className="bg-green-500 text-white p-2 rounded" onClick={handleNext}>Next</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default QAInterface;

