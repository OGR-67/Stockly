# Impression d'étiquettes

## Vue d'ensemble

L'impression passe par le protocole IPP (Internet Printing Protocol) — standard réseau supporté nativement par la plupart des imprimantes WiFi modernes, dont la Brother QL-810W cible.

Aucun driver n'est nécessaire. L'API envoie directement un job IPP à l'imprimante via HTTP sur le port 631.

## Flux

1. **Frontend** — `PrintModal.tsx` affiche un preview de l'étiquette (nom, DLC, code-barres). Au clic sur Imprimer, `html-to-image` capture ce preview en JPEG base64.
2. **API** — `POST /api/printers/{id}/print` reçoit `{ formatId, imageBase64 }`.
3. **Backend** — `IppPrintingService` :
   - Récupère l'imprimante (IP, port) et le format (dimensions en mm)
   - Resize l'image aux dimensions exactes du format via ImageSharp (`widthMm × 300/25.4` pixels, `ResizeMode.Pad` pour conserver le ratio avec fond blanc)
   - Envoie un job IPP `Print-Job` avec `DocumentFormat: image/jpeg` via SharpIpp

## Calcul des dimensions

```
pixels = mm × DPI / 25.4
```

25.4 = nombre de mm par pouce. On imprime à 300 DPI.

Exemple : format 62×29mm → 732×343 pixels.

`ResizeMode.Pad` : scale l'image en conservant le ratio et remplit le reste en blanc si les proportions diffèrent.

## Enregistrement d'une imprimante

Les imprimantes sont persistées en base avec leur IP et port (631 par défaut). À l'enregistrement, les formats Brother QL connus sont automatiquement seedés (actuellement : DK-11209 – 62×29mm).

**Découverte mDNS** — `PrinterDiscoveryService` écoute `_ipp._tcp.local.` via Zeroconf. Fonctionne uniquement sur Linux (`network_mode: host`). Sur macOS Docker Desktop, la VM isole le container du réseau local -> utiliser l'ajout manuel (nom + IP + port). Non testé sur windows.

## Limitations connues

- **Format d'envoi** : actuellement fixé à `image/jpeg`. Si une imprimante ne supporte pas JPEG, il faudra ajouter un champ `DocumentFormat` sur l'entité `Printer` et le configurer à l'enregistrement.
- **Découverte macOS** : non fonctionnelle en dev Docker (voir ci-dessus).
