import path from 'path';
import { Router } from 'express';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const router = Router();

const outputDir = process.env.COMFY_OUTPUT_DIR || path.resolve("/home/chunt/ComfyUI/output/putty-ai/");

// TODO fix this broken AI shit. all of this is garbage
const server_address = "link.putty-ai.com";

router.post('/', (req, res) => {
        const { prompt } = req.body;
        const clientId = uuidv4();

        const ws = new WebSocket(`ws://${server_address}/ws?clientId=${clientId}`);

        ws.on('open', () => {
                console.log('WebSocket connection opened');
                queuePrompt(prompt, clientId)
                        .then(promptId => {
                                ws.on('message', (message: string) => {
                                        const data = JSON.parse(message);
                                        if (data.type === 'executing' && data.data.node === null && data.data.prompt_id === promptId) {
                                                ws.close();
                                                getHistory(promptId)
                                                        .then(history => {
                                                                const image = history[promptId].outputs['9'].images[0];
                                                                const imageUrl = `http://localhost:3001/api/images/${image.filename}`;
                                                                res.json({ imageUrl });
                                                        })
                                                        .catch(error => {
                                                                console.error('Error getting history:', error);
                                                                res.status(500).json({ error: 'Failed to get image history' });
                                                        });
                                        }
                                });
                        })
                        .catch(error => {
                                console.error('Error queuing prompt:', error);
                                res.status(500).json({ error: 'Failed to queue prompt' });
                        });
        });

        ws.on('close', () => {
                console.log('WebSocket connection closed');
        });

        ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                res.status(500).json({ error: 'WebSocket error' });
        });
});

router.get('/images/:filename', (req, res) => {
        const { filename } = req.params;
        const imagePath = path.join(outputDir, filename);

        if (fs.existsSync(imagePath)) {
                res.sendFile(imagePath);
        } else {
                res.status(404).send('Image not found');
        }
});

async function queuePrompt(prompt: any, clientId: string): Promise<string> {
        const response = await fetch(`http://${server_address}/prompt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, client_id: clientId }),
        });
        const data = await response.json();
        return data.prompt_id;
}

async function getHistory(promptId: string): Promise<any> {
        const response = await fetch(`http://${server_address}/history/${promptId}`);
        return await response.json();
}

export default router;
