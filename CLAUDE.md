@AGENTS.md

# CLAUDE.md - Instructions pour les Assistants IA

Ce document fournit les instructions complètes pour utiliser Claude ou tout autre assistant IA afin de continuer le développement du projet cme (Scraper Immobilier Sénégal).

---

## 📋 Vue d'ensemble du projet

**cme** est une plateforme complète de gestion immobilière et cadastrale au Sénégal avec :

- **794,009 parcelles cadastrales** avec données géospatiales (PostGIS)
- **138,457 sociétés** de promotion immobilière et SCI
- **Carte interactive Leaflet** avec clustering de marqueurs
- **Système d'import fiscal** pour les données cadastrales
- **Gestion d'utilisateurs** avec NextAuth v5
- **Architecture moderne** : Next.js 15+, PostgreSQL, PostGIS, TypeScript

### Stack Technique

| Composant | Technologie |
|-----------|-------------|
| **Framework** | Next.js 15.2.4 (App Router) |
| **Language** | TypeScript 5 |
| **Base de données** | PostgreSQL 14+ avec PostGIS |
| **ORM** | Drizzle ORM |
| **Auth** | NextAuth v5 (Google OAuth + Credentials) |
| **Frontend** | React 19, Tailwind CSS 4, shadcn/ui |
| **Carte** | Leaflet + React-Leaflet |
| **Validation** | Zod |
| **Conteneurisation** | Docker + Docker Compose |
| **Package Manager** | npm |

---

## 🏗️ Architecture du Projet

### Structure des Répertoires

```
cme-nextjs/
├── src/
│   ├── app/                          # App Router Next.js
│   │   ├── api/                      # Routes API REST
│   │   │   ├── parcelles/            # API parcelles cadastrales
│   │   │   ├── companies/            # API sociétés
│   │   │   ├── import/               # API import fiscal
│   │   │   └── auth/                 # Routes NextAuth
│   │   ├── (dashboard)/              # Routes protégées
│   │   │   ├── page.tsx              # Tableau de bord
│   │   │   ├── map/                  # Carte interactive
│   │   │   ├── companies/            # Gestion sociétés
│   │   │   ├── import/               # Import fiscal
│   │   │   └── analytics/            # Statistiques
│   │   ├── layout.tsx                # Layout racine
│   │   └── page.tsx                  # Page d'accueil
│   ├── components/
│   │   ├── ui/                       # Composants shadcn/ui
│   │   ├── Map.tsx                   # Composant carte Leaflet
│   │   ├── Navbar.tsx                # Barre de navigation
│   │   └── ...                       # Autres composants
│   ├── lib/
│   │   ├── auth.ts                   # Configuration NextAuth
│   │   ├── db.ts                     # Helpers de requêtes DB
│   │   └── utils.ts                  # Utilitaires
│   └── db/
│       └── schema.ts                 # Schéma Drizzle ORM
├── drizzle/
│   ├── migrations/                   # Fichiers de migration
│   └── schema.ts                     # Définition du schéma
├── scripts/
│   ├── init-db.sql                   # Initialisation PostgreSQL
│   ├── seed-data.ts                  # Remplissage de données
│   └── import-sci.ts                 # Import SCI
├── docker-compose.yml                # Configuration Docker
├── Makefile                          # Commandes raccourcies
├── DOCKER_SETUP.md                   # Guide Docker
├── CAHIER_DES_CHARGES.md             # Spécifications
└── CLAUDE.md                         # Ce fichier
```

---

## 🗄️ Schéma de Base de Données

### Table: `users`
Gestion des utilisateurs avec NextAuth.

```typescript
{
  id: number (PK)
  email: string (unique)
  name: string
  image: string
  role: 'admin' | 'user'
  createdAt: Date
  updatedAt: Date
}
```

### Table: `parcelles_cadastrales`
Parcelles cadastrales avec données géospatiales.

```typescript
{
  id: number (PK)
  nicad: string (unique) // Identifiant cadastral unique
  numeroParcelle: string
  departement: string
  section: string
  superficie: number
  geometrie: geometry (PostGIS)
  
  // Données fiscales
  statutFiscal: 'bâti' | 'non-bâti' | 'eau' | 'inconnu'
  montantCFU: number
  montantCFPB: number
  taxeFonciere: number
  dateEcheance: Date
  observations: string
  
  createdAt: Date
  updatedAt: Date
}
```

### Table: `companies`
Sociétés de promotion immobilière et SCI.

