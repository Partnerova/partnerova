'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase-browser';

export default function Connexion() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) { setError('Email ou mot de passe incorrect.'); setLoading(false); return; }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    setLoading(false);
    if (profile?.role === 'marque') router.push('/dashboard/marque');
    else if (profile?.role === 'influenceur') router.push('/dashboard/influenceur');
    else router.push('/');
  };

  return (
    <div className="container">
      <div style={{ textAlign: 'center', paddingTop: 40 }}>
        <img src="/logo.png" alt="Partnerova" className="logo-img" style={{ margin: '0 auto' }} />
      </div>
      <div className="form-card" style={{ marginTop: 20 }}>
        <h1>Connexion</h1>
        <p className="subtitle">Accède à ton espace marque ou influenceur.</p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Mot de passe</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
