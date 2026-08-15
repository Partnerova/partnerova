'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase-browser';

export default function DashboardMarque() {
  const supabase = createClient();
  const router = useRouter();
  const [marque, setMarque] = useState(null);
  const [campagnes, setCampagnes] = useState([]);
  const [candidaturesParCampagne, setCandidaturesParCampagne] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titre: '', brief: '', budget: '', criteres: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/connexion'); return; }

    const { data: m } = await supabase.from('marques').select('*').eq('id', user.id).single();
    setMarque(m);

    if (m) {
      const { data: camps } = await supabase.from('campagnes').select('*').eq('marque_id', user.id).order('created_at', { ascending: false });
      setCampagnes(camps || []);

      const results = {};
      for (const c of camps || []) {
        const { data: cands } = await supabase
          .from('candidatures')
          .select('*, influenceurs(nom, plateforme_principale, lien_profil, nb_abonnes, niche)')
          .eq('campagne_id', c.id)
          .eq('statut', 'selectionne');
        results[c.id] = cands || [];
      }
      setCandidaturesParCampagne(results);
    }
    setLoading(false);
  };

  const creerCampagne = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('campagnes').insert({ ...form, marque_id: user.id });
    setForm({ titre: '', brief: '', budget: '', criteres: '' });
    setShowForm(false);
    load();
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
        <div className="logo">agence<span>.</span></div>
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
            <span className={`badge badge-${c.statut}`}>{c.statut === 'ouverte' ? 'Ouverte' : 'Fermée'}</span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--gray)' }}>{c.brief}</p>

          <div className="section-title">Profils proposés ({(candidaturesParCampagne[c.id] || []).length})</div>
          {(candidaturesParCampagne[c.id] || []).length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--gray)' }}>
              Aucun profil sélectionné pour l'instant — notre équipe examine les candidatures.
            </p>
          ) : (
            candidaturesParCampagne[c.id].map((cand) => (
              <div key={cand.id} className="card" style={{ background: 'var(--navy)' }}>
                <strong>{cand.influenceurs.nom}</strong>
                <p className="meta">
                  {cand.influenceurs.plateforme_principale} · {cand.influenceurs.nb_abonnes?.toLocaleString('fr-FR')} abonnés · {cand.influenceurs.niche}
                </p>
                {cand.influenceurs.lien_profil && (
                  <a href={cand.influenceurs.lien_profil} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--gold)' }}>
                    Voir le profil →
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
}
