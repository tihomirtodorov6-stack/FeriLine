export const metadata = {
  title: 'VoziMe.bg',
  description: 'Споделено пътуване Полско Косово - Бяла',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-512.png',
    apple: '/icon-512.png',
  },
};

export const viewport = {
  themeColor: '#0F4C75',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <body style={{margin:0}}>{children}</body>
    </html>
  );
}