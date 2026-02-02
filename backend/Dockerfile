FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Expose port
EXPOSE 8080

# Start the application
CMD ["npm", "run", "start"]
