# Stage 1: Build the React app and install backend dependencies
FROM node:18 AS build

# Install pnpm
RUN npm install -g pnpm

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the frontend
RUN pnpm run build

# Create directories for input, output, and OneDrive
RUN mkdir -p /usr/src/app/input /usr/src/app/output /usr/src/app/onedrive

# Stage 2: Create runtime image
FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

# Set the working directory
WORKDIR /usr/src/app

# Copy built frontend and backend from Stage 1
COPY --from=build /usr/src/app ./

# Install dotenv-vault globally
RUN npm install -g dotenv-vault

# Copy .env.vault file
COPY .env.vault .env.vault

# Set DOTENV_KEY and start the application
CMD ["sh", "-c", "DOTENV_KEY=$(dotenv-vault keys production) pnpm run start:backend"]

# Expose the port your app runs on
EXPOSE 8081
