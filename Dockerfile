# ── Build stage ────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# ── Runtime stage ───────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copy deps from build stage
COPY --from=build /app/node_modules ./node_modules

# Copy app source
COPY . .

# Railway / Render / Fly inject PORT at runtime
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
