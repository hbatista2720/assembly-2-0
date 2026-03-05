FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY . .
RUN npm install --include=dev
# Más memoria para Next.js build (evita OOM en VPS con poca RAM)
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
