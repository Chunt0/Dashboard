import React, { useState, useEffect } from 'react';

interface WorkflowViewProps {
        workflowName: string;
}

const WorkflowView: React.FC<WorkflowViewProps> = ({ workflowName }) => {
        const [workflow, setWorkflow] = useState<any>(null);
        //const [generatedImage, setGeneratedImage] = useState<string | null>(null);
        //const [socket, setSocket] = useState<WebSocket | null>(null);

        useEffect(() => {
                if (workflowName) {
                        fetch(`/workflows/${workflowName}`)
                                .then(response => response.json())
                                .then(data => setWorkflow(data));
                }
        }, [workflowName]);

        const handleGenerate = () => {
                // TODO: Create fetch to backend with prompt wait for response from the backend to load generated image
        };

	if (!workflow) {
		return (
			<div className="mt-8 border border-slate-800 bg-slate-950 p-6 text-slate-400">
				Please select a workflow.
			</div>
		);
	}

	return (
		<div className="mt-8 border border-slate-800 bg-slate-950 p-6 sm:p-8">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-xs font-medium text-slate-400">Workflow</p>
					<h2 className="text-xl font-semibold text-slate-100">{workflowName}</h2>
				</div>
				<button
					className="border border-slate-700 bg-slate-900 px-5 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
					onClick={handleGenerate}
				>
					Generate
				</button>
			</div>
			<div className="mt-6 grid gap-4 lg:grid-cols-2">
				<div className="border border-slate-800 bg-slate-950 p-4">
					<label className="text-xs font-medium text-slate-400">Positive Prompt</label>
					<textarea
						className="mt-2 min-h-[140px] w-full border border-slate-700 bg-slate-900 p-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-500"
						defaultValue={workflow['23'].inputs.text}
						onChange={e => (workflow['23'].inputs.text = e.target.value)}
					/>
				</div>
				<div className="border border-slate-800 bg-slate-950 p-4">
					<label className="text-xs font-medium text-slate-400">Negative Prompt</label>
					<textarea
						className="mt-2 min-h-[140px] w-full border border-slate-700 bg-slate-900 p-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-500"
						defaultValue={workflow['7'].inputs.text}
						onChange={e => (workflow['7'].inputs.text = e.target.value)}
					/>
				</div>
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="border border-slate-800 bg-slate-950 p-4">
						<label className="text-xs font-medium text-slate-400">Width</label>
						<input
							type="number"
							className="mt-2 w-full border border-slate-700 bg-slate-900 p-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-500"
							defaultValue={workflow['47'].inputs.width}
							onChange={e => (workflow['47'].inputs.width = parseInt(e.target.value))}
						/>
					</div>
					<div className="border border-slate-800 bg-slate-950 p-4">
						<label className="text-xs font-medium text-slate-400">Height</label>
						<input
							type="number"
							className="mt-2 w-full border border-slate-700 bg-slate-900 p-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-500"
							defaultValue={workflow['47'].inputs.height}
							onChange={e => (workflow['47'].inputs.height = parseInt(e.target.value))}
						/>
					</div>
				</div>
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="border border-slate-800 bg-slate-950 p-4">
						<label className="text-xs font-medium text-slate-400">Steps</label>
						<input
							type="number"
							className="mt-2 w-full border border-slate-700 bg-slate-900 p-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-500"
							defaultValue={workflow['3'].inputs.steps}
							onChange={e => (workflow['3'].inputs.steps = parseInt(e.target.value))}
						/>
					</div>
					<div className="border border-slate-800 bg-slate-950 p-4">
						<label className="text-xs font-medium text-slate-400">Seed</label>
						<input
							type="number"
							className="mt-2 w-full border border-slate-700 bg-slate-900 p-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-500"
							defaultValue={workflow['3'].inputs.seed}
							onChange={e => (workflow['3'].inputs.seed = parseInt(e.target.value))}
						/>
					</div>
				</div>
			</div>
                        {/*generatedImage && (
                                <div className="mt-4">
                                        <h3 className="text-lg font-bold">Generated Image</h3>
                                        <img src={generatedImage} alt="Generated" className="mt-2" />
                                        <a href={generatedImage} download className="text-blue-500">
                                                Download Image
                                        </a>
                                </div>
                        )*/}
                </div>
        );
};

export default WorkflowView;
