FROM node:20-alpine

WORKDIR /app

# Add debugging tools
RUN apk add --no-cache curl

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000 9229

ENV NODE_ENV=development

CMD ["npm", "run", "dev"]