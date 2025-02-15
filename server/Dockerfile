# Dockerfile for NestJS (server)
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "start:dev"]  # Use start:dev for hot reloading