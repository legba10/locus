FROM node:18-bullseye

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma Client for Linux (debian-openssl-1.1.x)
RUN npx prisma generate

# Build TypeScript
RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start"]
