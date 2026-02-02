FROM node:18-bullseye

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma Client WITHOUT executable permissions
RUN node node_modules/prisma/build/index.js generate

# Build TypeScript
RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start"]
