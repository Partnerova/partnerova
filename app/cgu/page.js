import Link from 'next/link';

export default function CGU() {
  return (
    <div className="legal-page">
      <p><Link href="/" style={{ color: 'var(--blue)' }}>← Retour à l'accueil</Link></p>
      <h1>Conditions d'utilisation</h1>
      <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

      <h2>1. Objet</h2>
      <p>
        Partnerova ("l'Agence") est une plateforme de mise en relation entre des marques et des
        influenceurs en vue de collaborations commerciales (partenariats, contenus sponsorisés, etc.).
        L'Agence agit en tant qu'intermédiaire : elle sélectionne, vérifie et transmet des profils,
        mais n'est pas partie aux contrats de collaboration conclus entre marques et influenceurs.
      </p>

      <h2>2. Inscription et vérification des comptes</h2>
      <p>
        Toute personne souhaitant utiliser la plateforme, en tant que marque ou en tant qu'influenceur,
        doit créer un compte et fournir des informations exactes et à jour, y compris des informations
        d'identification légale (raison sociale, numéro SIRET ou équivalent). L'Agence se réserve le
        droit de vérifier, refuser ou suspendre tout compte ne respectant pas ces exigences, notamment
        en cas d'informations manquantes, inexactes ou frauduleuses.
      </p>

      <h2>3. Campagnes et candidatures</h2>
      <p>
        Les marques publient des campagnes qui sont soumises à validation par l'Agence avant
        publication. Les influenceurs vérifiés peuvent candidater aux campagnes ouvertes. L'Agence
        examine les candidatures et transmet aux marques les profils les plus pertinents ; la marque
        décide ensuite, parmi les profils transmis, lesquels retenir.
      </p>

      <h2>4. Données personnelles</h2>
      <p>
        Les informations collectées (identité, coordonnées, informations d'entreprise, statistiques de
        réseaux sociaux) sont utilisées uniquement dans le cadre du fonctionnement de la plateforme et
        de la mise en relation entre utilisateurs. Elles ne sont pas cédées à des tiers en dehors de ce
        cadre. Conformément au RGPD, chaque utilisateur peut demander l'accès, la rectification ou la
        suppression de ses données en contactant l'Agence.
      </p>

      <h2>5. Responsabilité</h2>
      <p>
        L'Agence met tout en œuvre pour vérifier le sérieux des profils inscrits, mais ne garantit pas
        le résultat des collaborations engagées entre marques et influenceurs. Chaque partie reste
        responsable du respect de ses obligations légales, fiscales et contractuelles dans le cadre des
        collaborations réalisées via la plateforme.
      </p>

      <h2>6. Suppression de compte</h2>
      <p>
        L'Agence peut suspendre ou supprimer un compte à tout moment en cas de non-respect des présentes
        conditions, de comportement frauduleux, ou de contenu inapproprié. Un utilisateur peut également
        demander la suppression de son compte à tout moment.
      </p>

      <h2>7. Contact</h2>
      <p>
        Pour toute question relative aux présentes conditions ou à l'utilisation de la plateforme, contacte
        l'Agence via l'adresse indiquée sur le site.
      </p>
    </div>
  );
}
