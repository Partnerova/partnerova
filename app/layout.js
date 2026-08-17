import './globals.css';

export const metadata = {
  title: 'Partnerova — Agence de collaborations TikTok',
  description: "Plateforme de mise en relation entre marques et influenceurs",
  icons: { icon: '/logo.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
