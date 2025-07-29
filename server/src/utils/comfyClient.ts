import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const serverAddress = '127.0.0.1:8199';
const clientId = uuidv4();

export const queuePrompt = async (prompt: any) => {
  const { data } = await axios.post(`http://${serverAddress}/prompt`, {
    prompt,
    client_id: clientId,
  });
  return data;
};

export const getImage = async (filename: string, subfolder: string, folderType: string) => {
  const { data } = await axios.get(`http://${serverAddress}/view`, {
    params: {
      filename,
      subfolder,
      type: folderType,
    },
    responseType: 'arraybuffer',
  });
  return data;
};

export const getHistory = async (promptId: string) => {
  const { data } = await axios.get(`http://${serverAddress}/history/${promptId}`);
  return data;
};

export const getImages = (ws: WebSocket, prompt: any): Promise<Record<string, Buffer[]>> => {
  return new Promise((resolve) => {
    const promptFinished = async () => {
      const promptId = (await queuePrompt(prompt)).prompt_id;
      const outputImages: Record<string, Buffer[]> = {};

      const onMessage = async (data: WebSocket.Data) => {
        if (typeof data === 'string') {
          const message = JSON.parse(data);
          if (message.type === 'executing' && message.data.node === null && message.data.prompt_id === promptId) {
            ws.off('message', onMessage);
            const history = await getHistory(promptId);
            for (const nodeId in history[promptId].outputs) {
              const nodeOutput = history[promptId].outputs[nodeId];
              const imagesOutput: Buffer[] = [];
              if (nodeOutput.images) {
                for (const image of nodeOutput.images) {
                  const imageData = await getImage(image.filename, image.subfolder, image.type);
                  imagesOutput.push(imageData);
                }
              }
              outputImages[nodeId] = imagesOutput;
            }
            resolve(outputImages);
          }
        }
      };

      ws.on('message', onMessage);
    };

    if (ws.readyState === WebSocket.OPEN) {
      promptFinished();
    } else {
      ws.once('open', promptFinished);
    }
  });
};

export const connectToComfyUI = () => {
  const ws = new WebSocket(`ws://${serverAddress}/ws?clientId=${clientId}`);
  return ws;
};