```typescript
{
  id: number (PK)
  name: string
  registrationNumber: string (unique)
  type: 'SCI' | 'SARL' | 'SA' | 'EIRL' | 'autre'
  sector: string
  address: string
  city: string
  department: string
  phone: string
  email: string
  website: string
  
  // Données financières
  capitalSocial: number
  dateCreation: Date
  dateModification: Date
  
  createdAt: Date
  updatedAt: Date
}
```

### Table: `transactions`
Historique des transactions et modifications.

```typescript
{
  id: number (PK)
  userId: number (FK)
  type: 'create' | 'update' | 'delete' | 'import'
  entityType: 'parcelle' | 'company' | 'user'
  entityId: number
  changes: JSON
  createdAt: Date
}
```

### Table: `audit_log`
Journalisation complète des actions.

```typescript
{
  id: number (PK)
  userId: number (FK)
  action: string
  resource: string
  details: JSON
  ipAddress: string
  createdAt: Date
}
```

---

## 🔌 API REST - 26 Endpoints

### Parcelles Cadastrales

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/parcelles` | Lister les parcelles (pagination) |
| GET | `/api/parcelles/:id` | Détails d'une parcelle |
| GET | `/api/parcelles/search` | Rechercher par NICAD |
| GET | `/api/parcelles/bounds` | Parcelles dans une zone |
| POST | `/api/parcelles` | Créer une parcelle |
| PUT | `/api/parcelles/:id` | Modifier une parcelle |
| DELETE | `/api/parcelles/:id` | Supprimer une parcelle |
| GET | `/api/parcelles/stats` | Statistiques cadastrales |

### Sociétés

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/companies` | Lister les sociétés |
| GET | `/api/companies/:id` | Détails d'une société |
| GET | `/api/companies/search` | Rechercher par nom |
| POST | `/api/companies` | Créer une société |
| PUT | `/api/companies/:id` | Modifier une société |
| DELETE | `/api/companies/:id` | Supprimer une société |
| GET | `/api/companies/stats` | Statistiques sociétés |

### Import Fiscal

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/import/upload` | Upload fichier CSV |
| POST | `/api/import/preview` | Prévisualiser l'import |
| POST | `/api/import/execute` | Exécuter l'import |
| GET | `/api/import/status` | Statut de l'import |
| GET | `/api/import/history` | Historique des imports |

### Authentification

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/auth/session` | Session courante |
| POST | `/api/auth/signin` | Connexion |
| POST | `/api/auth/signout` | Déconnexion |
| GET | `/api/auth/providers` | Fournisseurs disponibles |

### Audit

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/audit/logs` | Journaux d'audit |
| GET | `/api/audit/user/:userId` | Logs d'un utilisateur |

---

## 🚀 Démarrage Rapide

### 1. Installation des Dépendances

```bash
npm install
```

### 2. Configuration Docker

```bash
# Démarrer les services
docker-compose up -d

# Initialiser la base de données
docker-compose exec postgres psql -U postgres -d cme_db < scripts/init-db.sql

# Ou utiliser le Makefile
make setup
```

### 3. Variables d'Environnement

Créer un fichier `.env.local` :

```env
# Base de données
DATABASE_URL=postgresql://postgres:postgres@localhost:5435/cme_db

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# OAuth Google (optionnel)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Application
NEXT_PUBLIC_APP_NAME=cme
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Lancer l'Application

```bash
npm run dev
# L'app sera disponible à http://localhost:3000
```

### 5. Accéder à la Base de Données

```bash
# pgAdmin: http://localhost:5050
# Adminer: http://localhost:8080
# MinIO: http://localhost:9001
```

---

## 📝 Conventions de Code

### Noms de Fichiers

- **Composants React** : PascalCase (`UserCard.tsx`)
- **Pages** : PascalCase (`Dashboard.tsx`)
- **Utilitaires** : camelCase (`formatDate.ts`)
- **Types** : PascalCase (`User.ts`)
- **Constantes** : UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

### Imports

```typescript
// 1. Imports externes
import React from 'react';
import { useRouter } from 'next/navigation';

// 2. Imports internes (absolus avec @)
import { Button } from '@/components/ui/button';
import { getUser } from '@/lib/db';
import type { User } from '@/types';

// 3. Imports relatifs (si nécessaire)
import { helper } from '../utils';
```

### Composants React

```typescript
// ✅ BON - Composant fonctionnel avec types
interface UserCardProps {
  userId: number;
  onSelect?: (id: number) => void;
}

export function UserCard({ userId, onSelect }: UserCardProps) {
  return (
    <div onClick={() => onSelect?.(userId)}>
      {/* Contenu */}
    </div>
  );
}

// ❌ MAUVAIS - Sans types
export default function UserCard({ userId, onSelect }) {
  // ...
}
```

