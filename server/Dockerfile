FROM node:18-alpine

# Install ffmpeg and dependencies
RUN apk add --no-cache ffmpeg libx11 libxext libxrender

WORKDIR /usr/src/app

COPY server/package*.json ./
RUN npm install --production

COPY server/dist ./dist
COPY client/dist ./client/dist

EXPOSE 3003

ENV PORT=3003
ENV NODE_ENV=production
ENV UPLOAD_DIR=/usr/src/app/uploads
ENV DATA_DIR=/usr/src/app/datasets

CMD ["node", "dist/index.js"]

