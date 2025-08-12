#!/bin/bash
set -e

echo "Stopping existing backend server..."
if pkill -f "node --env-file=.env ./src/backend/server.mjs"; then
  echo "Backend server stopped."
else
  echo "No running backend server process found."
fi

echo "Stopping existing frontend server..."
if pkill -f "vite"; then
  echo "Frontend server stopped."
else
  echo "No running frontend server process found."
fi

echo "Starting Docker if not running (MacOS)..."
open --background -a Docker || echo "Docker Desktop may already be running."

echo "Waiting for Docker to start..."
while ! docker info >/dev/null 2>&1; do
  echo "Waiting for Docker to start..."
  sleep 2
done
echo "Docker is running."

echo "Stopping existing containers and cleaning up unused images..."
docker compose down --rmi all
docker system prune -af

echo "Building and starting containers with production environment using Compose Bake..."
COMPOSE_BAKE=true docker compose --env-file .env.production up --build -d

echo "Deployment finished successfully."
