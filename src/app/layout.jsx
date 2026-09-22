import './globals.css';
import { AppProvider } from '../context/AppContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GlobalSearchWrapper from '../components/GlobalSearchWrapper';

export const metadata = {
  metadataBase: new URL('https://superkingsden.com'),
  title: {
    default: 'Super Kings Den — Official Fan Portal | CSK, JSK & TSK News, Squads & Highlights',
    template: '%s | Super Kings Den'
  },
  description: 'The premier independent fan destination celebrating Chennai Super Kings (IPL), Joburg Super Kings (SA20), and Texas Super Kings (MLC). #WhistlePodu',
  keywords: ['CSK', 'Chennai Super Kings', 'JSK', 'Joburg Super Kings', 'TSK', 'Texas Super Kings', 'IPL 2026', 'MS Dhoni', 'Ruturaj Gaikwad', 'Chepauk Stadium', 'Whistle Podu'],
  authors: [{ name: 'SuperKingsDen Editorial Team' }],
  creator: 'SuperKingsDen',
  publisher: 'SuperKingsDen',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://superkingsden.com',
    siteName: 'SuperKingsDen',
    title: 'SuperKingsDen — Where Super Kings Fans Unite | CSK, JSK & TSK',
    description: 'Comprehensive CSK, JSK & TSK news, match previews, live countdown, player stats, and community analysis.',
    images: [
      {
        url: 'https://superkingsden.com/wp-content/uploads/2026/06/Chennai-Super-Kings-2026.jpg',
        width: 1200,
        height: 675,
        alt: 'SuperKingsDen Official Banner'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@superkingsden',
    creator: '@superkingsden',
    title: 'SuperKingsDen — Where Super Kings Fans Unite',
    description: 'The ultimate Super Kings fan platform for CSK, JSK & TSK coverage.',
    images: ['https://superkingsden.com/wp-content/uploads/2026/06/Chennai-Super-Kings-2026.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;1,400;1,600&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('skd-theme-v2');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {
                document.documentElement.classList.remove('dark');
              }
            `,
          }}
        />
      </head>
      <body className="bg-slate-50 dark:bg-[#081432] text-slate-900 dark:text-slate-100 font-sans antialiased min-h-screen selection:bg-[#FFCB05] selection:text-[#081432]">

        <AppProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-200px)]">
            {children}
          </main>
          <Footer />
          <GlobalSearchWrapper />
        </AppProvider>
      </body>
    </html>
  );
}
