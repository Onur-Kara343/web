FROM node:20-alpine

RUN apk add --no-cache ffmpeg python3 py3-pip \
	&& pip install --no-cache-dir --break-system-packages yt-dlp

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --omit=dev

COPY backend/ ./
COPY frontend/ ./public/
RUN mkdir -p temp

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
