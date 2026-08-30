export const metadata = {
  title: 'VoziMe.bg',
  description: 'Споделено пътуване Полско Косово - Бяла',
  manifest: '/manifest.json',
  themeColor: '#0F4C75',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <head>
        <link rel="apple-touch-icon" href="/icon-512.png" />
      </head>
      <body style={{margin:0}}>{children}</body>
    </html>
  );
}