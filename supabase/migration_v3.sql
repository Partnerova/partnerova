-- ============================================================
-- MIGRATION V3 — à exécuter dans Supabase > SQL Editor
-- Restreint la modification des profils marques/influenceurs à l'admin seul.
-- Les utilisateurs gardent le droit de VOIR leur propre profil, mais plus de le MODIFIER.
-- ============================================================

-- MARQUES
drop policy if exists "Une marque voit/modifie son propre profil" on marques;

create policy "Une marque voit son propre profil" on marques
  for select using (id = auth.uid() or current_role_is('admin'));

create policy "Seul l'admin modifie un profil marque" on marques
  for update using (current_role_is('admin'));

create policy "Seul l'admin supprime un profil marque" on marques
  for delete using (current_role_is('admin'));

-- INFLUENCEURS
drop policy if exists "Un influenceur voit/modifie son propre profil" on influenceurs;

create policy "Un influenceur voit son propre profil" on influenceurs
  for select using (id = auth.uid() or current_role_is('admin'));

create policy "Seul l'admin modifie un profil influenceur" on influenceurs
  for update using (current_role_is('admin'));

create policy "Seul l'admin supprime un profil influenceur" on influenceurs
  for delete using (current_role_is('admin'));

-- Les policies d'insertion à l'inscription (id = auth.uid()) restent inchangées,
-- ainsi que celle qui permet aux marques de lire les influenceurs transmis.
