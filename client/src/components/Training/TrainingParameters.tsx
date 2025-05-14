import React from 'react';

interface TrainingParametersProps {
	trainingType: string;
}

const TrainingParameters: React.FC<TrainingParametersProps> = ({ trainingType }) => {
	// Here you can define parameters based on the training type
	const renderParameters = () => {
		switch (trainingType) {
			case 'sdxl':
				return <div>SDXL Parameters</div>;
			case 'flux':
				return <div>Flux Parameters</div>;
			case 'wan':
				return <div>WAN Parameters</div>;
			default:
				return null;
		}
	};

	return (
		<div>
			<h4>Training Parameters</h4>
			{renderParameters()}
		</div>
	);
};

export default TrainingParameters;

