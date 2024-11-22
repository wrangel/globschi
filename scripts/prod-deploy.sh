#!/bin/bash

# Run on Synology!

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