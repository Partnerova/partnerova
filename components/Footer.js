import Link from 'next/link';
import { ADMIN_EMAIL } from '../lib/config';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-col footer-brand">
          <img src="/logo.png" alt="Sponsova" className="logo-img" style={{ height: 32, marginBottom: 14 }} />
          <p>Des collaborations choisies avec soin, pas au hasard.</p>
        </div>

        <div className="footer-col">
          <h4>Navigation</h4>
          <Link href="/">Accueil</Link>
          <Link href="/inscription/marque">Je suis une marque</Link>
          <Link href="/inscription/influenceur">Je suis influenceur</Link>
          <Link href="/connexion">Connexion</Link>
        </div>

        <div className="footer-col">
          <h4>Légal</h4>
          <Link href="/cgu">Conditions d'utilisation</Link>
          <a href={`mailto:${ADMIN_EMAIL}`}>Nous contacter</a>
        </div>

        <div className="footer-col">
          <h4>Réseaux</h4>
          <a href="https://www.instagram.com/sponsova.agency" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://www.tiktok.com/@sponsova" target="_blank" rel="noreferrer">TikTok</a>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© {new Date().getFullYear()} Sponsova. Tous droits réservés.</span>
        </div>
      </div>
    </footer>
  );
}
