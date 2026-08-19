import './globals.css';

const SITE_URL = 'https://partnerova-qzol-liard.vercel.app';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Partnerova — Agence de collaborations TikTok',
  description: "Plateforme de mise en relation entre marques et influenceurs",
  icons: { icon: '/logo.png' },
  openGraph: {
    title: 'Partnerova — Agence de collaborations TikTok',
    description: "Des collaborations choisies avec soin, pas au hasard.",
    url: SITE_URL,
    siteName: 'Partnerova',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Partnerova' }],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Partnerova — Agence de collaborations TikTok',
    description: "Des collaborations choisies avec soin, pas au hasard.",
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
