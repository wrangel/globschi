#!/bin/bash

# Run locally!

# Removing conflicting local containers
docker compose down --rmi all && docker system prune -af

# Check for the -u flag
if [[ "$1" == "-u" ]]; then
    echo "Updating dependencies..."

    # Update dependencies
    pnpm update
    pnpm install && node ./scripts/fix-photo-sphere-viewer.mjs # Postinstall script would not work in docker setting
    pnpm audit --fix
    pnpm prune
    pnpm update react-scripts
    pnpm self-update
    pnpm depcheck

else
    echo "Skipping updates..."
fi

# Start the backend server
echo "Starting backend server..."
node ./src/backend/server.mjs &

# Start the frontend server
echo "Starting frontend server on port 3000..."
PORT=3000 react-scripts start &

# Wait for both processes to finish
wait
