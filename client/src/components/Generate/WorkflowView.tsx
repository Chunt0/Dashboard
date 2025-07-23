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
                return <div>Please select a workflow.</div>;
        }

        return (
                <div className="p-4">
                        <h2 className="text-xl font-bold mb-2">{workflowName}</h2>
                        <div className="grid grid-cols-2 gap-4">
                                <div>
                                        <label className="block mb-1">Positive Prompt</label>
                                        <textarea
                                                className="w-full p-2 border rounded"
                                                defaultValue={workflow['23'].inputs.text}
                                                onChange={e => (workflow['23'].inputs.text = e.target.value)}
                                        />
                                </div>
                                <div>
                                        <label className="block mb-1">Negative Prompt</label>
                                        <textarea
                                                className="w-full p-2 border rounded"
                                                defaultValue={workflow['7'].inputs.text}
                                                onChange={e => (workflow['7'].inputs.text = e.target.value)}
                                        />
                                </div>
                                <div>
                                        <label className="block mb-1">Width</label>
                                        <input
                                                type="number"
                                                className="w-full p-2 border rounded"
                                                defaultValue={workflow['47'].inputs.width}
                                                onChange={e => (workflow['47'].inputs.width = parseInt(e.target.value))}
                                        />
                                </div>
                                <div>
                                        <label className="block mb-1">Height</label>
                                        <input
                                                type="number"
                                                className="w-full p-2 border rounded"
                                                defaultValue={workflow['47'].inputs.height}
                                                onChange={e => (workflow['47'].inputs.height = parseInt(e.target.value))}
                                        />
                                </div>
                                <div>
                                        <label className="block mb-1">Steps</label>
                                        <input
                                                type="number"
                                                className="w-full p-2 border rounded"
                                                defaultValue={workflow['3'].inputs.steps}
                                                onChange={e => (workflow['3'].inputs.steps = parseInt(e.target.value))}
                                        />
                                </div>
                                <div>
                                        <label className="block mb-1">Seed</label>
                                        <input
                                                type="number"
                                                className="w-full p-2 border rounded"
                                                defaultValue={workflow['3'].inputs.seed}
                                                onChange={e => (workflow['3'].inputs.seed = parseInt(e.target.value))}
                                        />
                                </div>
                        </div>
                        <button
                                className="mt-4 bg-blue-500 text-white p-2 rounded"
                                onClick={handleGenerate}
                        >
                                Generate
                        </button>
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
