'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase-browser';

const LABEL_CAND = { en_attente: 'Candidature envoyée', selectionne: 'Transmis à la marque', acceptee: 'Accepté par la marque', refuse: 'Non retenu' };

export default function DashboardInfluenceur() {
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const [profil, setProfil] = useState(null);
  const [campagnes, setCampagnes] = useState([]);
  const [mesCandidatures, setMesCandidatures] = useState([]);
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
    const { data: inf } = await supabase.from('influenceurs').select('*').eq('id', userId).single();
    setProfil(inf);

    if (inf?.statut === 'verifie') {
      const { data: camps } = await supabase.from('campagnes').select('*').eq('statut', 'ouverte').order('created_at', { ascending: false });
      setCampagnes(camps || []);

      const { data: cands } = await supabase.from('candidatures').select('campagne_id, statut').eq('influenceur_id', userId);
      setMesCandidatures(cands || []);
    }
    setLoading(false);
  };

  const candidater = async (campagneId) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    await supabase.from('candidatures').insert({ campagne_id: campagneId, influenceur_id: session.user.id });
    load(session.user.id);
  };

  const logout = async () => { await supabase.auth.signOut(); router.push('/'); };

  if (loading) return <div className="container"><p style={{ paddingTop: 60 }}>Chargement...</p></div>;

  if (profil?.statut !== 'verifie') {
    return (
      <div className="container">
        <div className="form-card">
          <h1>Compte en attente</h1>
          <p className="subtitle">
            Ton profil est en cours de vérification par notre équipe.
            Tu pourras candidater aux campagnes une fois validé.
          </p>
          <button className="btn btn-outline" onClick={logout}>Se déconnecter</button>
        </div>
      </div>
    );
  }

  const statutPour = (campagneId) => mesCandidatures.find((c) => c.campagne_id === campagneId)?.statut;

  return (
    <div className="container">
      <div className="dash-header">
        <img src="/logo.png" alt="Partnerova" className="logo-img" />
        <div className="nav-links">
          <span style={{ color: 'var(--gray)' }}>{profil.nom}</span>
          <button className="btn btn-outline" onClick={logout}>Déconnexion</button>
        </div>
      </div>

      <h2>Campagnes ouvertes</h2>

      {campagnes.length === 0 && <p className="empty-state">Aucune campagne ouverte pour le moment.</p>}

      {campagnes.map((c) => {
        const statut = statutPour(c.id);
        return (
          <div key={c.id} className="card">
            <div className="card-row">
              <div>
                <h3>{c.titre}</h3>
                <p className="meta">{c.budget} {c.criteres && `· ${c.criteres}`}</p>
              </div>
              {statut ? (
                <span className={`badge badge-${statut}`}>{LABEL_CAND[statut]}</span>
              ) : (
                <button className="btn btn-primary" onClick={() => candidater(c.id)}>Candidater</button>
              )}
            </div>
            <p style={{ fontSize: 14, color: 'var(--gray)' }}>{c.brief}</p>
          </div>
        );
      })}
    </div>
  );
}
