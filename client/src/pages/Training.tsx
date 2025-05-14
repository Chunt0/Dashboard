import React from 'react';
import TrainingSelection from '../components/Training/TrainingSelection';
import TrainingParameters from '../components/Training/TrainingParameters';

const Training: React.FC = () => {
	return (
		<div>
			<h1>Training</h1>
			<TrainingSelection />
			<TrainingParameters />
		</div>
	);
};

export default Training;

