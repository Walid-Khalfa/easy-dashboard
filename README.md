# Easy-Dashboard Pro : Professional Starter Kit CRM MERN

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Easy-Dashboard Pro** est une version modernisée et sécurisée du Starter Kit CRM. Cette version a été refactorisée pour répondre aux standards de production de 2025/2026.

### 🚀 Améliorations de la Version Pro (2.0)

*   **🛠️ Full Stack TypeScript :** Migration complète vers TypeScript pour une meilleure maintenabilité et sécurité du code.
*   **⚡ Modernisation Frontend :** Passage à **React 18** et **Vite** pour des performances optimales. Utilisation d'**Ant Design 5** avec CSS-in-JS.
*   **🧠 State Management Moderne :** Migration vers **Redux Toolkit** pour une gestion d'état simplifiée.
*   **🛡️ Sécurité Renforcée :**
    *   Validation des données avec **Zod**.
    *   Authentification JWT avec **Refresh Tokens**.
    *   Protection contre les attaques communes avec **Helmet** et **Rate Limiting**.
    *   Gestion des rôles (**RBAC**).
    *   **Token Blocklist** avec Redis pour la révocation immédiate des tokens.
    *   **Account Lockout** après 5 tentatives échouées.
    *   Protection **ReDoS** avec échappement regex.
    *   Prévention des injections **NoSQL** via validation des champs.
*   **📦 Backend Robuste :** Migration vers **Mongoose 8**, support du **Soft Delete**, filtrage et tri avancés sur les routes CRUD génériques.
*   **🧪 Tests Automatisés :** Infrastructure de tests mise en place avec **Jest**, **Supertest** et **Vitest**.
*   **🏗️ Architecture en Couches :** Séparation des responsabilités avec Services, Repositories, et Contrôleurs.

### 🛠️ Architecture & RBAC

Le système utilise désormais un contrôle d'accès basé sur les rôles (RBAC) :
*   **ADMIN :** Accès total, peut créer/supprimer d'autres administrateurs, gérer les produits.
*   **STAFF :** Peut lire et modifier les clients et leads, mais ne peut pas les supprimer.

Les permissions sont définies dans `middleware/rbac.ts` et peuvent être étendues de manière granulaire.

### 📦 CRUD Générique Standardisé

Le contrôleur CRUD (`controllers/crudController/crudMethods.ts`) a été standardisé pour offrir :
*   **Pagination :** Paramètres `page` et `items`.
*   **Tri :** Paramètre `sort` (ex: `sort=name`).
*   **Filtrage :** Tout paramètre de query non réservé est utilisé comme filtre.
*   **Soft Delete :** Les entités supprimées sont marquées `removed: true` et filtrées par défaut.
*   **Cache Redis :** Mise en cache des requêtes de liste avec invalidation automatique.

Ce kit est conçu pour accélérer votre développement en vous fournissant une authentification sécurisée, une gestion des utilisateurs et des opérations CRUD génériques prêtes à l'emploi.

---

### 🚀 Démo en Ligne

Accédez à la version de démonstration pour tester l'application en direct.

