# E-radiologie Backoffice

## Environnement local commun

Depuis le dossier parent `E-RADIOLOGIE`, lancer `make start` pour démarrer le
backend MySQL, phpMyAdmin et les deux interfaces. Voir le [guide local](../README.md)
pour les comptes de test et les commandes. Cette interface est disponible sur
http://localhost:3001 et utilise l'API http://localhost:18740.

Pour un lancement hors Docker, définir `VITE_API_BASE_URL=http://localhost:18740`
dans `.env.local` et utiliser `npm run dev -- --port 3001 --strictPort`.

Application web backoffice développée avec **Vue.js**, **TypeScript** et **Vite**.

> 🔒 **Projet privé et propriétaire — Tous droits réservés**

Ce dépôt contient le code source de l'application **E-radiologie Backoffice**.  
Son accès, son utilisation, sa modification et sa distribution sont strictement réservés aux personnes explicitement autorisées.

---

## Présentation

**E-radiologie Backoffice** est une application web de gestion développée avec une architecture moderne basée sur Vue.js, TypeScript et Vite.

Le projet est structuré afin de faciliter :

- le développement ;
- la maintenance ;
- l'évolution fonctionnelle ;
- la séparation des responsabilités ;
- la gestion des appels API ;
- la gestion des états applicatifs ;
- le déploiement sur différents environnements.

---

## Technologies utilisées

Le projet utilise notamment :

- **Vue.js**
- **TypeScript**
- **Vite**
- **Vue Router**
- **Pinia** pour la gestion d'état
- **CSS**
- **API REST**
- **Bun / Node.js** pour la gestion et l'exécution du projet

Les dépendances exactes utilisées par l'application sont disponibles dans le fichier :

```text
package.json
```

---

## Prérequis

Avant d'installer le projet, vérifier que les outils suivants sont disponibles sur la machine.

### Option recommandée : Bun

```bash
bun --version
```

### Ou avec Node.js

Version recommandée :

```text
Node.js >= 20
```

Vérification :

```bash
node --version
npm --version
```

---

## Installation du projet

### 1. Cloner le dépôt

```bash
git clone <URL_DU_DEPOT>
```

Puis entrer dans le dossier du projet :

```bash
cd e-radiologie-backoffice
```

---

### 2. Installer les dépendances

Le projet contient un fichier `bun.lock`.  
L'utilisation de **Bun** est donc recommandée.

```bash
bun install
```

Si Bun n'est pas utilisé :

```bash
npm install
```

> Pour éviter des différences de versions entre les environnements, il est recommandé d'utiliser le même gestionnaire de paquets que celui utilisé pour générer le fichier de verrouillage du projet.

---

## Configuration de l'environnement

Un fichier d'exemple est disponible à la racine du projet :

```text
.env.example
```

Créer votre fichier d'environnement local à partir de celui-ci.

Avec Linux ou macOS :

```bash
cp .env.example .env.local
```

Ou :

```bash
cp .env.example .env
```

Adapter ensuite les variables d'environnement nécessaires au fonctionnement de l'application.

Utiliser `.env.local` sur chaque machine pour définir `VITE_API_BASE_URL`.
Docker laisse Vite charger ce fichier. Pour la production, le workflow récupère
uniquement cette variable publique dans
`~/projets/e-radiologie-back-office/.env.local` sur le serveur avant le build.
Créer ce fichier avant le premier déploiement ; il reste ignoré par Git.
Une modification exige un nouveau build et la publication du nouveau `dist/`.
Éviter les valeurs concurrentes dans `.env.production` ou l'environnement du build,
qui auraient priorité sur `.env.local`. Aucune clé secrète ne doit être préfixée
par `VITE_` : ces variables sont visibles dans le navigateur.


### Important

Les fichiers contenant des informations sensibles ne doivent jamais être ajoutés au dépôt Git.

Par exemple :

```text
.env
.env.local
.env.production
```

Les clés API, mots de passe, tokens et autres secrets doivent rester confidentiels.

---

## Lancer le projet en développement

Avec Bun :

```bash
bun run dev
```

Ou avec npm :

```bash
npm run dev
```

Vite affichera ensuite l'adresse locale permettant d'accéder à l'application.

Généralement :

```text
http://localhost:5173
```

---

## Build de production

Pour générer une version optimisée destinée à la production :

### Avec Bun

```bash
bun run build
```

### Avec npm

```bash
npm run build
```

Les fichiers générés seront généralement disponibles dans :

```text
dist/
```

---

## Tester le build de production

Pour tester localement la version compilée :

```bash
bun run preview
```

ou :

```bash
npm run preview
```

---

## Structure du projet

```text
.
├── assets/
├── src/
│   ├── api/
│   ├── components/
│   ├── router/
│   ├── stores/
│   ├── types/
│   ├── utils/
│   ├── views/
│   ├── App.vue
│   ├── index.css
│   └── main.ts
│
├── .env.example
├── .gitignore
├── bun.lock
├── index.html
├── package.json
├── README.md
├── tsconfig.json
└── vite.config.ts
```

### `src/api`

Contient les services et méthodes permettant de communiquer avec les API utilisées par l'application.

### `src/components`

Contient les composants Vue réutilisables dans différentes parties de l'application.

### `src/router`

Contient la configuration des routes de l'application.

### `src/stores`

Contient les stores applicatifs et la gestion des états partagés.

### `src/types`

Contient les interfaces et types TypeScript utilisés dans le projet.

### `src/utils`

Contient les fonctions utilitaires et helpers partagés.

### `src/views`

Contient les différentes vues/pages principales de l'application.

### `App.vue`

Composant racine de l'application.

### `main.ts`

Point d'entrée principal de l'application Vue.

