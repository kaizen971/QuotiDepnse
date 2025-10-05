# QuotiDepnse

Une application React Native Expo qui permet d'enregistrer rapidement ses dépenses au jour le jour, de les catégoriser (nourriture, transport, loisirs, etc.) et de visualiser ses habitudes de consommation via des graphiques simples.

## Structure du projet

```
QuotiDepnse/
├── frontend/          # Application Expo React Native
│   ├── App.js
│   ├── src/
│   │   ├── screens/
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   ├── HomeScreen.js
│   │   │   ├── AddExpenseScreen.js
│   │   │   └── StatsScreen.js
│   │   └── services/
│   │       └── api.js
│   └── package.json
├── backend/           # Serveur Node.js Express
│   ├── server.js
│   ├── package.json
│   └── .env
└── README.md
```

## Configuration

### Backend
- **Port**: 3002
- **MongoDB**: mongodb://kaizen971:secret@192.168.1.72:27017/
- **Collection**: QuotiDepnse
- **URL publique**: https://mabouya.servegame.com/QuotiDepnse

### Frontend
- **API URL**: https://mabouya.servegame.com/QuotiDepnse/QuotiDepnse
- **Framework**: React Native Expo

## Installation

Les dépendances ont été installées lors de la création du projet.

## Lancement

Pour démarrer le serveur backend:

```bash
cd /home/cheetoh/pi-agent/repo/QuotiDepnse/backend && npm start
```

Pour démarrer l'application frontend:

```bash
cd /home/cheetoh/pi-agent/repo/QuotiDepnse/frontend && npm start
```

## Fonctionnalités

- **Authentification**: Inscription et connexion avec système de tokens JWT
- **Gestion des dépenses**: Ajout, visualisation et suppression de dépenses
- **Catégorisation**: Classement par catégories (Nourriture, Transport, Loisirs, Santé, Logement, Autre)
- **Statistiques**: Visualisation des dépenses par catégorie avec graphiques
- **Dashboard**: Vue d'ensemble du total des dépenses

## Routes API

- `POST /QuotiDepnse/register` - Inscription
- `POST /QuotiDepnse/login` - Connexion
- `GET /QuotiDepnse/expenses` - Liste des dépenses (protégé)
- `POST /QuotiDepnse/expenses` - Créer une dépense (protégé)
- `DELETE /QuotiDepnse/expenses/:id` - Supprimer une dépense (protégé)
- `GET /QuotiDepnse/expenses/stats` - Statistiques (protégé)
- `GET /QuotiDepnse/health` - Test de santé de l'API

## Configuration Caddy

Le fichier Caddyfile a été mis à jour avec:

```caddy
handle_path /QuotiDepnse* {
  reverse_proxy 192.168.1.72:3002
}
```
