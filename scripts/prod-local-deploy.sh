export DOTENV_KEY=$(npx dotenv-vault keys production) 

docker compose --env-file .env.production build 

unset DOTENV_KEY