#!/bin/bash

# Run locally!

# Kill existing backend server process
echo "Stopping existing backend server..."
pkill -f "node ./src/backend/server.mjs"

# Kill existing frontend server process
echo "Stopping existing frontend server..."
pkill -f "vite"

open --background -a Docker

(
  # No dotenv-vault keys export here, just run docker compose with local env file
  docker compose down --rmi all && docker system prune -af
  docker compose --env-file .env.production up  --build -d
)