### Requêtes API

```typescript
// ✅ BON - Avec validation Zod
import { z } from 'zod';

const ParcelleSchema = z.object({
  nicad: z.string().min(1),
  numeroParcelle: z.string(),
  departement: z.string(),
});

export async function GET(request: Request) {
  try {
    const data = await request.json();
    const validated = ParcelleSchema.parse(data);
    // Traiter les données
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Invalid data' }, { status: 400 });
  }
}

// ❌ MAUVAIS - Sans validation
export async function GET(request: Request) {
  const data = await request.json();
  // Utiliser directement sans validation
}
```

### Gestion des Erreurs

```typescript
// ✅ BON - Gestion explicite
try {
  const result = await db.query(...);
  return Response.json(result);
} catch (error) {
  console.error('Database error:', error);
  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// ❌ MAUVAIS - Sans gestion
const result = await db.query(...);
return Response.json(result);
```

---

## 🔐 Authentification avec NextAuth

### Configuration

Le fichier `/src/lib/auth.ts` contient la configuration NextAuth :

```typescript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      // Configuration pour connexion par email/mot de passe
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
});
```

### Utilisation dans les Routes Protégées

```typescript
// ✅ Vérifier l'authentification
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await auth();
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Continuer avec l'utilisateur authentifié
  const userId = session.user.id;
}
```

### Utilisation dans les Composants

```typescript
// ✅ Utiliser useSession côté client
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export function UserMenu() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <div>Chargement...</div>;
  
  if (!session) {
    return <button onClick={() => signIn()}>Se connecter</button>;
  }
  
  return (
    <div>
      <p>Bienvenue, {session.user.name}</p>
      <button onClick={() => signOut()}>Se déconnecter</button>
    </div>
  );
}
```

---

## 🗺️ Carte Interactive Leaflet

### Composant Principal

Le composant `/src/components/Map.tsx` gère l'affichage de la carte :

```typescript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

export function MapComponent() {
  return (
    <MapContainer center={[14.7167, -17.4673]} zoom={10} style={{ height: '100vh' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {/* Marqueurs et popups */}
    </MapContainer>
  );
}
```

### Clustering de Marqueurs

Pour afficher 794,009 parcelles efficacement :

```typescript
import MarkerClusterGroup from 'react-leaflet-cluster';

export function ParcellesMap() {
  return (
    <MapContainer center={[14.7167, -17.4673]} zoom={10}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MarkerClusterGroup>
        {parcelles.map(parcelle => (
          <Marker key={parcelle.id} position={[parcelle.lat, parcelle.lng]}>
            <Popup>{parcelle.nicad}</Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
```

### Recherche par NICAD

```typescript
async function searchByNicad(nicad: string) {
  const response = await fetch(`/api/parcelles/search?nicad=${nicad}`);
  const parcelle = await response.json();
  
  if (parcelle) {
    map.setView([parcelle.lat, parcelle.lng], 15);
    // Afficher le marqueur
  }
}
```

---

## 📊 Import Fiscal

### Format du Fichier CSV

Le système d'import accepte les fichiers CSV avec les colonnes suivantes :

```csv
nicad,numeroParcelle,departement,section,statutFiscal,montantCFU,montantCFPB,taxeFonciere,dateEcheance,observations
DAKAR-001-0001-1,0001,Dakar,001,bâti,50000,25000,75000,2024-12-31,Propriété résidentielle
DAKAR-001-0002-2,0002,Dakar,001,non-bâti,0,0,0,2024-12-31,Terrain vacant
```

### Endpoint d'Import

```typescript
// POST /api/import/execute
{
  "file": "base64-encoded-csv",
  "departement": "Dakar",
  "dryRun": false
}
```

### Réponse

```json
{
  "success": true,
  "imported": 1000,
  "failed": 5,
  "errors": [
    { "row": 10, "error": "Invalid NICAD format" }
  ]
}
```

---

## 🧪 Tests

### Structure des Tests

```
tests/
├── unit/
│   ├── lib/
│   └── utils/
├── integration/
│   ├── api/
│   └── db/
└── e2e/
    ├── auth.spec.ts
    └── map.spec.ts
```

### Exemple de Test

