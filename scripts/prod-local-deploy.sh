(
  export DOTENV_KEY=$(pnpx dotenv-vault keys production)
  docker compose down --rmi all && docker system prune -af
  docker compose --env-file .env.production up --build
)
