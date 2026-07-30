import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import ViewportInsetsProvider from '@/components/ViewportInsetsProvider'
import ReadAloudToolbar from '@/components/ReadAloudToolbar'
import { SITE_NAME, SITE_URL } from '@/lib/site'

const themeInitScript = `(function(){try{var t=localStorage.getItem('bible-theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`

/**
 * Structured data describing what this page actually is: a free reading
 * application for the World English Bible, plus the public-domain work itself.
 */
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description:
        'Read the complete Old and New Testament from the World English Bible with search, read-aloud and a guided tour of key events.',
      inLanguage: 'en',
      isFamilyFriendly: true,
    },
    {
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#app`,
      url: SITE_URL,
      name: SITE_NAME,
      applicationCategory: 'ReferenceApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Read all 66 books and 1,189 chapters',
        'Search across the full text',
        'Listen with browser text-to-speech',
        'Light and dark reading modes',
        'Guided tour comparing how Matthew, Mark, Luke, John and Paul describe the same events',
      ],
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      '@type': 'Book',
      '@id': `${SITE_URL}/#book`,
      name: 'World English Bible',
      alternateName: 'WEB',
      bookEdition: 'World English Bible',
      inLanguage: 'en',
      numberOfPages: 1189,
      isAccessibleForFree: true,
      license: 'https://creativecommons.org/publicdomain/zero/1.0/',
      genre: 'Religious text',
      about: 'Old Testament and New Testament scripture',
      mainEntityOfPage: { '@id': `${SITE_URL}/#website` },
    },
  ],
}
// import PrayerChatWidget from '../components/PrayerChatWidget'

export const metadata: Metadata = {
  title: 'Holy Bible Reader - Old & New Testament',
  description: 'Read the complete Holy Bible with a beautiful, modern interface. 66 books, 1,189 chapters from the World English Bible - Old Testament and New Testament.',
  keywords: ['Bible', 'Old Testament', 'New Testament', 'Scripture', 'Christian', 'Reading', 'World English Bible', 'Gospel', 'Holy Bible'],
  authors: [{ name: 'Holy Bible Reader' }],
  creator: 'Holy Bible Reader',
  publisher: 'Holy Bible Reader',
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  category: 'reference',
  alternates: {
    canonical: '/',
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
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Holy Bible Reader - Old & New Testament',
    description: 'Read the complete Holy Bible with a beautiful, modern interface. 66 books, 1,189 chapters from the World English Bible.',
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Holy Bible Reader - Read the complete Bible online',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Holy Bible Reader - Old & New Testament',
    description: 'Read the complete Holy Bible with a beautiful, modern interface. 66 books, 1,189 chapters from the World English Bible.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Holy Bible',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  // Lets the page extend under the iPhone notch / home-indicator safe areas
  // instead of the browser reserving that strip and showing its own chrome
  // color (typically white) there. The CSS already reads env(safe-area-inset-*)
  // for the tour panel and listen button, but those resolve to 0 without this.
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f1e8' },
    { media: '(prefers-color-scheme: dark)', color: '#2c1f14' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <ViewportInsetsProvider />
        <main id="main-content">
          <ThemeProvider>{children}</ThemeProvider>
        </main>
        <ReadAloudToolbar />
        {/* <PrayerChatWidget /> */}
      </body>
    </html>
  )
}
