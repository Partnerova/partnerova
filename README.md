# Agence — Marques & Influenceurs

Plateforme de mise en relation : les marques et influenceurs créent un compte,
sont vérifiés manuellement, les marques publient des campagnes, les influenceurs
candidatent, et l'admin sélectionne les profils à transmettre aux marques.

## 1. Créer le projet Supabase (base de données + comptes)

1. Va sur https://supabase.com → crée un compte gratuit → "New project"
2. Une fois le projet créé, va dans **SQL Editor** (menu de gauche)
3. Copie-colle tout le contenu du fichier `supabase/schema.sql` et clique sur **Run**
4. Va dans **Project Settings → API** : note l'**URL** du projet et la clé **anon public**

## 2. Créer ton compte admin

1. Dans Supabase, va dans **Authentication → Users → Add user** (par email + mot de passe)
2. Note l'UUID de cet utilisateur (colonne "UID")
3. Retourne dans **SQL Editor** et exécute :
   ```sql
   insert into profiles (id, role) values ('COLLE-L-UUID-ICI', 'admin');
   ```
4. Tu pourras te connecter sur `/admin/connexion` avec cet email/mot de passe

## 3. Configurer le projet en local (optionnel, pour tester avant de publier)

1. Installe [Node.js](https://nodejs.org) si ce n'est pas déjà fait
2. Dans le dossier du projet :
   ```
   npm install
   cp .env.example .env.local
   ```
3. Remplis `.env.local` avec l'URL et la clé anon notées à l'étape 1
4. Lance `npm run dev` puis ouvre http://localhost:3000

## 4. Mettre le site en ligne (production) avec Vercel

1. Crée un compte gratuit sur https://vercel.com
2. Mets ce projet sur GitHub (crée un nouveau repo et pousse le code), ou utilise
   l'option "upload" de Vercel si tu ne connais pas Git
3. Sur Vercel : **Add New → Project** → importe le repo
4. Dans les paramètres du projet, section **Environment Variables**, ajoute :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (les mêmes valeurs que dans `.env.local`)
5. Clique sur **Deploy**. Ton site sera en ligne sur une adresse `*.vercel.app`
   (tu pourras ensuite y attacher un nom de domaine personnalisé dans les réglages)

## Fonctionnement du site

- `/` — page d'accueil
- `/inscription/marque` et `/inscription/influenceur` — création de compte
- `/connexion` — connexion marque/influenceur
- `/dashboard/marque` — publier des campagnes, voir les profils sélectionnés
- `/dashboard/influenceur` — voir les campagnes ouvertes, candidater
- `/admin/connexion` puis `/admin/dashboard` — ton espace pour vérifier les comptes
  et sélectionner les candidatures à transmettre aux marques

Tant qu'un compte marque ou influenceur n'est pas vérifié par toi dans l'espace admin,
il ne peut pas publier de campagne ni candidater.
