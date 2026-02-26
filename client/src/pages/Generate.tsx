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
				<div className="mt-8 border border-slate-800 bg-slate-950 p-10 text-center">
					<p className="text-xs font-medium text-slate-400">Generate</p>
					<h1 className="mt-3 text-2xl font-semibold text-slate-100 sm:text-3xl">Image and video generation.</h1>
					<p className="mt-3 text-sm text-slate-300">Select a workflow to configure prompts and start creating.</p>
				</div>
			)}
		</div>
	);
};

export default Generate;
