'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase-browser';
import { ADMIN_EMAIL } from '../../../lib/config';

const LABEL_CAMPAGNE = { en_attente: 'En attente de validation', ouverte: 'Ouverte', refusee: 'Refusée', fermee: 'Fermée' };
const LABEL_CAND = { en_attente: 'En cours d\u2019examen', selectionne: 'Transmis par l\u2019agence', acceptee: 'Accepté', refuse: 'Refusé' };

export default function DashboardMarque() {
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const [marque, setMarque] = useState(null);
  const [campagnes, setCampagnes] = useState([]);
  const [candidaturesParCampagne, setCandidaturesParCampagne] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titre: '', brief: '', budget: '', criteres: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (!session?.user) { router.push('/connexion'); return; }
      load(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') router.push('/connexion');
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const load = async (userId) => {
    const { data: m } = await supabase.from('marques').select('*').eq('id', userId).single();
    setMarque(m);

    if (m) {
      const { data: camps } = await supabase.from('campagnes').select('*').eq('marque_id', userId).order('created_at', { ascending: false });
      setCampagnes(camps || []);

      const results = {};
      for (const c of camps || []) {
        const { data: cands } = await supabase
          .from('candidatures')
          .select('*, influenceurs(nom, plateforme_principale, lien_profil, nb_abonnes, niche)')
          .eq('campagne_id', c.id)
          .in('statut', ['selectionne', 'acceptee']);
        results[c.id] = cands || [];
      }
      setCandidaturesParCampagne(results);
    }
    setLoading(false);
  };

  const creerCampagne = async (e) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    await supabase.from('campagnes').insert({ ...form, marque_id: session.user.id });
    setForm({ titre: '', brief: '', budget: '', criteres: '' });
    setShowForm(false);
    load(session.user.id);
  };

  const decider = async (id, statut) => {
    await supabase.from('candidatures').update({ statut }).eq('id', id);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) load(session.user.id);
  };

  const fermerCampagne = async (id) => {
    await supabase.from('campagnes').update({ statut: 'fermee' }).eq('id', id);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) load(session.user.id);
  };

  const logout = async () => { await supabase.auth.signOut(); router.push('/'); };

  if (loading) return <div className="container"><p style={{ paddingTop: 60 }}>Chargement...</p></div>;

  if (marque?.statut !== 'verifie') {
    return (
      <div className="container">
        <div className="form-card">
          <h1>Compte en attente</h1>
          <p className="subtitle">
            Ton profil est en cours de vérification par notre équipe.
            Tu pourras créer des campagnes une fois validé.
          </p>
          <button className="btn btn-outline" onClick={logout}>Se déconnecter</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="dash-header">
        <img src="/logo.png" alt="Sponsova" className="logo-img" />
        <div className="nav-links">
          <span style={{ color: 'var(--gray)' }}>{marque.nom_entreprise}</span>
          <button className="btn btn-outline" onClick={logout}>Déconnexion</button>
        </div>
      </div>

      <div className="card-row">
        <h2 style={{ margin: 0 }}>Mes campagnes</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : '+ Nouvelle campagne'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={creerCampagne} className="card" style={{ marginTop: 20 }}>
          <div className="field">
            <label>Titre de la campagne</label>
            <input required value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} />
          </div>
          <div className="field">
            <label>Brief</label>
            <textarea required value={form.brief} onChange={(e) => setForm({ ...form, brief: e.target.value })} />
          </div>
          <div className="field">
            <label>Budget</label>
            <input value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="ex: 1500€" />
          </div>
          <div className="field">
            <label>Critères recherchés</label>
            <input value={form.criteres} onChange={(e) => setForm({ ...form, criteres: e.target.value })} placeholder="ex: +10k abonnés, niche mode" />
          </div>
          <p style={{ fontSize: 13, color: 'var(--gray)', marginTop: -6, marginBottom: 18 }}>
            Ta campagne sera examinée par notre équipe avant d'être publiée aux influenceurs.
          </p>
          <button className="btn btn-primary">Publier la campagne</button>
        </form>
      )}

      {campagnes.length === 0 && !showForm && (
        <p className="empty-state">Tu n'as pas encore de campagne. Crée la première !</p>
      )}

      {campagnes.map((c) => (
        <div key={c.id} className="card" style={{ marginTop: 20 }}>
          <div className="card-row">
            <div>
              <h3>{c.titre}</h3>
              <p className="meta">{c.budget} {c.criteres && `· ${c.criteres}`}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className={`badge badge-${c.statut}`}>{LABEL_CAMPAGNE[c.statut] || c.statut}</span>
              {c.statut === 'ouverte' && (
                <button className="btn btn-outline btn-sm" onClick={() => fermerCampagne(c.id)}>Clôturer</button>
              )}
            </div>
          </div>
          <p style={{ fontSize: 14, color: 'var(--gray)' }}>{c.brief}</p>
          {c.statut === 'en_attente' && (
            <p style={{ fontSize: 13, color: 'var(--blue)' }}>Cette campagne est en attente de validation par l'agence.</p>
          )}
          {c.statut === 'refusee' && (
            <p style={{ fontSize: 13, color: 'var(--danger)' }}>Cette campagne n'a pas été validée par l'agence.</p>
          )}

          <div className="section-title">Profils proposés ({(candidaturesParCampagne[c.id] || []).length})</div>
          {(candidaturesParCampagne[c.id] || []).length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--gray)' }}>
              Aucun profil transmis pour l'instant — notre équipe examine les candidatures.
            </p>
          ) : (
            candidaturesParCampagne[c.id].map((cand) => (
              <div key={cand.id} className="card" style={{ background: '#fff' }}>
                <div className="card-row">
                  <div>
                    <strong>{cand.influenceurs.nom}</strong>
                    <p className="meta">
                      {cand.influenceurs.plateforme_principale} · {cand.influenceurs.nb_abonnes?.toLocaleString('fr-FR')} abonnés · {cand.influenceurs.niche}
                    </p>
                  </div>
                  <span className={`badge badge-${cand.statut}`}>{LABEL_CAND[cand.statut]}</span>
                </div>
                {cand.influenceurs.lien_profil && (
                  <a href={cand.influenceurs.lien_profil} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--blue)' }}>
                    Voir le profil TikTok →
                  </a>
                )}
                <p style={{ fontSize: 12.5, color: 'var(--gray)', marginTop: 10 }}>
                  Ce profil t'intéresse ? Contacte l'agence à <a href={`mailto:${ADMIN_EMAIL}`} style={{ color: 'var(--blue)' }}>{ADMIN_EMAIL}</a> pour être mis en relation.
                </p>
                {cand.statut === 'selectionne' && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => decider(cand.id, 'acceptee')}>Accepter</button>
                    <button className="btn btn-outline btn-sm" onClick={() => decider(cand.id, 'refuse')}>Refuser</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
}
