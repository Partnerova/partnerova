import './globals.css';

export const metadata = {
  title: 'Agence — Marques & Influenceurs',
  description: "Plateforme de mise en relation entre marques et influenceurs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
