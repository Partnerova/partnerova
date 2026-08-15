-- ============================================================
-- SCHÉMA : Agence de collaboration Marques / Influenceurs
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

-- Extension nécessaire pour les UUID
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- PROFILS (lié à l'authentification Supabase)
-- ------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('marque', 'influenceur', 'admin')),
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- MARQUES
-- ------------------------------------------------------------
create table marques (
  id uuid primary key references profiles(id) on delete cascade,
  nom_entreprise text not null,
  secteur text,
  contact_nom text,
  telephone text,
  site_web text,
  statut text not null default 'en_attente' check (statut in ('en_attente', 'verifie', 'refuse')),
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- INFLUENCEURS
-- ------------------------------------------------------------
create table influenceurs (
  id uuid primary key references profiles(id) on delete cascade,
  nom text not null,
  plateforme_principale text,
  lien_profil text,
  nb_abonnes integer,
  niche text,
  telephone text,
  statut text not null default 'en_attente' check (statut in ('en_attente', 'verifie', 'refuse')),
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- CAMPAGNES (créées par les marques)
-- ------------------------------------------------------------
create table campagnes (
  id uuid primary key default uuid_generate_v4(),
  marque_id uuid not null references marques(id) on delete cascade,
  titre text not null,
  brief text not null,
  budget text,
  criteres text,
  statut text not null default 'ouverte' check (statut in ('ouverte', 'fermee')),
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- CANDIDATURES (un influenceur postule à une campagne)
-- statut 'selectionne' = validé par l'admin et visible par la marque
-- statut 'en_attente'  = candidature reçue, en cours d'examen par l'admin (invisible pour la marque)
-- statut 'refuse'      = écarté par l'admin (invisible pour la marque)
-- ------------------------------------------------------------
create table candidatures (
  id uuid primary key default uuid_generate_v4(),
  campagne_id uuid not null references campagnes(id) on delete cascade,
  influenceur_id uuid not null references influenceurs(id) on delete cascade,
  statut text not null default 'en_attente' check (statut in ('en_attente', 'selectionne', 'refuse')),
  note_admin text,
  created_at timestamptz default now(),
  unique (campagne_id, influenceur_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table marques enable row level security;
alter table influenceurs enable row level security;
alter table campagnes enable row level security;
alter table candidatures enable row level security;

-- Fonction utilitaire : rôle de l'utilisateur connecté
create or replace function current_role_is(r text) returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = r
  );
$$ language sql security definer;

-- PROFILES
create policy "Un utilisateur voit son propre profil" on profiles
  for select using (id = auth.uid() or current_role_is('admin'));
create policy "Un utilisateur crée son propre profil" on profiles
  for insert with check (id = auth.uid());

-- MARQUES
create policy "Une marque voit/modifie son propre profil" on marques
  for all using (id = auth.uid() or current_role_is('admin'));
create policy "Une marque crée son propre profil" on marques
  for insert with check (id = auth.uid());

-- INFLUENCEURS
create policy "Un influenceur voit/modifie son propre profil" on influenceurs
  for all using (id = auth.uid() or current_role_is('admin'));
create policy "Un influenceur crée son propre profil" on influenceurs
  for insert with check (id = auth.uid());
-- Les marques ont besoin de lire les profils des influenceurs sélectionnés
create policy "Marques lisent les influenceurs sélectionnés sur leurs campagnes" on influenceurs
  for select using (
    exists (
      select 1 from candidatures c
      join campagnes camp on camp.id = c.campagne_id
      where c.influenceur_id = influenceurs.id
      and c.statut = 'selectionne'
      and camp.marque_id = auth.uid()
    )
  );

-- CAMPAGNES
create policy "Une marque gère ses propres campagnes" on campagnes
  for all using (marque_id = auth.uid() or current_role_is('admin'));
create policy "Les influenceurs vérifiés voient les campagnes ouvertes" on campagnes
  for select using (
    statut = 'ouverte' and current_role_is('influenceur')
  );

-- CANDIDATURES
create policy "Un influenceur gère ses propres candidatures" on candidatures
  for all using (influenceur_id = auth.uid());
create policy "Admin gère toutes les candidatures" on candidatures
  for all using (current_role_is('admin'));
create policy "Une marque voit les candidatures sélectionnées sur ses campagnes" on candidatures
  for select using (
    statut = 'selectionne'
    and exists (select 1 from campagnes where campagnes.id = candidatures.campagne_id and campagnes.marque_id = auth.uid())
  );
