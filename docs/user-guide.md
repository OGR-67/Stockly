# Guide utilisateur — Stockly

## Vue d'ensemble

L'app s'articule autour de trois actions principales :

- **Stock** : voir ce qu'on a, où c'est, quand ça expire
- **Ranger** : ajouter du stock
- **Admin** : gérer les références (produits, catégories, emplacements)

<!-- screenshot: écran d'accueil avec les trois boutons Stock/Ranger/Admin -->

## Voir son stock

### Page des emplacements

En cliquant sur **Stock**, vous voyez la liste des emplacements.

<!-- screenshot: page Stock avec liste des emplacements -->

Chaque emplacement affiche :
- Nombre total d'unités
- Nombre d'unités périmées (badge rouge)
- Nombre bientôt périmées (badge orange)

### Détail d'un emplacement

Cliquez sur un emplacement pour voir ce qu'il contient. Les unités sont groupées par produit et date DLC.

<!-- screenshot: détail d'un emplacement avec produits groupés -->

#### Chercher un produit

Utilisez la barre de recherche pour filtrer par nom de produit. Pratique si l'emplacement est grand.

#### Scanner un code-barres

Cliquez sur l'icône caméra (si activée en admin) ou branchez une douchette Bluetooth pour scanner directement un produit.

### Gérer une unité

Cliquez sur une unité pour ouvrir sa fiche d'édition.

<!-- screenshot: modale d'édition d'une unité de stock -->

Vous pouvez :

- **Modifier la DLC** — cliquez sur le champ date pour ouvrir le calendrier
- **Ajouter une note** — producteur, lot, stock spécifique, etc.
- **Consommer** — marque l'unité comme sortie (supprimée du stock)
- **Ouvrir** — marque comme ouverte et ajoute des jours automatiquement (si la catégorie l'autorise)
- **Transférer** — déplacer vers un autre emplacement
- **Imprimer l'étiquette** — regénère et imprime l'étiquette Brother (si imprimante configurée)

## Ranger du stock

Cliquez sur **Ranger** pour ajouter une unité.

### Sélectionner l'emplacement

Choisissez où vous rangez (frigo, placard, dépôt, etc.).

<!-- screenshot: sélection d'emplacement -->

### Ajouter un produit

Utilisez le scanner ou la recherche pour trouver le produit.

<!-- screenshot: recherche produit avec clavier / scanner -->

Si le produit n'existe pas, créez-le rapidement en donnant son nom.

### Saisir la DLC

Entrez la date limite. Appuyez sur le champ pour ouvrir le calendrier.

<!-- screenshot: saisie DLC -->

### Ajouter une note (optionnel)

Notez un détail si c'est pertinent (producteur, lien source, zone d'emplacement fine, etc.).

### Enregistrer

Cliquez sur **Enregistrer**. L'unité apparaît immédiatement dans l'emplacement.

## Alertes DLC

### Sur la page Stock

En haut de la page Stock, deux banners apparaissent si vous avez des unités périmées ou bientôt périmées :

- **Périmé** (rouge) — expiration dépassée
- **Bientôt périmé** (orange) — moins de 2 jours

Cliquez sur un banner pour aller à la vue d'administration où vous pouvez voir et gérer tous les produits concernés.

<!-- screenshot: banners d'alerte -->

## Administration

Cliquez sur **Admin** pour accéder aux réglages.

### Produits

Créez, modifiez ou supprimez des produits de référence. Définissez aussi :

- **Catégorie** — groupe auquel appartient le produit
- **Note par défaut** — une note qui pré-remplira automatiquement quand vous rangez ce produit

### Catégories

Définissez les catégories (Fruits, Légumes, Laitier, Viande, etc.). Vous pouvez aussi spécifier le nombre de jours à ajouter quand vous ouvrez un produit de cette catégorie.

### Emplacements

Créez les zones de votre stock (Frigo, Placard cuisine, Congélateur, Dépôt, etc.).

### Configuration — Imprimante

Si vous avez une imprimante Brother QL-810W, configurez-la ici.

**Découverte automatique** : cliquez sur *Rechercher les imprimantes* pour scanner le réseau.

**Ajout manuel** : rentrez l'adresse IP ou le hostname si la découverte ne marche pas.

**Imprimante par défaut** : sélectionnez celle à utiliser quand vous imprimez une étiquette.

**Format étiquette** : taille du support (62mm, 29mm, etc.).

<!-- screenshot: page de configuration imprimante -->

### Configuration — Autres

- **Caméra intégrée** — active le scanner via la caméra de votre téléphone/tablette
