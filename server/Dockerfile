FROM node:18-alpine

WORKDIR /usr/src/app

COPY server/package*.json ./
RUN npm install --production

COPY server/dist ./dist
COPY client/dist ./client/dist

EXPOSE 3003

CMD ["node", "dist/index.js"]
