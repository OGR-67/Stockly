#!/bin/sh
# Démarre l'environnement de développement (API + Frontend)

set -e

PROJECT_ROOT="$(dirname "$0")/.."

# Configuration git flow (seulement si Husky n'est pas déjà installé)
if [ ! -d "$PROJECT_ROOT/.husky/_" ]; then
  echo "Configuration git flow (commit lint + semantic releaser)..."
  cd "$PROJECT_ROOT"
  npx github:OGR-67/setup-git-flow
fi

echo "Démarrage de l'API et PostgreSQL..."
cd "$PROJECT_ROOT"
docker compose up -d

echo "Attente du démarrage complet..."
sleep 3

echo "Démarrage du frontend..."
cd "$PROJECT_ROOT/src/Stockly.Client"
npm install --legacy-peer-deps
npm run dev
