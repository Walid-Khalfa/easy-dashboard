# Easy-Dashboard : Starter Kit CRM avec MERN & Ant Design

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![Easy-Dashboard Screenshot](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/opp4yj177dizyaosah0o.png)

**Easy-Dashboard** est un kit de démarrage complet pour construire des applications de type CRM ou panneau d'administration. Basé sur le stack **MERN** (MongoDB, Express.js, React, Node.js) et utilisant la bibliothèque de composants **Ant Design**, ce projet fournit une base solide avec les fonctionnalités essentielles déjà implémentées.

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

* **🔐 Authentification Sécurisée :** Flux de connexion/déconnexion complet basé sur les JSON Web Tokens (JWT).
* **👤 Gestion des Utilisateurs :** CRUD complet pour la gestion des administrateurs et des utilisateurs.
* **⚙️ Modules CRUD Génériques :** Composants React et routes d'API réutilisables pour créer, lire, mettre à jour et supprimer n'importe quel type de données, accélérant ainsi le développement de nouvelles fonctionnalités.
* **🎨 Interface Élégante avec Ant Design :** Un tableau de bord à l'interface utilisateur soignée et réactive, construite avec React et la bibliothèque de composants [Ant Design (Antd)](https://ant.design/).
* **🌐 Gestion d'État Centralisée :** Logique d'état globale gérée avec Redux et Redux-Thunk pour une application prévisible et maintenable.
* **🔒 Routes Protégées :** Mise en place de routes privées et publiques pour s'assurer que seuls les utilisateurs authentifiés peuvent accéder aux pages sensibles.

---

### 🛠️ Stack Technique

| Domaine | Technologies |
| :--- | :--- |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, JWT |
| **Frontend** | React.js, Redux, Redux-Thunk, Ant Design (Antd) |
| **Base de Données** | MongoDB (via MongoDB Atlas) |

---

### 🏁 Démarrage Rapide

Suivez ces étapes pour lancer le projet sur votre machine locale.

#### **Prérequis**

* [Node.js](https://nodejs.org/) (version 14.x ou supérieure)
* `npm` ou `yarn`
* Un compte [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) pour obtenir une URL de connexion à la base de données.

#### **Installation**

1.  **Clonez le dépôt :**
    ```bash
    git clone [https://github.com/Walid-Khalfa/easy-dashboard.git](https://github.com/Walid-Khalfa/easy-dashboard.git)
    cd easy-dashboard
    ```

2.  **Configurez le Backend :**
    ```bash
    # Créez votre fichier d'environnement à partir du modèle
    cp .variables.env.tmp .variables.env
    ```
    Ouvrez le fichier `.variables.env` et collez votre URL de connexion MongoDB :
    ```env
    DATABASE=VOTRE_URL_MONGODB_ATLAS
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
    npm start
    ```
    Le serveur sera accessible sur `http://localhost:8000` (ou le port défini).

2.  **Lancer l'application React** (depuis le dossier `easy-dashboard/frontend`):
    ```bash
    npm start
    ```
    L'application sera accessible sur `http://localhost:3000`.

---


