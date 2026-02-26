import React from 'react';

const Training: React.FC = () => {
	return (
		<section className="mx-auto flex w-full max-w-5xl items-center justify-center">
			<div className="border border-slate-800 bg-slate-950 p-10 text-center">
				<p className="text-xs font-medium text-slate-400">Training Hub</p>
				<h2 className="mt-3 text-3xl font-semibold text-slate-100 sm:text-4xl">Pick a model family to launch.</h2>
				<p className="mt-3 text-sm text-slate-300">
					Choose SDXL or Flux, then select the dataset that is ready for training.
				</p>
			</div>
		</section>
	);
};

export default Training;
