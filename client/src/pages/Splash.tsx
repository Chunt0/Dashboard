import React from 'react';

const Splash: React.FC = () => {
	return (
		<section className="mx-auto flex w-full max-w-6xl flex-col gap-10">
			<div className="rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-10 fade-up">
				<p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">Studio Operations</p>
				<h1 className="display mt-3 text-4xl text-slate-900 sm:text-5xl">
					Data prep, labeling, and training in one focused workspace.
				</h1>
				<p className="mt-4 max-w-2xl text-lg text-slate-600">
					Move from raw assets to training-ready datasets without context switching. Upload, audit, and launch runs
					from a single streamlined console.
				</p>
				<div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
					<span className="rounded-full bg-teal-500/10 px-4 py-2">Folder-aware uploads</span>
					<span className="rounded-full bg-amber-500/15 px-4 py-2">QA with completion tracking</span>
					<span className="rounded-full bg-slate-900/5 px-4 py-2">Training launch in seconds</span>
				</div>
			</div>
			<div className="grid gap-6 md:grid-cols-3">
				<div className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm fade-up stagger-1">
					<p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">01</p>
					<h3 className="display mt-3 text-2xl text-slate-900">Upload</h3>
					<p className="mt-2 text-sm text-slate-600">
						Drop folders, keep structure, and prep assets fast with real-time progress.
					</p>
				</div>
				<div className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm fade-up stagger-2">
					<p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">02</p>
					<h3 className="display mt-3 text-2xl text-slate-900">Quality Assurance</h3>
					<p className="mt-2 text-sm text-slate-600">
						Review labels quickly, flag removals, and keep your dataset clean.
					</p>
				</div>
				<div className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm fade-up stagger-3">
					<p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">03</p>
					<h3 className="display mt-3 text-2xl text-slate-900">Train</h3>
					<p className="mt-2 text-sm text-slate-600">
						Kick off SDXL or Flux runs with one selection and a clear status feed.
					</p>
				</div>
			</div>
		</section>
	);
};

export default Splash;
