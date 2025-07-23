import React, { useState } from 'react';
import GenerateNavBar from '../components/Generate/GenerateNavBar';
import WorkflowView from '../components/Generate/WorkflowView';

const Generate: React.FC = () => {
    const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');

    const handleWorkflowSelect = (workflow: string) => {
        setSelectedWorkflow(workflow);
    };

    return (
        <div>
            <GenerateNavBar onWorkflowSelect={handleWorkflowSelect} />
            {selectedWorkflow ? (
                <WorkflowView workflowName={selectedWorkflow} />
            ) : (
                <div className="p-4">
                    <h1 className="text-2xl font-bold mb-4">Image and Video Generation</h1>
                    <p>Select a workflow to begin.</p>
                </div>
            )}
        </div>
    );
};

export default Generate;