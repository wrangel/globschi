#!/bin/bash

# Run locally!

#!/bin/bash

# Kill existing backend server process (if running)
pkill -f "node ./src/backend/server.mjs" || true

# Kill existing frontend server process (if running)
pkill -f "react-scripts start" || true

# Start Docker Desktop (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
  open --background -a Docker
fi

(
  export DOTENV_KEY=$(pnpx dotenv-vault keys production)
  docker compose down --rmi all && docker system prune -af
  docker compose --env-file .env.production up --build
)

# Optionally open the app in the browser
open http://localhost:3000
