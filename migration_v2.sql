-- ============================================================
-- MIGRATION V2 — à exécuter dans Supabase > SQL Editor
-- (après le schema.sql initial déjà en place)
-- ============================================================

-- ------------------------------------------------------------
-- 1. Email de contact + informations légales (entreprise)
-- ------------------------------------------------------------
alter table marques add column if not exists email_contact text;
alter table marques add column if not exists siret text;

alter table influenceurs add column if not exists email_contact text;
alter table influenceurs add column if not exists raison_sociale text;
alter table influenceurs add column if not exists siret text;

-- ------------------------------------------------------------
-- 2. Workflow campagnes : validation admin avant publication
--    en_attente -> ouverte (validée) ou refusee | fermee (cloturée par la marque)
-- ------------------------------------------------------------
alter table campagnes alter column statut set default 'en_attente';
alter table campagnes drop constraint if exists campagnes_statut_check;
alter table campagnes add constraint campagnes_statut_check
  check (statut in ('en_attente', 'ouverte', 'refusee', 'fermee'));

-- Les campagnes existantes déjà "ouverte" restent visibles telles quelles.

-- ------------------------------------------------------------
-- 3. Workflow candidatures : décision finale par la marque
--    en_attente (admin filtre) -> selectionne (transmis à la marque)
--    -> acceptee | refuse (décision marque, ou refuse direct par admin)
-- ------------------------------------------------------------
alter table candidatures drop constraint if exists candidatures_statut_check;
alter table candidatures add constraint candidatures_statut_check
  check (statut in ('en_attente', 'selectionne', 'acceptee', 'refuse'));

-- ------------------------------------------------------------
-- 4. RLS : la marque voit les profils transmis ET acceptés
-- ------------------------------------------------------------
drop policy if exists "Marques lisent les influenceurs sélectionnés sur leurs campagnes" on influenceurs;
create policy "Marques lisent les influenceurs transmis sur leurs campagnes" on influenceurs
  for select using (
    exists (
      select 1 from candidatures c
      join campagnes camp on camp.id = c.campagne_id
      where c.influenceur_id = influenceurs.id
      and c.statut in ('selectionne', 'acceptee')
      and camp.marque_id = auth.uid()
    )
  );

drop policy if exists "Une marque voit les candidatures sélectionnées sur ses campagnes" on candidatures;
create policy "Une marque voit les candidatures transmises sur ses campagnes" on candidatures
  for select using (
    statut in ('selectionne', 'acceptee')
    and exists (select 1 from campagnes where campagnes.id = candidatures.campagne_id and campagnes.marque_id = auth.uid())
  );

-- La marque peut accepter/refuser une candidature transmise sur sa propre campagne
drop policy if exists "Une marque décide des candidatures transmises sur ses campagnes" on candidatures;
create policy "Une marque décide des candidatures transmises sur ses campagnes" on candidatures
  for update using (
    exists (select 1 from campagnes where campagnes.id = candidatures.campagne_id and campagnes.marque_id = auth.uid())
  )
  with check (
    exists (select 1 from campagnes where campagnes.id = candidatures.campagne_id and campagnes.marque_id = auth.uid())
  );

-- ------------------------------------------------------------
-- 5. Suppression de comptes par l'admin
--    (supprimer la ligne "profiles" supprime en cascade marques/influenceurs/campagnes/candidatures)
-- ------------------------------------------------------------
drop policy if exists "Admin supprime les profils" on profiles;
create policy "Admin supprime les profils" on profiles
  for delete using (current_role_is('admin'));
