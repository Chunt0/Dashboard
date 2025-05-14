import React, { useState } from 'react';

const QAInterface: React.FC = () => {
	const [folder, setFolder] = useState<string>(''); // Add logic to select a folder
	const [label, setLabel] = useState<string>('');
	const [notes, setNotes] = useState<string>('');

	const handleFolderSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setFolder(e.target.value);
		// Load folder contents for QA
	};

	const handleSubmit = () => {
		// Submit label and notes for the current item in QA
		console.log('Label:', label);
		console.log('Notes:', notes);
	};

	return (
		<div>
			<h4>Select Folder for QA</h4>
			<select onChange={handleFolderSelection}>
				{/* Populate with folders */}
				<option value="">Select Folder</option>
			</select>

			<h4>Label</h4>
			<input type="text" value={label} onChange={(e) => setLabel(e.target.value)} />

			<h4>Notes</h4>
			<textarea value={notes} onChange={(e) => setNotes(e.target.value)} />

			<button onClick={handleSubmit}>Submit QA</button>
		</div>
	);
};

export default QAInterface;

