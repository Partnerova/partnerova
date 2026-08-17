import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <nav className="nav">
        <Link href="/"><img src="/logo.png" alt="Partnerova" className="logo-img" /></Link>
        <div className="nav-links">
          <Link href="/connexion">Connexion</Link>
          <Link href="/inscription/influenceur" className="btn btn-outline">Je suis influenceur</Link>
          <Link href="/inscription/marque" className="btn btn-primary">Je suis une marque</Link>
        </div>
      </nav>

      <section className="hero">
        <h1>Des collaborations choisies avec soin, pas au hasard.</h1>
        <p>
          Nous mettons en relation les marques avec des influenceurs vérifiés.
          Chaque profil est examiné avant d'être proposé — vous ne voyez que les meilleurs.
        </p>
        <div className="hero-actions">
          <Link href="/inscription/marque" className="btn btn-primary">Proposer une campagne</Link>
          <Link href="/inscription/influenceur" className="btn btn-outline">Rejoindre en tant qu'influenceur</Link>
        </div>
      </section>

      <section className="how">
        <div className="how-item">
          <div className="eyebrow">01</div>
          <h3>Inscription et vérification</h3>
          <p>Marques et influenceurs créent un profil, avec leurs informations légales. Chaque compte est vérifié avant activation.</p>
        </div>
        <div className="how-item">
          <div className="eyebrow">02</div>
          <h3>Campagnes & candidatures</h3>
          <p>Les marques publient leurs campagnes, validées par notre équipe. Les influenceurs intéressés candidatent.</p>
        </div>
        <div className="how-item">
          <div className="eyebrow">03</div>
          <h3>Sélection sur mesure</h3>
          <p>Nous étudions les candidatures et transmettons à la marque uniquement les profils les plus pertinents.</p>
        </div>
      </section>

      <div className="footer-links">
        <Link href="/cgu">Conditions d'utilisation</Link>
        <span>© {new Date().getFullYear()} Partnerova</span>
      </div>
    </div>
  );
}
