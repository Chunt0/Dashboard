import React from 'react';

const Uploading: React.FC = () => {
	return (
		<section className="mx-auto flex w-full max-w-5xl items-center justify-center">
			<div className="border border-slate-800 bg-slate-950 p-10 text-center">
				<p className="text-xs font-medium text-slate-400">Upload Center</p>
				<h2 className="mt-3 text-3xl font-semibold text-slate-100 sm:text-4xl">Choose a media lane to begin.</h2>
				<p className="mt-3 text-sm text-slate-300">
					Select Image or Video to keep your batches organized and labeled from the start.
				</p>
			</div>
		</section>
	);
};

export default Uploading;
