#!/bin/bash

# Run locally!

# Remove Docker containers if Docker is running
if docker info >/dev/null 2>&1; then
    echo "Stopping Docker containers and cleaning up..."
    docker compose down --rmi all && docker system prune -af
else
    echo "⚠️  Docker not running or not installed — skipping Docker cleanup."
fi

# Check for the -u flag to update dependencies
if [[ "$1" == "-u" ]]; then
    echo "📦 Updating dependencies..."

    pnpm update
    pnpm install && node ./scripts/fix-photo-sphere-viewer.mjs
    pnpm audit fix
    pnpm prune
    pnpm knip --fix
    pnpm depcheck
else
    echo "✅ Skipping dependency updates..."
fi

# Start the backend server
echo "🚀 Starting backend server..."
node --env-file=.env ./src/backend/server.mjs &

# Start the frontend Vite dev server
echo "🚀 Starting Vite frontend on port 3000..."
pnpm run frontend:dev &

# Wait for both processes to finish (Ctrl+C will kill both)
wait