```typescript
import { describe, it, expect } from 'vitest';
import { formatNicad } from '@/lib/utils';

describe('formatNicad', () => {
  it('should format NICAD correctly', () => {
    const result = formatNicad('DAKAR-001-0001-1');
    expect(result).toBe('DAKAR-001-0001-1');
  });

  it('should handle invalid NICAD', () => {
    expect(() => formatNicad('invalid')).toThrow();
  });
});
```

### Exécuter les Tests

```bash
npm run test              # Tous les tests
npm run test:watch       # Mode watch
npm run test:coverage    # Couverture
```

---

## 🐛 Debugging

### Logs

```typescript
// ✅ BON - Logs structurés
console.log('[API] Parcelles fetched:', { count: parcelles.length, time: Date.now() });

// ❌ MAUVAIS - Logs génériques
console.log('ok');
```

### Debugging avec VS Code

Ajouter à `.vscode/launch.json` :

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Inspection PostgreSQL

```bash
# Accéder à psql
docker-compose exec postgres psql -U postgres -d cme_db

# Requêtes utiles
SELECT COUNT(*) FROM parcelles_cadastrales;
SELECT COUNT(*) FROM companies;
SELECT * FROM parcelles_cadastrales WHERE nicad = 'DAKAR-001-0001-1';
```

---

## 📈 Performance

### Optimisations Clés

1. **Pagination** : Toujours paginer les listes (50/100/200 items)
2. **Indexation** : Les colonnes `nicad`, `registrationNumber` sont indexées
3. **Clustering Leaflet** : Utiliser le clustering pour 794,009 marqueurs
4. **Cache** : Utiliser Redis pour les requêtes fréquentes
5. **Compression** : Gzip activé dans Nginx

### Requête Optimisée

```typescript
// ✅ BON - Avec pagination et index
const parcelles = await db
  .select()
  .from(parcelles_cadastrales)
  .where(eq(parcelles_cadastrales.departement, 'Dakar'))
  .limit(50)
  .offset(0);

// ❌ MAUVAIS - Sans pagination
const parcelles = await db
  .select()
  .from(parcelles_cadastrales);
```

---

## 🚢 Déploiement

### Variables d'Environnement en Production

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5435/cme_db
NEXTAUTH_SECRET=very-long-random-string
NEXTAUTH_URL=https://cme.senegal.sn
```

### Build et Déploiement

```bash
# Build
npm run build

# Tester la build
npm run start

# Avec Docker
docker build -t cme:latest .
docker run -p 3000:3000 cme:latest
```

---

## 📚 Ressources Utiles

### Documentation Officielle

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [NextAuth.js](https://next-auth.js.org)
- [Leaflet](https://leafletjs.com)
- [PostGIS](https://postgis.net)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

### Fichiers de Référence

- `CAHIER_DES_CHARGES.md` - Spécifications complètes
- `DOCKER_SETUP.md` - Guide Docker détaillé
- `src/db/schema.ts` - Schéma de base de données
- `src/lib/auth.ts` - Configuration NextAuth

---

## ✅ Checklist pour les Nouvelles Fonctionnalités

Avant de commencer une nouvelle fonctionnalité, vérifier :

- [ ] Schéma de base de données mis à jour dans `src/db/schema.ts`
- [ ] Migration Drizzle générée (`npm run db:generate`)
- [ ] Endpoint API créé dans `src/app/api/`
- [ ] Validation Zod ajoutée
- [ ] Tests unitaires écrits
- [ ] Composant React créé (si UI)
- [ ] Documentation mise à jour
- [ ] Tests d'intégration validés

---

## 🤝 Contribution

### Workflow de Développement

1. **Créer une branche** : `git checkout -b feature/ma-feature`
2. **Développer** : Suivre les conventions de code
3. **Tester** : `npm run test`
4. **Commiter** : Messages clairs et descriptifs
5. **Pull Request** : Description détaillée
6. **Review** : Attendre l'approbation
7. **Merge** : Fusionner dans `main`

### Messages de Commit

```
feat: ajouter la recherche par NICAD
fix: corriger le clustering Leaflet
docs: mettre à jour CLAUDE.md
test: ajouter tests pour l'import fiscal
chore: mettre à jour les dépendances
```

---

## 📞 Support

Pour toute question ou problème :

1. Vérifier la documentation (ce fichier)
2. Consulter `CAHIER_DES_CHARGES.md`
3. Vérifier `DOCKER_SETUP.md` pour les problèmes Docker
4. Consulter les logs : `npm run dev` ou `docker-compose logs`
5. Vérifier la base de données : pgAdmin ou Adminer

---

**Dernière mise à jour** : Mai 2026  
**Version** : 1.0.0  
**Auteur** : Équipe cme
