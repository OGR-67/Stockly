#!/bin/sh
# Démarre Stockly en production

set -e

echo "Vérification du fichier .env..."
if [ ! -f "$(dirname "$0")/../.env" ]; then
  echo "❌ Erreur : fichier .env manquant."
  echo "Copier .env.example et renseigner toutes les valeurs :"
  echo "  cp .env.example .env"
  exit 1
fi

echo "✓ .env trouvé"
echo "Démarrage de Stockly en production..."

cd "$(dirname "$0")/.."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

echo "✓ Démarrage complet"
echo "Services :"
echo "  Frontend   : http://$(hostname):80"
echo "  API        : http://$(hostname):8080"
echo "  Logs       : docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f"
