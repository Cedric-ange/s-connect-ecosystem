# SFA Backend - Sales Force Automation

## 📋 Overview

Backend complet pour l'application SFA utilisant NestJS, Prisma, PostgreSQL, et JWT Auth.

## 🚀 Installation

1. **Installer les dépendances** (déjà fait) :
```bash
npm install --legacy-peer-deps
```

2. **Configurer PostgreSQL** :
   - Installer PostgreSQL sur votre machine
   - Créer une base de données `sfa_db`
   - Mettre à jour le fichier `.env` avec vos credentials

3. **Générer le client Prisma** :
```bash
npx prisma generate
```

4. **Exécuter les migrations** :
```bash
npx prisma migrate dev --name init
```

## 🔧 Configuration

Modifier le fichier `.env` selon votre environnement :

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sfa_db?schema=public"

# JWT
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRATION="7d"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-in-production"
JWT_REFRESH_EXPIRATION="30d"

# App
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:5173"
```

## 🎯 Modules Implémentés

### ✅ Modules Core (Fonctionnels)
- **AuthModule** : JWT + 2FA + Refresh Tokens
- **UsersModule** : CRUD utilisateurs avec rôles
- **PrismaModule** : Service Prisma global

### 🔄 Modules Métier (À compléter)
- **TerritoriesModule** : Hiérarchie territoriale
- **OutletsModule** : Points de vente
- **ProductsModule** : SKU et hiérarchie produits
- **OrdersModule** : Gestion des commandes
- **VisitsModule** : Gestion des visites
- **VendorStockModule** : Gestion stock vendeur
- **MerchandisingModule** : Merchandising
- **DashboardModule** : Statistiques

## 🏃 Démarrage

```bash
# Développement
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📚 Documentation API

Une fois démarré, accédez à la documentation Swagger :
`http://localhost:3000/api/docs`

## 🛠️ Schéma de Base de Données

Le schéma Prisma complet est défini dans `prisma/schema.prisma` avec :

- **Users** : Utilisateurs avec rôles (REP, ADMIN, SUP)
- **Territories** : Hiérarchie (PAYS, REGION, ZONE, SECTEUR)
- **Outlets** : Points de vente avec validation
- **Products** : Catégories, Marques, PackFormats, PackSize (SKU)
- **Orders** : Commandes avec détails
- **Visits** : Visites avec check-in/check-out
- **VendorStock** : Stock vendeur avec mouvements
- **Merchandising** : Merchandising avec photos

## 🔄 Prochaines Étapes

1. ⚙️ Configurer PostgreSQL
2. 🗄️ Exécuter les migrations Prisma
3. 🔧 Implémenter les modules métier restants
4. 🧪 Tester les endpoints
5. 🔒 Ajouter les guards par rôle
6. 📧 Configurer l'envoi d'emails

## 📞 Support

Pour toute question sur le backend, consultez la documentation Swagger ou les fichiers de service dans `src/`.


