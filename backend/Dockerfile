FROM node:18-bullseye

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Prisma runs at container start (Railway Start Command)
RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start"]
