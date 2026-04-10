FROM node:20-alpine

WORKDIR /app

# Copy package files first (for layer caching)
COPY package.json ./

# Install dependencies
RUN npm install

# Copy ALL source files
COPY server.js ./
COPY index.html ./

EXPOSE 8080
ENV PORT=8080

CMD ["node", "server.js"]
