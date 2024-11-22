#!/bin/bash

# Removing conflicting local contains
docker compose down --rmi all && docker system prune -af

# Update 

#pnpm update
#pnpm install
#pnpm audit --fix
#pnpm prune
#pnpm update react-scripts
#pnpm self-update
#pnpm depcheck

# Start the backend server
echo "Starting backend server..."
node ./src/backend/server.mjs &

# Start the frontend server
echo "Starting frontend server on port 3000..."
PORT=3000 react-scripts start &

# Wait for both processes to finish
wait
