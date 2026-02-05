import React, { useState } from 'react';
import GenerateNavBar from '../components/Generate/GenerateNavBar';
import WorkflowView from '../components/Generate/WorkflowView';

const Generate: React.FC = () => {
    const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');

    const handleWorkflowSelect = (workflow: string) => {
        setSelectedWorkflow(workflow);
    };

    return (
        <div className="mx-auto w-full max-w-6xl">
            <GenerateNavBar onWorkflowSelect={handleWorkflowSelect} />
            {selectedWorkflow ? (
                <WorkflowView workflowName={selectedWorkflow} />
            ) : (
                <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white/80 p-10 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)] fade-up">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Generate</p>
                    <h1 className="display mt-3 text-3xl text-slate-900 sm:text-4xl">Image and video generation, simplified.</h1>
                    <p className="mt-4 text-base text-slate-600">Select a workflow to configure prompts and start creating.</p>
                </div>
            )}
        </div>
    );
};

export default Generate;
