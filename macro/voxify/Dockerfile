FROM node:20-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --omit=dev

COPY backend/ ./
COPY frontend/ ./public/
RUN mkdir -p temp

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
