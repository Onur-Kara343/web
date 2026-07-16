FROM node:20-alpine
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production
COPY backend ./
EXPOSE 5003
CMD ["node", "server.js"]