**URL :** [**https://antd-admin-yle2f.ondigitalocean.app**](https://antd-admin-yle2f.ondigitalocean.app)

> **Identifiants de connexion :**
> * **Email :** `admin@demon.com`
> * **Mot de passe :** `admin123`

---

### ✨ Fonctionnalités Principales

* **🔐 Authentification Sécurisée :** Flux de connexion/déconnexion complet basé sur les JSON Web Tokens (JWT) avec refresh tokens.
* **🔒 Token Blocklist :** Révocation immédiate des tokens lors de la déconnexion via Redis.
* **🚫 Account Lockout :** Verrouillage automatique après 5 tentatives de connexion échouées.
* **👤 Gestion des Utilisateurs :** CRUD complet pour la gestion des administrateurs et des utilisateurs.
* **⚙️ Modules CRUD Génériques :** Composants React et routes d'API réutilisables pour créer, lire, mettre à jour et supprimer n'importe quel type de données, accélérant ainsi le développement de nouvelles fonctionnalités.
* **🎨 Interface Élégante avec Ant Design :** Un tableau de bord à l'interface utilisateur soignée et réactive, construite avec React et la bibliothèque de composants [Ant Design (Antd)](https://ant.design/).
* **🌐 Gestion d'État Centralisée :** Logique d'état globale gérée avec Redux et Redux-Thunk pour une application prévisible et maintenable.
* **🔒 Routes Protégées :** Mise en place de routes privées et publiques pour s'assurer que seuls les utilisateurs authentifiés peuvent accéder aux pages sensibles.

---

### 🛠️ Stack Technique

| Domaine | Technologies |
| :--- | :--- |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, JWT, Redis |
| **Frontend** | React.js, Redux, Redux-Thunk, Ant Design (Antd) |
| **Base de Données** | MongoDB (via MongoDB Atlas), Redis (cache/blocklist) |
| **Sécurité** | Helmet, Rate Limiting, Zod Validation, bcrypt |
| **Tests** | Jest, Supertest, Vitest |

---

### 🏁 Démarrage Rapide

Suivez ces étapes pour lancer le projet sur votre machine locale.

#### **Prérequis**

* [Node.js](https://nodejs.org/) (version 18.x ou supérieure)
* `npm` ou `yarn`
* Un compte [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) pour obtenir une URL de connexion à la base de données.
* **Redis** (optionnel, pour la token blocklist et le cache)

#### **Installation**

1.  **Clonez le dépôt :**
    ```bash
    git clone https://github.com/Walid-Khalfa/easy-dashboard.git
    cd easy-dashboard
    ```

2.  **Configurez le Backend :**
    ```bash
    # Créez votre fichier d'environnement à partir du modèle
    cp .variables.env.tmp .variables.env
    ```
    Ouvrez le fichier `.variables.env` et configurez les variables :
    ```env
    DATABASE=VOTRE_URL_MONGODB_ATLAS
    JWT_SECRET=votre_secret_jwt
    JWT_REFRESH_SECRET=votre_refresh_secret
    REDIS_URL=redis://localhost:6379  # Optionnel
    ```

3.  **Installez les dépendances du Backend :**
    ```bash
    npm install
    ```
    *Optionnel : La commande `npm run setup` peut être utilisée si elle sert à peupler la base de données avec des données initiales.*

4.  **Installez les dépendances du Frontend :**
    ```bash
    cd frontend
    npm install
    ```

---

### 🚀 Lancement de l'Application

Vous devrez lancer le serveur backend et l'application React dans deux terminaux distincts.

1.  **Lancer le serveur Backend** (depuis le dossier racine `easy-dashboard`):
    ```bash
    npm run build # Compilation TypeScript
    npm start     # Lancement du serveur (dist/server.js)
    # OU en développement :
    npm run dev
    ```
    Le serveur sera accessible sur `http://localhost:8000`.

2.  **Lancer l'application React** (depuis le dossier `easy-dashboard/frontend`):
    ```bash
    npm install
    npm run dev
    ```
    L'application sera accessible sur `http://localhost:3000`.

---

### 🧪 Tests

```bash
# Backend tests
npm test

# Frontend tests
cd frontend
npm test
```

---

### 📁 Structure du Projet

```
easy-dashboard/
├── controllers/          # Contrôleurs Express
├── middleware/           # Middlewares (auth, rbac, validation, logging)
├── models/              # Modèles Mongoose
├── routes/              # Routes API
├── services/            # Couche de services (logique métier)
├── src/                 # Architecture propre (Lead module)
│   ├── application/     # Services applicatifs
│   ├── domain/          # Entités et validation
│   ├── infrastructure/  # Repositories
│   └── interfaces/      # Contrôleurs
├── utils/               # Utilitaires (redis, errors, regex)
├── tests/               # Tests d'intégration
├── frontend/            # Application React
│   ├── src/
│   │   ├── components/  # Composants réutilisables
│   │   ├── pages/       # Pages de l'application
│   │   ├── redux/       # State management
│   │   └── request/     # Configuration Axios
└── docs/                # Documentation
```

---

### 📚 Documentation

La documentation complète est disponible dans le dossier `docs/` :
- [Variables d'environnement](docs/environment-variables.md)
- [Architecture en couches](docs/adr/001-layered-architecture.md)
- [Matrice RBAC](docs/adr/002-rbac-permission-matrix.md)
- [Authentification](docs/authentication/overview.md)
- [Déploiement](docs/deployment/health-checks.md)

---

### 🐳 Docker

Un `Dockerfile` et `docker-compose.yml` sont fournis pour le déploiement containerisé :

```bash
# Build et démarrage
docker-compose up --build
```

---

### 📝 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.