---

## Scripts

Les scripts réellement disponibles sont définis dans :

```text
package.json
```

Les principaux scripts sont généralement :

| Commande | Description |
|---|---|
| `bun run dev` | Lance l'environnement de développement |
| `bun run build` | Génère le build de production |
| `bun run preview` | Prévisualise le build de production |

Les mêmes commandes peuvent être exécutées avec `npm run`.

---

## Développement

Lors du développement, respecter autant que possible l'organisation existante du projet.

### Composants

Les composants réutilisables doivent être placés dans :

```text
src/components/
```

### Pages

Les nouvelles pages doivent être placées dans :

```text
src/views/
```

### API

Les communications avec les services externes ou le backend doivent être centralisées dans :

```text
src/api/
```

### Types TypeScript

Les types et interfaces partagés doivent être placés dans :

```text
src/types/
```

### État global

Les données devant être partagées entre plusieurs composants doivent être gérées dans :

```text
src/stores/
```

---

## Bonnes pratiques Git

Avant de créer un commit :

1. vérifier que l'application démarre correctement ;
2. vérifier qu'aucune clé ou donnée sensible n'est présente ;
3. vérifier que le build fonctionne ;
4. utiliser un message de commit explicite.

Exemples :

```bash
git commit -m "feat: ajout de la gestion des utilisateurs"
```

```bash
git commit -m "fix: correction de l'affichage du tableau"
```

```bash
git commit -m "refactor: amélioration de la gestion des appels API"
```

---

## Sécurité

Les informations suivantes ne doivent jamais être enregistrées directement dans le code source :

- mots de passe ;
- clés API ;
- tokens d'accès ;
- identifiants de bases de données ;
- secrets d'authentification ;
- clés privées ;
- informations confidentielles de production.

Utiliser les variables d'environnement pour ce type d'informations.

---

## Déploiement

Avant tout déploiement en production :

```bash
bun install
bun run build
```

ou :

```bash
npm install
npm run build
```

Le contenu généré dans :

```text
dist/
```

peut ensuite être déployé sur le serveur ou l'infrastructure prévue pour l'application.

La configuration exacte du déploiement dépend de l'environnement cible.

---

## Accès au projet

Ce projet est **privé**.

L'accès au dépôt ne constitue pas une autorisation permettant :

- de copier le projet ;
- de redistribuer son code source ;
- de publier le projet ;
- de créer une version dérivée ;
- de vendre ou commercialiser tout ou partie du projet ;
- de réutiliser le code dans un autre produit sans autorisation.

Toute utilisation doit faire l'objet d'une autorisation préalable.

---

## Licence

**Licence propriétaire — Tous droits réservés.**

Copyright © 2026 **Issam LAMMRI**

Le présent logiciel ainsi que l'ensemble de son code source, de sa documentation, de ses ressources, de son architecture et de ses composants sont confidentiels et propriétaires.

Toute copie, reproduction, modification, publication, distribution, sous-licence, commercialisation ou utilisation, totale ou partielle, sans autorisation écrite préalable du propriétaire est strictement interdite.

La mise à disposition du code source à un collaborateur, prestataire ou partenaire ne lui confère aucun droit de propriété sur le logiciel.

---

## Auteur

### Développement

**Issam LAMMRI**  
**Développeur & Lead Developer**

Responsable du développement et de l'architecture technique du projet.

---

## Maintenance

Toute évolution importante concernant :

- l'architecture ;
- les dépendances ;
- les variables d'environnement ;
- la procédure d'installation ;
- la procédure de déploiement ;
- ou les prérequis techniques

doit être documentée dans ce fichier afin de conserver une procédure d'installation fiable et reproductible.

---

**Projet privé — Copyright © 2026 Issam LAMMRI — Tous droits réservés.**
## Administration V1

Les rubriques `/content/specialties`, `/content/classifications`, `/content/courses`,
`/content/dems-exercises`, `/content/report-exams` et `/content/report-templates`
réutilisent l'authentification administrateur. Elles gèrent les règles ordonnées,
l'arborescence des cours et blocs, les médias et les textes WYSIWYG Tiptap.
Les comptes rendus privés des médecins ne sont pas exposés dans ces rubriques.

`bun run lint` vérifie les fichiers TypeScript et les composants Vue via
`vue-tsc` sous Node. Le conteneur local fournit Node 22 et Bun.
Voir le [bilan V1](../V1_BILAN.md) et le [contrat API](../e-radiologie-backend/docs/V1_API.md).

### Réorganisation et import d’images

Les règles d’évaluation, sections, sous-titres et blocs de cours se réordonnent
en glissant leur poignée, à la souris ou au toucher. Les déplacements restent
dans la liste du même niveau. Les boutons haut/bas sont conservés ; une poignée
sélectionnée au clavier répond également aux flèches haut/bas. L’ordre est
sauvegardé avec le bouton « Enregistrer ».

Les images de présentation, de blocs et de dossiers DEMS utilisent une zone de
dépôt, également accessible par clic ou au clavier. Un aperçu, l’état de l’envoi,
le remplacement et le retrait du formulaire sont disponibles. Les URL restent
acceptées. L’import conserve les formats PNG/JPEG/WebP et la limite de 5 Mo ;
les dépôts multiples sont refusés. L’enregistrement du formulaire attend la fin
de tous les imports. La consultation seule ne permet ni import ni déplacement.

La recette dédiée se lance depuis le dossier parent avec
`npm run test:e2e -- tests/e2e/editorial-drag-drop.spec.ts` : réorganisation
persistée, contenu WYSIWYG conservé, dépôt et sélection de fichiers, erreurs
d’import, mode lecture seule et interaction tactile sur écran mobile.
