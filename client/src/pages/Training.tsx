import React from 'react';

const Training: React.FC = () => {
        return (
                <section className="mx-auto flex w-full max-w-5xl items-center justify-center">
                        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-10 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)] fade-up">
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">Training Hub</p>
                                <h2 className="display mt-3 text-4xl text-slate-900 sm:text-5xl">Pick a model family to launch.</h2>
                                <p className="mt-4 text-base text-slate-600">
                                        Choose SDXL or Flux, then select the dataset that is ready for training.
                                </p>
                        </div>
                </section>
        );
};

export default Training;
