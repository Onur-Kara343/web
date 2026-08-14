# Frontend Builder
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/ .
RUN apk add --no-cache python3 make g++

# Backend Builder
FROM node:18-alpine AS backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .

# Final image
FROM node:18-alpine
WORKDIR /app

# Copy backend
COPY --from=backend /app/backend /app/backend
WORKDIR /app/backend

# Copy frontend
COPY --from=frontend-builder /app/frontend /app/frontend

# Expose ports
EXPOSE 5000

# Install serve for frontend in production
RUN npm install -g serve

# Start backend and serve frontend
CMD ["sh", "-c", "node server.js & serve -s ../frontend -l 3000"]