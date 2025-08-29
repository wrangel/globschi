  #!/bin/bash
  set -e

  echo "Starting Docker Desktop (MacOS)..."
  open -a Docker || echo "Docker Desktop may already be running."

  echo "Waiting for Docker to be ready..."
  while ! docker info >/dev/null 2>&1; do
    echo "Waiting for Docker to start..."
    sleep 2
  done
  echo "Docker is running."

  echo "Stopping existing containers and cleaning up..."
  docker compose down --rmi all && docker system prune -af

  echo "Building images using docker compose..."
  docker compose --env-file .env.production build --no-cache

  echo "Logging into Docker registry (if needed)..."
  docker login

  # Define your images explicitly instead of all images
  IMAGES=(
    "wrangel/globschi-frontend:2.1" # Use the tags defined in docker-compose.yml
    "wrangel/globschi-backend:2.1"
  )

  echo "Pushing built images to Docker registry..."
  for IMAGE in "${IMAGES[@]}"; do
      echo "Pushing $IMAGE..."
      docker push "$IMAGE"
  done
  echo "All images pushed successfully."

  echo "Cleaning up containers and images after push..."
  docker compose down --rmi all && docker system prune -af

  # Remove killall docker unless you need it for your environment
  # killall docker

  echo "Production build and push finished successfully."
