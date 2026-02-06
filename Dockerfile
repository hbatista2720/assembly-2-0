FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# Instalar todas las dependencias (incl. devDependencies) para que el build pase (tipos React, etc.)
RUN npm install --include=dev

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
