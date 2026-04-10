FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY server.js ./
COPY index.html ./
COPY sw.js ./

EXPOSE 8080
ENV PORT=8080

CMD ["node", "server.js"]
