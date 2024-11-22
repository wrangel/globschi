#!/bin/bash

# Clean up 
docker compose down --rmi all && docker system prune -af

# Set the DOTENV_KEY and build images using docker-compose
export DOTENV_KEY=$(npx dotenv-vault keys production)
docker compose --env-file .env.production build

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
