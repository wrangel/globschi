#!/bin/bash

# Run on Synology!

# Define image names
FRONTEND_IMAGE="wrangel/globschi-frontend"
BACKEND_IMAGE="wrangel/globschi-backend"

# Function to get the latest tag from a Docker repository
get_latest_tag() {
    local repo=$1
    # Fetch tags from the Docker registry and sort them to find the latest version
    latest_tag=$(curl -s "https://registry.hub.docker.com/v2/repositories/$repo/tags/" | jq -r '.results[].name' | sort -V | tail -n 1)
    echo "$latest_tag"
}

# Stop and remove existing containers if they exist
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
latest_backend_tag=$(get_latest_tag "$BACKEND_IMAGE")
latest_frontend_tag=$(get_latest_tag "$FRONTEND_IMAGE")

echo "Latest backend tag: $latest_backend_tag"
echo "Latest frontend tag: $latest_frontend_tag"

# Pull the latest images with their respective tags
docker pull "$BACKEND_IMAGE:$latest_backend_tag"
docker pull "$FRONTEND_IMAGE:$latest_frontend_tag"

# Define the path to the dotenv key
DOTENV_FILE="/volume1/secrets/dotenv.txt"

# Read DOTENV_KEY from the secrets file
DOTENV_KEY=$(cat "$DOTENV_FILE")

(
    # Export the DOTENV_KEY for use in Docker Compose
    export DOTENV_KEY

    # Run Docker Compose
    docker-compose -f /volume1/docker/docker-compose.yml up -d
)
