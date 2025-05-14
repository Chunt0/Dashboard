import React, { useState } from 'react';

const TrainingSelection: React.FC = () => {
	const [dataFolder, setDataFolder] = useState<string>('');
	const [trainingType, setTrainingType] = useState<string>('');

	const handleDataFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setDataFolder(e.target.value);
	};

	const handleTrainingTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setTrainingType(e.target.value);
	};

	return (
		<div>
			<h4>Select Data Folder</h4>
			<input type="text" value={dataFolder} onChange={handleDataFolderChange} placeholder="Enter data folder path" />

			<h4>Select Training Type</h4>
			<select value={trainingType} onChange={handleTrainingTypeChange}>
				<option value="">Select Training Type</option>
				<option value="sdxl">SDXL</option>
				<option value="flux">Flux</option>
				<option value="wan">WAN</option>
			</select>
		</div>
	);
};

export default TrainingSelection;

