FROM node:20-alpine

WORKDIR /app

# Add debugging tools
RUN apk add --no-cache curl

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000 9229

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true

CMD ["npm", "run", "dev"]