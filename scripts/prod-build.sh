#!/bin/bash

# Run locally!

open -a Docker

# Clean up
docker compose down --rmi all && docker system prune -af

# Build images using docker-compose
docker compose --env-file .env.production build --no-cache

# Log in to Docker registry (if needed)
docker login

# Get a list of all images on the system
IMAGES=$(docker images --format "{{.Repository}}:{{.Tag}}")

# Loop through each image and push it
for IMAGE in $IMAGES; do
    echo "Pushing $IMAGE..."
    docker push "$IMAGE"
done
echo "All images pushed successfully."

# Clean up 
docker compose down --rmi all && docker system prune -af

killall docker
