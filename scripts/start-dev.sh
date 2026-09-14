#!/bin/sh
# Démarre l'environnement de développement : PostgreSQL en Docker, API (dotnet watch) et
# Frontend (Vite) en natif avec hot reload. Éviter de conteneuriser l'API en dev : un rebuild
# d'image complet à chaque changement de code est beaucoup plus lent qu'un simple hot reload.
# Usage: ./scripts/start-dev.sh [--fresh]
#   --fresh : supprime le volume Postgres avant de redémarrer (base vierge, reseedée au démarrage)

set -e

PROJECT_ROOT="$(dirname "$0")/.."
cd "$PROJECT_ROOT"

# Configuration git flow (seulement si Husky n'est pas déjà installé)
if [ ! -d ".husky/_" ]; then
  echo "Configuration git flow (commit lint + semantic releaser)..."
  npx github:OGR-67/setup-git-flow
fi

if [ "$1" = "--fresh" ]; then
  echo "Suppression du volume Postgres (--fresh)..."
  docker compose down -v
fi

echo "Démarrage de PostgreSQL..."
docker compose up -d db

echo "Attente de PostgreSQL..."
until docker compose exec -T db pg_isready -U "${POSTGRES_USER:-stockly}" -d stockly > /dev/null 2>&1; do
  sleep 1
done

if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

export ASPNETCORE_ENVIRONMENT=Development
export ASPNETCORE_URLS="http://localhost:5050"
export ConnectionStrings__Default="Host=localhost;Port=5432;Database=stockly;Username=${POSTGRES_USER:-stockly};Password=${POSTGRES_PASSWORD:-stockly}"

echo "Démarrage de l'API (dotnet watch, hot reload sur localhost:5050)..."
dotnet watch run --project src/Stockly.API --no-launch-profile --non-interactive &
API_PID=$!
trap 'kill $API_PID 2>/dev/null' EXIT INT TERM

echo "Démarrage du frontend..."
cd src/Stockly.Client
npm install --legacy-peer-deps
npm run dev
