# Stage 1: Build the React app
FROM node:18 AS frontend

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the frontend source code and the public directory
COPY src ./src
COPY public ./public

# Build the frontend
RUN pnpm run build

# Stage 2: Set up the Node backend
FROM node:18-alpine AS backend

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the backend source code
COPY ./src/backend ./src/backend

# Copy the built frontend from the previous stage
COPY --from=frontend /usr/src/app/build ./build

# Expose the ports for backend and frontend
EXPOSE 8081 3000

# Start both backend and frontend using concurrently
RUN pnpm install concurrently
CMD ["pnpm", "run", "dev"]
