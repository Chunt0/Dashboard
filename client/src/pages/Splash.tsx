import React from 'react';

const Splash: React.FC = () => {
	return (
		<div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white p-10">
			<h1 className="text-5xl font-extrabold mb-6 center">Welcome to Data Prep, Labeling, and Training</h1>
			<p className="text-xl mb-4 text-center max-w-md">Upload your data for preparation and labeling with ease.</p>
			<p className="text-xl mb-4 text-center max-w-md">Perform quality assurance to fix labels and add insightful notes.</p>
			<p className="text-xl text-center max-w-md">Begin training runs for SDXL, Flux, or WAN2.1.</p>
		</div>
	);
};

export default Splash;

