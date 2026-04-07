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
| **Infrastructure** | EF Core context, repositories, IPP              | Application    |
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

## Imprimante (Brother QL-810W)

L'API communique avec l'imprimante via IPP (port 631), découverte mDNS (`_ipp._tcp.local`).
L'implémentation est en cours — ajouter une imprimante via `/admin/settings`.

> **Dev** : quand l'API tourne dans Docker (réseau bridge), la découverte mDNS ne fonctionne pas.
> Pour tester l'imprimante en local, lancer l'API nativement avec `dotnet run`.
