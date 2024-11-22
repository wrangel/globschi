#!/bin/bash

# Run on Synology!

# Function to get the latest tag from a Docker repository
get_latest_tag() {
    local repo=$1
    # Fetch tags from the Docker registry and sort them to find the latest version
    latest_tag=$(curl -s "https://registry.hub.docker.com/v2/repositories/$repo/tags/" | jq -r '.results[].name' | sort -V | tail -n 1)
    echo "$latest_tag"
}

# Stop and remove all containers if they exist
echo "Stopping and removing all containers..."
if [ "$(docker ps -aq)" ]; then
    docker rm -f $(docker ps -aq) || echo "Failed to remove some containers."
else
    echo "No containers to remove."
fi

# Remove all unused networks forcefully
echo "Removing all unused networks..."
docker network prune -f || echo "No unused networks to remove."

# Optional: Remove all unused volumes (if desired)
echo "Removing all unused volumes..."
docker volume prune -f || echo "No volumes to remove."

# Optional: Remove all dangling images (if desired)
echo "Removing all dangling images..."
docker image prune -f || echo "No dangling images to remove."

# Get the latest tags for backend and frontend images
backend_image="wrangel/globschi-backend"
frontend_image="wrangel/globschi-frontend"

latest_backend_tag=$(get_latest_tag "$backend_image")
latest_frontend_tag=$(get_latest_tag "$frontend_image")

echo "Latest backend tag: $latest_backend_tag"
echo "Latest frontend tag: $latest_frontend_tag"

# Pull the latest images with their respective tags
docker pull "$backend_image:$latest_backend_tag"
docker pull "$frontend_image:$latest_frontend_tag"

# Run the frontend container
echo "Starting frontend container..."
docker run -d \
    --name frontend \
    -p 3000:80 \
    "$FRONTEND_IMAGE:$latest_frontend_tag"

# Run the backend container with DOTENV_KEY from volume
echo "Starting backend container..."
docker run -d \
    --name backend \
    -e DOTENV_KEY="$(cat $DOTENV_FILE)" \
    -v "$DOTENV_FILE:/run/secrets/dotenv_key" \
    "$BACKEND_IMAGE:$latest_backend_tag"

echo "All containers started successfully."