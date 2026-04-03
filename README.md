# Stockly

Stockly est une application hobbyiste de gestion des stocks pour la maison.

## Philosophie

Plutôt qu'une gestion des stocks hardcore à l'unité, le stock sera géré en unités de stock pour fluidifier son utilisation.
À l'inverse d'un entrepôt d'entreprise, connaître le stock à l'unité près n'est pas pertinent pour un ménage. L'idée est plutôt d'avoir une vue d'ensemble et de savoir ce qui est disponible, où ça se trouve, et quand ça périme.

## Fonctionnalités

- 📦 Gestion des emplacements de stockage (frigo, congélateur, placard...)
- 🔍 Scan de codes-barres pour l'ajout et la sortie de stock
- 📅 Calcul automatique des dates de péremption selon la catégorie de produit
- 🏷️ Impression d'étiquettes avec DLC calculée
- 👀 Vue du stock filtrable par emplacement, triée par date de péremption

## Stack

- **Front** : React / TypeScript
- **Back** : .NET
- **Base de données** : Postgres

## Installation

À venir — un `docker-compose` sera fourni pour simplifier le déploiement.

## Documentation

La documentation détaillée est disponible dans le dossier [`docs/`](./docs/).

## Statut

🚧 En cours de développement — projet hobbyiste, pas de support garanti.
