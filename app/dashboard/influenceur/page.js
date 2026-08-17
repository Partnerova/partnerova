'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase-browser';

const LABEL_CAND = { en_attente: 'Candidature envoyée', selectionne: 'Transmis à la marque', acceptee: 'Accepté par la marque', refuse: 'Non retenu' };

export default function DashboardInfluenceur() {
  const supabase = createClient();
  const router = useRouter();
  const [profil, setProfil] = useState(null);
  const [campagnes, setCampagnes] = useState([]);
  const [mesCandidatures, setMesCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/connexion'); return; }

    const { data: inf } = await supabase.from('influenceurs').select('*').eq('id', user.id).single();
    setProfil(inf);

    if (inf?.statut === 'verifie') {
      const { data: camps } = await supabase.from('campagnes').select('*').eq('statut', 'ouverte').order('created_at', { ascending: false });
      setCampagnes(camps || []);

      const { data: cands } = await supabase.from('candidatures').select('campagne_id, statut').eq('influenceur_id', user.id);
      setMesCandidatures(cands || []);
    }
    setLoading(false);
  };

  const candidater = async (campagneId) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('candidatures').insert({ campagne_id: campagneId, influenceur_id: user.id });
    load();
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
