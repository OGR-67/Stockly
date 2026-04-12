# Impression d'étiquettes

## Vue d'ensemble

L'API communique avec les imprimantes via **CUPS** (Common Unix Printing System), un système d'impression standard sur Linux/Unix.

L'API exécute la commande `lp` pour envoyer des jobs au serveur CUPS local, qui les route vers les imprimantes configurées.

## Architecture

```
Frontend (HTML preview) 
  ↓
API /print endpoint
  ↓
CupsPrintingService
  ├─ Récupère l'imprimante (nom de queue CUPS)
  ├─ Redimensionne l'image (ImageSharp)
  ├─ Écrit dans un fichier temporaire PNG
  └─ Exécute: lp -d <queue> <file>
    ↓
CUPS (serveur local)
  ├─ Convertit PNG → PDF
  └─ Envoie à l'imprimante (ipp://192.168.x.x)
    ↓
Imprimante Brother
```

## Flux d'impression

1. **Frontend** — `PrintModal.tsx` capture un preview HTML en image (base64).
2. **API** — `POST /api/printers/{id}/print` reçoit `{ formatId, imageBase64 }`.
3. **Backend** — `CupsPrintingService` :
   - Récupère l'imprimante et le format (dimensions mm)
   - Redimensionne l'image PNG aux dimensions exactes via ImageSharp
   - Écrit dans un fichier temporaire
   - Exécute `lp -d <queue> <file>`
   - CUPS convertit PNG → PDF et envoie à l'imprimante

## Calcul des dimensions

```
pixels = mm × DPI / 25.4
```

- 25.4 = mm par pouce
- 300 DPI = densité standard d'impression
- `ResizeMode.Pad` = conserve le ratio et remplit en blanc si besoin

Exemple : format 62×29mm → 732×343 pixels.

## Configuration des imprimantes

### Découverte automatique (recommandé)

```bash
./scripts/discover-printers.sh
```

Ce script :
- Scanne le réseau sur le port 631 (IPP)
- Récupère le nom de chaque imprimante via `ipptool`
- Crée les queues CUPS manquantes
- Récupère l'IP du serveur et le subnet automatiquement

### Ajout manuel

```bash
# 1. Trouver l'IP (sur l'écran tactile de l'imprimante)
# Settings → Network → TCP/IP

# 2. Créer la queue CUPS
lpadmin -p NomImprimante -E -v ipp://192.168.1.XXX -m everywhere

# 3. Vérifier
lpstat -p
```

### Vérification

```bash
# Lister les imprimantes
lpstat -p

# Tester un print
lp -d NomImprimante /etc/hostname

# Vérifier la queue
lpstat -o NomImprimante
```

## Détails d'implémentation

### CupsPrintingService

Located: `src/Stockly.Infrastructure/Printing/CupsPrintingService.cs`

- Injecte `IPrinterRepository` et `ILogger<CupsPrintingService>`
- Redimensionne l'image PNG aux dimensions du format
- Crée un fichier temporaire
- Exécute `lp -d {queue} {file}` via `Process.Start`
- Gère les erreurs et logs complets (entrée, traitement, succès/échec)

### CupsDiscoveryService

Located: `src/Stockly.Infrastructure/Printing/CupsDiscoveryService.cs`

- Exécute `lpstat -e` pour lister les queues CUPS
- Retourne la liste au frontend pour enregistrement

## Docker

### Image

Le Dockerfile installe `cups-client` (outils `lp`, `lpstat`).

```dockerfile
RUN apt-get install -y cups-client
```

### Socket CUPS

Docker Compose monte le socket CUPS du serveur :

```yaml
api:
  volumes:
    - /run/cups:/run/cups:ro
```

Cela permet au container de communiquer avec le serveur CUPS de l'hôte.

## Troubleshooting

**Imprimante ne répond pas**

```bash
# Vérifier que l'IP est accessible
ping 192.168.1.XXX

# Vérifier que le port 631 (IPP) répond
curl -v http://192.168.1.XXX/

# Vérifier dans CUPS
lpstat -p -l NomImprimante
tail -30 /var/log/cups/error_log
```

**Commande `lp` échoue silencieusement**

- Vérifier les logs API : `docker compose logs api`
- Vérifier les logs CUPS : `tail -50 /var/log/cups/error_log`
- Vérifier que le socket CUPS est bien monté : `docker exec <api-container> ls -la /run/cups/`

**Imprimante WiFi déconnectée**

```bash
# La redécouvrir avec:
./scripts/discover-printers.sh
```

## Limitations

- **Découverte** : le script scanne par scan TCP sur le port 631. Si le réseau est segmenté, il faut ajout manuel.
- **Performance** : CUPS convertit PNG → PDF (seqentiel), ce qui ajoute ~2-3 secondes par job.
