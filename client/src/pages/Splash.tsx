import React from 'react';

const Splash: React.FC = () => {
	return (
		<section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
			<div className="border border-slate-800 bg-slate-950 p-8">
				<p className="text-xs font-medium text-slate-400">Studio Operations</p>
				<h1 className="mt-3 text-3xl font-semibold text-slate-100 sm:text-4xl">
					Data prep, labeling, and training in one workspace.
				</h1>
				<p className="mt-3 max-w-2xl text-sm text-slate-300">
					Upload, review, and launch training runs without context switching.
				</p>
			</div>
			<div className="grid gap-4 md:grid-cols-3">
				<div className="border border-slate-800 bg-slate-950 p-6">
					<p className="text-xs font-medium text-slate-500">01</p>
					<h3 className="mt-3 text-lg font-semibold text-slate-100">Upload</h3>
					<p className="mt-2 text-sm text-slate-300">
						Drop folders, keep structure, and prep assets fast.
					</p>
				</div>
				<div className="border border-slate-800 bg-slate-950 p-6">
					<p className="text-xs font-medium text-slate-500">02</p>
					<h3 className="mt-3 text-lg font-semibold text-slate-100">Quality Assurance</h3>
					<p className="mt-2 text-sm text-slate-300">
						Review labels quickly and keep datasets clean.
					</p>
				</div>
				<div className="border border-slate-800 bg-slate-950 p-6">
					<p className="text-xs font-medium text-slate-500">03</p>
					<h3 className="mt-3 text-lg font-semibold text-slate-100">Train</h3>
					<p className="mt-2 text-sm text-slate-300">
						Launch SDXL or Flux runs with a single selection.
					</p>
				</div>
			</div>
		</section>
	);
};

export default Splash;
