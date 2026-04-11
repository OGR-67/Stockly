# Stockly

Gestion de stock alimentaire simplifiée. Suivi par unité, pas au flux. Pensé pour être utile sans friction.

## Philosophie

Stockly trace le stock à l'unité plutôt qu'au flux. L'app n'a pas besoin d'être mise à jour à chaque mouvement — on l'utilise quand c'est pertinent. Elle accepte les petits écarts naturels et reste utile sans friction. L'idée : minimiser la charge pour maximiser l'adoption réelle.

## Fonctionnalités

- **Gestion DLC** : suivi des dates limites, alertes pour bientôt expiré et expiré
- **Emplacements** : organisez votre stock par zone (frigo, placard, dépôt)
- **Scan de codes-barres** : ajoutez du stock via caméra ou douchette
- **Impression d'étiquettes** : génération Brother QL compatible
- **Notes** : ajoutez une note à chaque unité (producteur, source, etc.)

## Stack

- **Backend** : .NET 10 + EF Core + PostgreSQL 17
- **Frontend** : React 19 + TypeScript + TanStack Router
- **Infra** : Docker + Docker Compose

## Documentation

- [Démarrer en dev](docs/onboarding.md) — installation, commandes, architecture
- [Déployer en prod](docs/deployment.md) — variables d'env, lancement
- [Guide utilisateur](docs/user-guide.md) — comment utiliser l'app
- [Impression](docs/printing.md) — intégration imprimante Brother

## Démarrage rapide

```bash
# Dev
./scripts/start-dev.sh

# Prod
./scripts/start-prod.sh
```

## Licence

MIT
