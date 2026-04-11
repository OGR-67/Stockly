#!/bin/sh
# Démarre l'environnement de développement (API + Frontend)

set -e

echo "Démarrage de l'API et PostgreSQL..."
docker compose up -d

echo "Attente du démarrage complet..."
sleep 3

echo "Démarrage du frontend..."
cd "$(dirname "$0")/../src/Stockly.Client"
npm install
npm run dev
