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
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0F4C75',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <body style={{margin:0, padding:0, overflow:'hidden', position:'fixed', width:'100%', height:'100dvh', overscrollBehavior:'none', touchAction:'manipulation'}}>
        {children}
      </body>
    </html>
  );
}