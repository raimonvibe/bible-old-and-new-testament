import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import ViewportInsetsProvider from '@/components/ViewportInsetsProvider'
import ReadAloudToolbar from '@/components/ReadAloudToolbar'

const themeInitScript = `(function(){try{var t=localStorage.getItem('bible-theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`
// import PrayerChatWidget from '../components/PrayerChatWidget'

export const metadata: Metadata = {
  title: 'Holy Bible Reader - Old & New Testament',
  description: 'Read the complete Holy Bible with a beautiful, modern interface. 66 books, 1,189 chapters from the World English Bible - Old Testament and New Testament.',
  keywords: ['Bible', 'Old Testament', 'New Testament', 'Scripture', 'Christian', 'Reading', 'World English Bible', 'Gospel', 'Holy Bible'],
  authors: [{ name: 'Holy Bible Reader' }],
  creator: 'Holy Bible Reader',
  publisher: 'Holy Bible Reader',
  metadataBase: new URL('https://bible-new-testament.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Holy Bible Reader - Old & New Testament',
    description: 'Read the complete Holy Bible with a beautiful, modern interface. 66 books, 1,189 chapters from the World English Bible.',
    url: 'https://bible-new-testament.vercel.app',
    siteName: 'Holy Bible Reader',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
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
