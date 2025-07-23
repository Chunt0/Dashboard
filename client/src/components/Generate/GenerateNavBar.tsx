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
    <div className="bg-gray-800 text-white p-4">
      <label htmlFor="workflow-select" className="mr-2">Select Workflow:</label>
      <select id="workflow-select" className="bg-gray-700 text-white p-2 rounded" onChange={handleWorkflowChange}>
        <option value="">--Select a workflow--</option>
        {workflows.map(workflow => (
          <option key={workflow} value={workflow}>{workflow}</option>
        ))}
      </select>
    </div>
  );
};

export default GenerateNavBar;
