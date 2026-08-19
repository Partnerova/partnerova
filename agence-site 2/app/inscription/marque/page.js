'use client';
import { useState } from 'react';
import { createClient } from '../../../lib/supabase-browser';
import Link from 'next/link';

export default function InscriptionMarque() {
  const supabase = createClient();
  const [form, setForm] = useState({
    email: '', password: '', nom_entreprise: '', siret: '', secteur: '',
    contact_nom: '', telephone: '', site_web: '', email_contact: '', cgu: false
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

    await supabase.from('profiles').insert({ id: userId, role: 'marque' });
    const { error: insertError } = await supabase.from('marques').insert({
      id: userId,
      nom_entreprise: form.nom_entreprise,
      siret: form.siret,
      secteur: form.secteur,
      contact_nom: form.contact_nom,
      telephone: form.telephone,
      site_web: form.site_web,
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
            Merci ! Ton compte est en cours de vérification. Confirme aussi ton email si un lien t'a été envoyé.
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
        <h1>Inscription marque</h1>
        <p className="subtitle">Crée ton compte pour proposer des campagnes.</p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Nom de l'entreprise</label>
            <input required value={form.nom_entreprise} onChange={update('nom_entreprise')} />
          </div>
          <div className="field">
            <label>SIRET (ou numéro d'immatriculation)</label>
            <input required value={form.siret} onChange={update('siret')} placeholder="14 chiffres" />
          </div>
          <div className="field">
            <label>Secteur d'activité</label>
            <input value={form.secteur} onChange={update('secteur')} placeholder="Mode, beauté, food..." />
          </div>
          <div className="field">
            <label>Nom du contact</label>
            <input value={form.contact_nom} onChange={update('contact_nom')} />
          </div>
          <div className="field">
            <label>Téléphone</label>
            <input value={form.telephone} onChange={update('telephone')} />
          </div>
          <div className="field">
            <label>Site web</label>
            <input value={form.site_web} onChange={update('site_web')} placeholder="https://" />
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
            <span>J'accepte les <Link href="/cgu" target="_blank" style={{ color: 'var(--blue)' }}>conditions d'utilisation</Link> de Partnerova.</span>
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
