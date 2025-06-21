FROM node:18-bullseye

RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-dev && \
    apt-get install -y ffmpeg libsm6 libxext6 libxrender-dev && \
    apt-get clean

RUN pip3 install scenedetect aiohttp opencv-python-headless

WORKDIR /usr/src/app

COPY server/package*.json ./
RUN npm install --production

COPY server/dist ./dist
COPY server/src/scripts ./dist/scripts
COPY client/dist ./client/dist

EXPOSE 3003
ENV NODE_ENV=production
ENV UPLOAD_DIR=/usr/src/app/uploads
ENV DATA_DIR=/usr/src/app/datasets

CMD ["node", "dist/index.js"]
