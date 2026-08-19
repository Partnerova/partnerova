'use client';
import { useState } from 'react';
import { createClient } from '../../../lib/supabase-browser';
import Link from 'next/link';

export default function InscriptionInfluenceur() {
  const supabase = createClient();
  const [form, setForm] = useState({
    email: '', password: '', nom: '', plateforme_principale: '', lien_profil: '',
    nb_abonnes: '', niche: '', telephone: '', raison_sociale: '', siret: '', email_contact: '', cgu: false
  });
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.cgu) { setError("Tu dois accepter les conditions d'utilisation pour continuer."); return; }
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });
    if (signUpError) { setError(signUpError.message); setLoading(false); return; }

    const userId = data.user?.id;
    if (!userId) { setError("Impossible de créer le compte. Réessaie."); setLoading(false); return; }

    await supabase.from('profiles').insert({ id: userId, role: 'influenceur' });
    const { error: insertError } = await supabase.from('influenceurs').insert({
      id: userId,
      nom: form.nom,
      plateforme_principale: form.plateforme_principale,
      lien_profil: form.lien_profil,
      nb_abonnes: form.nb_abonnes ? parseInt(form.nb_abonnes, 10) : null,
      niche: form.niche,
      telephone: form.telephone,
      raison_sociale: form.raison_sociale,
      siret: form.siret,
      email_contact: form.email_contact,
    });

    setLoading(false);
    if (insertError) { setError(insertError.message); return; }
    setDone(true);
  };

  if (done) {
    return (
      <div className="container">
        <div className="form-card">
          <h1>Inscription reçue</h1>
          <p className="success-msg">
            Merci ! Ton profil est en cours de vérification. Confirme aussi ton email si un lien t'a été envoyé.
            Tu pourras te connecter une fois ton profil validé.
          </p>
          <p style={{ marginTop: 20 }}><Link href="/connexion">Aller à la connexion →</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="form-card">
        <h1>Inscription influenceur</h1>
        <p className="subtitle">Crée ton compte pour candidater aux campagnes.</p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Nom / pseudo</label>
            <input required value={form.nom} onChange={update('nom')} />
          </div>
          <div className="field">
            <label>Plateforme principale</label>
            <input value={form.plateforme_principale} onChange={update('plateforme_principale')} placeholder="Instagram, TikTok, YouTube..." />
          </div>
          <div className="field">
            <label>Lien du profil</label>
            <input required value={form.lien_profil} onChange={update('lien_profil')} placeholder="https://tiktok.com/@..." />
          </div>
          <div className="field">
            <label>Nombre d'abonnés</label>
            <input type="number" value={form.nb_abonnes} onChange={update('nb_abonnes')} />
          </div>
          <div className="field">
            <label>Niche / thématique</label>
            <input value={form.niche} onChange={update('niche')} placeholder="Mode, fitness, lifestyle..." />
          </div>
          <div className="field">
            <label>Statut / nom d'entreprise (auto-entrepreneur, société...)</label>
            <input required value={form.raison_sociale} onChange={update('raison_sociale')} placeholder="ex: Auto-entrepreneur — Jean Dupont" />
          </div>
          <div className="field">
            <label>SIRET (ou numéro d'immatriculation)</label>
            <input required value={form.siret} onChange={update('siret')} placeholder="14 chiffres" />
          </div>
          <div className="field">
            <label>Téléphone</label>
            <input value={form.telephone} onChange={update('telephone')} />
          </div>
          <div className="field">
            <label>Email de connexion</label>
            <input required type="email" value={form.email} onChange={update('email')} />
          </div>
          <div className="field">
            <label>Email de contact (pour être recontacté par l'agence)</label>
            <input required type="email" value={form.email_contact} onChange={update('email_contact')} placeholder="peut être différent de l'email de connexion" />
          </div>
          <div className="field">
            <label>Mot de passe</label>
            <input required type="password" minLength={6} value={form.password} onChange={update('password')} />
          </div>
          <label className="field-check">
            <input type="checkbox" checked={form.cgu} onChange={update('cgu')} />
            <span>J'accepte les <Link href="/cgu" target="_blank" style={{ color: 'var(--blue)' }}>conditions d'utilisation</Link> de Sponsova.</span>
          </label>
          {error && <p className="error-msg">{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>
      </div>
    </div>
  );
}
