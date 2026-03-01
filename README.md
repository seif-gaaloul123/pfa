# Medical CRM - Système de Gestion de Rendez-vous Médicaux

Une application complète de gestion de cabinet médical avec système de réservation de rendez-vous, gestion des patients et des médecins.

## 🚀 Fonctionnalités

### ✨ Gestion des Patients
- Création, modification et suppression de patients
- Informations complètes (nom, prénom, date de naissance, téléphone, email, notes)
- Liste complète des patients avec recherche

### 📅 Système de Rendez-vous
- Réservation de rendez-vous par patient
- Sélection de médecin et créneau horaire
- **Prévention des doubles réservations** - impossible de réserver un créneau déjà pris
- Affichage des créneaux disponibles uniquement
- Gestion complète (création, modification, suppression)

### 👨‍⚕️ Gestion des Médecins
- 24 médecins répartis sur 6 spécialités :
  - Cardiologie (4 médecins)
  - Neurologie (3 médecins)
  - Pédiatrie (4 médecins)
  - Orthopédie (3 médecins)
  - Dermatologie (3 médecins)
  - Médecine Générale (4 médecins)
- Dashboard affichant tous les services et leurs médecins

### 🔐 Authentification & Sécurité
- Système de connexion sécurisé avec JWT
- Rôles utilisateurs (admin, médecin, assistant)
- Routes protégées
- Middleware d'authentification

### 💾 Base de Données Persistante
- Stockage JSON automatique
- Sauvegarde automatique à chaque modification
- Récupération des données au redémarrage du serveur

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** avec Express
- **JWT** pour l'authentification
- **bcryptjs** pour le hashing des mots de passe
- **CORS** pour la gestion des origines
- **Multer** pour l'upload de fichiers
- Base de données JSON persistante

### Frontend
- **React 18** avec Hooks
- **React Router DOM** pour la navigation
- **Axios** pour les requêtes API
- **Vite** comme bundler
- CSS moderne et responsive

## 📦 Installation

### Prérequis
- Node.js (v16 ou supérieur)
- npm ou yarn

### Installation du Backend

```bash
cd backend
npm install
```

### Installation du Frontend

```bash
cd frontend
npm install
```

## 🚀 Démarrage

### Démarrer le Backend

```bash
cd backend
npm run dev
```

Le serveur backend démarre sur **http://localhost:4000**

### Démarrer le Frontend

```bash
cd frontend
npm run dev
```

L'application frontend démarre sur **http://localhost:5173**

## 🔑 Identifiants par Défaut

### Administrateur
- **Email:** admin@example.com
- **Mot de passe:** admin123

### Médecins
- **Email:** dr.smith@hospital.com (ou tout autre médecin)
- **Mot de passe:** doctor123

## 📁 Structure du Projet

```
pfa/
├── backend/
│   ├── src/
│   │   ├── config.js              # Configuration de l'application
│   │   ├── dataStore.js           # Gestion de la base de données
│   │   ├── server.js              # Point d'entrée du serveur
│   │   ├── middleware/
│   │   │   └── authMiddleware.js  # Middleware d'authentification
│   │   └── routes/
│   │       ├── authRoutes.js      # Routes d'authentification
│   │       ├── patientRoutes.js   # Routes des patients
│   │       ├── appointmentRoutes.js # Routes des rendez-vous
│   │       └── fileRoutes.js      # Routes d'upload de fichiers
│   ├── database.json              # Base de données persistante
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── main.jsx               # Point d'entrée React
    │   ├── App.jsx                # Composant principal
    │   ├── api.js                 # Configuration Axios
    │   ├── AuthContext.jsx        # Contexte d'authentification
    │   ├── styles.css             # Styles globaux
    │   ├── components/
    │   │   └── PrivateRoute.jsx   # Route protégée
    │   └── pages/
    │       ├── LoginPage.jsx      # Page de connexion
    │       ├── DashboardPage.jsx  # Tableau de bord
    │       ├── PatientsPage.jsx   # Gestion des patients
    │       ├── AppointmentsPage.jsx # Gestion des rendez-vous
    │       └── FileUploadPage.jsx # Upload de fichiers
    ├── index.html
    └── package.json
```

## 🎯 Utilisation

1. **Connexion**
   - Utilisez les identifiants admin ou médecin

2. **Dashboard**
   - Vue d'ensemble des services médicaux
   - Liste des médecins par spécialité

3. **Gestion des Patients**
   - Ajouter un nouveau patient
   - Modifier les informations
   - Supprimer un patient

4. **Réservation de Rendez-vous**
   - Sélectionner un patient
   - Choisir un médecin et sa spécialité
   - Sélectionner une date
   - Choisir un créneau horaire disponible
   - Les créneaux déjà réservés sont marqués "(Déjà réservé)"

## 🔒 Sécurité

- Mots de passe hashés avec bcrypt
- Tokens JWT pour l'authentification
- Routes API protégées par middleware
- Validation des données côté backend
- Protection contre les doubles réservations

## 📝 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/users` - Créer un utilisateur (admin uniquement)
- `GET /api/auth/doctors` - Liste des médecins

### Patients
- `GET /api/patients` - Liste des patients
- `POST /api/patients` - Créer un patient
- `GET /api/patients/:id` - Détails d'un patient
- `PUT /api/patients/:id` - Modifier un patient
- `DELETE /api/patients/:id` - Supprimer un patient

### Rendez-vous
- `GET /api/appointments` - Liste des rendez-vous
- `POST /api/appointments` - Créer un rendez-vous
- `PUT /api/appointments/:id` - Modifier un rendez-vous
- `DELETE /api/appointments/:id` - Supprimer un rendez-vous

## 🐛 Dépannage

### Le serveur backend ne démarre pas
- Vérifiez que le port 4000 est disponible
- Vérifiez l'installation des dépendances : `npm install`

### Le frontend ne se connecte pas au backend
- Vérifiez que le backend est démarré
- Vérifiez l'URL dans `frontend/src/api.js`

### Problème d'authentification
- Déconnectez-vous et reconnectez-vous
- Vérifiez que le token n'a pas expiré

### Les données disparaissent
- Vérifiez que le fichier `backend/database.json` existe
- Ne supprimez pas ce fichier

## 🎨 Personnalisation

### Modifier les horaires de travail
Éditez `frontend/src/pages/AppointmentsPage.jsx` ligne 42-43 :
```javascript
for (let hour = 9; hour < 17; hour++) // 9h-17h par défaut
```

### Ajouter des médecins
Éditez `backend/src/dataStore.js` dans la fonction `seedDoctors()`

### Changer le port backend
Créez un fichier `.env` dans `/backend` :
```
PORT=4000
```

## 📄 Licence

Ce projet est sous licence MIT.

## 👥 Auteurs

- Seif Gaaloul

## 🙏 Remerciements

Projet développé pour la gestion moderne des cabinets médicaux.
