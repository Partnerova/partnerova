'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase-browser';

const LABEL_CAMPAGNE = { en_attente: 'En attente', ouverte: 'Ouverte', refusee: 'Refusée', fermee: 'Fermée' };
const LABEL_CAND = { en_attente: 'En attente', selectionne: 'Transmis à la marque', acceptee: 'Accepté par la marque', refuse: 'Refusé' };

export default function AdminDashboard() {
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const [tab, setTab] = useState('influenceurs');
  const [isAdmin, setIsAdmin] = useState(null);
  const [influenceurs, setInfluenceurs] = useState([]);
  const [marques, setMarques] = useState([]);
  const [campagnes, setCampagnes] = useState([]);
  const [candidatures, setCandidatures] = useState({});

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      checkAdmin(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') router.push('/admin/connexion');
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const checkAdmin = async (session) => {
    if (!session?.user) { router.push('/admin/connexion'); return; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    if (profile?.role !== 'admin') { router.push('/admin/connexion'); return; }
    setIsAdmin(true);
    loadAll();
  };

  const loadAll = async () => {
    const { data: inf } = await supabase.from('influenceurs').select('*').order('created_at', { ascending: false });
    setInfluenceurs(inf || []);
    const { data: marq } = await supabase.from('marques').select('*').order('created_at', { ascending: false });
    setMarques(marq || []);
    const { data: camps } = await supabase.from('campagnes').select('*, marques(nom_entreprise)').order('created_at', { ascending: false });
    setCampagnes(camps || []);

    const candMap = {};
    for (const c of camps || []) {
      const { data: cands } = await supabase
        .from('candidatures')
        .select('*, influenceurs(nom, plateforme_principale, lien_profil, nb_abonnes, niche)')
        .eq('campagne_id', c.id);
      candMap[c.id] = cands || [];
    }
    setCandidatures(candMap);
  };

  const majStatutInfluenceur = async (id, statut) => {
    await supabase.from('influenceurs').update({ statut }).eq('id', id);
    loadAll();
  };
  const majStatutMarque = async (id, statut) => {
    await supabase.from('marques').update({ statut }).eq('id', id);
    loadAll();
  };
  const majStatutCandidature = async (id, statut) => {
    await supabase.from('candidatures').update({ statut }).eq('id', id);
    loadAll();
  };
  const majStatutCampagne = async (id, statut) => {
    await supabase.from('campagnes').update({ statut }).eq('id', id);
    loadAll();
  };

  const supprimerCompte = async (id, nom) => {
    if (!confirm(`Supprimer définitivement le compte "${nom}" ? Cette action est irréversible.`)) return;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) alert("Erreur lors de la suppression : " + error.message);
    loadAll();
  };

  const supprimerCampagne = async (id, titre) => {
    if (!confirm(`Supprimer définitivement la campagne "${titre}" ? Cette action est irréversible.`)) return;
    const { error } = await supabase.from('campagnes').delete().eq('id', id);
    if (error) alert("Erreur lors de la suppression : " + error.message);
    loadAll();
  };

  const logout = async () => { await supabase.auth.signOut(); router.push('/'); };

  if (!isAdmin) return <div className="container"><p style={{ paddingTop: 60 }}>Vérification...</p></div>;

  return (
    <div className="container">
      <div className="dash-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo.png" alt="Sponsova" className="logo-img" />
          <span style={{ fontSize: 13, color: 'var(--gray)' }}>admin</span>
        </div>
        <button className="btn btn-outline" onClick={logout}>Déconnexion</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        {['influenceurs', 'marques', 'campagnes'].map((t) => (
          <button
            key={t}
            className={tab === t ? 'btn btn-primary' : 'btn btn-outline'}
            onClick={() => setTab(t)}
          >
            {t === 'influenceurs' ? `Influenceurs (${influenceurs.length})` : t === 'marques' ? `Marques (${marques.length})` : `Campagnes (${campagnes.length})`}
          </button>
        ))}
      </div>

      {tab === 'influenceurs' && influenceurs.map((i) => (
        <div key={i.id} className="card">
          <div className="card-row">
            <div>
              <h3>{i.nom}</h3>
              <p className="meta">{i.plateforme_principale} · {i.nb_abonnes?.toLocaleString('fr-FR')} abonnés · {i.niche}</p>
              {i.lien_profil && <a href={i.lien_profil} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--blue)' }}>Voir le profil →</a>}
            </div>
            <span className={`badge badge-${i.statut === 'en_attente' ? 'attente' : i.statut}`}>{i.statut}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 10, lineHeight: 1.7 }}>
            {i.email_contact && <div>Email de contact : <a href={`mailto:${i.email_contact}`} style={{ color: 'var(--blue)' }}>{i.email_contact}</a></div>}
            {i.telephone && <div>Téléphone : {i.telephone}</div>}
            {i.raison_sociale && <div>Entreprise : {i.raison_sociale}</div>}
            {i.siret && <div>SIRET : {i.siret}</div>}
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {i.statut === 'en_attente' && (
              <>
                <button className="btn btn-primary btn-sm" onClick={() => majStatutInfluenceur(i.id, 'verifie')}>Vérifier</button>
                <button className="btn btn-outline btn-sm" onClick={() => majStatutInfluenceur(i.id, 'refuse')}>Refuser</button>
              </>
            )}
            <button className="btn btn-danger btn-sm" onClick={() => supprimerCompte(i.id, i.nom)}>Supprimer le compte</button>
          </div>
        </div>
      ))}

      {tab === 'marques' && marques.map((m) => (
        <div key={m.id} className="card">
          <div className="card-row">
            <div>
              <h3>{m.nom_entreprise}</h3>
              <p className="meta">{m.secteur} · {m.contact_nom} · {m.telephone}</p>
              {m.site_web && <a href={m.site_web} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--blue)' }}>Site web →</a>}
            </div>
            <span className={`badge badge-${m.statut === 'en_attente' ? 'attente' : m.statut}`}>{m.statut}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 10, lineHeight: 1.7 }}>
            {m.email_contact && <div>Email de contact : <a href={`mailto:${m.email_contact}`} style={{ color: 'var(--blue)' }}>{m.email_contact}</a></div>}
            {m.siret && <div>SIRET : {m.siret}</div>}
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {m.statut === 'en_attente' && (
              <>
                <button className="btn btn-primary btn-sm" onClick={() => majStatutMarque(m.id, 'verifie')}>Vérifier</button>
                <button className="btn btn-outline btn-sm" onClick={() => majStatutMarque(m.id, 'refuse')}>Refuser</button>
              </>
            )}
            <button className="btn btn-danger btn-sm" onClick={() => supprimerCompte(m.id, m.nom_entreprise)}>Supprimer le compte</button>
          </div>
        </div>
      ))}

      {tab === 'campagnes' && campagnes.map((c) => (
        <div key={c.id} className="card">
          <div className="card-row">
            <div>
              <h3>{c.titre}</h3>
              <p className="meta">{c.marques?.nom_entreprise} · {c.budget} · {c.criteres}</p>
            </div>
            <span className={`badge badge-${c.statut}`}>{LABEL_CAMPAGNE[c.statut] || c.statut}</span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--gray)' }}>{c.brief}</p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            {c.statut === 'en_attente' && (
              <>
                <button className="btn btn-primary btn-sm" onClick={() => majStatutCampagne(c.id, 'ouverte')}>Valider la campagne</button>
                <button className="btn btn-outline btn-sm" onClick={() => majStatutCampagne(c.id, 'refusee')}>Refuser</button>
              </>
            )}
            <button className="btn btn-danger btn-sm" onClick={() => supprimerCampagne(c.id, c.titre)}>Supprimer</button>
          </div>

          <div className="section-title">Candidatures ({(candidatures[c.id] || []).length})</div>
          {(candidatures[c.id] || []).length === 0 && <p style={{ fontSize: 13, color: 'var(--gray)' }}>Aucune candidature reçue.</p>}
          {(candidatures[c.id] || []).map((cand) => (
            <div key={cand.id} className="card" style={{ background: '#fff' }}>
              <div className="card-row">
                <div>
                  <strong>{cand.influenceurs.nom}</strong>
                  <p className="meta">{cand.influenceurs.plateforme_principale} · {cand.influenceurs.nb_abonnes?.toLocaleString('fr-FR')} abonnés · {cand.influenceurs.niche}</p>
                  {cand.influenceurs.lien_profil && <a href={cand.influenceurs.lien_profil} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--blue)' }}>Voir le profil →</a>}
                </div>
                <span className={`badge badge-${cand.statut}`}>{LABEL_CAND[cand.statut]}</span>
              </div>
              {cand.statut === 'en_attente' && (
                <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => majStatutCandidature(cand.id, 'selectionne')}>Proposer à la marque</button>
                  <button className="btn btn-outline btn-sm" onClick={() => majStatutCandidature(cand.id, 'refuse')}>Écarter (spam)</button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
