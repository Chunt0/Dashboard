FROM node:18-alpine

WORKDIR /usr/src/app

COPY server/package*.json ./
RUN npm install --production

COPY server/dist ./dist
COPY client/dist ./client/dist

EXPOSE 3003
ENV NODE_ENV=production
ENV UPLOAD_DIR=/usr/src/app/upload
ENV DATA_DIR=/usr/src/app/datasets

CMD ["node", "dist/index.js"]
