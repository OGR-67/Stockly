# Onboarding — Stockly

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ou Docker Engine + Compose plugin)
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 22+](https://nodejs.org/)
- [dotnet-ef](https://learn.microsoft.com/en-us/ef/core/cli/dotnet)

```bash
dotnet tool install --global dotnet-ef
```

---

## Démarrage rapide

**Utiliser le script** (recommandé) :

```bash
git clone <repo>
cd Stockly
./scripts/start-dev.sh
```

Ce script configure automatiquement :
- Le pre-commit hook (commit lint + formatage)
- L'API + Postgres (migrations auto)
- Le frontend (npm install + dev server)

**Ou manuellement** :

```bash
git clone <repo>
cd Stockly
docker compose up        # API + Postgres, migrations auto au démarrage
```

Dans un autre terminal :

```bash
cd src/Stockly.Client
npm install && npm run dev
```

| Service    | URL                                      |
| ---------- | ---------------------------------------- |
| API        | http://localhost:8080                    |
| OpenAPI    | http://localhost:8080/openapi            |
| Frontend   | http://localhost:5173                    |
| PostgreSQL | postgresql://localhost:5432/stockly      |

Credentials dev : `stockly` / `stockly`. Pas de configuration requise, les defaults sont dans `docker-compose.override.yml`.

---

## Architecture

```
Stockly/
├── src/
│   ├── Stockly.Core/           # Entités du domaine (zéro dépendance externe)
│   ├── Stockly.Application/    # Logique métier, services, DTOs, interfaces repos
│   ├── Stockly.Infrastructure/ # EF Core, repositories, IPP printing
│   ├── Stockly.DI/             # Enregistrement des services, migrations
│   ├── Stockly.API/            # Controllers REST, Program.cs
│   └── Stockly.Client/         # Frontend React/TypeScript/Vite
├── docker-compose.yml
├── docker-compose.override.yml # Dev (fusionné automatiquement)
├── docker-compose.prod.yml
└── .env.example
```

| Projet             | Responsabilité                                  | Dépend de      |
| ------------------ | ----------------------------------------------- | -------------- |
| **Core**           | Modèles métier purs                             | —              |
| **Application**    | Services, DTOs, interfaces IRepo                | Core           |
| **Infrastructure** | EF Core context, repositories, CUPS printing    | Application    |
| **DI**             | Migrations, enregistrement des services         | Infrastructure |
| **API**            | Controllers, endpoints REST                     | DI             |

---

## Migrations EF Core

Les migrations s'appliquent automatiquement au démarrage via `ApplyMigrationsAsync()` dans `Program.cs`.

```bash
# Créer une migration
dotnet ef migrations add <NomMigration> \
  --project src/Stockly.Infrastructure \
  --startup-project src/Stockly.API

# Lister les migrations
dotnet ef migrations list \
  --project src/Stockly.Infrastructure \
  --startup-project src/Stockly.API
```

---

## Troubleshooting

**"Connection to database failed"** — L'API a démarré avant Postgres. Un healthcheck est en place normalement, mais en cas de problème :

```bash
docker compose down -v && docker compose up --build
```

**"libgssapi_krb5.so.2: cannot open shared object file"** — Déjà corrigé dans le Dockerfile (dépendances Kerberos installées au runtime).

**CORS error** — Vérifier que le frontend tourne sur `http://localhost:5173`. L'origine autorisée est configurée dans `Program.cs`.

**Port déjà utilisé** — Changer le mapping dans `docker-compose.override.yml`.

---

## Commandes utiles

```bash
docker compose logs -f api
docker compose exec api bash
docker compose exec db psql -U stockly -d stockly
docker compose down
docker compose down -v      # supprime aussi les volumes
docker compose build api
docker compose ps
```

---

## Impression (CUPS)

L'API communique avec les imprimantes via **CUPS** (Common Unix Printing System). CUPS doit être installé sur le serveur hôte.

### Découverte et enregistrement

**Serveur de production** :

```bash
# Découvrir et enregistrer les imprimantes automatiquement
./scripts/discover-printers.sh
```

Ce script :
- Scanne le réseau (même subnet que le serveur)
- Récupère le nom de chaque imprimante via IPP
- Crée les queues CUPS manquantes

Les imprimantes découvertes apparaissent ensuite dans `/admin/settings` pour enregistrement.

**Ajout manuel** (une imprimante spécifique) :

```bash
# Trouver l'IP sur l'écran de l'imprimante (Settings → Network)
lpadmin -p NomImprimante -E -v ipp://192.168.1.XXX -m everywhere
```

Voir [Impression d'étiquettes](printing.md) pour plus de détails.
