import React, { useState, useEffect } from 'react';

interface GenerateNavBarProps {
  onWorkflowSelect: (workflow: string) => void;
}

const GenerateNavBar: React.FC<GenerateNavBarProps> = ({ onWorkflowSelect }) => {
  const [workflows, setWorkflows] = useState<string[]>([]);

  useEffect(() => {
    // This is a placeholder for fetching the list of workflows.
    // In a real application, you would fetch this from an API or a static directory.
    setWorkflows(['flux-basic-t2i.json']);
  }, []);

  const handleWorkflowChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onWorkflowSelect(event.target.value);
  };

	return (
		<div className="border-b border-slate-800 bg-slate-950">
			<div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
				<div>
					<p className="text-xs font-medium text-slate-400">Generate</p>
					<h2 className="text-lg font-semibold text-slate-100">Pick a workflow to start creating</h2>
				</div>
				<div className="flex items-center gap-3">
					<label htmlFor="workflow-select" className="text-sm font-medium text-slate-300">
						Workflow
					</label>
					<select
						id="workflow-select"
						className="min-w-[220px] border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-500"
						onChange={handleWorkflowChange}
					>
						<option value="">Select a workflow</option>
						{workflows.map((workflow) => (
							<option key={workflow} value={workflow}>
								{workflow}
							</option>
						))}
					</select>
				</div>
			</div>
		</div>
	);
};

export default GenerateNavBar;
