#!/bin/bash

# Run locally!

# Kill existing backend server process
echo "Stopping existing backend server..."
pkill -f "node ./src/backend/server.mjs"

# Kill existing frontend server process
echo "Stopping existing frontend server..."
pkill -f "react-scripts start"

open --background -a Docker

(
  export DOTENV_KEY=$(pnpx dotenv-vault keys production)
  docker compose down --rmi all && docker system prune -af
  docker compose --env-file .env.production up --build
)
