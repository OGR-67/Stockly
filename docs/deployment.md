# Déploiement — Stockly

## Prérequis

- Linux (requis pour `network_mode: host` — voir section Réseau)
- Docker Engine + Compose plugin

---

## Variables d'environnement

Copier `.env.example` et renseigner toutes les valeurs :

```bash
cp .env.example .env
```

| Variable               | Description                                  |
| ---------------------- | -------------------------------------------- |
| `POSTGRES_USER`        | Utilisateur PostgreSQL                       |
| `POSTGRES_PASSWORD`    | Mot de passe PostgreSQL                      |
| `CONNECTION_STRING`    | Chaîne de connexion complète pour l'API      |
| `Auth__ApiKey`         | Clé API requise sur tous les appels entrants |

Aucune valeur par défaut en prod — le démarrage échoue si une variable est manquante.

---

## Démarrage

**Utiliser le script** (recommandé) :

```bash
./scripts/start-prod.sh
```

**Ou manuellement** :

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

| Service    | Accès                   |
| ---------- | ----------------------- |
| Frontend   | http://host:80          |
| API        | http://host:8080        |
| OpenAPI    | http://host:8080/openapi|
| PostgreSQL | non exposé publiquement |

---

## Réseau et imprimantes

L'API utilise `network_mode: host` en prod. C'est nécessaire pour la découverte mDNS des imprimantes (`_ipp._tcp.local`) sur le réseau local — sans ça, le container est isolé dans un réseau bridge et ne peut pas résoudre les imprimantes.

Conséquence : le champ `ports:` de `docker-compose.yml` est ignoré. L'API écoute directement sur le port 8080 de la machine hôte.

---

## Commandes utiles

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```
