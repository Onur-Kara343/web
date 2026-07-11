FROM node:18-alpine

# Arbeitsverzeichnis erstellen
WORKDIR /app

# Package-Dateien kopieren
COPY package*.json ./

# Abhängigkeiten installieren (nur Production)
RUN npm ci --only=production

# Quellcode kopieren
COPY . .

# Port für Express
EXPOSE 3000

# Healthcheck für Docker
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Server starten
CMD ["node", "server.js"]